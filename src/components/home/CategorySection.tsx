import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { categories } from '@/data/products';

export default function CategorySection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Danh mục sản phẩm
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Khám phá các loại hình thủ công mỹ nghệ đa dạng từ khắp các vùng miền Việt Nam
          </p>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/products?category=${category.slug}`}
              className="group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden hover-lift">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <h3 className="font-display text-lg font-semibold text-background mb-1">
                    {category.name}
                  </h3>
                  <p className="text-background/80 text-sm">
                    {category.productCount} sản phẩm
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View all link */}
        <div className="text-center mt-10">
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
          >
            Xem tất cả danh mục
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
