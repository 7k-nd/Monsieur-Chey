import { createClient } from '@supabase/supabase-js';
import { Attendee, ScanResult } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Mapper: DB Row (snake_case) -> Attendee (camelCase)
 */
export function rowToAttendee(row: any): Attendee {
  return {
    id: row.id,
    qrToken: row.qr_token,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email || undefined,
    company: row.company || undefined,
    jobTitle: row.job_title || undefined,
    photoUrl: row.photo_url || undefined,
    category: row.category,
    price: Number(row.price),
    paymentMethod: row.payment_method,
    paymentReference: row.payment_reference || undefined,
    paymentStatus: row.payment_status,
    tableNumber: row.table_number || undefined,
    isScanned: Boolean(row.is_scanned),
    scannedAt: row.scanned_at || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    sponsorName: row.sponsor_name || undefined,
  };
}

/**
 * Mapper: Attendee (camelCase) -> DB Row (snake_case)
 */
export function attendeeToRow(attendee: Partial<Attendee>): Record<string, any> {
  const row: Record<string, any> = {};
  if (attendee.id !== undefined) row.id = attendee.id;
  if (attendee.qrToken !== undefined) row.qr_token = attendee.qrToken;
  if (attendee.fullName !== undefined) row.full_name = attendee.fullName;
  if (attendee.phone !== undefined) row.phone = attendee.phone;
  if (attendee.email !== undefined) row.email = attendee.email;
  if (attendee.company !== undefined) row.company = attendee.company;
  if (attendee.jobTitle !== undefined) row.job_title = attendee.jobTitle;
  if (attendee.photoUrl !== undefined) row.photo_url = attendee.photoUrl;
  if (attendee.category !== undefined) row.category = attendee.category;
  if (attendee.price !== undefined) row.price = attendee.price;
  if (attendee.paymentMethod !== undefined) row.payment_method = attendee.paymentMethod;
  if (attendee.paymentReference !== undefined) row.payment_reference = attendee.paymentReference;
  if (attendee.paymentStatus !== undefined) row.payment_status = attendee.paymentStatus;
  if (attendee.tableNumber !== undefined) row.table_number = attendee.tableNumber;
  if (attendee.isScanned !== undefined) row.is_scanned = attendee.isScanned;
  if (attendee.scannedAt !== undefined) row.scanned_at = attendee.scannedAt;
  if (attendee.notes !== undefined) row.notes = attendee.notes;
  if (attendee.createdAt !== undefined) row.created_at = attendee.createdAt;
  if (attendee.sponsorName !== undefined) row.sponsor_name = attendee.sponsorName;
  return row;
}

/**
 * Récupère tous les invités depuis Supabase
 */
export async function fetchAttendeesFromSupabase(): Promise<Attendee[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('attendees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch attendees error:', error);
      return null;
    }
    return (data || []).map(rowToAttendee);
  } catch (err) {
    console.error('Network error fetching attendees:', err);
    return null;
  }
}

/**
 * Recherche un invité par son QR token ou ID
 */
export async function fetchAttendeeByTokenFromSupabase(token: string): Promise<Attendee | null> {
  if (!supabase) return null;
  try {
    const clean = token.trim();
    const { data, error } = await supabase
      .from('attendees')
      .select('*')
      .or(`qr_token.ilike.${clean},id.eq.${clean}`)
      .limit(1);

    if (error || !data || data.length === 0) return null;
    return rowToAttendee(data[0]);
  } catch (err) {
    console.error('Error fetching attendee by token:', err);
    return null;
  }
}

/**
 * Recherche par numéro de téléphone
 */
export async function fetchAttendeesByPhoneFromSupabase(phone: string): Promise<Attendee[]> {
  if (!supabase) return [];
  try {
    const cleanPhone = phone.replace(/[\s\-\+]/g, '');
    const { data, error } = await supabase
      .from('attendees')
      .select('*')
      .ilike('phone', `%${cleanPhone}%`);

    if (error || !data) return [];
    return data.map(rowToAttendee);
  } catch (err) {
    console.error('Error fetching attendees by phone:', err);
    return [];
  }
}

/**
 * Enregistre un nouvel invité dans Supabase
 */
