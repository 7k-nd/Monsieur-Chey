'use client';

import React from 'react';
import { Calendar, MapPin, ArrowDown } from 'lucide-react';
import CountdownTimer from './CountdownTimer';

interface HeroSectionProps {
  onOpenRegister: () => void;
}

export default function HeroSection({ onOpenRegister }: HeroSectionProps) {

  return (
    <section id="intro" className="hero-cinematic relative min-h-screen flex flex-col justify-between pt-36 pb-16 px-6 sm:px-12 lg:px-20 z-10 overflow-hidden">
      
      {/* Background image with Ken Burns slow zoom */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat hero-bg-kenburns scale-105"
        style={{ backgroundImage: "url('/images/hero-bg.jfif')" }}
      />
      {/* High-contrast dark cinematic gradient overlay ensuring razor-sharp readability */}
      <div className="hero-overlay absolute inset-0 bg-gradient-to-b from-black/85 via-black/65 to-black/92 transition-all duration-500" />
      {/* Subtle white ambient glow from top */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
      <div className="hero-light-sweep absolute inset-0 pointer-events-none" aria-hidden="true" />
      
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Main Editorial Text */}
          <div className="lg:col-span-8 space-y-8">
            
            <div className="hero-entrance text-pretitle with-line font-bold tracking-[0.25em] text-[#eabe7c]">
              Monsieur Chey présente • Lubumbashi 2026
            </div>

            <h1 className="hero-entrance hero-entrance-delay-1 text-huge-title !text-white font-extrabold tracking-tight drop-shadow-[0_4px_25px_rgba(0,0,0,0.9)]">
              Et si votre prochain partenaire d&apos;affaires vous attendait autour d&apos;un dîner<span className="text-[#eabe7c]"> ?</span>
            </h1>

            <p className="hero-entrance hero-entrance-delay-2 text-lg sm:text-xl text-white font-normal max-w-3xl leading-relaxed drop-shadow-[0_2px_15px_rgba(0,0,0,0.85)]">
              Le Dîner des Entrepreneurs réunit à Lubumbashi des femmes et des hommes qui entreprennent, développent des projets et souhaitent élargir leur réseau. Une rencontre conviviale, pensée pour favoriser des échanges utiles, des retours d&apos;expérience sincères et de nouvelles collaborations. Ici, chaque rencontre peut ouvrir une possibilité.
            </p>

            <div className="hero-entrance hero-entrance-delay-3 flex flex-wrap gap-4 pt-2 text-xs font-semibold uppercase tracking-wider text-white">
              <div className="meta-badge flex items-center gap-2 px-4 py-2.5 bg-black/50 backdrop-blur-md border border-white/20 rounded-md shadow-md transition-colors">
                <Calendar className="w-4 h-4 text-[#eabe7c]" />
                <span className="text-white font-medium">Samedi 21 novembre 2026 • 15h00 – 19h00</span>
              </div>
              <div className="meta-badge flex items-center gap-2 px-4 py-2.5 bg-black/50 backdrop-blur-md border border-white/20 rounded-md shadow-md transition-colors">
                <MapPin className="w-4 h-4 text-[#eabe7c]" />
                <span className="text-white font-medium">Big Five • Nyota et Mwenda, près du Terminus Battant</span>
              </div>
              <div className="meta-badge px-4 py-2.5 bg-black/50 backdrop-blur-md border border-white/20 rounded-md shadow-md">
                <span className="text-white font-medium">Tenue élégante et classique</span>
              </div>
            </div>

            <div className="hero-entrance hero-entrance-delay-4 flex flex-wrap gap-4 pt-4">
              <button
                onClick={onOpenRegister}
                className="luther-btn luther-btn-primary shadow-[0_0_25px_rgba(234,190,124,0.35)]"
              >
                Réserver ma place
              </button>

              <a
                href="#vision"
                className="luther-btn luther-btn-stroke bg-white/5 backdrop-blur-sm border-white/40 hover:bg-white hover:text-black transition-all"
              >
                Découvrir le concept
              </a>
            </div>

          </div>

          {/* Right Column */}
          <div className="hero-entrance hero-entrance-delay-3 lg:col-span-4 space-y-8 lg:pl-6">
            
            <div className="glass-panel p-6 rounded-lg border border-white/20 bg-black/60 backdrop-blur-md shadow-2xl space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#eabe7c] block">
                Temps restant avant l&apos;événement
              </span>
            <CountdownTimer />
            </div>

          </div>

        </div>
      </div>

      <div className="relative z-10 pt-12 text-center lg:text-left max-w-7xl mx-auto w-full">
        <a
          href="#vision"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/40 hover:text-[#eabe7c] transition-colors"
        >
          <span>Défiler pour explorer</span>
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
        </a>
      </div>

    </section>
  );
}
