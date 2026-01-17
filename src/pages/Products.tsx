import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Grid3X3, LayoutList, ChevronDown } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { products, categories } from '@/data/products';

const priceRanges = [
  { label: 'Dưới 500.000đ', min: 0, max: 500000 },
  { label: '500.000đ - 1.000.000đ', min: 500000, max: 1000000 },
  { label: '1.000.000đ - 2.000.000đ', min: 1000000, max: 2000000 },
  { label: 'Trên 2.000.000đ', min: 2000000, max: Infinity },
];

const ratingFilters = [4.5, 4, 3.5, 3];

export default function Products() {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('category') ? [searchParams.get('category')!] : []
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000000]);
  const [minRating, setMinRating] = useState<number>(0);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    const search = searchParams.get('search');
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    // Price filter
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Rating filter
    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.reverse();
        break;
      default:
        // Featured - keep original order
        break;
    }

    return result;
  }, [searchParams, selectedCategories, priceRange, minRating, sortBy]);

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h4 className="font-display font-semibold mb-4">Danh mục</h4>
        <div className="space-y-3">
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex items-center gap-3 cursor-pointer"
            >
              <Checkbox
                checked={selectedCategories.includes(category.slug)}
                onCheckedChange={() => toggleCategory(category.slug)}
              />
              <span className="text-sm">{category.name}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                ({category.productCount})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h4 className="font-display font-semibold mb-4">Khoảng giá</h4>
        <Slider
          value={priceRange}
          onValueChange={(value) => setPriceRange(value as [number, number])}
          min={0}
          max={3000000}
          step={100000}
          className="mb-4"
        />
        <div className="flex items-center gap-2 text-sm">
          <span>{formatPrice(priceRange[0])}đ</span>
          <span className="text-muted-foreground">-</span>
          <span>{formatPrice(priceRange[1])}đ</span>
        </div>
      </div>

      {/* Rating */}
      <div>
        <h4 className="font-display font-semibold mb-4">Đánh giá</h4>
        <div className="space-y-3">
          {ratingFilters.map((rating) => (
            <label
              key={rating}
              className="flex items-center gap-3 cursor-pointer"
            >
              <Checkbox
                checked={minRating === rating}
                onCheckedChange={() =>
                  setMinRating((prev) => (prev === rating ? 0 : rating))
                }
              />
              <span className="text-sm">Từ {rating} sao trở lên</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear filters */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setSelectedCategories([]);
          setPriceRange([0, 3000000]);
          setMinRating(0);
        }}
      >
        Xóa bộ lọc
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Tất cả sản phẩm
            </h1>
            <p className="text-muted-foreground">
              Khám phá {filteredProducts.length} sản phẩm thủ công mỹ nghệ
            </p>
          </div>

          {/* Active filters */}
          {(selectedCategories.length > 0 || minRating > 0) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedCategories.map((slug) => {
                const category = categories.find((c) => c.slug === slug);
                return (
                  <Badge
                    key={slug}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => toggleCategory(slug)}
                  >
                    {category?.name} ✕
                  </Badge>
                );
              })}
              {minRating > 0 && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => setMinRating(0)}
                >
                  Từ {minRating}★ ✕
                </Badge>
              )}
            </div>
          )}

          <div className="flex gap-8">
            {/* Desktop sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <h3 className="font-display text-lg font-semibold mb-6 flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Bộ lọc
                </h3>
                <FilterContent />
              </div>
            </aside>

            {/* Products section */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
                {/* Mobile filter button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Bộ lọc
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle>Bộ lọc sản phẩm</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort */}
                <div className="flex items-center gap-4 ml-auto">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sắp xếp" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Nổi bật</SelectItem>
                      <SelectItem value="newest">Mới nhất</SelectItem>
                      <SelectItem value="price-asc">Giá: Thấp → Cao</SelectItem>
                      <SelectItem value="price-desc">Giá: Cao → Thấp</SelectItem>
                      <SelectItem value="rating">Đánh giá cao</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* View mode */}
                  <div className="hidden sm:flex border border-border rounded-lg">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="icon"
                      className="rounded-r-none"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="icon"
                      className="rounded-l-none"
                      onClick={() => setViewMode('list')}
                    >
                      <LayoutList className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Products grid */}
              {filteredProducts.length > 0 ? (
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                      : 'flex flex-col gap-4'
                  }
                >
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg mb-4">
                    Không tìm thấy sản phẩm phù hợp
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCategories([]);
                      setPriceRange([0, 3000000]);
                      setMinRating(0);
                    }}
                  >
                    Xóa bộ lọc
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
