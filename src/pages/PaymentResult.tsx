import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [orderNumber, setOrderNumber] = useState<string>('');

  useEffect(() => {
    const vnpResponseCode = searchParams.get('vnp_ResponseCode');
    const vnpTxnRef = searchParams.get('vnp_TxnRef');

    if (vnpResponseCode) {
      if (vnpResponseCode === '00') {
        setStatus('success');
      } else {
        setStatus('failed');
      }
      if (vnpTxnRef) {
        setOrderNumber(vnpTxnRef);
      }
    } else {
      setStatus('failed');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30 py-12">
        <div className="container mx-auto px-4 max-w-lg">
          <Card>
            <CardContent className="pt-6">
              {status === 'loading' && (
                <div className="text-center py-8">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                  <p>Đang xử lý kết quả thanh toán...</p>
                </div>
              )}

              {status === 'success' && (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-green-600 mb-2">Thanh toán thành công!</h2>
                  <p className="text-muted-foreground mb-6">
                    Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được xác nhận.
                  </p>
                  {orderNumber && (
                    <p className="text-sm text-muted-foreground mb-6">
                      Mã đơn hàng: <strong>{orderNumber}</strong>
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild>
                      <Link to="/account/orders">Xem đơn hàng</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/">Tiếp tục mua sắm</Link>
                    </Button>
                  </div>
                </div>
              )}

              {status === 'failed' && (
                <div className="text-center py-8">
                  <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-destructive mb-2">Thanh toán thất bại</h2>
                  <p className="text-muted-foreground mb-6">
                    Rất tiếc, thanh toán của bạn không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild>
                      <Link to="/cart">Quay lại giỏ hàng</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/">Về trang chủ</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
