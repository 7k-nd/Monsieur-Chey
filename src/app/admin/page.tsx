'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  getStoredAttendeesAsync,
  updateAttendeeAsync,
  deleteAttendeeAsync,
  registerAttendeeAsync,
  getStoredAdminPin,
  setStoredAdminPin,
  ensureDefaultPins,
} from '@/lib/storage';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  getDefaultSettings,
  fetchRemoteSettings,
  updateMrCheyPhoto,
  savePartners,
  Partner,
  DEFAULT_MR_CHEY_PHOTO,
} from '@/lib/settings';
import { Attendee, PaymentStatus, TicketCategory } from '@/types';
import { openWhatsApp } from '@/lib/whatsapp';
import {
  ShieldCheck,
  Users,
  DollarSign,
  QrCode,
  Search,
  Plus,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Lock,
  ArrowLeft,
  MessageCircle,
  Edit2,
  MoreVertical,
  Building2,
  Image as ImageIcon,
  Check,
  ExternalLink,
  UserCheck,
  RotateCcw,
  Sparkles,
  MapPin,
  Camera
} from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Active Tab: 'attendees' | 'settings'
  const [activeTab, setActiveTab] = useState<'attendees' | 'settings'>('attendees');

  // Attendees state
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [connectionError, setConnectionError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Manual Add Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('+243 ');
  const [newEmail, setNewEmail] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newCategory, setNewCategory] = useState<TicketCategory>('standard');
  const [newTable, setNewTable] = useState('Table 1');
  const [newStatus, setNewStatus] = useState<PaymentStatus>('validated');
  const [isAdding, setIsAdding] = useState(false);

  // Edit Table Modal state
  const [editingAttendee, setEditingAttendee] = useState<Attendee | null>(null);
  const [tableInput, setTableInput] = useState('');

  // CSV Import State
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvText, setCsvText] = useState('');

  // Event Settings State (Mr Chey photo & Partners)
  const [mrCheyPhotoInput, setMrCheyPhotoInput] = useState(DEFAULT_MR_CHEY_PHOTO);
  const [partners, setPartners] = useState<Partner[]>(getDefaultSettings().partners);
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerCategory, setNewPartnerCategory] = useState('Partenaire Officiel');
  const [newPartnerLogo, setNewPartnerLogo] = useState('');
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);

  const loadAttendees = async () => {
    try {
      const list = await getStoredAttendeesAsync();
      setAttendees(list);
      setConnectionError('');
      return true;
    } catch (error) {
      setAttendees([]);
      setConnectionError(error instanceof Error ? error.message : 'Impossible de charger les invités depuis Supabase.');
      return false;
    }
  };

  const loadSettings = async () => {
    try {
      const settings = await fetchRemoteSettings();
      setMrCheyPhotoInput(settings.mrCheyPhoto);
      setPartners(settings.partners);
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Impossible de charger les paramètres du site.');
    }
  };

  useEffect(() => {
    const authSession = sessionStorage.getItem('diner_admin_auth');
    if (authSession === 'true') {
      void loadAttendees().then((isConnected) => {
        if (isConnected) {
          setIsAuthenticated(true);
          void loadSettings();
        } else {
          sessionStorage.removeItem('diner_admin_auth');
        }
      });
    }

    ensureDefaultPins();
  }, []);

  const [newUserAlert, setNewUserAlert] = useState<{
    id: string;
    name: string;
    phone: string;
    category: string;
    company?: string;
    time: string;
  } | null>(null);

  const playNotificationSound = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24); // G5
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.65);
    } catch (e) {
      // Audio not supported
    }
  };

  // Supabase real-time sync for admin
  useEffect(() => {
    if (!isAuthenticated) return;
    void loadAttendees();

    const client = supabase;
    if (client) {
      const channel = client
        .channel('admin-realtime-sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'attendees' },
          (payload) => {
            loadAttendees();

            if (payload.eventType === 'INSERT') {
              const newRecord = payload.new as any;
              setNewUserAlert({
                id: newRecord.id,
                name: newRecord.full_name || 'Nouveau participant',
                phone: newRecord.phone || '',
                category: newRecord.category || 'standard',
                company: newRecord.company,
                time: new Date().toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                }),
              });
              playNotificationSound();
            }
          }
        )
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    }
  }, [isAuthenticated]);

  // Click outside to close 3-dots dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = getStoredAdminPin();
    if (pinInput.trim() === correctPin) {
      if (!(await loadAttendees())) return;
      setIsAuthenticated(true);
      sessionStorage.setItem('diner_admin_auth', 'true');
      setPinError(false);
      void loadSettings();
    } else {
      setPinError(true);
    }
  };

  const handleStatusChange = async (id: string, newStatus: PaymentStatus) => {
    setActiveMenuId(null);
    try {
      const updated = await updateAttendeeAsync(id, { paymentStatus: newStatus });
      if (!updated) throw new Error('Invité introuvable dans Supabase.');
      await loadAttendees();
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Impossible de modifier le statut du paiement.');
    }
  };

  const handleToggleScanned = async (att: Attendee) => {
    setActiveMenuId(null);
    const newScanned = !att.isScanned;
    try {
      const updated = await updateAttendeeAsync(att.id, {
        isScanned: newScanned,
        scannedAt: newScanned ? new Date().toISOString() : undefined,
      });
      if (!updated) throw new Error('Invité introuvable dans Supabase.');
      await loadAttendees();
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Impossible de modifier le statut du scan.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    setActiveMenuId(null);
    if (confirm(`Voulez-vous vraiment supprimer l'inscription de ${name} ?`)) {
      try {
        if (!(await deleteAttendeeAsync(id))) throw new Error('Invité introuvable dans Supabase.');
        await loadAttendees();
      } catch (error) {
        setConnectionError(error instanceof Error ? error.message : 'Impossible de supprimer cet invité.');
      }
    }
  };

  const handleSaveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAttendee) {
      try {
        const updated = await updateAttendeeAsync(editingAttendee.id, { tableNumber: tableInput.trim() });
        if (!updated) throw new Error('Invité introuvable dans Supabase.');
        setEditingAttendee(null);
        await loadAttendees();
      } catch (error) {
        setConnectionError(error instanceof Error ? error.message : 'Impossible de modifier la table.');
      }
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newPhone.trim()) return;

    setIsAdding(true);
    try {
      await registerAttendeeAsync({
        fullName: newFullName.trim(),
        phone: newPhone.trim(),
        email: newEmail.trim() || undefined,
        company: newCompany.trim() || undefined,
        jobTitle: newJobTitle.trim() || undefined,
        category: newCategory,
        price: newCategory === 'vip' ? 50 : 30,
        paymentMethod: 'cash',
        paymentStatus: newStatus,
        tableNumber: newTable.trim() || 'Table 1',
      });

      setShowAddModal(false);
      setNewFullName('');
      setNewPhone('+243 ');
      setNewEmail('');
      setNewCompany('');
      setNewJobTitle('');
      await loadAttendees();
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Impossible d’ajouter l’invité dans Supabase.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleSaveMrCheyPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mrCheyPhotoInput.trim()) return;
    try {
      await updateMrCheyPhoto(mrCheyPhotoInput.trim());
      setSettingsSuccessMsg('Portrait de Mr Chey mis à jour avec succès !');
      setConnectionError('');
      setTimeout(() => setSettingsSuccessMsg(''), 4000);
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Impossible d’enregistrer le portrait.');
    }
  };

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerName.trim()) return;
    const newPartner: Partner = {
      id: `partner-${Date.now()}`,
      name: newPartnerName.trim(),
      category: newPartnerCategory.trim() || 'Partenaire Officiel',
      logoUrl: newPartnerLogo.trim() || undefined,
    };
    const updated = [...partners, newPartner];
    try {
      await savePartners(updated);
      setPartners(updated);
      setShowAddPartnerModal(false);
      setNewPartnerName('');
      setNewPartnerLogo('');
      setSettingsSuccessMsg('Partenaire ajouté avec succès !');
      setConnectionError('');
      setTimeout(() => setSettingsSuccessMsg(''), 4000);
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Impossible d’enregistrer le partenaire.');
    }
  };

  const handleDeletePartner = async (id: string) => {
    if (confirm('Voulez-vous supprimer ce partenaire ?')) {
      const updated = partners.filter((p) => p.id !== id);
      try {
        await savePartners(updated);
        setPartners(updated);
        setSettingsSuccessMsg('Partenaire supprimé.');
        setConnectionError('');
        setTimeout(() => setSettingsSuccessMsg(''), 4000);
      } catch (error) {
        setConnectionError(error instanceof Error ? error.message : 'Impossible de supprimer le partenaire.');
      }
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Nom',
      'Telephone',
      'Email',
      'Entreprise',
      'Fonction',
      'Categorie',
      'Prix',
      'Paiement',
      'Statut',
      'Table',
      'Token QR',
      'Scanne',
      'Date Scan',
    ];
    const rows = attendees.map((a) => [
      `"${a.fullName}"`,
      `"${a.phone}"`,
      `"${a.email || ''}"`,
      `"${a.company || ''}"`,
      `"${a.jobTitle || ''}"`,
      `"${a.category}"`,
      a.price,
      `"${a.paymentMethod}"`,
      `"${a.paymentStatus}"`,
      `"${a.tableNumber || ''}"`,
      `"${a.qrToken}"`,
      a.isScanned ? 'OUI' : 'NON',
      `"${a.scannedAt || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `diner_entrepreneurs_inscrits_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCsv = async () => {
    if (!csvText.trim()) return;
    const lines = csvText.trim().split('\n');
    let count = 0;

    try {
      for (const [index, line] of lines.entries()) {
        if (
          index === 0 &&
          (line.toLowerCase().includes('nom') || line.toLowerCase().includes('name'))
        ) {
          continue;
        }
        const parts = line.split(',').map((p) => p.replace(/^["']|["']$/g, '').trim());
        if (parts[0] && parts[1]) {
          const isVip = parts[5]?.toLowerCase() === 'vip';
          await registerAttendeeAsync({
            fullName: parts[0],
            phone: parts[1],
            email: parts[2] || undefined,
            company: parts[3] || undefined,
            jobTitle: parts[4] || undefined,
            category: (isVip ? 'vip' : 'standard') as TicketCategory,
            price: isVip ? 50 : 30,
            paymentMethod: 'cash',
            paymentStatus: 'validated',
            tableNumber: parts[6] || 'Table Import',
          });
          count++;
        }
      }

      alert(`${count} participant(s) importé(s) avec succès dans Supabase !`);
      setShowImportModal(false);
      setCsvText('');
      await loadAttendees();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur pendant l’import dans Supabase.';
      await loadAttendees();
      setConnectionError(`${count} participant(s) importé(s). ${message}`);
    }
  };

  const sendWhatsAppTicket = (att: Attendee) => {
    setActiveMenuId(null);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const ticketUrl = `${origin}/billet/${att.qrToken}`;
    const text = `Bonjour ${att.fullName},\nVoici votre billet officiel pour Le Dîner des Entrepreneurs avec Mr Chey : ${ticketUrl}\nTable assignée : ${
      att.tableNumber || 'À l\'accueil'
    }.`;
    openWhatsApp(text, att.phone);
  };

  const totalCount = attendees.length;
  const validatedCount = attendees.filter((a) => a.paymentStatus === 'validated').length;
  const pendingCount = attendees.filter(
    (a) => a.paymentStatus === 'pending' || a.paymentStatus === 'cash_on_arrival'
  ).length;
  const scannedCount = attendees.filter((a) => a.isScanned).length;
  const totalRevenue = attendees
    .filter((a) => a.paymentStatus === 'validated')
    .reduce((sum, a) => sum + (a.price || 0), 0);

  const filteredAttendees = attendees.filter((a) => {
    const matchesSearch =
      a.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.company && a.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.jobTitle && a.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      a.qrToken.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'validated'
        ? a.paymentStatus === 'validated'
        : statusFilter === 'pending'
        ? a.paymentStatus === 'pending'
        : a.paymentStatus === 'cash_on_arrival';

    const matchesCategory =
      categoryFilter === 'all' ? true : a.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#141516] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#1c1d1e] p-8 rounded-xl border border-[#eabe7c]/30 text-center space-y-6 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-black/40 border border-[#eabe7c] mx-auto flex items-center justify-center text-[#eabe7c]">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h1 className="font-serif text-2xl font-bold text-white">Administration</h1>
            <p className="text-xs text-[#eabe7c] mt-1 font-medium">Mr Chey • Gestion Privée</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {!isSupabaseConfigured && (
              <p className="text-xs text-amber-200">
                Supabase n&apos;est pas configuré : le tableau de bord restera inaccessible.
              </p>
            )}
            {connectionError && (
              <p className="text-xs text-rose-300">{connectionError}</p>
            )}
            <div>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Code PIN (par défaut: 2026)"
                className="w-full px-4 py-3 rounded-lg bg-[#101112] border border-white/10 text-center font-mono text-lg text-[#eabe7c] tracking-widest focus:border-[#eabe7c] focus:outline-none"
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
              Accéder au Dashboard
            </button>
          </form>

          <Link href="/" className="inline-block text-xs text-white/40 hover:text-[#eabe7c]">
            Retour au site public
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141516] text-[#a1a1a2] pb-16">
      {/* Top Header */}
      <header className="bg-[#101112] border-b border-white/10 px-6 sm:px-10 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-lg bg-[#1c1d1e] text-white/60 hover:text-[#eabe7c]">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                <span>Dashboard Administration</span>
                <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold bg-[#eabe7c] text-black">
                  Mr Chey
                </span>
              </h1>
              <p className="text-[11px] text-[#eabe7c]">Le Dîner des Entrepreneurs • Lubumbashi</p>
            </div>
          </div>

          {/* Navigation Tabs & Actions */}
          <div className="flex items-center gap-3">
            <div className="bg-[#1c1d1e] p-1 rounded-lg border border-white/10 flex gap-1">
              <button
                onClick={() => setActiveTab('attendees')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'attendees'
                    ? 'bg-[#eabe7c] text-black shadow-md'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Participants ({totalCount})</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'settings'
                    ? 'bg-[#eabe7c] text-black shadow-md'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mr. Chey &amp; Partenaires</span>
              </button>
            </div>

            <Link
              href="/scanner"
              className="px-3.5 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-900 transition-colors"
              title="Accéder au scanner d'entrée"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">Scanner</span>
            </Link>

            <button
              onClick={() => {
                sessionStorage.removeItem('diner_admin_auth');
                setIsAuthenticated(false);
              }}
              className="text-xs text-white/40 hover:text-rose-400"
            >
              Quitter
            </button>
          </div>
        </div>
      </header>

      {connectionError && (
        <div className="max-w-7xl mx-auto px-6 sm:px-10 mt-4">
          <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-lg text-rose-200 text-xs">
            {connectionError}
          </div>
        </div>
      )}

      {/* Real-time New User Alert Notification Banner */}
      {newUserAlert && (
        <div className="fixed top-20 right-6 z-50 max-w-sm w-full bg-[#1c1d1e] border-2 border-emerald-400 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] animate-fade-in backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <span>🔔 Inscription en Temps Réel !</span>
                </span>
                <span className="text-[10px] text-white/50">{newUserAlert.time}</span>
              </div>

              <h4 className="text-white font-bold text-sm truncate mt-1">{newUserAlert.name}</h4>
              <p className="text-xs text-white/70 mt-0.5">
                Pass : <span className="text-[#eabe7c] font-semibold">{newUserAlert.category.toUpperCase()}</span>
                {newUserAlert.company ? ` • ${newUserAlert.company}` : ''}
              </p>
              <p className="text-[11px] font-mono text-white/50">{newUserAlert.phone}</p>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => {
                    handleStatusChange(newUserAlert.id, 'validated');
                    setNewUserAlert(null);
                  }}
                  className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Valider Paiement Direct ✅
                </button>
                <button
                  onClick={() => setNewUserAlert(null)}
                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white/70 text-[11px] cursor-pointer"
                >
                  Ignorer
                </button>
              </div>
            </div>

            <button
              onClick={() => setNewUserAlert(null)}
              className="text-white/40 hover:text-white p-1 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {settingsSuccessMsg && (
        <div className="max-w-7xl mx-auto px-6 sm:px-10 mt-4">
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-200 text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{settingsSuccessMsg}</span>
          </div>
        </div>
      )}

      {/* ================= TAB 1 : PARTICIPANTS & BILLETS ================= */}
      {activeTab === 'attendees' && (
        <main className="max-w-7xl mx-auto px-6 sm:px-10 pt-8 space-y-8 animate-fade-in">
          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-5 rounded-xl bg-[#1c1d1e] border border-white/10 shadow-lg">
              <div className="flex justify-between items-center text-white/50 text-xs mb-1">
                <span>Total Inscrits</span>
                <Users className="w-4 h-4 text-[#eabe7c]" />
              </div>
              <div className="text-2xl font-bold font-serif text-white">{totalCount}</div>
            </div>

            <div className="p-5 rounded-xl bg-[#1c1d1e] border border-emerald-500/30 shadow-lg">
              <div className="flex justify-between items-center text-white/50 text-xs mb-1">
                <span>Validés / Payés (QR Prêts)</span>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-serif text-emerald-400">{validatedCount}</div>
            </div>

            <div className="p-5 rounded-xl bg-[#1c1d1e] border border-amber-500/30 shadow-lg">
              <div className="flex justify-between items-center text-white/50 text-xs mb-1">
                <span>En Attente (Pré-inscrits)</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold font-serif text-amber-400">{pendingCount}</div>
            </div>

            <div className="p-5 rounded-xl bg-[#1c1d1e] border border-blue-500/30 shadow-lg">
              <div className="flex justify-between items-center text-white/50 text-xs mb-1">
                <span>Scannés (Entrés)</span>
                <QrCode className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold font-serif text-blue-400">
                {scannedCount}{' '}
                <span className="text-xs font-normal text-white/40 font-sans">
                  ({Math.round((scannedCount / (totalCount || 1)) * 100)}%)
                </span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#1c1d1e] border border-[#eabe7c]/40 col-span-2 lg:col-span-1 shadow-lg">
              <div className="flex justify-between items-center text-[#eabe7c] text-xs mb-1">
                <span>Recettes Encaissées</span>
                <DollarSign className="w-4 h-4 text-[#eabe7c]" />
              </div>
              <div className="text-2xl font-bold font-serif text-[#eabe7c] font-mono">
                ${totalRevenue}
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="p-4 rounded-xl bg-[#1c1d1e] border border-white/10 flex flex-wrap items-center justify-between gap-4 shadow-lg">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher nom, tél, entreprise, fonction, QR..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#101112] border border-white/10 text-xs text-white focus:border-[#eabe7c] focus:outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#101112] border border-white/10 text-xs text-white focus:border-[#eabe7c] focus:outline-none"
              >
                <option value="all">Tous les statuts</option>
                <option value="validated">Validé (Payé)</option>
                <option value="pending">En attente (Pré-inscrit)</option>
                <option value="cash_on_arrival">Espèces sur place</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#101112] border border-white/10 text-xs text-white focus:border-[#eabe7c] focus:outline-none"
              >
                <option value="all">Toutes formules</option>
                <option value="standard">Standard ($30)</option>
                <option value="vip">VIP ($50)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-lg bg-[#eabe7c] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-white shadow-lg transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un Participant</span>
              </button>

              <button
                onClick={() => setShowImportModal(true)}
                className="px-3.5 py-2 rounded-lg bg-[#101112] border border-white/15 text-white/80 text-xs font-semibold flex items-center gap-1.5 hover:border-[#eabe7c] transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Import</span>
              </button>

              <button
                onClick={handleExportCsv}
                className="px-3.5 py-2 rounded-lg bg-[#101112] border border-white/15 text-white/80 text-xs font-semibold flex items-center gap-1.5 hover:border-[#eabe7c] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {/* Data Table with 3-Dots Menu */}
          <div className="bg-[#1c1d1e] rounded-xl border border-white/10 overflow-visible shadow-2xl">
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#101112] text-[#eabe7c] uppercase font-semibold border-b border-white/10">
                  <tr>
                    <th className="p-4">Participant</th>
                    <th className="p-4">Secteur / Entreprise</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Formule</th>
                    <th className="p-4">Paiement &amp; QR</th>
                    <th className="p-4">Table</th>
                    <th className="p-4">Accès</th>
                    <th className="p-4 text-right">Options</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredAttendees.length > 0 ? (
                    filteredAttendees.map((att) => {
                      const isValidated = att.paymentStatus === 'validated';
                      const isMenuOpen = activeMenuId === att.id;

                      return (
                        <tr key={att.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/20 shrink-0 bg-black/40">
                                {att.photoUrl ? (
                                  <img
                                    src={att.photoUrl}
                                    alt={att.fullName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center font-bold text-base text-[#eabe7c]">
                                    {att.fullName.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <span className="font-bold text-white block text-sm">{att.fullName}</span>
                                <span className="font-mono text-[10px] text-[#eabe7c]/80 block">
                                  {att.qrToken}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <span className="font-semibold text-white/90 block">
                              {att.company || 'Indépendant'}
                            </span>
                            <span className="text-[10px] text-white/50 block">
                              {att.jobTitle || 'Non renseigné'}
                            </span>
                          </td>

                          <td className="p-4">
                            <span className="font-mono text-white/80 block">{att.phone}</span>
                            {att.email && (
                              <span className="text-[10px] text-white/40 block truncate max-w-[140px]">
                                {att.email}
                              </span>
                            )}
                          </td>

                          <td className="p-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                att.category === 'vip'
                                  ? 'bg-[#eabe7c]/20 text-[#eabe7c] border border-[#eabe7c]/40'
                                  : 'bg-black/30 text-white/70 border border-white/10'
                              }`}
                            >
                              {att.category} (${att.price})
                            </span>
                          </td>

                          <td className="p-4">
                            {isValidated ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-semibold text-[11px]">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Payé • QR Prêt</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300 font-semibold text-[11px]">
                                <Clock className="w-3.5 h-3.5" />
                                <span>En Attente (Pré-inscrit)</span>
                              </span>
                            )}
                            {att.paymentReference && (
                              <span className="block text-[9px] font-mono text-white/40 mt-0.5">
                                Réf: {att.paymentReference}
                              </span>
                            )}
                          </td>

                          <td className="p-4">
                            <button
                              onClick={() => {
                                setEditingAttendee(att);
                                setTableInput(att.tableNumber || '');
                              }}
                              className="flex items-center gap-1 px-2 py-1 rounded bg-[#101112] hover:border-[#eabe7c] border border-white/10 text-[#eabe7c] text-[11px] font-semibold"
                            >
                              <span>{att.tableNumber || 'Assigner'}</span>
                              <Edit2 className="w-2.5 h-2.5 text-[#eabe7c]" />
                            </button>
                          </td>

                          <td className="p-4">
                            {att.isScanned ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Entré</span>
                              </span>
                            ) : (
                              <span className="text-white/40 text-[11px]">Pas encore</span>
                            )}
                          </td>

                          {/* 3-DOTS ACTION MENU */}
                          <td className="p-4 text-right relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(isMenuOpen ? null : att.id);
                              }}
                              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                isMenuOpen
                                  ? 'bg-[#eabe7c] text-black border-[#eabe7c]'
                                  : 'bg-[#101112] text-white/70 hover:text-white border-white/10 hover:border-white/30'
                              }`}
                              title="Plus d'actions"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown Popover */}
                            {isMenuOpen && (
                              <div
                                ref={menuRef}
                                className="absolute right-4 top-12 w-52 rounded-xl bg-[#1c1d1e] border border-white/20 shadow-2xl p-1.5 z-50 text-left space-y-1 animate-fade-in backdrop-blur-xl"
                              >
                                {/* Valider comme payé (Action clé) */}
                                {!isValidated ? (
                                  <button
                                    onClick={() => handleStatusChange(att.id, 'validated')}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-emerald-400 hover:bg-emerald-950 text-xs font-semibold transition-colors"
                                  >
                                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span>Valider comme payé ✅</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleStatusChange(att.id, 'pending')}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-amber-400 hover:bg-amber-950 text-xs font-medium transition-colors"
                                  >
                                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                                    <span>Marquer en attente</span>
                                  </button>
                                )}

                                {/* Voir / Débloquer Billet direct */}
                                <Link
                                  href={`/billet/${att.qrToken}`}
                                  target="_blank"
                                  onClick={() => setActiveMenuId(null)}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/90 hover:bg-white/10 text-xs font-medium transition-colors"
                                >
                                  <QrCode className="w-4 h-4 text-[#eabe7c] shrink-0" />
                                  <span>Voir Billet &amp; QR Code</span>
                                </Link>

                                {/* Envoyer sur WhatsApp */}
                                <button
                                  onClick={() => sendWhatsAppTicket(att)}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/90 hover:bg-white/10 text-xs font-medium transition-colors"
                                >
                                  <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                                  <span>Envoyer via WhatsApp</span>
                                </button>

                                {/* Modifier la table */}
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    setEditingAttendee(att);
                                    setTableInput(att.tableNumber || '');
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/90 hover:bg-white/10 text-xs font-medium transition-colors"
                                >
                                  <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                                  <span>Changer la Table</span>
                                </button>

                                {/* Toggle scan manuel */}
                                <button
                                  onClick={() => handleToggleScanned(att)}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/90 hover:bg-white/10 text-xs font-medium transition-colors"
                                >
                                  <RotateCcw className="w-4 h-4 text-purple-400 shrink-0" />
                                  <span>
                                    {att.isScanned ? 'Annuler scan d\'entrée' : 'Marquer comme entré'}
                                  </span>
                                </button>

                                <div className="h-px bg-white/10 my-1" />

                                {/* Supprimer */}
                                <button
                                  onClick={() => handleDelete(att.id, att.fullName)}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-950 text-xs font-medium transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
                                  <span>Supprimer le participant</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-white/40">
                        Aucun participant trouvé avec ces filtres.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      {/* ================= TAB 2 : MR CHEY & PARTENAIRES ================= */}
      {activeTab === 'settings' && (
        <main className="max-w-5xl mx-auto px-6 sm:px-10 pt-8 space-y-10 animate-fade-in">
          {/* Section 1 : Photo Portrait de Mr. Chey */}
          <div className="bg-[#1c1d1e] rounded-2xl border border-[#eabe7c]/30 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#eabe7c]/10 border border-[#eabe7c] flex items-center justify-center text-[#eabe7c]">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-bold text-white">Portrait Officiel de Mr Chey</h2>
                  <p className="text-xs text-white/60">
                    Cette photo apparaît dans la section Vision &amp; Hôte Principal sur la page d&apos;accueil.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Photo Preview */}
              <div className="md:col-span-4 flex flex-col items-center">
                <div className="w-48 h-60 rounded-xl overflow-hidden border-2 border-[#eabe7c] shadow-2xl bg-black/60 relative">
                  <img
                    src={mrCheyPhotoInput}
                    alt="Aperçu Portrait Mr Chey"
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_MR_CHEY_PHOTO;
                    }}
                  />
                  <span className="absolute bottom-2 left-2 right-2 text-center text-[10px] bg-black/70 text-[#eabe7c] py-0.5 rounded backdrop-blur-sm">
                    Aperçu Actuel
                  </span>
                </div>
              </div>

              {/* Form to update photo */}
              <form onSubmit={handleSaveMrCheyPhoto} className="md:col-span-8 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-white/70 mb-1">
                    Lien / URL de la photo de Mr Chey
                  </label>
                  <input
                    type="text"
                    value={mrCheyPhotoInput}
                    onChange={(e) => setMrCheyPhotoInput(e.target.value)}
                    placeholder="Ex: /images/mr-chey.png ou https://..."
                    className="w-full px-4 py-2.5 rounded-lg bg-[#101112] border border-white/15 text-xs text-white focus:border-[#eabe7c] focus:outline-none"
                    required
                  />
                  <p className="text-[11px] text-white/40 mt-1">
                    Astuce : vous pouvez coller une URL d&apos;image ou utiliser la photo par défaut <span className="font-mono text-[#eabe7c]">/images/mr-chey.png</span>.
                  </p>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setMrCheyPhotoInput('/images/mr-chey.png')}
                    className="px-3 py-1 rounded bg-[#101112] border border-white/10 hover:border-[#eabe7c] text-[11px] text-white/70"
                  >
                    Photo Standard (/images/mr-chey.png)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setMrCheyPhotoInput(
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80'
                      )
                    }
                    className="px-3 py-1 rounded bg-[#101112] border border-white/10 hover:border-[#eabe7c] text-[11px] text-white/70"
                  >
                    Exemple Portrait Studio
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-[#eabe7c] text-black text-xs font-bold uppercase tracking-wider hover:bg-white transition-all shadow-lg cursor-pointer"
                  >
                    Enregistrer le Nouveau Portrait
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Section 2 : Partenaires & Logos */}
          <div className="bg-[#1c1d1e] rounded-2xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#eabe7c]/10 border border-[#eabe7c] flex items-center justify-center text-[#eabe7c]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-bold text-white">Logos &amp; Partenaires</h2>
                  <p className="text-xs text-white/60">
                    Gérez les entreprises qui sponsorisent l&apos;événement sur la page d&apos;accueil.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAddPartnerModal(true)}
                className="px-4 py-2 rounded-lg bg-[#eabe7c] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-white shadow-lg transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un Partenaire</span>
              </button>
            </div>

            {/* Partners Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className="p-4 rounded-xl bg-[#101112] border border-white/10 flex items-center justify-between gap-3 group hover:border-[#eabe7c]/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-black/50 border border-white/15 flex items-center justify-center text-[#eabe7c] shrink-0 overflow-hidden">
                      {partner.logoUrl ? (
                        <img
                          src={partner.logoUrl}
                          alt={partner.name}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <Building2 className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-white text-xs block truncate">
                        {partner.name}
                      </span>
                      <span className="text-[10px] text-[#eabe7c] block truncate">
                        {partner.category}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeletePartner(partner.id)}
                    className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-950/40 transition-colors shrink-0"
                    title="Supprimer le partenaire"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* ================= MODAL: AJOUTER UN PARTICIPANT ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#1c1d1e] rounded-2xl border border-[#eabe7c]/40 p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-white">Ajouter un Participant</h3>
                <p className="text-xs text-[#eabe7c]">Inscription et assignation de table</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualAdd} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase font-bold text-white/70 mb-1">
                  Nom Complet *
                </label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Ex: Jean-David Kabwe"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#101112] border border-white/15 text-xs text-white focus:border-[#eabe7c] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-white/70 mb-1">
                    Numéro de Téléphone *
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+243 ..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#101112] border border-white/15 text-xs text-white focus:border-[#eabe7c] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-white/70 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="client@domaine.cd"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#101112] border border-white/15 text-xs text-white focus:border-[#eabe7c] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-white/70 mb-1">
                    Secteur d&apos;Activité / Entreprise
                  </label>
                  <input
                    type="text"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="Ex: Minier, Tech, Banque..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#101112] border border-white/15 text-xs text-white focus:border-[#eabe7c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-white/70 mb-1">
                    Fonction / Titre
                  </label>
                  <input
                    type="text"
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    placeholder="Ex: Directeur Général"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#101112] border border-white/15 text-xs text-white focus:border-[#eabe7c] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-white/70 mb-1">
                    Formule / Catégorie
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as TicketCategory)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#101112] border border-white/15 text-xs text-white focus:border-[#eabe7c] focus:outline-none"
                  >
                    <option value="standard">Standard — $30</option>
                    <option value="vip">Pass VIP — $50</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-white/70 mb-1">
                    Place / Table Assignée
                  </label>
                  <input
                    type="text"
                    value={newTable}
                    onChange={(e) => setNewTable(e.target.value)}
                    placeholder="Ex: Table Prestige, Table 1..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#101112] border border-white/15 text-xs text-white focus:border-[#eabe7c] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase font-bold text-white/70 mb-1">
                  Statut Initial du Paiement
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as PaymentStatus)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#101112] border border-white/15 text-xs text-white focus:border-[#eabe7c] focus:outline-none"
                >
                  <option value="validated">✅ Validé (Débloque le QR Code immédiatement)</option>
                  <option value="pending">⏳ En attente de paiement (Pré-inscription)</option>
                  <option value="cash_on_arrival">💵 Paiement en espèces sur place</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-lg bg-[#101112] border border-white/15 text-xs font-semibold text-white/70 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="flex-1 py-3 rounded-lg bg-[#eabe7c] text-black text-xs font-extrabold uppercase tracking-wider hover:bg-white transition-all shadow-lg disabled:opacity-50"
                >
                  {isAdding ? 'Enregistrement...' : 'Valider l\'inscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: AJOUTER UN PARTENAIRE ================= */}
      {showAddPartnerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1c1d1e] rounded-2xl border border-[#eabe7c]/40 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Nouveau Partenaire</h3>
                <p className="text-xs text-[#eabe7c]">Ajouter un sponsor ou partenaire officiel</p>
              </div>
              <button
                onClick={() => setShowAddPartnerModal(false)}
                className="text-white/50 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPartner} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase font-bold text-white/70 mb-1">
                  Nom de l&apos;Entreprise *
                </label>
                <input
                  type="text"
                  value={newPartnerName}
                  onChange={(e) => setNewPartnerName(e.target.value)}
                  placeholder="Ex: Rawbank Prestige"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#101112] border border-white/15 text-xs text-white focus:border-[#eabe7c] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-bold text-white/70 mb-1">
                  Catégorie / Statut *
                </label>
                <input
                  type="text"
                  value={newPartnerCategory}
                  onChange={(e) => setNewPartnerCategory(e.target.value)}
                  placeholder="Ex: Partenaire Platine, Partenaire Bancaire..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#101112] border border-white/15 text-xs text-white focus:border-[#eabe7c] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-bold text-white/70 mb-1">
                  Lien du Logo (URL image)
                </label>
                <input
                  type="text"
                  value={newPartnerLogo}
                  onChange={(e) => setNewPartnerLogo(e.target.value)}
                  placeholder="Ex: https://... ou laisser vide pour icône par défaut"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#101112] border border-white/15 text-xs text-white focus:border-[#eabe7c] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddPartnerModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-[#101112] border border-white/15 text-xs font-semibold text-white/70"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-[#eabe7c] text-black text-xs font-bold uppercase tracking-wider hover:bg-white"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: MODIFIER TABLE ================= */}
      {editingAttendee && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#1c1d1e] rounded-xl border border-white/20 p-6 space-y-4 shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-white">
              Assigner la Table pour {editingAttendee.fullName}
            </h3>

            <form onSubmit={handleSaveTable} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase font-bold text-white/70 mb-1">
                  Nom ou Numéro de la Table
                </label>
                <input
                  type="text"
                  value={tableInput}
                  onChange={(e) => setTableInput(e.target.value)}
                  placeholder="Ex: Table Prestige (Mr Chey), Table 4..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#101112] border border-white/15 text-xs text-white focus:border-[#eabe7c] focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAttendee(null)}
                  className="flex-1 py-2 rounded-lg bg-[#101112] border border-white/15 text-xs text-white/70"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-[#eabe7c] text-black text-xs font-bold uppercase hover:bg-white"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: IMPORT CSV ================= */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1c1d1e] rounded-xl border border-white/20 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-serif text-lg font-bold text-white">Importer des Invités via CSV</h3>
              <button onClick={() => setShowImportModal(false)} className="text-white/50 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-white/60">
              Collez vos données CSV au format :<br />
              <code className="text-[#eabe7c] text-[11px]">Nom, Téléphone, Email, Entreprise, Fonction, Catégorie (standard/vip), Table</code>
            </p>

            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Patrick Mukendi, +243990011223, patrick@katanga.cd, Gécamines, Ingénieur, standard, Table 1"
              rows={6}
              className="w-full p-3 rounded-lg bg-[#101112] border border-white/15 text-xs text-white font-mono focus:border-[#eabe7c] focus:outline-none"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 py-2.5 rounded-lg bg-[#101112] border border-white/15 text-xs text-white/70"
              >
                Annuler
              </button>
              <button
                onClick={handleImportCsv}
                className="flex-1 py-2.5 rounded-lg bg-[#eabe7c] text-black text-xs font-bold uppercase hover:bg-white"
              >
                Lancer l&apos;import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
