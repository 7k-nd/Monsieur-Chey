'use client';

import React from 'react';
import { MapPin, Sparkles, Clock } from 'lucide-react';

export default function LocationSection() {
  return (
    <section id="lieu" className="py-24 px-6 sm:px-12 lg:px-20 border-t border-white/10 relative z-10">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Luther Heading */}
        <div className="max-w-3xl space-y-4">
          <div className="text-pretitle with-line">
            Localisation & Accès
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif text-white">
            Rendez-vous au Big Five, à Lubumbashi.
          </h2>
          <p className="text-base text-white/70 font-light">
            Retrouvez-nous au croisement des avenues Nyota et Mwenda, près du Terminus Battant.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Details Card */}
          <div className="lg:col-span-6 bg-[#1c1d1e] p-8 rounded border border-white/10 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#eabe7c] block mb-1">
                  Adresse Officielle
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-white">
                  Big Five, Lubumbashi
                </h3>
                <p className="text-sm text-white/80 mt-1 font-medium text-[#eabe7c]">
                  Croisement des avenues Nyota et Mwenda, près du Terminus Battant
                </p>
              </div>

              <div className="space-y-4 pt-2 border-t border-white/10">
                
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded bg-black/40 text-[#eabe7c] shrink-0 border border-white/10">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Horaires</h4>
                    <p className="text-xs text-white/60 mt-0.5">Samedi 21 novembre 2026, de 15h00 à 19h00.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded bg-black/40 text-[#eabe7c] shrink-0 border border-white/10">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Tenue</h4>
                    <p className="text-xs text-white/60 mt-0.5">Élégant et classique.</p>
                  </div>
                </div>

              </div>
            </div>

            <div className="pt-4">
              <a
                href="https://maps.google.com/?q=Big+Five+Lubumbashi+Avenue+Nyota+Mwenda"
                target="_blank"
                rel="noopener noreferrer"
                className="luther-btn luther-btn-primary !text-[10px]"
              >
                Ouvrir dans Google Maps
              </a>
            </div>
          </div>

          {/* Map Area */}
          <div className="lg:col-span-6 bg-[#1c1d1e] p-8 rounded border border-white/10 flex flex-col justify-between text-center relative overflow-hidden">
            <div className="flex justify-between items-center text-xs font-mono text-white/50">
              <span>Big Five • Lubumbashi</span>
              <span className="text-[#eabe7c] font-sans uppercase font-semibold text-[10px]">Accès à la rencontre</span>
            </div>

            <div className="mt-6 mb-4">
              <div className="w-16 h-16 rounded-full bg-[#eabe7c]/10 border-2 border-[#eabe7c] mx-auto flex items-center justify-center text-[#eabe7c] mb-4">
                <MapPin className="w-7 h-7" />
              </div>
              <h4 className="font-serif text-2xl text-white">
                Big Five, Lubumbashi
              </h4>
              <p className="text-xs text-white/60 max-w-sm mx-auto mt-2">
                Croisement des avenues Nyota et Mwenda, près du Terminus Battant.
              </p>
            </div>

            <div className="relative w-full h-[260px] overflow-hidden rounded border border-white/10 bg-[#111213]">
              <iframe
                title="Carte Big Five Lubumbashi"
                src="https://www.google.com/maps?q=Big+Five+Lubumbashi+Avenue+Nyota+Mwenda&z=15&output=embed"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

            <div className="mt-4 p-3 bg-black/40 rounded border border-white/5 text-[11px] text-[#eabe7c]">
              Samedi 21 novembre 2026 • 15h00 – 19h00
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