export async function insertAttendeeToSupabase(attendee: Attendee): Promise<Attendee | null> {
  if (!supabase) return null;
  try {
    const row = attendeeToRow(attendee);
    const { data, error } = await supabase.from('attendees').upsert(row).select();
    if (error || !data || data.length === 0) {
      console.error('Error inserting attendee:', error);
      return null;
    }
    return rowToAttendee(data[0]);
  } catch (err) {
    console.error('Network error inserting attendee:', err);
    return null;
  }
}

/**
 * Met à jour un invité dans Supabase
 */
export async function updateAttendeeInSupabase(id: string, updates: Partial<Attendee>): Promise<Attendee | null> {
  if (!supabase) return null;
  try {
    const row = attendeeToRow(updates);
    const { data, error } = await supabase
      .from('attendees')
      .update(row)
      .eq('id', id)
      .select();

    if (error || !data || data.length === 0) {
      console.error('Error updating attendee:', error);
      return null;
    }
    return rowToAttendee(data[0]);
  } catch (err) {
    console.error('Network error updating attendee:', err);
    return null;
  }
}

/**
 * Supprime un invité dans Supabase
 */
export async function deleteAttendeeFromSupabase(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('attendees').delete().eq('id', id);
    return !error;
  } catch (err) {
    console.error('Error deleting attendee:', err);
    return false;
  }
}

/**
 * LOGIQUE DU SCANNER :
 * 1. Recherche du billet dans Supabase
 * 2. Vérification statut paiement
 * 3. Vérification anti-fraude (déjà scanné ?)
 * 4. Marquage immédiat comme "entré" (is_scanned = true, scanned_at = NOW())
 */
export async function verifyAndCheckInWithSupabase(token: string): Promise<ScanResult> {
  if (!supabase) {
    return {
      status: 'error',
      message: 'Base de données Supabase non connectée.',
    };
  }

  try {
    const clean = token.trim();
    // 1. Chercher dans la base
    const { data, error } = await supabase
      .from('attendees')
      .select('*')
      .or(`qr_token.ilike.${clean},id.eq.${clean}`)
      .limit(1);

    if (error || !data || data.length === 0) {
      return {
        status: 'not_found',
        message: 'Billet introuvable dans la base de données. Veuillez vérifier le QR Code.',
      };
    }

    const attendee = rowToAttendee(data[0]);

    // 2. Vérification paiement
    if (attendee.paymentStatus !== 'validated') {
      return {
        status: 'unpaid',
        message: `Billet en attente de paiement (${attendee.paymentStatus}). Merci d'orienter l'invité vers la caisse d'accueil.`,
        attendee,
      };
    }

    // 3. Vérification anti-fraude : déjà entré ?
    if (attendee.isScanned) {
      const formattedDate = attendee.scannedAt
        ? new Date(attendee.scannedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        : 'plus tôt';
      return {
        status: 'already_scanned',
        message: `ALERTE : Ce billet a DÉJÀ ÉTÉ SCANNÉ à ${formattedDate}. Accès refusé pour empêcher les doublons.`,
        attendee,
        scannedAt: attendee.scannedAt,
      };
    }

    // 4. Validation & Marquage comme ENTRÉ dans Supabase
    const now = new Date().toISOString();
    const { data: updatedData, error: updateError } = await supabase
      .from('attendees')
      .update({
        is_scanned: true,
        scanned_at: now,
      })
      .eq('id', attendee.id)
      .select();

    if (updateError || !updatedData || updatedData.length === 0) {
      console.error('Check-in update error:', updateError);
      return {
        status: 'error',
        message: 'Erreur lors de la mise à jour du statut dans la base de données.',
        attendee,
      };
    }

    const updatedAttendee = rowToAttendee(updatedData[0]);

    return {
      status: 'valid',
      message: 'ACCÈS AUTORISÉ - Bienvenue au Dîner des Entrepreneurs !',
      attendee: updatedAttendee,
      scannedAt: now,
    };
  } catch (err) {
    console.error('Scan error:', err);
    return {
      status: 'error',
      message: 'Erreur de connexion au serveur.',
    };
  }
}
