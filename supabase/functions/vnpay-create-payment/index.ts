import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function sortObject(obj: Record<string, string>): Record<string, string> {
  const sorted: Record<string, string> = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
}

async function hmacSHA512(key: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const dataData = encoder.encode(data);
  
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, dataData);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, orderNumber, amount, orderInfo } = await req.json();

    if (!orderId || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const vnpTmnCode = Deno.env.get('VNPAY_TMN_CODE');
    const vnpHashSecret = Deno.env.get('VNPAY_HASH_SECRET');
    
    if (!vnpTmnCode || !vnpHashSecret) {
      console.error('VNPay credentials not configured');
      return new Response(
        JSON.stringify({ error: 'VNPay not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // VNPay sandbox URL
    const vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    
    // Get return URL from request origin or use default
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || '';
    const returnUrl = `https://${projectRef}.supabase.co/functions/v1/vnpay-return`;

    const date = new Date();
    const createDate = date.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const expireDate = new Date(date.getTime() + 15 * 60 * 1000).toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);

    const vnpParams: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: vnpTmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderNumber || orderId,
      vnp_OrderInfo: orderInfo || `Thanh toan don hang ${orderNumber}`,
      vnp_OrderType: 'other',
      vnp_Amount: String(Math.round(amount * 100)), // VNPay expects amount in smallest currency unit
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: '127.0.0.1',
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    const sortedParams = sortObject(vnpParams);
    const signData = new URLSearchParams(sortedParams).toString();
    const secureHash = await hmacSHA512(vnpHashSecret, signData);

    const paymentUrl = `${vnpUrl}?${signData}&vnp_SecureHash=${secureHash}`;

    console.log('Created VNPay payment URL for order:', orderNumber);

    return new Response(
      JSON.stringify({ paymentUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('VNPay create payment error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
