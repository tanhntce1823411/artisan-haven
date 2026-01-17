import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const footerLinks = {
  shop: [
    { name: 'Gốm Sứ', href: '/products?category=gom-su' },
    { name: 'Mây Tre Đan', href: '/products?category=may-tre-dan' },
    { name: 'Thổ Cẩm', href: '/products?category=tho-cam' },
    { name: 'Đồ Gỗ', href: '/products?category=do-go' },
    { name: 'Tranh Thêu', href: '/products?category=tranh-theu' },
  ],
  support: [
    { name: 'Hướng dẫn mua hàng', href: '/guide' },
    { name: 'Chính sách vận chuyển', href: '/shipping' },
    { name: 'Đổi trả & Hoàn tiền', href: '/returns' },
    { name: 'Câu hỏi thường gặp', href: '/faq' },
  ],
  company: [
    { name: 'Về chúng tôi', href: '/about' },
    { name: 'Làng nghề đối tác', href: '/artisans' },
    { name: 'Tin tức', href: '/news' },
    { name: 'Liên hệ', href: '/contact' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-secondary border-t border-border">
      {/* Newsletter */}
      <div className="bg-primary text-primary-foreground">
        <div className="container py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="font-display text-2xl font-bold mb-2">
                Đăng ký nhận tin
              </h3>
              <p className="text-primary-foreground/80">
                Nhận thông tin ưu đãi và sản phẩm mới nhất
              </p>
            </div>
            <form className="flex w-full max-w-md gap-2">
              <Input
                type="email"
                placeholder="Email của bạn"
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
              />
              <Button variant="secondary">Đăng ký</Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display text-xl font-bold">V</span>
              </div>
              <span className="font-display text-xl font-bold text-foreground">
                Việt Craft
              </span>
            </Link>
            <p className="text-muted-foreground mb-6">
              Kết nối nghệ nhân truyền thống với người yêu thích đồ thủ công mỹ nghệ Việt Nam.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Danh mục</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span>123 Đường Láng, Đống Đa, Hà Nội</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-5 w-5 flex-shrink-0" />
                <span>1900 1234</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-5 w-5 flex-shrink-0" />
                <span>hello@vietcraft.vn</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © 2024 Việt Craft. Bảo lưu mọi quyền.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Chính sách bảo mật
            </Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">
              Điều khoản sử dụng
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
