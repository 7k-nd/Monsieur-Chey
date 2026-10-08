'use client';

import React from 'react';
import { Calendar, MapPin, ArrowDown } from 'lucide-react';
import CountdownTimer from './CountdownTimer';

interface HeroSectionProps {
  onOpenRegister: () => void;
}

export default function HeroSection({ onOpenRegister }: HeroSectionProps) {

  return (
    <section id="intro" className="relative min-h-screen flex flex-col justify-between pt-36 pb-16 px-6 sm:px-12 lg:px-20 z-10 overflow-hidden">
      
      {/* Background image with Ken Burns slow zoom */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat hero-bg-kenburns scale-105"
        style={{ backgroundImage: "url('/images/hero-bg.jfif')" }}
      />
      {/* High-contrast dark cinematic gradient overlay ensuring razor-sharp readability */}
      <div className="hero-overlay absolute inset-0 bg-gradient-to-b from-black/85 via-black/65 to-black/92 transition-all duration-500" />
      {/* Subtle white ambient glow from top */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Main Editorial Text */}
          <div className="lg:col-span-8 space-y-8">
            
            <div className="text-pretitle with-line font-bold tracking-[0.25em] text-[#eabe7c]">
              Mr Chey présente • Lubumbashi 2026
            </div>

            <h1 className="text-huge-title !text-white font-extrabold tracking-tight drop-shadow-[0_4px_25px_rgba(0,0,0,0.9)]">
              Le Dîner des <br />
              Entrepreneurs<span className="text-[#eabe7c]">.</span>
            </h1>

            <p className="text-lg sm:text-2xl text-white font-normal max-w-2xl leading-relaxed drop-shadow-[0_2px_15px_rgba(0,0,0,0.85)]">
              Le grand rendez-vous d&apos;exception qui réunit fondateurs visionnaires, capitaines d&apos;industrie et investisseurs du Katanga autour d&apos;une gastronomie d&apos;élite et de synergies concrètes.
            </p>

            {/* Meta badges with Big 5 Lubumbashi (Av. Nyota, coin Mwenda) */}
            <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold uppercase tracking-wider text-white">
              <div className="meta-badge flex items-center gap-2 px-4 py-2.5 bg-black/50 backdrop-blur-md border border-white/20 rounded-md shadow-md transition-colors">
                <Calendar className="w-4 h-4 text-[#eabe7c]" />
                <span className="text-white font-medium">Samedi 21 Novembre 2026 • 15h00 - 19h30</span>
              </div>
              <div className="meta-badge flex items-center gap-2 px-4 py-2.5 bg-black/50 backdrop-blur-md border border-white/20 rounded-md shadow-md transition-colors">
                <MapPin className="w-4 h-4 text-[#eabe7c]" />
                <span className="text-white font-medium">Big 5 Lubumbashi (Av. Nyota, coin Mwenda)</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
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
                Découvrir la vision
              </a>
            </div>

          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-8 lg:pl-6">
            
            <div className="glass-panel p-6 rounded-lg border border-white/20 bg-black/60 backdrop-blur-md shadow-2xl space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#eabe7c] block">
                Temps restant avant l&apos;ouverture
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
