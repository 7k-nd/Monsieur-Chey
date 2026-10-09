'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { WHATSAPP_CONTACT_DISPLAY } from '@/lib/whatsapp';

export default function FaqSection() {
  const faqs = [
    {
      q: 'Comment réserver ma place ?',
      a: `Choisissez votre formule et remplissez le formulaire. Réglez ensuite le montant correspondant par Airtel Money au ${WHATSAPP_CONTACT_DISPLAY}. Depuis votre page billet, envoyez la capture de la transaction au même numéro WhatsApp. Votre place est confirmée après vérification du paiement.`,
    },
    {
      q: 'Quand recevrai-je mon QR code ?',
      a: 'Après votre inscription, vous accédez à votre page billet. Le QR code est débloqué sur cette page dès que l’organisateur a vérifié et validé votre paiement. Vous pouvez retrouver votre billet sur le site avec votre numéro de téléphone.',
    },
    {
      q: 'Que se passe-t-il à l\u2019entrée le jour de l\u2019événement ?',
      a: 'À l’accueil, présentez le QR code de votre billet confirmé pour le contrôle d’accès.',
    },
    {
      q: 'Quel est le dress code ?',
      a: 'La tenue demandée est élégante et classique.',
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 px-6 sm:px-12 lg:px-20 border-t border-white/10 relative z-10">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Section Heading — Luther style */}
        <div className="max-w-3xl space-y-4">
          <div className="text-pretitle with-line">
            Questions Fréquentes
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif text-white">
            Tout ce que Vous Devez Savoir.
          </h2>
          <p className="text-base text-white/70 font-light">
            Les informations pratiques sur votre réservation et votre venue.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-[#1c1d1e] rounded border border-white/10 overflow-hidden transition-all duration-300 hover:border-[#eabe7c]/30"
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:text-[#eabe7c] transition-colors"
                >
                  <span className="font-serif text-sm sm:text-base font-bold text-white">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#eabe7c] shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-white/70 leading-relaxed border-t border-white/10 pt-3 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
