import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { UserLayout } from '@/components/account/UserLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Package, Eye } from 'lucide-react';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipping: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

const paymentLabels: Record<string, string> = {
  cod: 'Thanh toán khi nhận hàng',
  bank_transfer: 'Chuyển khoản',
  vnpay: 'VNPay',
};

export default function UserOrders() {
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['user-orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('orders')
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

  if (isLoading) {
    return (
      <UserLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử đơn hàng</CardTitle>
        </CardHeader>
        <CardContent>
          {orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(Number(order.total))}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Bạn chưa có đơn hàng nào</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Trạng thái</p>
                  <span className={`text-sm px-2 py-1 rounded-full ${statusColors[selectedOrder.status]}`}>
                    {statusLabels[selectedOrder.status]}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Thanh toán</p>
                  <p className="font-medium">{paymentLabels[selectedOrder.payment_method]}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Địa chỉ giao hàng</h4>
                <div className="text-sm text-muted-foreground p-4 border rounded-lg">
                  <p className="font-medium text-foreground">{(selectedOrder.shipping_address as any)?.full_name}</p>
                  <p>{(selectedOrder.shipping_address as any)?.phone}</p>
                  <p>{(selectedOrder.shipping_address as any)?.address_line}</p>
                  <p>
                    {(selectedOrder.shipping_address as any)?.ward && `${(selectedOrder.shipping_address as any).ward}, `}
                    {(selectedOrder.shipping_address as any)?.district}, {(selectedOrder.shipping_address as any)?.city}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Sản phẩm</h4>
                <div className="border rounded-lg divide-y">
                  {selectedOrder.order_items?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 p-3">
                      <img
                        src={item.product_image || '/placeholder.svg'}
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(Number(item.price))} x {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatCurrency(Number(item.price) * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(Number(selectedOrder.subtotal))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Phí vận chuyển</span>
                  <span>{formatCurrency(Number(selectedOrder.shipping_fee))}</span>
                </div>
                <div className="flex justify-between font-medium text-lg">
                  <span>Tổng cộng</span>
                  <span className="text-primary">{formatCurrency(Number(selectedOrder.total))}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </UserLayout>
  );
}
