import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

function sortObject(obj: Record<string, string>): Record<string, string> {
  const sorted: Record<string, string> = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
}

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const params: Record<string, string> = {};
    
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    console.log('VNPay return params:', params);

    const vnpHashSecret = Deno.env.get('VNPAY_HASH_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!vnpHashSecret) {
      console.error('VNPay hash secret not configured');
      return new Response('Configuration error', { status: 500 });
    }

    // Get secure hash from params
    const secureHash = params['vnp_SecureHash'];
    delete params['vnp_SecureHash'];
    delete params['vnp_SecureHashType'];

    // Verify signature
    const sortedParams = sortObject(params);
    const signData = new URLSearchParams(sortedParams).toString();
    const checkSum = await hmacSHA512(vnpHashSecret, signData);

    const vnpResponseCode = params['vnp_ResponseCode'];
    const vnpTxnRef = params['vnp_TxnRef'];
    const vnpTransactionNo = params['vnp_TransactionNo'];

    // Get frontend URL from project
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || '';
    const frontendUrl = `https://id-preview--${projectRef}.lovable.app`;

    // Update order status in database
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      if (secureHash === checkSum && vnpResponseCode === '00') {
        // Payment successful
        const { error } = await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            vnpay_transaction_id: vnpTransactionNo,
            status: 'processing',
          })
          .eq('order_number', vnpTxnRef);

        if (error) {
          console.error('Failed to update order:', error);
        } else {
          console.log('Order updated successfully:', vnpTxnRef);
        }
      } else {
        // Payment failed
        const { error } = await supabase
          .from('orders')
          .update({
            payment_status: 'failed',
          })
          .eq('order_number', vnpTxnRef);

        if (error) {
          console.error('Failed to update order status:', error);
        }
      }
    }

    // Redirect to frontend payment result page
    const redirectUrl = `${frontendUrl}/payment-result?vnp_ResponseCode=${vnpResponseCode}&vnp_TxnRef=${vnpTxnRef}`;
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl,
      },
    });
  } catch (error) {
    console.error('VNPay return error:', error);
    return new Response('Internal error', { status: 500 });
  }
});
