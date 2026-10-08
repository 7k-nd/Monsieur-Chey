'use client';

import React from 'react';

export default function ProgramSection() {
  const scheduleLeft = [
    {
      time: '15h00 - 15h45',
      title: 'Accueil VIP & Cocktail Red Carpet',
      meta: 'Check-in & Photo Call',
      desc: 'Accueil personnalisé au tapis rouge, remise des badges officiels, photo call prestige et cocktail de bienvenue pour initier les premiers échanges informels.',
    },
    {
      time: '15h45 - 16h30',
      title: 'Keynote d’Ouverture par Mr Chey',
      meta: 'Allocution & Vision Stratégique',
      desc: 'Intervention inaugurale : « Bâtir et pérenniser une entreprise à fort impact dans le grand Katanga : Enjeux, opportunités et financements 2026-2030 ».',
    },
    {
      time: '16h30 - 17h30',
      title: 'Panel Stratégique des Capitaines d’Industrie',
      meta: 'Débat & Retours d’Expérience',
      desc: 'Discussion sans filtre avec 4 leaders économiques de Lubumbashi sur la fiscalité, la chaîne de valeur minière et l’intégration technologique.',
    },
  ];

  const scheduleRight = [
    {
      time: '17h30 - 18h45',
      title: 'Grand Dîner Gastronomique & Pitchs d’Honneur',
      meta: 'Menu 3 Services & Présentations',
      desc: 'Service du dîner gastronomique en 3 services à table, ponctué par des présentations éclair (1 minute) d’entreprises et de projets à haut potentiel.',
    },
    {
      time: '18h45 - 19h30',
      title: 'Deal Room, Networking B2B & Clôture',
      meta: 'Accords & Photo de Famille',
      desc: 'Session intensive de mise en relation d’affaires ciblée, échange de contacts qualifiés, toasts d’honneur et clôture officielle de la soirée.',
    },
  ];

  return (
    <section id="programme" className="py-24 px-6 sm:px-12 lg:px-20 border-t border-white/10 relative z-10">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Luther Heading */}
        <div className="max-w-3xl space-y-4">
          <div className="text-pretitle with-line">
            Déroulement de la Soirée
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif text-white">
            Le Programme du Samedi 21 Novembre.
          </h2>
          <p className="text-base text-white/70 font-light">
            Une organisation rythmée et minutée de 15h00 à 19h30 pour valoriser chaque instant de présence.
          </p>
        </div>

        {/* Luther Timeline Grid (2 Columns: Timeline Left & Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Timeline Column 1 */}
          <div className="space-y-10 border-l border-white/15 pl-6 sm:pl-8 relative">
            {scheduleLeft.map((item, index) => (
              <div key={index} className="relative group space-y-2">
                
                {/* Bullet */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#141516] border-2 border-[#eabe7c] group-hover:bg-[#eabe7c] transition-colors" />

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold text-[#eabe7c] uppercase tracking-wider">
                      {item.time}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">
                      {item.meta}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl text-white group-hover:text-[#eabe7c] transition-colors">
                    {item.title}
                  </h3>
                </div>

                <p className="text-sm text-white/60 leading-relaxed font-light">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Timeline Column 2 */}
          <div className="space-y-10 border-l border-white/15 pl-6 sm:pl-8 relative">
            {scheduleRight.map((item, index) => (
              <div key={index} className="relative group space-y-2">
                
                {/* Bullet */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#141516] border-2 border-[#eabe7c] group-hover:bg-[#eabe7c] transition-colors" />

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold text-[#eabe7c] uppercase tracking-wider">
                      {item.time}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">
                      {item.meta}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl text-white group-hover:text-[#eabe7c] transition-colors">
                    {item.title}
                  </h3>
                </div>

                <p className="text-sm text-white/60 leading-relaxed font-light">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
