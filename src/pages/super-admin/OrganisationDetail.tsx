import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Building2, Save, Loader2, Crown, User, Phone, MapPin, Mail, Globe, Briefcase, Clock, Shield, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatAmount } from '../../lib/currency';
import { FormuleConfig, getFormules, getOfferPrice } from '../../services/formulesSaas';

const PERIODICITE_CODES = ['mensuel', 'trimestriel', 'annuel'] as const;

const PAYS = [
  'Sénégal', "Côte d'Ivoire", 'Mali', 'Burkina Faso', 'Guinée',
  'Bénin', 'Togo', 'Niger', 'Cameroun', 'Congo', 'Gabon',
  'Mauritanie', 'France', 'Autre',
];

interface OrgData {
  id: string;
  nom: string;
  statut: string;
  devise_defaut: string;
  pays?: string;
  ville?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  site_web?: string;
  secteur?: string;
  formule_code?: string;
  periodicite?: string;
  prix_abonnement?: number;
  date_debut_abonnement?: string;
  date_fin_abonnement?: string;
  statut_abonnement?: string;
  responsable_nom?: string;
  responsable_prenom?: string;
  created_at: string;
}

interface FormState {
  nom: string;
  pays: string;
  ville: string;
  adresse: string;
  telephone: string;
  email: string;
  site_web: string;
  secteur: string;
  responsable_prenom: string;
  responsable_nom: string;
  statut: string;
  formule_code: string;
  periodicite: string;
  date_debut_abonnement: string;
  date_fin_abonnement: string;
  statut_abonnement: string;
}

function orgToForm(org: OrgData): FormState {
  return {
    nom: org.nom || '',
    pays: org.pays || '',
    ville: org.ville || '',
    adresse: org.adresse || '',
    telephone: org.telephone || '',
    email: org.email || '',
    site_web: org.site_web || '',
    secteur: org.secteur || '',
    responsable_prenom: org.responsable_prenom || '',
    responsable_nom: org.responsable_nom || '',
    statut: org.statut || 'actif',
    formule_code: org.formule_code || '',
    periodicite: org.periodicite || 'mensuel',
    date_debut_abonnement: org.date_debut_abonnement?.split('T')[0] || '',
    date_fin_abonnement: org.date_fin_abonnement?.split('T')[0] || '',
    statut_abonnement: org.statut_abonnement || 'inactif',
  };
}

