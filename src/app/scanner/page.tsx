'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  verifyAndCheckInAsync,
  getStoredAdminPin,
  getStoredScannerPin,
  getStoredAttendeesAsync,
  ensureDefaultPins,
} from '@/lib/storage';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ScanResult } from '@/types';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  ArrowLeft,
  Camera,
  Volume2,
  VolumeX,
  User,
  Phone,
  Mail,
  Briefcase,
  Tag,
  CreditCard,
  MapPin,
  Calendar,
  Clock,
  Loader2,
  Wifi,
  WifiOff
} from 'lucide-react';

export default function ScannerPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Scanner states
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [manualToken, setManualToken] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, scanned: 0 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html5QrCodeRef = useRef<any>(null);
  const isScanningRef = useRef(false);

  const updateStats = async () => {
    const all = await getStoredAttendeesAsync();
    const scanned = all.filter((a) => a.isScanned).length;
    setStats({ total: all.length, scanned });
  };

  useEffect(() => {
    const authSession = sessionStorage.getItem('diner_scan_auth');
    if (authSession === 'true') {
      setIsAuthenticated(true);
      updateStats();
    }

    ensureDefaultPins();
  }, []);

  // Supabase realtime sync
  useEffect(() => {
    if (!isAuthenticated) return;
    updateStats();

    const client = supabase;
    if (client) {
      const channel = client
        .channel('scanner-realtime-sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'attendees' },
          () => {
            updateStats();
          }
        )
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = getStoredScannerPin();
    if (pinInput.trim() === correctPin) {
      setIsAuthenticated(true);
      sessionStorage.setItem('diner_scan_auth', 'true');
      setPinError(false);
      updateStats();
    } else {
      setPinError(true);
    }
  };

  const playFeedbackSound = (type: 'success' | 'warning' | 'error') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.35);
      } else if (type === 'warning') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(320, audioCtx.currentTime);
        osc.frequency.setValueAtTime(260, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.45);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.45);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, audioCtx.currentTime);
        osc.frequency.setValueAtTime(140, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.4);
      }
    } catch (e) {
      console.warn('Audio feedback not available:', e);
    }
  };

  const processToken = async (rawToken: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const result = await verifyAndCheckInAsync(rawToken);
      setScanResult(result);
      await updateStats();

      if (result.status === 'valid') {
        playFeedbackSound('success');
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([120, 60, 120]);
        }
      } else if (result.status === 'already_scanned') {
        playFeedbackSound('warning');
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([400, 150, 400]);
        }
      } else {
        playFeedbackSound('error');
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([300, 100, 300]);
        }
      }
    } catch (err) {
      console.error('Scan processing error:', err);
      setScanResult({
        status: 'error',
        message: 'Erreur inattendue lors de la vérification.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const startScanner = async () => {
    setCameraError(null);
    setIsScanning(true);
    isScanningRef.current = true;

    try {
      const html5QrCodeModule = await import('html5-qrcode');
      const Html5Qrcode = html5QrCodeModule.Html5Qrcode;

      const qrScanner = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = qrScanner;

      const config = {
        fps: 15,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await qrScanner.start(
        { facingMode: 'environment' },
        config,
        async (decodedText) => {
          await stopScanner();
          await processToken(decodedText);
        },
        () => {}
      );
    } catch (err: unknown) {
      console.error('Camera startup error:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setCameraError(`Accès caméra impossible (${errMsg}). Utilisez la saisie manuelle ci-dessous.`);
      setIsScanning(false);
      isScanningRef.current = false;
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && isScanningRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Error stopping camera', err);
      }
    }
    setIsScanning(false);
    isScanningRef.current = false;
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    processToken(manualToken.trim());
    setManualToken('');
  };

  const resetResult = () => {
    setScanResult(null);
    startScanner();
  };

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#141516] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#1c1d1e] p-8 rounded border border-emerald-500/30 text-center space-y-6 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-black/40 border border-emerald-400 mx-auto flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div>
            <h1 className="font-serif text-2xl font-bold text-white">Scanner d&apos;Entrée</h1>
            <p className="text-xs text-emerald-400/80 mt-1 font-medium">Poste Accueil &amp; Sécurité VIP</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Code PIN (par défaut: 2026)"
                className="w-full px-4 py-3 rounded bg-[#101112] border border-white/10 text-center font-mono text-lg text-emerald-400 tracking-widest focus:border-emerald-400 focus:outline-none"
                autoFocus
              />
              {pinError && (
                <p className="text-xs text-rose-400 mt-2">Code PIN incorrect.</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full luther-btn luther-btn-primary"
            >
              Ouvrir le Scanner
            </button>
          </form>

          <Link href="/" className="inline-block text-xs text-white/40 hover:text-[#eabe7c]">
            Retour au site
          </Link>
        </div>
      </div>
    );
  }

  // --- RESULT SCREEN (after scan) ---
  if (scanResult) {
    const isSuccess = scanResult.status === 'valid';
    const isAlreadyScanned = scanResult.status === 'already_scanned';
    const attendee = scanResult.attendee;

    return (
      <div
        className={`min-h-screen flex flex-col justify-between p-6 transition-colors duration-300 ${
          isSuccess
            ? 'bg-emerald-950 text-emerald-50'
            : isAlreadyScanned
            ? 'bg-[#3d1800] text-amber-100 border-4 border-amber-500/40'
            : 'bg-rose-950 text-rose-50'
        }`}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider opacity-80">
            Dîner des Entrepreneurs • Contrôle Sécurité
          </span>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded bg-black/20"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>

        {/* Main result */}
        <div className="max-w-lg w-full mx-auto text-center space-y-6 animate-fade-in py-6">
          {/* Status icon */}
          <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center bg-black/30 border-4 border-white/40 shadow-2xl">
            {isSuccess ? (
              <CheckCircle2 className="w-16 h-16 text-emerald-300 animate-bounce" />
            ) : isAlreadyScanned ? (
              <AlertTriangle className="w-16 h-16 text-amber-400" />
            ) : (
              <XCircle className="w-16 h-16 text-rose-300" />
            )}
          </div>

          {/* Status title */}
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold uppercase tracking-tight">
              {isSuccess
                ? 'ACCÈS VALIDÉ'
                : isAlreadyScanned
                ? '🚨 DÉJÀ SCANNÉ !'
                : 'ACCÈS REFUSÉ'}
            </h1>
            <p className="text-sm sm:text-base mt-2 font-medium opacity-95 px-4">
              {scanResult.message}
            </p>
          </div>

          {/* Anti-fraud banner if already scanned */}
          {isAlreadyScanned && (
            <div className="p-3 bg-red-600/30 border border-red-500 rounded text-xs font-bold uppercase tracking-wider text-red-200">
              ⚠️ ATTENTION : Risque de copie ou tentative d&apos;infiltration frauduleuse !
            </div>
          )}

          {/* ALL attendee details — visible on scan */}
          {attendee && (
            <div className="bg-black/40 border border-white/20 rounded-xl p-6 text-left space-y-5 backdrop-blur-md shadow-2xl">
              
              {/* Photo + Name + Seat header */}
              <div className="flex items-center gap-4 pb-4 border-b border-white/15">
                <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-[#eabe7c] shrink-0 bg-black/50 shadow-md">
                  {attendee.photoUrl ? (
                    <img
                      src={attendee.photoUrl}
                      alt={attendee.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-3xl text-[#eabe7c] bg-[#1c1d1e]">
                      {attendee.fullName.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider mb-1 ${
                      attendee.category === 'vip'
                        ? 'bg-[#eabe7c] text-black font-bold'
                        : 'bg-white/20 text-white'
                    }`}
                  >
                    {attendee.category === 'vip' ? '👑 Pass VIP ($50)' : 'Pass Standard ($30)'}
                  </span>
                  <h2 className="text-2xl font-bold truncate text-white">{attendee.fullName}</h2>
                  {attendee.company && (
                    <p className="text-xs text-white/70 truncate">{attendee.company}</p>
                  )}
                </div>
              </div>

              {/* Table / Place highlight */}
              {attendee.tableNumber && (
                <div className="p-4 rounded-lg bg-[#eabe7c]/15 border border-[#eabe7c]/40 text-center">
                  <span className="text-[11px] uppercase font-bold tracking-widest block text-[#eabe7c] mb-1">
                    📍 Place / Table Assignée
                  </span>
                  <span className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
                    {attendee.tableNumber}
                  </span>
                </div>
              )}

              {/* Client info grid */}
              <div className="grid grid-cols-1 gap-2.5 text-xs sm:text-sm">
                {attendee.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 opacity-60 shrink-0" />
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider opacity-60">Téléphone</span>
                      <span className="font-semibold text-white">{attendee.phone}</span>
                    </div>
                  </div>
                )}

                {attendee.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 opacity-60 shrink-0" />
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider opacity-60">Email</span>
                      <span className="font-semibold text-white">{attendee.email}</span>
                    </div>
                  </div>
                )}

                {attendee.jobTitle && (
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 opacity-60 shrink-0" />
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider opacity-60">Fonction</span>
                      <span className="font-semibold text-white">{attendee.jobTitle}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 opacity-60 shrink-0" />
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider opacity-60">Paiement</span>
                    <span className="font-semibold text-white">
                      {attendee.paymentStatus === 'validated'
                        ? '✅ Validé'
                        : attendee.paymentStatus === 'pending'
                        ? '⏳ En attente'
                        : attendee.paymentStatus === 'cash_on_arrival'
                        ? '💵 Espèces sur place'
                        : '❌ Rejeté'}
                      {attendee.paymentMethod && ` (${attendee.paymentMethod.toUpperCase()})`}
                    </span>
                  </div>
                </div>

                {attendee.scannedAt && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 opacity-60 shrink-0" />
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider opacity-60">Heure du Scan</span>
                      <span className="font-semibold text-white">
                        {new Date(attendee.scannedAt).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom action */}
        <div className="max-w-md w-full mx-auto space-y-3">
          <button
            onClick={resetResult}
            className="w-full py-4 rounded-lg bg-white text-black text-sm font-extrabold uppercase tracking-wider shadow-2xl hover:bg-white/90 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Camera className="w-5 h-5" />
            <span>Scanner le Billet Suivant</span>
          </button>
        </div>
      </div>
    );
  }

  // --- SCANNER MAIN SCREEN ---
  return (
    <div className="min-h-screen bg-[#141516] text-[#a1a1a2] flex flex-col justify-between p-6">
      <header className="flex items-center justify-between">
        <Link
          href="/"
          className="p-2 rounded bg-[#1c1d1e] text-white/60 hover:text-[#eabe7c]"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="text-center">
          <h1 className="font-serif text-base font-bold text-white">Contrôle d&apos;Accès</h1>
          <div className="flex items-center justify-center gap-1.5 mt-0.5">
            {isSupabaseConfigured ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] text-emerald-400 font-semibold">Supabase Connecté (Direct)</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] text-amber-400 font-semibold">Mode Local</span>
              </>
            )}
          </div>
        </div>

        <Link
          href="/admin"
          className="p-2 rounded bg-[#1c1d1e] text-white/60 hover:text-[#eabe7c]"
          title="Dashboard Admin"
        >
          <Lock className="w-5 h-5" />
        </Link>
      </header>

      <main className="max-w-md w-full mx-auto my-auto space-y-6 text-center">
        {/* Stats bar */}
        <div className="p-4 rounded-lg bg-[#1c1d1e] border border-white/10 flex items-center justify-around text-xs shadow-lg">
          <div>
            <span className="text-white/50 block text-[10px] uppercase">Total Inscrits</span>
            <span className="font-bold text-base text-white font-serif">{stats.total}</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <span className="text-white/50 block text-[10px] uppercase">Présents (Entrés)</span>
            <span className="font-bold text-base text-emerald-400 font-serif">{stats.scanned}</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <span className="text-white/50 block text-[10px] uppercase">Restants</span>
            <span className="font-bold text-base text-[#eabe7c] font-serif">
              {Math.max(0, stats.total - stats.scanned)}
            </span>
          </div>
        </div>

        {/* Camera scanner area */}
        <div className="relative rounded-xl overflow-hidden bg-[#1c1d1e] border-2 border-[#eabe7c]/40 p-2 shadow-2xl">
          <div
            id="qr-reader"
            className="w-full aspect-square rounded-lg bg-black overflow-hidden flex items-center justify-center text-xs text-white/40"
          >
            {isProcessing ? (
              <div className="p-6 space-y-3 flex flex-col items-center">
                <Loader2 className="w-10 h-10 text-[#eabe7c] animate-spin" />
                <p className="text-xs text-white font-medium">Vérification en temps réel...</p>
              </div>
            ) : !isScanning ? (
              <div className="p-6 space-y-4">
                <Camera className="w-12 h-12 text-[#eabe7c] mx-auto animate-pulse" />
                <p className="text-xs text-white/60">
                  Pointez la caméra vers le code QR du billet pour valider l&apos;entrée.
                </p>
                <button
                  onClick={startScanner}
                  className="luther-btn luther-btn-primary"
                >
                  Activer la Caméra
                </button>
              </div>
            ) : null}
          </div>

          {isScanning && (
            <button
              onClick={stopScanner}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/80 border border-white/20 text-[11px] font-semibold text-[#eabe7c] shadow-lg cursor-pointer hover:bg-black"
            >
              Arrêter la caméra
            </button>
          )}
        </div>

        {cameraError && (
          <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-500/30 text-xs text-rose-200">
            {cameraError}
          </div>
        )}

        {/* Manual token input */}
        <div className="p-4 rounded-lg bg-[#1c1d1e] border border-white/10 shadow-md">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-2">
            Ou saisie manuelle du Token :
          </span>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Ex: DDE26-VIP-994182"
              className="flex-1 px-3 py-2 rounded bg-[#101112] border border-white/10 text-xs text-white font-mono focus:border-[#eabe7c] focus:outline-none uppercase"
            />
            <button
              type="submit"
              disabled={isProcessing}
              className="px-4 py-2 rounded bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-500 disabled:opacity-50"
            >
              {isProcessing ? '...' : 'Valider'}
            </button>
          </form>
        </div>
      </main>

      <footer className="text-center text-[10px] text-white/40">
        Le Dîner des Entrepreneurs • Lubumbashi 2026
      </footer>
    </div>
  );
}
