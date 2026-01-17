import { Quote } from 'lucide-react';

const artisans = [
  {
    id: 1,
    name: 'Nghệ nhân Nguyễn Văn Minh',
    craft: 'Gốm Bát Tràng',
    experience: '35 năm kinh nghiệm',
    quote: 'Mỗi sản phẩm là một tác phẩm nghệ thuật, chứa đựng tâm huyết và tình yêu với nghề truyền thống.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  },
  {
    id: 2,
    name: 'Nghệ nhân Trần Thị Hoa',
    craft: 'Thêu Thường Tín',
    experience: '28 năm kinh nghiệm',
    quote: 'Từng đường kim, mũi chỉ đều mang theo câu chuyện và linh hồn của làng quê Việt Nam.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
  },
  {
    id: 3,
    name: 'Nghệ nhân Lê Văn Hùng',
    craft: 'Đồ gỗ mỹ nghệ',
    experience: '40 năm kinh nghiệm',
    quote: 'Gỗ có linh hồn riêng, người thợ chỉ là người giúp nó tìm thấy hình hài đẹp nhất.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
  },
];

export default function ArtisanSection() {
  return (
    <section className="py-16 md:py-24 bg-secondary">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Nghệ nhân đối tác
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Gặp gỡ những bàn tay tài hoa đằng sau mỗi sản phẩm thủ công mỹ nghệ
          </p>
        </div>

        {/* Artisan cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {artisans.map((artisan, index) => (
            <div
              key={artisan.id}
              className="bg-card rounded-2xl p-6 shadow-card border border-border hover-lift animate-slide-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Quote icon */}
              <Quote className="h-8 w-8 text-primary/30 mb-4" />

              {/* Quote */}
              <p className="text-muted-foreground italic mb-6 min-h-[80px]">
                "{artisan.quote}"
              </p>

              {/* Artisan info */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary">
                  <img
                    src={artisan.image}
                    alt={artisan.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-foreground">
                    {artisan.name}
                  </h4>
                  <p className="text-sm text-primary">{artisan.craft}</p>
                  <p className="text-xs text-muted-foreground">
                    {artisan.experience}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
