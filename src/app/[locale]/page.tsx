import { LandingLayout } from '@/components/layout';
import {
  AmenitiesSection,
  CtaSection,
  HeroSection,
  PricingSection,
  StatsSection,
  TestimonialsSection,
  TrainersSection,
} from './_components';

export default function HomePage() {
  return (
    <LandingLayout>
      <HeroSection />
      <StatsSection />
      <PricingSection />
      <TrainersSection />
      <AmenitiesSection />
      <TestimonialsSection />
      <CtaSection />
    </LandingLayout>
  );
}
