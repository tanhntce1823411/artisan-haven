import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Eye, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

export default function AdminOrders() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({ title: 'Cập nhật trạng thái thành công!' });
    },
    onError: (error) => {
      toast({ title: 'Lỗi', description: error.message, variant: 'destructive' });
    },
  });

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = order.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      (order.shipping_address as any)?.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle>Quản lý đơn hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo mã đơn hoặc tên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Lọc trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã đơn</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Ngày đặt</TableHead>
                    <TableHead className="text-right">Tổng tiền</TableHead>
                    <TableHead>Thanh toán</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders?.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>{(order.shipping_address as any)?.full_name}</TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(Number(order.total))}</TableCell>
                      <TableCell>
                        <span className="text-sm">{paymentLabels[order.payment_method] || order.payment_method}</span>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(status) => updateStatusMutation.mutate({ id: order.id, status })}
                        >
                          <SelectTrigger className={`w-[130px] h-8 text-xs ${statusColors[order.status] || ''}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!filteredOrders || filteredOrders.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Không có đơn hàng nào
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Thông tin giao hàng</h4>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p><strong>Tên:</strong> {(selectedOrder.shipping_address as any)?.full_name}</p>
                    <p><strong>SĐT:</strong> {(selectedOrder.shipping_address as any)?.phone}</p>
                    <p><strong>Địa chỉ:</strong> {(selectedOrder.shipping_address as any)?.address_line}</p>
                    <p>
                      {(selectedOrder.shipping_address as any)?.ward && `${(selectedOrder.shipping_address as any).ward}, `}
                      {(selectedOrder.shipping_address as any)?.district}, {(selectedOrder.shipping_address as any)?.city}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Thông tin đơn hàng</h4>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p><strong>Ngày đặt:</strong> {formatDate(selectedOrder.created_at)}</p>
                    <p><strong>Thanh toán:</strong> {paymentLabels[selectedOrder.payment_method]}</p>
                    <p><strong>Trạng thái TT:</strong> {selectedOrder.payment_status || 'Chưa thanh toán'}</p>
                    {selectedOrder.notes && <p><strong>Ghi chú:</strong> {selectedOrder.notes}</p>}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Sản phẩm</h4>
                <div className="border rounded-lg divide-y">
                  {selectedOrder.order_items?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 p-3">
                      <img
                        src={item.product_image || '/placeholder.svg'}
                        alt={item.product_name}
                        className="w-12 h-12 object-cover rounded"
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
    </AdminLayout>
  );
}
