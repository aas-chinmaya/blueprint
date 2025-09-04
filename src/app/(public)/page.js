'use client';

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { FeatureSection, HeroSection } from '@/components/layout/hero-section';


export default function LandingPage() {


  return (
   
    <div className='bg-background dark:bg-gradient-to-b dark:from-[#0e0e0e] dark:via-[#161616] dark:to-[#1c1c1c]'>
    <Header />
<HeroSection/>   <FeatureSection/> 
    <Footer/>
    </div>
  );
}
