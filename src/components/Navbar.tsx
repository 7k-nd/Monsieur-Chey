'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Ticket, Sun, Moon } from 'lucide-react';
import { getMyLastTicketToken } from '@/lib/storage';

interface NavbarProps {
  onOpenRegister: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export default function Navbar({ onOpenRegister, theme = 'light', onToggleTheme }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [myTicketToken, setMyTicketToken] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    const updateToken = () => {
      setMyTicketToken(getMyLastTicketToken());
    };

    updateToken();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('diner_my_ticket_updated', updateToken);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('diner_my_ticket_updated', updateToken);
    };
  }, []);

  const ticketHref = myTicketToken ? `/billet/${myTicketToken}` : '/retrouver-billet';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'nav-scrolled bg-[#141516]/95 backdrop-blur-md border-b border-white/10 shadow-2xl py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between">
        
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group" aria-label="Mr Chey - Accueil">
          <Image
            src="/logo.png"
            alt="Logo Mr Chey"
            width={96}
            height={96}
            className="brand-logo h-14 w-14 object-contain sm:h-16 sm:w-16"
            priority
          />
          <span className="hidden sm:inline-block text-[9px] uppercase tracking-[0.25em] text-white/50 font-medium">
            Dîner des Entrepreneurs
          </span>
        </Link>

        {/* Desktop Nav (Without speakers/intervenants) */}
        <nav className="hidden lg:flex items-center gap-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
          <a href="#intro" className="hover:text-[#eabe7c] transition-colors">Intro</a>
          <a href="#vision" className="hover:text-[#eabe7c] transition-colors">Vision</a>
          <a href="#programme" className="hover:text-[#eabe7c] transition-colors">Programme</a>
          <a href="#tarifs" className="hover:text-[#eabe7c] transition-colors">Tarifs</a>
          <a href="#lieu" className="hover:text-[#eabe7c] transition-colors">Lieu</a>
          <a href="#faq" className="hover:text-[#eabe7c] transition-colors">FAQ</a>
        </nav>

        {/* Action CTAs (Scan button removed; Mon Billet directly opens user's ticket) */}
        <div className="hidden lg:flex items-center gap-4">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all flex items-center justify-center"
              title={theme === 'light' ? 'Passer en mode sombre' : 'Passer en mode clair ivoire'}
              aria-label="Changer de thème"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-[#0f172a]" />
              ) : (
                <Sun className="w-4 h-4 text-[#eabe7c]" />
              )}
            </button>
          )}

          <Link
            href={ticketHref}
            className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/80 hover:text-[#eabe7c] transition-colors flex items-center gap-1.5"
            title={myTicketToken ? 'Accéder à mon billet' : 'Retrouver mon billet'}
          >
            <Ticket className="w-3.5 h-3.5 text-[#eabe7c]" />
            <span>Mon Billet</span>
          </Link>

          <button
            onClick={onOpenRegister}
            className="luther-btn luther-btn-primary !py-2.5 !px-5 !text-[10px]"
          >
            Réserver
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="flex lg:hidden items-center gap-2">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-1.5 rounded-full bg-white/10 border border-white/20 transition-all"
              title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-[#0f172a]" />
              ) : (
                <Sun className="w-4 h-4 text-[#eabe7c]" />
              )}
            </button>
          )}
          <button
            onClick={onOpenRegister}
            className="luther-btn luther-btn-primary !py-2 !px-3.5 !text-[10px]"
          >
            Réserver
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-white hover:text-[#eabe7c]"
            aria-label="Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Scan removed, Intervenants removed, Mon Billet enhanced) */}
      {isOpen && (
        <div className="lg:hidden bg-[#141516] border-b border-white/10 px-6 py-6 space-y-4 animate-fade-in shadow-2xl">
          <div className="grid grid-cols-2 gap-3 text-xs uppercase tracking-widest font-semibold text-white/80">
            <a href="#intro" onClick={() => setIsOpen(false)} className="p-3 bg-[#1c1d1e] rounded hover:text-[#eabe7c]">Intro</a>
            <a href="#vision" onClick={() => setIsOpen(false)} className="p-3 bg-[#1c1d1e] rounded hover:text-[#eabe7c]">Vision</a>
            <a href="#programme" onClick={() => setIsOpen(false)} className="p-3 bg-[#1c1d1e] rounded hover:text-[#eabe7c]">Programme</a>
            <a href="#tarifs" onClick={() => setIsOpen(false)} className="p-3 bg-[#1c1d1e] rounded hover:text-[#eabe7c]">Tarifs</a>
            <a href="#lieu" onClick={() => setIsOpen(false)} className="p-3 bg-[#1c1d1e] rounded hover:text-[#eabe7c]">Lieu</a>
            <a href="#faq" onClick={() => setIsOpen(false)} className="p-3 bg-[#1c1d1e] rounded hover:text-[#eabe7c]">FAQ</a>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
            <Link
              href={ticketHref}
              onClick={() => setIsOpen(false)}
              className="p-3 rounded bg-[#1c1d1e] text-xs font-semibold uppercase tracking-wider text-[#eabe7c] flex items-center justify-center gap-2"
            >
              <Ticket className="w-4 h-4" />
              <span>{myTicketToken ? 'Accéder à mon Billet' : 'Retrouver mon Billet'}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
