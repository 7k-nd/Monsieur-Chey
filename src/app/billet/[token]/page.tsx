'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { findAttendeeByTokenAsync, saveMyLastTicketToken } from '@/lib/storage';
import { Attendee } from '@/types';
import TicketCard from '@/components/TicketCard';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';

import { supabase } from '@/lib/supabase';

export default function TicketPage() {
  const params = useParams();
  const token = typeof params?.token === 'string' ? params.token : '';
  const [attendee, setAttendee] = useState<Attendee | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (token) {
        setLoading(true);
        try {
          const found = await findAttendeeByTokenAsync(token);
          if (isMounted) {
            setAttendee(found || null);
            setLoadError('');
            if (found) saveMyLastTicketToken(token);
          }
        } catch (error) {
          if (isMounted) {
            setAttendee(null);
            setLoadError(error instanceof Error ? error.message : 'Impossible de charger le billet depuis Supabase.');
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [token]);

  useEffect(() => {
    const handleUpdate = async () => {
      if (token) {
        try {
          const found = await findAttendeeByTokenAsync(token);
          setLoadError('');
          setAttendee((prev) => {
            if (prev && prev.paymentStatus !== 'validated' && found?.paymentStatus === 'validated') {
              import('canvas-confetti').then((c) => {
                const confetti = c.default || c;
                confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              }).catch(() => {});
            }
            return found || null;
          });
        } catch (error) {
          setLoadError(error instanceof Error ? error.message : 'Impossible d’actualiser le billet depuis Supabase.');
        }
      }
    };

    const client = supabase;
    if (client && token) {
      const channel = client
        .channel(`ticket-status-${token}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'attendees' },
          (payload) => {
            if (
              payload.new &&
              (payload.new.qr_token?.toLowerCase() === token.toLowerCase() ||
                payload.new.id === token)
            ) {
              handleUpdate();
            }
          }
        )
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    }

    return;
  }, [token]);

  return (
    <div className="min-h-screen bg-[#141516] text-[#a1a1a2] py-12 px-6 sm:px-10">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* Top bar back link */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#eabe7c] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à l&apos;accueil</span>
          </Link>

          <Link
            href="/retrouver-billet"
            className="text-xs text-white/50 hover:text-white"
          >
            Chercher un autre billet
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <RefreshCw className="w-8 h-8 text-[#eabe7c] animate-spin mx-auto mb-4" />
            <p className="text-xs text-white/60">Chargement de votre billet officiel...</p>
          </div>
        ) : loadError ? (
          <div className="bg-[#1c1d1e] p-8 rounded border border-amber-500/30 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-xl font-bold text-white">Connexion à Supabase impossible</h2>
            <p className="text-xs text-white/60 max-w-md mx-auto">{loadError}</p>
          </div>
        ) : attendee ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-pretitle with-line justify-center text-center mx-auto">
                Billet Officiel
              </div>
              <h1 className="font-serif text-3xl font-bold text-white mt-1">
                Votre Accès au Dîner.
              </h1>
              <p className="text-xs text-white/60 mt-1">
                Présentez ce QR Code à l&apos;entrée pour votre enregistrement.
              </p>
            </div>

            <TicketCard attendee={attendee} />
          </div>
        ) : (
          <div className="bg-[#1c1d1e] p-8 rounded border border-rose-500/30 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-xl font-bold text-white">Billet Introuvable</h2>
            <p className="text-xs text-white/60 max-w-md mx-auto">
              Aucun billet correspondant au code <strong className="text-[#eabe7c] font-mono">{token}</strong> n&apos;a été trouvé.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/retrouver-billet"
                className="luther-btn luther-btn-primary !text-[10px]"
              >
                Rechercher par téléphone
              </Link>
              <Link
                href="/"
                className="luther-btn luther-btn-stroke !text-[10px]"
              >
                S&apos;inscrire
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
