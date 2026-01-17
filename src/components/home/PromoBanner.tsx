import { Link } from 'react-router-dom';
import { ArrowRight, Gift, Truck, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Truck,
    title: 'Miễn phí vận chuyển',
    description: 'Cho đơn từ 500.000đ',
  },
  {
    icon: Shield,
    title: 'Bảo hành chất lượng',
    description: 'Cam kết chính hãng',
  },
  {
    icon: Gift,
    title: 'Quà tặng đặc biệt',
    description: 'Khi mua từ 1 triệu',
  },
  {
    icon: Clock,
    title: 'Hỗ trợ 24/7',
    description: 'Tư vấn nhiệt tình',
  },
];

export default function PromoBanner() {
  return (
    <>
      {/* Features bar */}
      <section className="py-8 border-y border-border bg-card">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground text-sm">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 md:py-20 bg-primary text-primary-foreground relative overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 craft-pattern opacity-10" />
        
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Khám phá bộ sưu tập<br />
              <span className="text-golden">Tết Nguyên Đán 2024</span>
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
              Những món quà thủ công ý nghĩa dành tặng người thân yêu dịp Tết cổ truyền
            </p>
            <Link to="/products?collection=tet-2024">
              <Button size="lg" variant="secondary" className="group">
                Xem bộ sưu tập
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
