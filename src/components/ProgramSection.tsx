'use client';

import React from 'react';

export default function ProgramSection() {
  const schedule = [
    {
      time: '15h00 – 15h25',
      title: 'Accueil et installation',
      meta: 'Accès, orientation et premiers échanges',
      desc: 'Vérification des accès, scan des QR codes, orientation vers les tables, premiers échanges et photos d’arrivée.',
    },
    {
      time: '15h25 – 15h35',
      title: 'Mot de bienvenue et présentation du concept',
      meta: 'Ouverture par l’organisateur',
      desc: 'Ouverture brève, présentation de l’objectif de la rencontre et des règles de participation.',
    },
    {
      time: '15h35 – 16h05',
      title: 'Faisons connaissance',
      meta: 'Présentations en petits groupes',
      desc: 'Présentez votre nom, votre activité, votre secteur et le type de connexion recherché. Une attention particulière est portée aux profils VIP.',
    },
    {
      time: '16h05 – 16h30',
      title: 'Paroles d’entrepreneurs',
      meta: 'Retours d’expérience et questions',
      desc: 'Deux ou trois retours d’expérience courts et concrets : une difficulté rencontrée, une leçon apprise et un conseil utile, suivis de quelques questions.',
    },
    {
      time: '16h30 – 16h45',
      title: 'Pause et échanges libres',
      meta: 'Pause de 15 minutes',
      desc: 'Prenez le temps de vous rafraîchir, d’échanger des contacts et de vous préparer aux rotations.',
    },
    {
      time: '16h45 – 17h30',
      title: 'Speed-networking : rencontres ciblées',
      meta: 'Rotations par tables',
      desc: 'Rotations d’environ 10 minutes selon les secteurs et besoins recueillis à l’inscription. Présentez votre activité et identifiez des pistes de collaboration.',
    },
    {
      time: '17h30 – 18h30',
      title: 'Dîner et conversations d’affaires',
      meta: 'Repas partagé et rencontres',
      desc: 'Repas partagé dans une ambiance élégante et chaleureuse. Conversations libres, rapprochement des contacts et présentations VIP courtes.',
    },
    {
      time: '18h30 – 18h50',
      title: 'Connexions et opportunités',
      meta: 'Prises de contact finales',
      desc: 'Un temps dédié aux besoins, aux offres de collaboration, aux prochaines rencontres et aux mises en relation.',
    },
    {
      time: '18h50 – 19h00',
      title: 'Clôture et photo collective',
      meta: 'Fin officielle',
      desc: 'Remerciements, photo de groupe et rappel des suites possibles avant la fin officielle de la rencontre.',
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
            Le Programme du samedi 21 novembre.
          </h2>
          <p className="text-base text-white/70 font-light">
            Un programme proposé de 15h00 à 19h00, avec une pause et une large place accordée aux rencontres. Les horaires restent à valider par l’organisation.
          </p>
        </div>

        {/* Luther Timeline Grid (2 Columns: Timeline Left & Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {[
            schedule.slice(0, 4),
            schedule.slice(4),
          ].map((column, columnIndex) => (
          <div key={columnIndex} className="space-y-10 border-l border-white/15 pl-6 sm:pl-8 relative">
            {column.map((item, index) => (
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
          ))}
        </div>

      </div>
    </section>
  );
}
