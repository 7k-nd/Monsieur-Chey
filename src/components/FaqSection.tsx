'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FaqSection() {
  const faqs = [
    {
      q: 'Comment s\u2019effectue le paiement de mon billet ?',
      a: 'Vous pouvez payer facilement via Mobile Money en RDC (Vodacom M-Pesa, Airtel Money, Orange Money), en espèces auprès du comité d\u2019organisation, ou par virement bancaire. Une fois votre référence transmise ou votre versement effectué, votre billet QR officiel est validé instantanément.',
    },
    {
      q: 'Comment récupérer mon billet une fois inscrit ?',
      a: 'Dès votre formulaire soumis, vous accédez à votre page privée avec votre billet QR unique. Vous pouvez le télécharger au format image haute définition, le recevoir par WhatsApp ou le retrouver à tout moment sur ce site en entrant simplement votre numéro de téléphone.',
    },
    {
      q: 'Que se passe-t-il à l\u2019entrée le jour de l\u2019événement ?',
      a: 'L\u2019équipe d\u2019accueil scanne votre QR code en une fraction de seconde grâce à l\u2019application dédiée. Votre photo, votre nom et votre numéro de table s\u2019affichent instantanément à l\u2019écran pour vous orienter sans aucune file d\u2019attente.',
    },
    {
      q: 'Puis-je inscrire un collaborateur ou une délégation d\u2019entreprise ?',
      a: 'Oui, vous pouvez opter pour la formule « Table Entreprise (5 places) » ou inscrire individuellement vos collaborateurs. L\u2019administration peut également importer ou assigner des tables groupées.',
    },
    {
      q: 'Que faire si je n\u2019ai pas de connexion internet le jour J ?',
      a: 'Vous pouvez enregistrer la capture d\u2019écran de votre billet QR sur votre téléphone ou l\u2019imprimer. De plus, notre système de scan à l\u2019entrée fonctionne parfaitement hors ligne.',
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
            Une organisation fluide et transparente pensée pour les professionnels exigeants.
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
