import { supabase, isSupabaseConfigured } from './supabase';

export interface Partner {
  id: string;
  name: string;
  category: string;
  logoUrl?: string;
}

const SETTINGS_KEY = 'diner_entrepreneurs_settings_v1';

export const DEFAULT_PARTNERS: Partner[] = [
  { id: '1', name: 'Katanga Mining Hub', category: 'Partenaire Platine' },
  { id: '2', name: 'Copperbelt Invest', category: 'Partenaire Or' },
  { id: '3', name: 'Lubumbashi Tech', category: 'Partenaire Innovation' },
  { id: '4', name: 'Rawbank Prestige', category: 'Partenaire Bancaire' },
  { id: '5', name: 'Vodacom Business', category: 'Partenaire Télécom' },
  { id: '6', name: 'Chambre de Commerce', category: 'Partenaire Institutionnel' },
];

export const DEFAULT_MR_CHEY_PHOTO = '/images/monsieur chey.jpg';

interface SiteSettings {
  mrCheyPhoto: string;
  partners: Partner[];
}

export function getLocalSettings(): SiteSettings {
  if (typeof window === 'undefined') {
    return { mrCheyPhoto: DEFAULT_MR_CHEY_PHOTO, partners: DEFAULT_PARTNERS };
  }
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      const initial: SiteSettings = {
        mrCheyPhoto: DEFAULT_MR_CHEY_PHOTO,
        partners: DEFAULT_PARTNERS,
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading settings from localStorage', e);
    return { mrCheyPhoto: DEFAULT_MR_CHEY_PHOTO, partners: DEFAULT_PARTNERS };
  }
}

export function saveLocalSettings(settings: SiteSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event('diner_settings_updated'));
  } catch (e) {
    console.error('Error saving settings to localStorage', e);
  }
}

export async function fetchRemoteSettings(): Promise<SiteSettings> {
  const local = getLocalSettings();
  if (!supabase) return local;

  try {
    const { data, error } = await supabase.from('site_settings').select('*');
    if (!error && data && data.length > 0) {
      const remoteSettings: Partial<SiteSettings> = {};
      data.forEach((row: { key: string; value: any }) => {
        if (row.key === 'mr_chey_photo' && row.value?.url) {
          remoteSettings.mrCheyPhoto = row.value.url;
        }
        if (row.key === 'partners' && Array.isArray(row.value)) {
          remoteSettings.partners = row.value;
        }
      });
      const merged = { ...local, ...remoteSettings };
      saveLocalSettings(merged);
      return merged;
    }
  } catch (err) {
    // If table doesn't exist yet, smoothly fallback
  }

  return local;
}

export async function updateMrCheyPhoto(photoUrl: string): Promise<void> {
  const settings = getLocalSettings();
  settings.mrCheyPhoto = photoUrl;
  saveLocalSettings(settings);

  if (supabase) {
    try {
      await supabase.from('site_settings').upsert({
        key: 'mr_chey_photo',
        value: { url: photoUrl },
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      // Ignored if table not created
    }
  }
}

export async function savePartners(partners: Partner[]): Promise<void> {
  const settings = getLocalSettings();
  settings.partners = partners;
  saveLocalSettings(settings);

  if (supabase) {
    try {
      await supabase.from('site_settings').upsert({
        key: 'partners',
        value: partners,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      // Ignored if table not created
    }
  }
}
