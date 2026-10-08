'use client';

import React, { useState, useEffect } from 'react';
import { Quote } from 'lucide-react';
import { fetchRemoteSettings, DEFAULT_MR_CHEY_PHOTO } from '@/lib/settings';

export default function VisionSection() {
  const [mrCheyPhoto, setMrCheyPhoto] = useState(DEFAULT_MR_CHEY_PHOTO);

  useEffect(() => {
    fetchRemoteSettings()
      .then((settings) => setMrCheyPhoto(settings.mrCheyPhoto))
      .catch((error) => console.error('Unable to load event settings:', error));
  }, []);

  return (
    <section id="vision" className="py-24 px-6 sm:px-12 lg:px-20 border-t border-white/10 relative z-10">
      <div className="max-w-7xl mx-auto space-y-24">
        
        {/* Luther About Info Layout (2 Columns: Picture + Text) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Picture Block in Luther style with border offset */}
          <div className="lg:col-span-6 relative">
            <div className="relative z-10 overflow-hidden rounded-lg bg-[#1a1b1d] border-2 border-white/20 aspect-[4/5] shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
              <img
                src={mrCheyPhoto && mrCheyPhoto !== '/images/mr-chey.png' ? mrCheyPhoto : '/images/monsieur chey.jpg'}
                alt="Mr Chey - Initiateur & Hôte Principal"
                className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700 brightness-105 contrast-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141516] via-transparent to-white/5 opacity-80" />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-md bg-black/60 backdrop-blur-md border border-white/15 shadow-[0_12px_30px_rgba(0,0,0,0.4)]">
                <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#eabe7c] block mb-1">
                  Initiateur & Hôte Principal
                </span>
                <h3 className="font-serif text-3xl font-bold text-white tracking-wide">Mr Chey</h3>
                <p className="text-xs text-white/90 font-medium">Entrepreneur, Mentor & Stratège d&apos;Affaires</p>
              </div>
            </div>

            {/* Decorative Offset Border with white-gold highlight */}
            <div className="hidden sm:block absolute -bottom-4 -right-4 w-full h-full border-2 border-white/25 rounded-lg -z-0 pointer-events-none" />
          </div>

          {/* Text Block in Luther style */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="text-pretitle with-line">
              Vision & Raison d&apos;Être
            </div>

            <h2 className="attention-getter text-white drop-shadow-sm font-serif">
              « Créer la table stratégique où naissent les alliances économiques majeures du grand Katanga. »
            </h2>

            <p className="text-base text-white/90 leading-relaxed font-light">
              Le Dîner des Entrepreneurs est conçu comme un cercle d&apos;affaires sélectif et chaleureux. Loin des conférences magistrales impersonnelles, nous privilégions la rencontre directe, les échanges d&apos;expérience sincères et les deals concrets entre décideurs.
            </p>

            {/* Quote block with white accent */}
            <div className="p-6 bg-white/[0.06] border-l-4 border-[#eabe7c] rounded-r-lg border-y border-r border-white/10 text-sm text-white italic space-y-2 backdrop-blur-sm shadow-lg">
              <Quote className="w-5 h-5 text-[#eabe7c] opacity-80" />
              <p className="text-white/95 leading-relaxed">
                « Les opportunités les plus puissantes se concluent toujours autour d&apos;un repas raffiné, entre personnes partageant la même volonté de bâtir. »
              </p>
              <span className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#eabe7c] not-italic">
                — Mr Chey
              </span>
            </div>

            <div className="pt-2">
              <a
                href="#tarifs"
                className="luther-btn luther-btn-primary"
              >
                Prendre part à cette table
              </a>
            </div>

          </div>

        </div>

        {/* Luther Skills List Style (The 4 Core Pillars) */}
        <div className="pt-12 border-t border-white/10 space-y-8">
          <div className="text-pretitle">
            Les Piliers du Dîner
          </div>

          <ul className="skills-list">
            <li>Networking Stratégique VIP</li>
            <li>Deal Room & Synergies Katanga</li>
            <li>Dîner Gastronomique 3 Services</li>
            <li>Partage d&apos;Expérience Réelle</li>
            <li>Billet QR & Accès Sécurisé</li>
          </ul>
        </div>

      </div>
    </section>
  );
}
