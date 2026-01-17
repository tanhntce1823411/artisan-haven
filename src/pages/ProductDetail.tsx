import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Heart,
  Share2,
  Star,
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  MapPin,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { products } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Không tìm thấy sản phẩm</h1>
            <Link to="/products">
              <Button>Quay lại trang sản phẩm</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success('Đã thêm vào giỏ hàng', {
      description: `${quantity} x ${product.name}`,
    });
  };

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground">
              Trang chủ
            </Link>
            <span>/</span>
            <Link to="/products" className="hover:text-foreground">
              Sản phẩm
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>

          {/* Product section */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === index
                          ? 'border-primary'
                          : 'border-transparent'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              {/* Badges */}
              <div className="flex gap-2 mb-4">
                {discount > 0 && (
                  <Badge className="bg-destructive text-destructive-foreground">
                    Giảm {discount}%
                  </Badge>
                )}
                {product.inStock ? (
                  <Badge variant="secondary" className="bg-accent/20 text-accent">
                    Còn hàng
                  </Badge>
                ) : (
                  <Badge variant="secondary">Hết hàng</Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-golden text-golden'
                          : 'text-muted'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium">{product.rating}</span>
                <span className="text-muted-foreground">
                  ({product.reviewCount} đánh giá)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="font-display text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-6">{product.description}</p>

              {/* Meta info */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-muted rounded-lg">
                {product.artisan && (
                  <div>
                    <span className="text-sm text-muted-foreground">Nghệ nhân</span>
                    <p className="font-medium">{product.artisan}</p>
                  </div>
                )}
                {product.origin && (
                  <div>
                    <span className="text-sm text-muted-foreground">Xuất xứ</span>
                    <p className="font-medium flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {product.origin}
                    </p>
                  </div>
                )}
                {product.materials && (
                  <div className="col-span-2">
                    <span className="text-sm text-muted-foreground">Chất liệu</span>
                    <p className="font-medium">{product.materials.join(', ')}</p>
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium">Số lượng:</span>
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mb-8">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Thêm vào giỏ
                </Button>
                <Button size="lg" variant="outline">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-card rounded-lg border border-border">
                  <Truck className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <span className="text-xs">Giao hàng toàn quốc</span>
                </div>
                <div className="text-center p-3 bg-card rounded-lg border border-border">
                  <Shield className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <span className="text-xs">Bảo hành chất lượng</span>
                </div>
                <div className="text-center p-3 bg-card rounded-lg border border-border">
                  <RotateCcw className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <span className="text-xs">Đổi trả 7 ngày</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="description" className="mb-16">
            <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent h-auto p-0">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Mô tả chi tiết
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Đánh giá ({product.reviewCount})
              </TabsTrigger>
              <TabsTrigger
                value="shipping"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Vận chuyển
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="pt-6">
              <div className="prose prose-stone max-w-none">
                <p>{product.description}</p>
                <h3>Đặc điểm nổi bật</h3>
                <ul>
                  <li>Sản phẩm được làm thủ công 100% bởi nghệ nhân lành nghề</li>
                  <li>Chất liệu tự nhiên, thân thiện với môi trường</li>
                  <li>Mang đậm nét văn hóa truyền thống Việt Nam</li>
                  <li>Mỗi sản phẩm là độc nhất, có thể có chút khác biệt về chi tiết</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="pt-6">
              <p className="text-muted-foreground">
                Chức năng đánh giá sẽ được cập nhật sau khi kết nối backend.
              </p>
            </TabsContent>

            <TabsContent value="shipping" className="pt-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Truck className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Giao hàng tiêu chuẩn</h4>
                    <p className="text-sm text-muted-foreground">
                      3-5 ngày làm việc. Miễn phí cho đơn từ 500.000đ
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Đóng gói cẩn thận</h4>
                    <p className="text-sm text-muted-foreground">
                      Sản phẩm được đóng gói chống sốc, bảo vệ tối đa
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-bold mb-6">
                Sản phẩm liên quan
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
