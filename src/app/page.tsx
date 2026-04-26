import { HeroSection } from '@/components/home/HeroSection';
import { CategoryCards } from '@/components/home/CategoryCards';
import { FeaturedSection } from '@/components/home/FeaturedSection';
import { WhyUsSection } from '@/components/home/WhyUsSection';
import { AppSection } from '@/components/home/AppSection';

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <HeroSection />
      <CategoryCards />
      <FeaturedSection />
      <WhyUsSection />
      <AppSection />
    </div>
  );
}
