import { Attendee, PaymentStatus, ScanResult, TicketCategory } from '@/types';
import {
  isSupabaseConfigured,
  fetchAttendeesFromSupabase,
  fetchAttendeeByTokenFromSupabase,
  fetchAttendeesByPhoneFromSupabase,
  insertAttendeeToSupabase,
  updateAttendeeInSupabase,
  deleteAttendeeFromSupabase,
  verifyAndCheckInWithSupabase,
} from './supabase';

// Production Live Storage Key
const STORAGE_KEY = 'diner_entrepreneurs_attendees_live_v2';
const ADMIN_PIN_KEY = 'diner_entrepreneurs_admin_pin';
const SCANNER_PIN_KEY = 'diner_entrepreneurs_scanner_pin';
const LAST_TICKET_KEY = 'diner_entrepreneurs_my_last_ticket';

export const DEFAULT_ADMIN_PIN = 'MrCheyAdmin2026!';
export const DEFAULT_SCANNER_PIN = 'Big5Scanner2026!';

// Zero mock data - 100% real database
export const INITIAL_ATTENDEES: Attendee[] = [];

export function getStoredAttendees(): Attendee[] {
  if (typeof window === 'undefined') return [];
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (!item) {
      return [];
    }
    return JSON.parse(item);
  } catch (e) {
    console.error('Error reading localStorage', e);
    return [];
  }
}

export async function getStoredAttendeesAsync(): Promise<Attendee[]> {
  if (isSupabaseConfigured) {
    const fromSupabase = await fetchAttendeesFromSupabase();
    if (fromSupabase !== null) {
      saveAttendees(fromSupabase);
      return fromSupabase;
    }
  }
  return getStoredAttendees();
}

export function saveAttendees(attendees: Attendee[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attendees));
    window.dispatchEvent(new Event('diner_attendees_updated'));
  } catch (e) {
    console.error('Error saving attendees', e);
  }
}

export function saveMyLastTicketToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LAST_TICKET_KEY, token);
    window.dispatchEvent(new Event('diner_my_ticket_updated'));
  } catch (e) {
    console.error('Error saving last ticket token', e);
  }
}

export function getMyLastTicketToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(LAST_TICKET_KEY);
  } catch (e) {
    return null;
  }
}

