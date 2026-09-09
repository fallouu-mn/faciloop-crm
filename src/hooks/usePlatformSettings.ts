import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface PlatformSettings {
  nom_plateforme: string;
  email_support: string;
  whatsapp_support: string;
  devise_defaut: string;
  message_maintenance: string;
}

const DEFAULTS: PlatformSettings = {
  nom_plateforme: 'Faciloop SaaS',
  email_support: '',
  whatsapp_support: '',
  devise_defaut: 'XOF',
  message_maintenance: '',
};

let cached: PlatformSettings | null = null;
const listeners: Array<(s: PlatformSettings) => void> = [];

function notify(s: PlatformSettings) {
  cached = s;
  listeners.forEach(fn => fn(s));
}

export function invalidatePlatformSettings() {
  cached = null;
}

export async function refreshPlatformSettings() {
  const { data } = await supabase
    .from('platform_settings')
    .select('*')
    .limit(1)
    .single();
  const loaded: PlatformSettings = data
    ? {
        nom_plateforme: data.nom_plateforme || DEFAULTS.nom_plateforme,
        email_support: data.email_support || '',
        whatsapp_support: data.whatsapp_support || '',
        devise_defaut: data.devise_defaut || 'XOF',
        message_maintenance: data.message_maintenance || '',
      }
    : DEFAULTS;
  notify(loaded);
}

export function usePlatformSettings(): PlatformSettings {
  const [settings, setSettings] = useState<PlatformSettings>(cached ?? DEFAULTS);

  useEffect(() => {
    listeners.push(setSettings);

    if (!cached) {
      supabase
        .from('platform_settings')
        .select('*')
        .limit(1)
        .single()
        .then(({ data }) => {
          const loaded: PlatformSettings = data
            ? {
                nom_plateforme: data.nom_plateforme || DEFAULTS.nom_plateforme,
                email_support: data.email_support || '',
                whatsapp_support: data.whatsapp_support || '',
                devise_defaut: data.devise_defaut || 'XOF',
                message_maintenance: data.message_maintenance || '',
              }
            : DEFAULTS;
          notify(loaded);
        });
    } else {
      setSettings(cached);
    }

    return () => {
      const idx = listeners.indexOf(setSettings);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, []);

  return settings;
}
