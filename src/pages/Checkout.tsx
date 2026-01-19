import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, CreditCard, Truck, MapPin, ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const SHIPPING_FEE = 30000;

export default function Checkout() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { items, clearCart } = useCart();
  const { toast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'vnpay'>('cod');
  const [notes, setNotes] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [newAddress, setNewAddress] = useState({
    full_name: '',
    phone: '',
    address_line: '',
    ward: '',
    district: '',
    city: '',
  });
  const [useNewAddress, setUseNewAddress] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (items.length === 0 && !authLoading) {
      navigate('/cart');
    }
  }, [items, authLoading, navigate]);

  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ['user-addresses', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddr = addresses.find(a => a.is_default) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
    } else if (addresses && addresses.length === 0) {
      setUseNewAddress(true);
    }
  }, [addresses]);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const total = subtotal + SHIPPING_FEE;

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Chưa đăng nhập');

      let shippingAddress;
      if (useNewAddress) {
        shippingAddress = newAddress;
      } else {
        const selectedAddr = addresses?.find(a => a.id === selectedAddressId);
        if (!selectedAddr) throw new Error('Vui lòng chọn địa chỉ giao hàng');
        shippingAddress = {
          full_name: selectedAddr.full_name,
          phone: selectedAddr.phone,
          address_line: selectedAddr.address_line,
          ward: selectedAddr.ward,
          district: selectedAddr.district,
          city: selectedAddr.city,
        };
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          payment_method: paymentMethod === 'vnpay' ? 'bank_transfer' : 'cod',
          subtotal,
          shipping_fee: SHIPPING_FEE,
          total,
          shipping_address: shippingAddress as any,
          notes,
          payment_status: 'pending',
        } as any)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_image: item.product.images?.[0] || null,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return order;
    },
    onSuccess: async (order) => {
      if (paymentMethod === 'vnpay') {
        // Create VNPay payment
        try {
          const { data, error } = await supabase.functions.invoke('vnpay-create-payment', {
            body: {
              orderId: order.id,
              orderNumber: order.order_number,
              amount: total,
              orderInfo: `Thanh toan don hang ${order.order_number}`,
            },
          });

          if (error) throw error;
          if (data?.paymentUrl) {
            clearCart();
            window.location.href = data.paymentUrl;
            return;
          }
        } catch (error) {
          console.error('VNPay error:', error);
          toast({
            title: 'Lỗi thanh toán',
            description: 'Không thể tạo thanh toán VNPay. Đơn hàng đã được tạo với hình thức COD.',
            variant: 'destructive',
          });
        }
      }

      clearCart();
      toast({ title: 'Đặt hàng thành công!' });
      navigate('/account/orders');
    },
    onError: (error) => {
      toast({ title: 'Lỗi', description: error.message, variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (useNewAddress) {
      if (!newAddress.full_name || !newAddress.phone || !newAddress.address_line || !newAddress.district || !newAddress.city) {
        toast({ title: 'Lỗi', description: 'Vui lòng điền đầy đủ thông tin địa chỉ', variant: 'destructive' });
        return;
      }
    } else if (!selectedAddressId) {
      toast({ title: 'Lỗi', description: 'Vui lòng chọn địa chỉ giao hàng', variant: 'destructive' });
      return;
    }

    createOrderMutation.mutate();
  };

  if (authLoading || addressesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">Thanh toán</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column - Address & Payment */}
              <div className="lg:col-span-2 space-y-6">
                {/* Shipping Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Địa chỉ giao hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {addresses && addresses.length > 0 && !useNewAddress ? (
                      <div className="space-y-4">
                        <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                          {addresses.map((address) => (
                            <div
                              key={address.id}
                              className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                                selectedAddressId === address.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                              }`}
                              onClick={() => setSelectedAddressId(address.id)}
                            >
                              <RadioGroupItem value={address.id} id={address.id} />
                              <div className="flex-1">
                                <p className="font-medium">{address.full_name} - {address.phone}</p>
                                <p className="text-sm text-muted-foreground">
                                  {address.address_line}, {address.ward && `${address.ward}, `}
                                  {address.district}, {address.city}
                                </p>
                              </div>
                            </div>
                          ))}
                        </RadioGroup>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setUseNewAddress(true)}
                        >
                          Sử dụng địa chỉ khác
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {addresses && addresses.length > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setUseNewAddress(false)}
                            className="mb-4"
                          >
                            Chọn từ địa chỉ đã lưu
                          </Button>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Họ và tên *</Label>
                            <Input
                              value={newAddress.full_name}
                              onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                              required={useNewAddress}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Số điện thoại *</Label>
                            <Input
                              value={newAddress.phone}
                              onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                              required={useNewAddress}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Địa chỉ *</Label>
                          <Input
                            value={newAddress.address_line}
                            onChange={(e) => setNewAddress({ ...newAddress, address_line: e.target.value })}
                            placeholder="Số nhà, tên đường"
                            required={useNewAddress}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Phường/Xã</Label>
                            <Input
                              value={newAddress.ward}
                              onChange={(e) => setNewAddress({ ...newAddress, ward: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Quận/Huyện *</Label>
                            <Input
                              value={newAddress.district}
                              onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                              required={useNewAddress}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Tỉnh/Thành *</Label>
                            <Input
                              value={newAddress.city}
                              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                              required={useNewAddress}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Phương thức thanh toán
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'cod' | 'vnpay')}>
                      <div
                        className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                          paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setPaymentMethod('cod')}
                      >
                        <RadioGroupItem value="cod" id="cod" />
                        <div className="flex items-center gap-3 flex-1">
                          <Truck className="h-6 w-6 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Thanh toán khi nhận hàng (COD)</p>
                            <p className="text-sm text-muted-foreground">Thanh toán bằng tiền mặt khi nhận hàng</p>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                          paymentMethod === 'vnpay' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setPaymentMethod('vnpay')}
                      >
                        <RadioGroupItem value="vnpay" id="vnpay" />
                        <div className="flex items-center gap-3 flex-1">
                          <CreditCard className="h-6 w-6 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Thanh toán qua VNPay</p>
                            <p className="text-sm text-muted-foreground">Thanh toán online qua ví VNPay, thẻ ATM/Visa/Master</p>
                          </div>
                        </div>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ghi chú đơn hàng</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ghi chú thêm cho đơn hàng (nếu có)..."
                      rows={3}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Right column - Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5" />
                      Đơn hàng của bạn
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex gap-3">
                        <img
                          src={item.product.images?.[0] || '/placeholder.svg'}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm line-clamp-2">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                          <p className="text-sm font-medium">{formatCurrency(item.product.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tạm tính</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Phí vận chuyển</span>
                        <span>{formatCurrency(SHIPPING_FEE)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium text-lg">
                        <span>Tổng cộng</span>
                        <span className="text-primary">{formatCurrency(total)}</span>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={createOrderMutation.isPending}
                    >
                      {createOrderMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {paymentMethod === 'vnpay' ? 'Thanh toán VNPay' : 'Đặt hàng'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