export function generateQrToken(category: TicketCategory): string {
  const prefix = category === 'vip' ? 'DDE26-VIP' : 'DDE26-STD';
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${randomDigits}`;
}

export function registerAttendee(data: Omit<Attendee, 'id' | 'qrToken' | 'isScanned' | 'createdAt'>): Attendee {
  const attendees = getStoredAttendees();
  const token = generateQrToken(data.category);
  const newAttendee: Attendee = {
    ...data,
    id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    qrToken: token,
    isScanned: false,
    createdAt: new Date().toISOString(),
  };

  attendees.unshift(newAttendee);
  saveAttendees(attendees);
  saveMyLastTicketToken(token);

  // Background sync with Supabase
  if (isSupabaseConfigured) {
    insertAttendeeToSupabase(newAttendee).catch((err) => {
      console.warn('Background Supabase insert error:', err);
    });
  }

  return newAttendee;
}

export async function registerAttendeeAsync(
  data: Omit<Attendee, 'id' | 'qrToken' | 'isScanned' | 'createdAt'>
): Promise<Attendee> {
  const token = generateQrToken(data.category);
  const newAttendee: Attendee = {
    ...data,
    id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    qrToken: token,
    isScanned: false,
    createdAt: new Date().toISOString(),
  };

  // 1. Sauvegarde principale dans Supabase
  if (isSupabaseConfigured) {
    const inserted = await insertAttendeeToSupabase(newAttendee);
    if (inserted) {
      const attendees = getStoredAttendees();
      attendees.unshift(inserted);
      saveAttendees(attendees);
      saveMyLastTicketToken(token);
      return inserted;
    }
  }

  // 2. Fallback local si offline
  const attendees = getStoredAttendees();
  attendees.unshift(newAttendee);
  saveAttendees(attendees);
  saveMyLastTicketToken(token);
  return newAttendee;
}

export function findAttendeeByToken(token: string): Attendee | undefined {
  const attendees = getStoredAttendees();
  const clean = token.trim().toLowerCase();
  return attendees.find(a => a.qrToken.toLowerCase() === clean || a.id.toLowerCase() === clean);
}

export async function findAttendeeByTokenAsync(token: string): Promise<Attendee | undefined> {
  if (isSupabaseConfigured) {
    const fromSb = await fetchAttendeeByTokenFromSupabase(token);
    if (fromSb) return fromSb;
  }
  return findAttendeeByToken(token);
}

export function findAttendeeByPhone(phone: string): Attendee[] {
  const attendees = getStoredAttendees();
  const cleanPhone = phone.replace(/[\s\-\+]/g, '');
  return attendees.filter(a => {
    const p = a.phone.replace(/[\s\-\+]/g, '');
    return p.includes(cleanPhone) || cleanPhone.includes(p);
  });
}

export async function findAttendeeByPhoneAsync(phone: string): Promise<Attendee[]> {
  if (isSupabaseConfigured) {
    const fromSb = await fetchAttendeesByPhoneFromSupabase(phone);
    if (fromSb && fromSb.length > 0) return fromSb;
  }
  return findAttendeeByPhone(phone);
}

export function updateAttendee(id: string, updates: Partial<Attendee>): Attendee | null {
  const attendees = getStoredAttendees();
  const index = attendees.findIndex(a => a.id === id || a.qrToken === id);
  if (index === -1) return null;

  attendees[index] = { ...attendees[index], ...updates };
  saveAttendees(attendees);

  if (isSupabaseConfigured) {
    updateAttendeeInSupabase(attendees[index].id, updates).catch(console.error);
  }

  return attendees[index];
}

export async function updateAttendeeAsync(id: string, updates: Partial<Attendee>): Promise<Attendee | null> {
  let result: Attendee | null = null;
  if (isSupabaseConfigured) {
    result = await updateAttendeeInSupabase(id, updates);
  }
  const local = updateAttendee(id, updates);
  return result || local;
}

export function deleteAttendee(id: string): boolean {
  const attendees = getStoredAttendees();
  const filtered = attendees.filter(a => a.id !== id && a.qrToken !== id);
  if (filtered.length !== attendees.length) {
    saveAttendees(filtered);
    if (isSupabaseConfigured) {
      deleteAttendeeFromSupabase(id).catch(console.error);
    }
    return true;
  }
  return false;
}

export async function deleteAttendeeAsync(id: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    await deleteAttendeeFromSupabase(id);
  }
  return deleteAttendee(id);
}

/**
 * VÉRIFICATION ET CHECK-IN DIRECTEMENT DANS SUPABASE
 * Empêche qu'une personne utilise un QR code déjà scanné !
 */
export async function verifyAndCheckInAsync(token: string): Promise<ScanResult> {
  if (isSupabaseConfigured) {
    const result = await verifyAndCheckInWithSupabase(token);
    if (result.attendee) {
      const all = getStoredAttendees();
      const idx = all.findIndex(a => a.id === result.attendee?.id || a.qrToken === result.attendee?.qrToken);
      if (idx !== -1) {
        all[idx] = result.attendee;
      } else {
        all.unshift(result.attendee);
      }
      saveAttendees(all);
    }
    return result;
  }

  return verifyAndCheckIn(token);
}

export function verifyAndCheckIn(token: string): ScanResult {
  const attendees = getStoredAttendees();
  const clean = token.trim();
  const attendee = attendees.find(a => a.qrToken.toLowerCase() === clean.toLowerCase() || a.id === clean);

  if (!attendee) {
    return {
      status: 'not_found',
      message: 'Billet introuvable dans la base de données. Veuillez vérifier le QR Code.',
    };
  }

  if (attendee.paymentStatus !== 'validated') {
    return {
      status: 'unpaid',
      message: `Billet en attente de paiement (${attendee.paymentStatus}). Merci d'orienter l'invité vers la caisse d'accueil.`,
      attendee,
    };
  }

  if (attendee.isScanned) {
    const formattedDate = attendee.scannedAt
      ? new Date(attendee.scannedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      : 'plus tôt';
    return {
      status: 'already_scanned',
      message: `ALERTE : Ce billet a DÉJÀ ÉTÉ SCANNÉ à ${formattedDate}. Accès refusé pour éviter une intrusion frauduleuse.`,
      attendee,
      scannedAt: attendee.scannedAt,
    };
  }

  const now = new Date().toISOString();
  attendee.isScanned = true;
  attendee.scannedAt = now;
  saveAttendees(attendees);

  return {
    status: 'valid',
    message: 'ACCÈS AUTORISÉ - Bienvenue au Dîner des Entrepreneurs !',
    attendee,
    scannedAt: now,
  };
}

export function getStoredAdminPin(): string {
  if (typeof window === 'undefined') return DEFAULT_ADMIN_PIN;
  return localStorage.getItem(ADMIN_PIN_KEY) || DEFAULT_ADMIN_PIN;
}

export function setStoredAdminPin(newPin: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_PIN_KEY, newPin);
}

export function getStoredScannerPin(): string {
  if (typeof window === 'undefined') return DEFAULT_SCANNER_PIN;
  return localStorage.getItem(SCANNER_PIN_KEY) || DEFAULT_SCANNER_PIN;
}

export function setStoredScannerPin(newPin: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SCANNER_PIN_KEY, newPin);
}

export function ensureDefaultPins(): void {
  if (typeof window === 'undefined') return;

  const adminPin = localStorage.getItem(ADMIN_PIN_KEY);
  if (!adminPin || adminPin === '2026') {
    localStorage.setItem(ADMIN_PIN_KEY, DEFAULT_ADMIN_PIN);
  }

  const scannerPin = localStorage.getItem(SCANNER_PIN_KEY);
  if (!scannerPin || scannerPin === '2026') {
    localStorage.setItem(SCANNER_PIN_KEY, DEFAULT_SCANNER_PIN);
  }
}
