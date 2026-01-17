import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroBanner from '@/components/home/HeroBanner';
import CategorySection from '@/components/home/CategorySection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import ArtisanSection from '@/components/home/ArtisanSection';
import PromoBanner from '@/components/home/PromoBanner';

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroBanner />
        <CategorySection />
        <FeaturedProducts />
        <PromoBanner />
        <ArtisanSection />
      </main>
      <Footer />
    </div>
  );
}
