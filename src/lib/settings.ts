import { getSupabaseClient } from './supabase';

export interface Partner {
  id: string;
  name: string;
  category: string;
  logoUrl?: string;
}

export const DEFAULT_PARTNERS: Partner[] = [
  // Partners are added only after their participation is confirmed.
];

export const DEFAULT_MR_CHEY_PHOTO = '/images/monsieur chey.jpg';

export interface SiteSettings {
  mrCheyPhoto: string;
  partners: Partner[];
}

export function getDefaultSettings(): SiteSettings {
  return {
    mrCheyPhoto: DEFAULT_MR_CHEY_PHOTO,
    partners: DEFAULT_PARTNERS,
  };
}

export async function fetchRemoteSettings(): Promise<SiteSettings> {
  const { data, error } = await getSupabaseClient()
    .from('site_settings')
    .select('*');

  if (error) {
    console.error('Supabase fetch site settings error:', error);
    throw new Error('Impossible de charger les paramètres du site depuis Supabase.');
  }

  const settings = getDefaultSettings();
  data?.forEach((row: { key: string; value: unknown }) => {
    if (
      row.key === 'mr_chey_photo' &&
      typeof row.value === 'object' &&
      row.value !== null &&
      'url' in row.value &&
      typeof row.value.url === 'string'
    ) {
      settings.mrCheyPhoto = row.value.url;
    }
    if (row.key === 'partners' && Array.isArray(row.value)) {
      settings.partners = row.value as Partner[];
    }
  });
  return settings;
}

export async function updateMrCheyPhoto(photoUrl: string): Promise<void> {
  const { error } = await getSupabaseClient().from('site_settings').upsert({
    key: 'mr_chey_photo',
    value: { url: photoUrl },
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Supabase update Mr Chey photo error:', error);
    throw new Error('Impossible d’enregistrer le portrait dans Supabase.');
  }
}

export async function savePartners(partners: Partner[]): Promise<void> {
  const { error } = await getSupabaseClient().from('site_settings').upsert({
    key: 'partners',
    value: partners,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Supabase save partners error:', error);
    throw new Error('Impossible d’enregistrer les partenaires dans Supabase.');
  }
}
