'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import VisionSection from '@/components/VisionSection';
import ProgramSection from '@/components/ProgramSection';
import PricingSection from '@/components/PricingSection';
import PartnersSection from '@/components/PartnersSection';
import LocationSection from '@/components/LocationSection';
import FaqSection from '@/components/FaqSection';
import Footer from '@/components/Footer';
import RegistrationModal from '@/components/RegistrationModal';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import { TicketCategory } from '@/types';
import { useScrollReveal } from '@/lib/useScrollReveal';

export default function HomePage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TicketCategory>('standard');

  // Activate scroll reveal animations
  useScrollReveal();

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleOpenRegister = (cat: TicketCategory = 'standard') => {
    setSelectedCategory(cat);
    setIsModalOpen(true);
  };

  return (
    <div className={`s-pagewrap relative min-h-screen transition-colors duration-500 ${theme === 'light' ? 'light-mode' : 'bg-[#141516] text-[#a1a1a2]'}`}>
      {/* Luther's Background Circles */}
      <div className="circles">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <Navbar
        onOpenRegister={() => handleOpenRegister('standard')}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
      
      <main className="s-content relative z-10">
        <HeroSection onOpenRegister={() => handleOpenRegister('standard')} />
        
        <div className="reveal fade-up">
          <VisionSection />
        </div>
        <div className="reveal fade-up">
          <ProgramSection />
        </div>
        <div className="reveal scale-in">
          <PricingSection onSelectCategory={(cat) => handleOpenRegister(cat)} />
        </div>
        <div className="reveal fade-up">
          <PartnersSection />
        </div>
        <div className="reveal fade-left">
          <LocationSection />
        </div>
        <div className="reveal fade-up">
          <FaqSection />
        </div>
      </main>

      <div className="reveal fade-up">
        <Footer />
      </div>

      {/* Floating WhatsApp contact button */}
      <FloatingWhatsApp />

      <RegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultCategory={selectedCategory}
      />
    </div>
  );
}
