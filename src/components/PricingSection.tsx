'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { TicketConfig } from '@/types';

interface PricingSectionProps {
  onSelectCategory: (category: 'standard' | 'vip') => void;
}

export const TICKET_TIERS: TicketConfig[] = [
  {
    id: 'standard',
    name: 'Pass Standard',
    price: 30,
    badge: 'Accès aux activités communes',
    description: 'Prenez part au dîner, aux échanges entre participants et à l’ensemble des activités communes.',
    features: [
      'Accès au dîner et à toutes les activités communes',
      'Retours d’expérience et échanges entre participants',
      'Participation au speed-networking',
    ],
  },
  {
    id: 'vip',
    name: 'Pass VIP',
    price: 50,
    badge: 'Expérience VIP',
    isPopular: true,
    description: 'La formule tout inclus, avec un placement privilégié et des possibilités de visibilité supplémentaires.',
    features: [
      'Accès au dîner et à toutes les activités',
      'Placement privilégié',
      'Possibilité de présenter brièvement son entreprise et ses défis',
      'Possibilité d’apporter roll-up et flyers selon les consignes d’installation',
      'Interview vidéo pour une visibilité sur les comptes de l’organisateur et des partenaires',
    ],
  },
];

export default function PricingSection({ onSelectCategory }: PricingSectionProps) {
  return (
    <section id="tarifs" className="py-24 px-6 sm:px-12 lg:px-20 border-t border-white/10 relative z-10">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Luther Header */}
        <div className="max-w-3xl space-y-4">
          <div className="text-pretitle with-line">
            Formules & Tarifs
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif text-white">
            Tarifs de Participation.
          </h2>
          <p className="text-base text-white/70 font-light">
            Réglez votre billet par Airtel Money, puis transmettez votre justificatif sur WhatsApp. La réservation est confirmée après vérification du paiement.
          </p>
        </div>

        {/* Pricing Cards: 2 Columns for Standard 30$ and VIP 50$ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
          {TICKET_TIERS.map((tier) => {
            return (
              <div
                key={tier.id}
                className={`rounded-xl p-8 sm:p-10 flex flex-col justify-between relative transition-all duration-300 ${
                  tier.isPopular
                    ? 'bg-gradient-to-b from-[#222427] to-[#18191a] border-2 border-white/40 shadow-[0_10px_40px_rgba(255,255,255,0.06)] md:-translate-y-2'
                    : 'bg-[#1a1b1d] border border-white/20 hover:border-white/40'
                }`}
              >
                {/* Popular Tag with bright white-gold styling */}
                {tier.isPopular && (
                  <div className="absolute -top-3.5 left-8 px-4 py-1 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg border border-white">
                    Formule VIP
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#eabe7c] block mb-1">
                      {tier.badge}
                    </span>
                    <h3 className="font-serif text-3xl font-bold text-white">
                      {tier.name}
                    </h3>
                  </div>

                  <p className="text-xs text-white/85 leading-relaxed font-light">
                    {tier.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 pb-6 border-b border-white/15">
                    <span className="text-5xl font-serif font-bold text-white">
                      ${tier.price}
                    </span>
                    <span className="text-xs text-[#eabe7c] font-mono font-semibold">USD / personne</span>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-white/70 block">
                      Inclus dans votre réservation :
                    </span>
                    {tier.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-white/95">
                        <Check className="w-3.5 h-3.5 text-[#eabe7c] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Button */}
                <div className="pt-8">
                  <button
                    onClick={() => onSelectCategory(tier.id)}
                    className={`w-full luther-btn ${
                      tier.isPopular ? 'luther-btn-primary shadow-[0_0_20px_rgba(234,190,124,0.3)]' : 'luther-btn-stroke bg-white/5 hover:bg-white hover:text-black border-white/30'
                    }`}
                  >
                    <span>Réserver en {tier.name} ({tier.price} USD)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
