import { Attendee, ScanResult, TicketCategory } from '@/types';
import {
  fetchAttendeesFromSupabase,
  fetchAttendeeByTokenFromSupabase,
  fetchAttendeesByPhoneFromSupabase,
  insertAttendeeToSupabase,
  updateAttendeeInSupabase,
  deleteAttendeeFromSupabase,
  verifyAndCheckInWithSupabase,
} from './supabase';

const ADMIN_PIN_KEY = 'diner_entrepreneurs_admin_pin';
const SCANNER_PIN_KEY = 'diner_entrepreneurs_scanner_pin';
const LAST_TICKET_KEY = 'diner_entrepreneurs_my_last_ticket';

export const DEFAULT_ADMIN_PIN = 'MrCheyAdmin2026!';
export const DEFAULT_SCANNER_PIN = 'Big5Scanner2026!';

// Zero mock data - 100% real database
export const INITIAL_ATTENDEES: Attendee[] = [];

export async function getStoredAttendeesAsync(): Promise<Attendee[]> {
  return fetchAttendeesFromSupabase();
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

  const inserted = await insertAttendeeToSupabase(newAttendee);
  saveMyLastTicketToken(inserted.qrToken);
  return inserted;
}

export async function findAttendeeByTokenAsync(token: string): Promise<Attendee | undefined> {
  return (await fetchAttendeeByTokenFromSupabase(token)) || undefined;
}

export async function findAttendeeByPhoneAsync(phone: string): Promise<Attendee[]> {
  return fetchAttendeesByPhoneFromSupabase(phone);
}

export async function updateAttendeeAsync(id: string, updates: Partial<Attendee>): Promise<Attendee | null> {
  return updateAttendeeInSupabase(id, updates);
}

export async function deleteAttendeeAsync(id: string): Promise<boolean> {
  return deleteAttendeeFromSupabase(id);
}

/**
 * VÉRIFICATION ET CHECK-IN DIRECTEMENT DANS SUPABASE
 * Empêche qu'une personne utilise un QR code déjà scanné !
 */
export async function verifyAndCheckInAsync(token: string): Promise<ScanResult> {
  return verifyAndCheckInWithSupabase(token);
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
