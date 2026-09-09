import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Phone, Mail, Save, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { refreshPlatformSettings } from '../../hooks/usePlatformSettings';

interface PlatformSettings {
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

const DEVISES = [
  { code: 'XOF', label: 'XOF — Franc CFA (BCEAO)' },
  { code: 'XAF', label: 'XAF — Franc CFA (BEAC)' },
  { code: 'EUR', label: 'EUR — Euro' },
  { code: 'USD', label: 'USD — Dollar US' },
];

export const ParametresSuperAdmin: React.FC = () => {
  const { t } = useTranslation('superAdmin');
  const [form, setForm] = useState<PlatformSettings>(DEFAULTS);
  const [initial, setInitial] = useState<PlatformSettings>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('platform_settings')
        .select('*')
        .limit(1)
        .single();
      if (data) {
        const loaded: PlatformSettings = {
          nom_plateforme: data.nom_plateforme || DEFAULTS.nom_plateforme,
          email_support: data.email_support || '',
          whatsapp_support: data.whatsapp_support || '',
          devise_defaut: data.devise_defaut || 'XOF',
          message_maintenance: data.message_maintenance || '',
        };
        setForm(loaded);
        setInitial(loaded);
      }
    };
    load();
  }, []);

  const isDirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initial), [form, initial]);

  const update = (key: keyof PlatformSettings, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);

    const { error } = await supabase
      .from('platform_settings')
      .upsert({ id: 1, ...form }, { onConflict: 'id' });

    await refreshPlatformSettings();
    setInitial({ ...form });
    setSaving(false);
    if (!error) {
      setSaveSuccess(true);
      toast.success('Paramètres de la plateforme sauvegardés !');
    } else {
      toast.error(`Erreur lors de la sauvegarde : ${error.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-32">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t('parametres.title')}</h1>
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
            {t('badge')}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          {t('parametres.subtitle')}
        </p>
      </div>

      {/* Platform information */}
      <div className="rounded-xl border border-border bg-card">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">{t('parametres.platformSection')}</h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t('parametres.labelPlatformName')}</label>
            <input
              value={form.nom_plateforme}
              onChange={(e) => update('nom_plateforme', e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
            />
            <p className="text-[10px] text-muted-foreground">{t('parametres.platformNameHint')}</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t('parametres.labelDevise')}</label>
            <select
              value={form.devise_defaut}
              onChange={(e) => update('devise_defaut', e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
            >
              {DEVISES.map(d => <option key={d.code} value={d.code}>{d.label}</option>)}
            </select>
            <p className="text-[10px] text-muted-foreground">{t('parametres.deviseHint')}</p>
          </div>
        </div>
      </div>

      {/* Support contact */}
      <div className="rounded-xl border border-border bg-card">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">{t('parametres.supportSection')}</h2>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" /> {t('parametres.labelEmail')}
            </label>
            <input
              type="email"
              value={form.email_support}
              onChange={(e) => update('email_support', e.target.value)}
              placeholder="support@faciloop.app"
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Phone className="h-3 w-3" /> {t('parametres.labelWhatsapp')}
            </label>
            <input
              type="tel"
              value={form.whatsapp_support}
              onChange={(e) => update('whatsapp_support', e.target.value)}
              placeholder="+221 77 000 00 00"
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
            />
          </div>
        </div>
        <div className="px-4 pb-4">
          <p className="text-[10px] text-muted-foreground">
            {t('parametres.supportHint')}
          </p>
        </div>
      </div>

      {/* Sticky Save */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border p-4">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className={`w-full h-11 rounded-xl text-sm font-semibold shadow-sm flex items-center justify-center gap-2 transition-all ${
              isDirty
                ? 'bg-gradient-faciloop text-white hover:opacity-90'
                : saveSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saveSuccess && !isDirty ? (
              <>
                <Check className="h-4 w-4" />
                {t('parametres.savedBtn')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {t('parametres.saveBtn')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
