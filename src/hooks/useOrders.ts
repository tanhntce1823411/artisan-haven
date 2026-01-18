import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  address_line: string;
  ward?: string;
  district: string;
  city: string;
}

export interface CreateOrderData {
  items: OrderItem[];
  shipping_address: ShippingAddress;
  payment_method: 'cod' | 'bank_transfer';
  subtotal: number;
  shipping_fee: number;
  total: number;
  notes?: string;
}

export const useCreateOrder = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: CreateOrderData) => {
      if (!user) throw new Error('Bạn cần đăng nhập để đặt hàng');

      // Create order - use type assertion for dynamic table
      const { data: order, error: orderError } = await supabase
        .from('orders' as any)
        .insert({
          user_id: user.id,
          payment_method: orderData.payment_method,
          subtotal: orderData.subtotal,
          shipping_fee: orderData.shipping_fee,
          total: orderData.total,
          shipping_address: orderData.shipping_address,
          notes: orderData.notes,
        } as any)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = orderData.items.map((item) => ({
        order_id: (order as any).id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: item.product_image,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items' as any)
        .insert(orderItems as any);

      if (itemsError) throw itemsError;

      return order as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useOrders = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('orders' as any)
        .select(`
          *,
          order_items(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};
