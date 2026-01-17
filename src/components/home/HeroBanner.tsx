import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden gradient-hero craft-pattern">
      <div className="container py-16 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              <span>Thủ công mỹ nghệ truyền thống</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Nét đẹp{' '}
              <span className="text-gradient">thủ công</span>
              <br />
              Việt Nam
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              Khám phá bộ sưu tập đồ thủ công mỹ nghệ được chế tác bởi các nghệ nhân 
              tài hoa từ các làng nghề truyền thống Việt Nam.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/products">
                <Button size="lg" className="group w-full sm:w-auto">
                  Khám phá ngay
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Về chúng tôi
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-border">
              <div>
                <div className="font-display text-2xl md:text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Sản phẩm</div>
              </div>
              <div>
                <div className="font-display text-2xl md:text-3xl font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground">Nghệ nhân</div>
              </div>
              <div>
                <div className="font-display text-2xl md:text-3xl font-bold text-primary">20+</div>
                <div className="text-sm text-muted-foreground">Làng nghề</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-fade-in">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-card">
              <img
                src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop"
                alt="Đồ thủ công mỹ nghệ Việt Nam"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl p-4 shadow-card border border-border animate-float hidden md:block">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=100&h=100&fit=crop"
                    alt="Gốm sứ"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-sm">Gốm Bát Tràng</p>
                  <p className="text-xs text-muted-foreground">Từ 350.000đ</p>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-golden/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 right-12 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
