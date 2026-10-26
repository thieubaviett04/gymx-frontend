'use client';

import React from 'react';
import HeroSection from './HeroSection';
import StatsSection from './StatsSection';
import PricingSection from './PricingSection';
import TrainersSection from './TrainersSection';
import AmenitiesSection from './AmenitiesSection';
import TestimonialsSection from './TestimonialsSection';
import CtaSection from './CtaSection';

export default function LandingContent() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <PricingSection />
      <TrainersSection />
      <AmenitiesSection />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}
