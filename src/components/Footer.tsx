'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUp, Ticket, Shield } from 'lucide-react';
import { createWhatsAppUrl, WHATSAPP_CONTACT_NUMBER } from '@/lib/whatsapp';

export default function Footer() {
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#101112] border-t border-white/10 pt-20 pb-12 px-6 sm:px-12 lg:px-20 text-white/70 relative z-10">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Luther Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Col 1: Brand */}
          <div className="lg:col-span-5 space-y-4">
            <Image
              src="/logo.png"
              alt="Logo Mr Chey"
              width={96}
              height={96}
              className="h-16 w-16 object-contain"
            />
            <p className="text-xs text-white/60 leading-relaxed font-light max-w-sm">
              Le Dîner des Entrepreneurs est l&apos;initiative de référence pour dynamiser les partenariats d&apos;affaires et l&apos;investissement à Lubumbashi et dans le grand Katanga.
            </p>
            <div className="text-xs text-[#eabe7c] font-semibold">
              Samedi 21 Novembre 2026 • Lubumbashi
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-[10px] uppercase font-bold tracking-[0.25em] text-white">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#intro" className="hover:text-[#eabe7c] transition-colors">Intro</a></li>
              <li><a href="#vision" className="hover:text-[#eabe7c] transition-colors">Vision</a></li>
              <li><a href="#programme" className="hover:text-[#eabe7c] transition-colors">Programme</a></li>
              <li><a href="#tarifs" className="hover:text-[#eabe7c] transition-colors">Tarifs ($30 & $50)</a></li>
              <li><a href="#lieu" className="hover:text-[#eabe7c] transition-colors">Lieu</a></li>
              <li><a href="#faq" className="hover:text-[#eabe7c] transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Col 3: Dedicated Portals & Contact (Scan button removed from public UI) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-[10px] uppercase font-bold tracking-[0.25em] text-white">
              Assistance & Accès
            </h4>
            
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/retrouver-billet" className="hover:text-[#eabe7c] transition-colors flex items-center gap-1.5 text-[#eabe7c]">
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Retrouver mon Billet d&apos;entrée</span>
                </Link>
              </li>
            </ul>

            <div className="space-y-1 text-xs text-white/60 pt-2">
              <p>Lubumbashi (Avenue Nyota, coin Mwenda)</p>
              <p>Contact : +243 997 173 630</p>
            </div>

            <div>
              <a
                href={createWhatsAppUrl(
                  "Bonjour Mr Chey, j'ai une question concernant le Dîner des Entrepreneurs.",
                  WHATSAPP_CONTACT_NUMBER
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-950 border border-emerald-500/40 text-emerald-300 rounded text-xs font-semibold hover:bg-emerald-900 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>WhatsApp Secrétariat</span>
              </a>
            </div>
          </div>

        </div>

        {/* Luther Copyright & Go to Top */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/40">
          <div className="space-y-1 text-center sm:text-left">
            <p>
              © 2026 Le Dîner des Entrepreneurs • Tous droits réservés. Une initiative de Mr Chey.
            </p>
            <p className="text-[11px] text-white/50">
              Conçu &amp; Développé par{' '}
              <a
                href="https://bryankanyinda-portfolio.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#eabe7c] hover:text-white font-semibold transition-colors underline decoration-[#eabe7c]/40 underline-offset-4"
              >
                Bryan Kanyinda
              </a>
            </p>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-white/60 hover:text-[#eabe7c] transition-colors group cursor-pointer"
            title="Haut de page"
          >
            <span className="uppercase tracking-widest text-[9px] font-bold">Haut de page</span>
            <div className="w-8 h-8 rounded-full bg-[#1c1d1e] border border-white/10 flex items-center justify-center group-hover:border-[#eabe7c]">
              <ArrowUp className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>

      </div>
    </footer>
  );
}
