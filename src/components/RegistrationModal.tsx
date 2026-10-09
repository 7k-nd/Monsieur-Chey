'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, Check, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { TicketCategory, Attendee } from '@/types';
import { registerAttendeeAsync, saveMyLastTicketToken } from '@/lib/storage';
import { WHATSAPP_CONTACT_DISPLAY } from '@/lib/whatsapp';
import { TICKET_TIERS } from './PricingSection';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: TicketCategory;
}

export default function RegistrationModal({ isOpen, onClose, defaultCategory = 'standard' }: RegistrationModalProps) {
  const [category, setCategory] = useState<TicketCategory>(defaultCategory);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+243 ');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAttendee, setCreatedAttendee] = useState<Attendee | null>(null);

  // Sync internal category state when the prop changes (user picks a different tier)
  useEffect(() => {
    setCategory(defaultCategory);
  }, [defaultCategory]);

  if (!isOpen) return null;

  const currentTier = TICKET_TIERS.find((t) => t.id === category) || TICKET_TIERS[0];

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      alert('Veuillez renseigner votre nom et votre numéro de téléphone.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newAttendee = await registerAttendeeAsync({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        company: company.trim() || undefined,
        jobTitle: jobTitle.trim() || undefined,
        category: category,
        price: currentTier.price,
        paymentMethod: 'airtel',
        paymentReference: paymentReference.trim() || undefined,
        paymentStatus: 'pending',
        photoUrl: photoPreview || '/images/avatars/user-01.jpg',
      });

      setCreatedAttendee(newAttendee);
      saveMyLastTicketToken(newAttendee.qrToken);

      // Safe dynamic confetti trigger
      try {
        const confettiMod = await import('canvas-confetti');
        const confettiFn = confettiMod.default || confettiMod;
        if (typeof confettiFn === 'function') {
          confettiFn({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#eabe7c', '#ffffff', '#141516'],
          });
        }
      } catch (err) {
        // Confetti optional
      }
    } catch (err) {
      console.error('Registration error', err);
      alert(
        err instanceof Error
          ? err.message
          : "Une erreur s'est produite lors de l'enregistrement dans Supabase."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToTicket = () => {
    if (createdAttendee) {
      onClose();
      window.location.href = `/billet/${createdAttendee.qrToken}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#141516] border border-white/20 rounded p-6 sm:p-10 shadow-2xl my-8 text-white max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {createdAttendee ? (
          /* SUCCESS VIEW */
          <div className="text-center py-6 space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#eabe7c]/20 border-2 border-[#eabe7c] mx-auto flex items-center justify-center text-[#eabe7c]">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#eabe7c] block">
                Demande enregistrée pour {createdAttendee.fullName}
              </span>
              <h3 className="font-serif text-3xl font-bold text-white">
                Votre préinscription est enregistrée.
              </h3>
              <p className="text-xs text-white/70 max-w-md mx-auto">
                Le QR code sera débloqué sur votre page billet dès validation de votre paiement par l&apos;organisateur.
              </p>
            </div>

            <div className="p-4 bg-[#1c1d1e] border border-white/10 rounded text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-white/50">Formule choisie :</span>
                <span className="font-semibold text-[#eabe7c] capitalize">{createdAttendee.category === 'vip' ? 'VIP (50 USD)' : 'Standard (30 USD)'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Mode de paiement :</span>
                <span className="font-semibold uppercase text-white/80">Airtel Money</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Statut :</span>
                <span className="font-semibold text-amber-400">Paiement à vérifier</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleGoToTicket}
                className="w-full luther-btn luther-btn-primary flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Suivre ma réservation</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-white/40">
                Sur cette page, confirmez votre paiement sur WhatsApp et joignez la capture de la transaction. Le QR code apparaît après vérification.
              </p>
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="text-pretitle with-line">
                Billetterie Officielle
              </div>
              <h2 className="font-serif text-3xl font-bold text-white">
                Réservez Votre Place.
              </h2>
              <p className="text-xs text-white/60 mt-1">
                Le Dîner des Entrepreneurs • Samedi 21 novembre 2026 • Big Five, Lubumbashi
              </p>
            </div>

            {/* Category Selector (Standard 30$ / VIP 50$) */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-bold tracking-[0.2em] text-[#eabe7c]">
                1. Choisissez votre catégorie de Pass
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TICKET_TIERS.map((tier) => {
                  const isSelected = category === tier.id;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setCategory(tier.id)}
                      className={`p-4 rounded text-left transition-all border ${
                        isSelected
                          ? 'border-[#eabe7c] bg-[#1c1d1e] shadow-lg'
                          : 'border-white/10 bg-[#101112] hover:border-white/30'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-bold text-white">{tier.name}</span>
                        <span className="text-sm font-serif font-bold text-[#eabe7c]">${tier.price}</span>
                      </div>
                      <span className="text-[10px] text-white/50 block">
                        {tier.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-bold tracking-[0.2em] text-[#eabe7c]">
                2. Photo de profil (facultatif)
              </label>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded overflow-hidden bg-black/40 border border-white/20 shrink-0 flex items-center justify-center">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Aperçu" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-white/30" />
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    id="modal-photo"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="modal-photo"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#1c1d1e] border border-white/10 text-xs text-white/80 hover:border-[#eabe7c] cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#eabe7c]" />
                    <span>{photoPreview ? 'Modifier ma photo' : 'Importer ma photo'}</span>
                  </label>
                  <p className="text-[10px] text-white/40 mt-1">Ajoutez une photo à votre dossier si vous le souhaitez.</p>
                </div>
              </div>
            </div>

            {/* Personal info */}
            <div className="space-y-3">
              <label className="block text-[10px] uppercase font-bold tracking-[0.2em] text-[#eabe7c]">
                3. Coordonnées professionnelles
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">Nom & Prénom *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Christian Malela"
                    className="w-full px-3.5 py-2.5 rounded bg-[#101112] border border-white/10 text-xs text-white focus:border-[#eabe7c] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">Téléphone WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+243 81 000 0000"
                    className="w-full px-3.5 py-2.5 rounded bg-[#101112] border border-white/10 text-xs text-white focus:border-[#eabe7c] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">Entreprise / Secteur</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Ex: Katanga Mining Tech"
                    className="w-full px-3.5 py-2.5 rounded bg-[#101112] border border-white/10 text-xs text-white focus:border-[#eabe7c] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">Fonction / Titre</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Ex: Fondateur / Directeur"
                    className="w-full px-3.5 py-2.5 rounded bg-[#101112] border border-white/10 text-xs text-white focus:border-[#eabe7c] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="space-y-3">
              <label className="block text-[10px] uppercase font-bold tracking-[0.2em] text-[#eabe7c]">
                4. Paiement ({currentTier.price} USD)
              </label>

              <div className="p-3.5 bg-[#101112] border border-white/10 rounded text-xs space-y-1">
                <p className="registration-payment-instructions text-white/90">
                  Effectuez le paiement Airtel Money au {WHATSAPP_CONTACT_DISPLAY}, puis indiquez la référence de transaction ci-dessous. Après votre préinscription, envoyez la capture de paiement à ce même numéro sur WhatsApp.
                </p>
                <div className="pt-2">
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="Référence de transaction (facultatif)"
                    className="w-full px-3 py-1.5 rounded bg-[#141516] border border-white/10 text-xs text-white focus:border-[#eabe7c] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full luther-btn luther-btn-primary flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Enregistrement...' : `Créer ma préinscription (${currentTier.price} USD)`}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
