'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Attendee } from '@/types';
import { Printer, Share2, Lock, CheckCircle2, Clock, MessageCircle, AlertTriangle } from 'lucide-react';
import { openWhatsApp, WHATSAPP_CONTACT_NUMBER } from '@/lib/whatsapp';

interface TicketCardProps {
  attendee: Attendee;
}

export default function TicketCard({ attendee }: TicketCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const ticketRef = useRef<HTMLDivElement>(null);

  const isValidated = attendee.paymentStatus === 'validated';

  useEffect(() => {
    let isMounted = true;
    if (attendee?.qrToken && isValidated) {
      import('qrcode')
        .then((QRCodeModule) => {
          const QRCode = QRCodeModule.default || QRCodeModule;
          if (QRCode && typeof QRCode.toDataURL === 'function') {
            QRCode.toDataURL(attendee.qrToken, {
              width: 320,
              margin: 1,
              color: {
                dark: '#141516',
                light: '#ffffff',
              },
            })
              .then((url: string) => {
                if (isMounted) setQrDataUrl(url);
              })
              .catch((err: unknown) => console.error('QR code generation error:', err));
          }
        })
        .catch((err) => console.error('Error loading qrcode module:', err));
    }
    return () => {
      isMounted = false;
    };
  }, [attendee?.qrToken, isValidated]);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const ticketUrl = `${window.location.origin}/billet/${attendee.qrToken}`;
    const message =
      `Voici mon billet pour Le Dîner des Entrepreneurs, organisé par Mr Chey.\n\n` +
      `Nom : ${attendee.fullName}\nPass : ${attendee.category.toUpperCase()}\n` +
      `Table : ${attendee.tableNumber || "À l'accueil"}\nBillet : ${ticketUrl}`;
    openWhatsApp(message);
  };

  const handleWhatsAppValidation = () => {
    const ref = attendee.paymentReference || attendee.qrToken;
    const message =
      `Bonjour Mr Chey & Organisation,\nJe me suis pré-enregistré pour Le Dîner des Entrepreneurs.\n` +
      `Nom : ${attendee.fullName}\nPass : ${attendee.category.toUpperCase()} ($${attendee.price})\n` +
      `Référence de paiement : ${ref}\nMerci de valider mon accès.`;
    openWhatsApp(message, WHATSAPP_CONTACT_NUMBER);
  };

  const getPrice = (category: string) => {
    if (category?.toLowerCase().includes('vip')) return '$50';
    return '$30';
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-6">
      {/* Ticket Card */}
      <div
        ref={ticketRef}
        className={`bg-[#141516] rounded-2xl overflow-hidden shadow-2xl relative border ${
          isValidated ? 'border-[#eabe7c]/40' : 'border-amber-500/30'
        }`}
      >
        {/* Header */}
        <div className="p-6 text-center border-b border-white/10 bg-[#1c1d1e]/50">
          <Image
            src="/logo.png"
            alt="Logo Mr Chey"
            width={96}
            height={96}
            className="h-16 w-16 object-contain mx-auto mb-1"
          />
          <p className="text-white/80 text-xs tracking-widest uppercase">Le Dîner des Entrepreneurs • Lubumbashi</p>
        </div>

        {/* Body */}
        <div className="p-8 flex flex-col items-center justify-center space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-white tracking-wide">{attendee.fullName}</h3>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full border border-[#eabe7c]/50 bg-[#eabe7c]/10 text-[#eabe7c] text-xs font-semibold uppercase tracking-wider">
                PASS {attendee.category?.toUpperCase() || 'STANDARD'} ({getPrice(attendee.category)})
              </span>

              {isValidated ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Paiement Validé
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  Paiement en Attente
                </span>
              )}
            </div>

            {attendee.company && (
              <p className="text-xs text-white/60">{attendee.company} {attendee.jobTitle ? `• ${attendee.jobTitle}` : ''}</p>
            )}
          </div>

          {/* QR Code OR Locked State */}
          {isValidated ? (
            <div className="flex flex-col items-center space-y-3">
              <div className="bg-white p-3.5 rounded-xl shadow-[0_0_25px_rgba(234,190,124,0.2)]">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Ticket QR Code" className="w-48 h-48 object-contain" />
                ) : (
                  <div className="w-48 h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                    Génération du QR Code...
                  </div>
                )}
              </div>
              <div className="text-center font-mono text-white/60 text-xs tracking-widest uppercase">
                {attendee.qrToken}
              </div>
            </div>
          ) : (
            <div className="w-full bg-[#1c1d1e] border border-amber-500/30 rounded-xl p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/40 mx-auto flex items-center justify-center text-amber-400">
                <Lock className="w-7 h-7" />
              </div>

              <div>
                <h4 className="text-white font-bold text-sm uppercase tracking-wide">
                  QR Code d&apos;Accès Verrouillé
                </h4>
                <p className="text-xs text-white/70 mt-1.5 leading-relaxed">
                  Votre pré-enregistrement a bien été enregistré. Votre QR code officiel sera débloqué ici dès que l&apos;organisateur valide la réception de votre paiement.
                </p>
              </div>

              {attendee.paymentReference && (
                <div className="p-2.5 rounded bg-black/40 border border-white/10 text-xs font-mono text-[#eabe7c]">
                  Réf: {attendee.paymentReference} ({attendee.paymentMethod.toUpperCase()})
                </div>
              )}

              <button
                onClick={handleWhatsAppValidation}
                className="w-full py-2.5 px-4 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Confirmer mon paiement (WhatsApp)</span>
              </button>
            </div>
          )}

          {/* Seat / Table if assigned */}
          {attendee.tableNumber && (
            <div className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#eabe7c] block">
                Table Assignée
              </span>
              <span className="font-serif text-lg font-bold text-white">
                {attendee.tableNumber}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-black/40 py-4 px-6 text-center border-t border-white/10">
          <p className="text-white/60 text-[11px] tracking-wider uppercase">
            {isValidated
              ? 'Présentez ce QR Code aux hôtesses à l’entrée'
              : 'En attente de confirmation par l’équipe d’accueil'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      {isValidated && (
        <div className="grid grid-cols-2 gap-4 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-[#141516] border border-[#eabe7c]/30 hover:border-[#eabe7c] text-white rounded-lg transition-colors font-medium tracking-wide text-sm"
          >
            <Printer size={18} />
            <span>Imprimer</span>
          </button>
          <button
            onClick={handleWhatsAppShare}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-[#141516] border border-[#eabe7c]/30 hover:border-[#eabe7c] text-white rounded-lg transition-colors font-medium tracking-wide text-sm"
          >
            <Share2 size={18} />
            <span>Partager</span>
          </button>
        </div>
      )}
    </div>
  );
}