export const OrganisationDetail: React.FC = () => {
  const { t } = useTranslation('superAdmin');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [org, setOrg] = useState<OrgData | null>(null);
  const [formules, setFormules] = useState<FormuleConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [form, setForm] = useState<FormState>({
    nom: '', pays: '', ville: '', adresse: '', telephone: '', email: '',
    site_web: '', secteur: '', responsable_prenom: '', responsable_nom: '',
    statut: 'actif', formule_code: '', periodicite: 'mensuel',
    date_debut_abonnement: '', date_fin_abonnement: '', statut_abonnement: 'inactif',
  });

  useEffect(() => {
    const fetchData = async () => {
      const [orgRes, formulesData] = await Promise.all([
        supabase.from('organizations').select('*').eq('id', id!).single(),
        getFormules(),
      ]);
      if (!orgRes.error && orgRes.data) {
        const orgData = orgRes.data as OrgData;

        if (!orgData.responsable_prenom && !orgData.responsable_nom) {
          const { data: adminName } = await supabase.rpc('get_org_admin_name', { _org_id: id! });
          if (adminName && adminName.length > 0) {
            orgData.responsable_prenom = adminName[0].first_name || '';
            orgData.responsable_nom = adminName[0].last_name || '';
          }
        }

        if (
          orgData.statut_abonnement === 'actif' &&
          orgData.date_fin_abonnement &&
          new Date(orgData.date_fin_abonnement) < new Date()
        ) {
          orgData.statut_abonnement = 'expire';
          await supabase
            .from('organizations')
            .update({ statut_abonnement: 'expire' })
            .eq('id', id!);
        }

        setOrg(orgData);
        setForm(orgToForm(orgData));
      }
      setFormules(formulesData);
      setLoading(false);
    };
    if (id) fetchData();
  }, [id]);

  const initialForm = useMemo(() => org ? orgToForm(org) : null, [org]);
  const isDirty = useMemo(() => {
    if (!initialForm) return false;
    return JSON.stringify(form) !== JSON.stringify(initialForm);
  }, [form, initialForm]);

  const update = (key: keyof FormState, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
    setSaveSuccess(false);
  };

  const prixAuto = getOfferPrice(formules, form.formule_code, form.periodicite, false);
  const fmtPrice = (amount: number) => formatAmount(amount, 'XOF');
  const activeFormules = formules.filter(f => f.isActive);

  const handleOfferSelect = (code: string) => {
    update('formule_code', code);
    if (!form.date_debut_abonnement) {
      update('date_debut_abonnement', new Date().toISOString().split('T')[0]);
    }
    const durationDays = form.periodicite === 'annuel' ? 365 : form.periodicite === 'trimestriel' ? 90 : 30;
    const startDate = form.date_debut_abonnement || new Date().toISOString().split('T')[0];
    const endDate = new Date(new Date(startDate).getTime() + durationDays * 86400000).toISOString().split('T')[0];
    setForm(f => ({
      ...f,
      formule_code: code,
      date_fin_abonnement: endDate,
      statut_abonnement: f.statut_abonnement === 'inactif' ? 'actif' : f.statut_abonnement,
    }));
  };

  const handlePeriodiciteChange = (newPeriodicite: string) => {
    const durationDays = newPeriodicite === 'annuel' ? 365 : newPeriodicite === 'trimestriel' ? 90 : 30;
    const startDate = form.date_debut_abonnement || new Date().toISOString().split('T')[0];
    const endDate = new Date(new Date(startDate).getTime() + durationDays * 86400000).toISOString().split('T')[0];
    setForm(f => ({
      ...f,
      periodicite: newPeriodicite,
      date_fin_abonnement: endDate,
    }));
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    const prix = getOfferPrice(formules, form.formule_code, form.periodicite, false);

    const { error } = await supabase
      .from('organizations')
      .update({
        nom: form.nom,
        pays: form.pays || null,
        ville: form.ville || null,
        adresse: form.adresse || null,
        telephone: form.telephone || null,
        email: form.email || null,
        site_web: form.site_web || null,
        secteur: form.secteur || null,
        responsable_prenom: form.responsable_prenom || null,
        responsable_nom: form.responsable_nom || null,
        statut: form.statut,
        formule_code: form.formule_code || null,
        periodicite: form.periodicite || null,
        prix_abonnement: prix,
        date_debut_abonnement: form.date_debut_abonnement || null,
        date_fin_abonnement: form.date_fin_abonnement || null,
        statut_abonnement: form.statut_abonnement,
      })
      .eq('id', id);

    setSaving(false);
    if (!error) {
      setSaveSuccess(true);
      setOrg(prev => prev ? {
        ...prev,
        ...form,
        prix_abonnement: prix,
      } : prev);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-sm text-muted-foreground">{t('detail.notFound')}</p>
        <button onClick={() => navigate(-1)} className="text-primary text-sm hover:underline">
          {t('detail.back')}
        </button>
      </div>
    );
  }

  const statutBadgeClass = (s: string) =>
    s === 'actif'
      ? 'bg-emerald-500/10 text-emerald-600'
      : s === 'en_attente'
        ? 'bg-amber-500/10 text-amber-600'
        : 'bg-destructive/10 text-destructive';

  const statutDisplayLabel = (s: string) => {
    if (s === 'actif') return t('status.actif');
    if (s === 'en_attente') return t('status.en_attente');
    return t('status.suspendu');
  };

  return (
    <div className="space-y-6 pb-32">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/super-admin/organisations')}
          className="p-2 rounded-xl hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-faciloop text-white flex items-center justify-center font-bold shrink-0">
              {form.nom[0] || 'O'}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-foreground truncate">{form.nom || org.nom}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statutBadgeClass(form.statut)}`}>
                  {statutDisplayLabel(form.statut)}
                </span>
                {form.formule_code && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    {form.formule_code} / {form.periodicite}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {t('detail.registeredOn', { date: new Date(org.created_at).toLocaleDateString('fr-FR') })}
                </span>
                {form.date_fin_abonnement && (
                  <span className={`text-xs flex items-center gap-1 ${
                    new Date(form.date_fin_abonnement) < new Date()
                      ? 'text-destructive font-medium'
                      : 'text-muted-foreground'
                  }`}>
                    {new Date(form.date_fin_abonnement) < new Date() ? (
                      <AlertTriangle className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    {t('detail.endAbo', { date: new Date(form.date_fin_abonnement).toLocaleDateString('fr-FR') })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informations entreprise */}
      <div className="rounded-xl border border-border bg-card">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">{t('detail.sectionInfo')}</h2>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3 w-3" /> {t('detail.labelCompanyName')}
            </label>
            <input
              value={form.nom}
              onChange={(e) => update('nom', e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" /> {t('detail.labelFirstName')}
            </label>
            <input
              value={form.responsable_prenom}
              onChange={(e) => update('responsable_prenom', e.target.value)}
              placeholder={t('common.notProvided')}
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" /> {t('detail.labelLastName')}
            </label>
            <input
              value={form.responsable_nom}
              onChange={(e) => update('responsable_nom', e.target.value)}
              placeholder={t('common.notProvided')}
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Phone className="h-3 w-3" /> {t('detail.labelPhone')}
            </label>
            <input
              value={form.telephone}
              onChange={(e) => update('telephone', e.target.value)}
              placeholder={t('common.notProvided')}
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" /> {t('detail.labelEmail')}
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder={t('common.notProvided')}
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {t('detail.labelCountry')}
            </label>
            <select
              value={form.pays}
              onChange={(e) => update('pays', e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
            >
              <option value="">{t('common.select')}</option>
              {PAYS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {t('detail.labelCity')}
            </label>
            <input
              value={form.ville}
              onChange={(e) => update('ville', e.target.value)}
              placeholder={t('common.notProvided')}
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {t('detail.labelAddress')}
            </label>
            <input
              value={form.adresse}
              onChange={(e) => update('adresse', e.target.value)}
              placeholder={t('common.notProvided')}
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Briefcase className="h-3 w-3" /> {t('detail.labelSector')}
            </label>
            <input
              value={form.secteur}
              onChange={(e) => update('secteur', e.target.value)}
              placeholder={t('common.notProvided')}
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Globe className="h-3 w-3" /> {t('detail.labelWebsite')}
            </label>
            <input
              value={form.site_web}
              onChange={(e) => update('site_web', e.target.value)}
              placeholder={t('common.notProvided')}
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Statut du compte */}
      <div className="rounded-xl border border-border bg-card">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">{t('detail.sectionAccount')}</h2>
        </div>
        <div className="p-4">
          <select
            value={form.statut}
            onChange={(e) => update('statut', e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
          >
            <option value="en_attente">{t('detail.statusPending')}</option>
            <option value="actif">{t('detail.statusActive')}</option>
            <option value="suspendu">{t('detail.statusSuspended')}</option>
            <option value="inactif">{t('detail.statusInactive')}</option>
          </select>
          <p className="text-[10px] text-muted-foreground mt-1.5">
            {t('detail.accountNote')}
          </p>
        </div>
      </div>

      {/* Abonnement */}
      <div className="rounded-xl border border-border bg-card">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Crown className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-semibold text-foreground">{t('detail.sectionSub')}</h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t('detail.labelSubStatus')}</label>
            <select
              value={form.statut_abonnement}
              onChange={(e) => update('statut_abonnement', e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
            >
              <option value="inactif">{t('detail.subStatusInactive')}</option>
              <option value="actif">{t('detail.subStatusActive')}</option>
              <option value="suspendu">{t('detail.subStatusSuspended')}</option>
              <option value="expire">{t('detail.subStatusExpired')}</option>
            </select>
          </div>

          {activeFormules.length > 0 && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t('detail.labelFormula')}</label>
                <select
                  value={form.formule_code}
                  onChange={(e) => handleOfferSelect(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                >
                  <option value="">{t('detail.noFormula')}</option>
                  {activeFormules.map(f => (
                    <option key={f.code} value={f.code}>{f.label} — {f.description}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t('detail.labelPeriod')}</label>
                <select
                  value={form.periodicite}
                  onChange={(e) => handlePeriodiciteChange(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                >
                  {PERIODICITE_CODES.map(code => (
                    <option key={code} value={code}>{t(`period.${code}`)}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> {t('detail.labelStartDate')}
              </label>
              <input
                type="date"
                value={form.date_debut_abonnement}
                onChange={(e) => update('date_debut_abonnement', e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> {t('detail.labelEndDate')}
              </label>
              <input
                type="date"
                value={form.date_fin_abonnement}
                onChange={(e) => update('date_fin_abonnement', e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
              />
            </div>
          </div>

          {form.formule_code && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{t('common.autoCalculated')}</span>
                <span className="text-sm font-bold text-primary">{fmtPrice(prixAuto)}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {t('common.pricingFrom', { formula: form.formule_code, period: t(`period.${form.periodicite}`) })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Save Button */}
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
              t('detail.savedBtn')
            ) : (
              <>
                <Save className="h-4 w-4" />
                {t('detail.saveBtn')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
