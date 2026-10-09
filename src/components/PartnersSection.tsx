'use client';

import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { Partner, fetchRemoteSettings, DEFAULT_PARTNERS } from '@/lib/settings';

export default function PartnersSection() {
  const [partners, setPartners] = useState<Partner[]>(DEFAULT_PARTNERS);

  useEffect(() => {
    fetchRemoteSettings()
      .then((settings) => setPartners(settings.partners))
      .catch((error) => console.error('Unable to load event settings:', error));
  }, []);

  if (partners.length === 0) return null;

  const marqueePartners = [...partners, ...partners];

  return (
    <section className="partners-marquee-section py-20 px-6 sm:px-12 lg:px-20 border-t border-white/10 relative z-10">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-pretitle with-line">
              Soutiens & Sponsors
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif text-white">
              Ils Accompagnent l&apos;Événement.
            </h2>
          </div>
        </div>

        <div className="partners-marquee-shell relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-sm">
          <div className="partners-marquee-track flex w-max items-center gap-4 py-6 pl-4 pr-4">
            {marqueePartners.map((partner, index) => (
              <div
                key={`${partner.id}-${index}`}
                className="partner-marquee-item group relative flex h-24 w-44 items-center justify-center rounded-2xl border border-white/10 bg-[#121314]/90 px-4 shadow-[0_18px_40px_rgba(0,0,0,0.18)] transition-all duration-500 hover:-translate-y-1 hover:border-[#eabe7c]/50 hover:bg-[#1b1d1f]"
                style={{ animationDelay: `${(index % 6) * 0.2}s` }}
                aria-label={partner.name}
                title={partner.name}
              >
                <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(234,190,124,0.18),_transparent_55%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#0e0f10] text-[#eabe7c] shadow-inner shadow-[#eabe7c]/10 transition-transform duration-500 group-hover:scale-110">
                  {partner.logoUrl ? (
                    <img src={partner.logoUrl} alt="" className="h-full w-full object-contain p-1" />
                  ) : (
                    <Building2 className="h-5 w-5" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
