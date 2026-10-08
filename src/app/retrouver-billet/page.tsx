'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Phone, Ticket, AlertCircle, ArrowRight } from 'lucide-react';
import { findAttendeeByPhoneAsync, findAttendeeByTokenAsync, saveMyLastTicketToken } from '@/lib/storage';
import { Attendee } from '@/types';

export default function RetrouverBilletPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Attendee[]>([]);
  const [searched, setSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setSearchError('');
    try {
      const byToken = await findAttendeeByTokenAsync(query.trim());
      if (byToken) {
        setResults([byToken]);
        saveMyLastTicketToken(byToken.qrToken);
      } else {
        const byPhone = await findAttendeeByPhoneAsync(query.trim());
        setResults(byPhone);
        if (byPhone.length > 0) {
          saveMyLastTicketToken(byPhone[0].qrToken);
        }
      }
      setSearched(true);
    } catch (error) {
      setResults([]);
      setSearched(true);
      setSearchError(error instanceof Error ? error.message : 'Impossible de rechercher le billet dans Supabase.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141516] text-[#a1a1a2] py-14 px-6 sm:px-10">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* Navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#eabe7c] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à l&apos;accueil</span>
        </Link>

        {/* Title in Luther Style */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#1c1d1e] border border-[#eabe7c] mx-auto flex items-center justify-center text-[#eabe7c]">
            <Ticket className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-white">
            Retrouver Mon Billet.
          </h1>
          <p className="text-xs text-white/60 max-w-sm mx-auto">
            Saisissez le numéro de téléphone utilisé lors de votre inscription ou votre code de référence.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="bg-[#1c1d1e] p-6 sm:p-8 rounded border border-white/10 space-y-4 shadow-xl">
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-[0.2em] text-[#eabe7c] mb-2">
              Numéro de téléphone ou Code Billet :
            </label>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: +243815987654 ou DDE26-VIP..."
                className="w-full pl-10 pr-4 py-3 rounded bg-[#101112] border border-white/10 text-xs text-white focus:border-[#eabe7c] focus:outline-none"
              />
              <Phone className="w-4 h-4 text-[#eabe7c] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="w-full luther-btn luther-btn-primary flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>{isSearching ? 'Recherche en cours...' : 'Rechercher mon billet'}</span>
          </button>
        </form>

        {/* Results */}
        {searchError && (
          <div className="p-6 rounded bg-[#1c1d1e] border border-amber-500/30 text-center space-y-2">
            <AlertCircle className="w-6 h-6 text-amber-400 mx-auto" />
            <p className="text-xs text-white font-medium">Connexion à Supabase impossible</p>
            <p className="text-[11px] text-white/60">{searchError}</p>
          </div>
        )}

        {searched && !searchError && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-[10px] uppercase font-bold tracking-widest text-white/40">
              Résultat(s) ({results.length}) :
            </h2>

            {results.length > 0 ? (
              <div className="space-y-3">
                {results.map((att) => (
                  <div
                    key={att.id}
                    className="bg-[#1c1d1e] p-5 rounded border border-white/10 flex items-center justify-between gap-4 hover:border-[#eabe7c]/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded overflow-hidden border border-white/20 shrink-0 bg-black/40">
                        {att.photoUrl ? (
                          <img src={att.photoUrl} alt={att.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#eabe7c] font-bold">
                            {att.fullName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-serif text-base font-bold text-white truncate">
                          {att.fullName}
                        </h3>
                        <p className="text-[11px] text-[#eabe7c] uppercase tracking-wider font-semibold">
                          {att.category === 'vip' ? 'Pass VIP ($50)' : 'Pass Standard ($30)'} • {att.phone}
                        </p>
                        <p className="text-[10px] text-white/40 font-mono">
                          {att.qrToken}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/billet/${att.qrToken}`}
                      onClick={() => saveMyLastTicketToken(att.qrToken)}
                      className="shrink-0 luther-btn luther-btn-primary !py-2 !px-4 !text-[10px] flex items-center gap-1"
                    >
                      <span>Voir</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded bg-[#1c1d1e] border border-white/10 text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-amber-400 mx-auto" />
                <p className="text-xs text-white font-medium">
                  Aucun billet trouvé pour &ldquo;{query}&rdquo;.
                </p>
                <p className="text-[11px] text-white/40">
                  Vérifiez le numéro avec l&apos;indicatif (+243) ou réservez un nouveau pass.
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
