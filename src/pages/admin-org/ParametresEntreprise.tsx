import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Building2, Save, Upload, Globe, Phone, Mail, MapPin, Briefcase, ListChecks, Tags } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { PinChangeSection } from '../../components/common/PinChangeSection';
import {
  CustomFieldsSchemaEditor,
  CustomSourcesEditor,
} from '../../components/common/CustomFieldsForm';
import { useOrganizationSettings } from '../../hooks/useOrganizationSettings';
import type { CustomFieldDef } from '../../types/crm';

export const ParametresEntreprise: React.FC = () => {
  const { t, i18n } = useTranslation('admin');
  const isEn = i18n.language?.startsWith('en');
  const { user, currentOrg, currency, setCurrency, updateOrganization } = useAuth();
  const [nom, setNom] = useState(currentOrg?.nom || '');
  const [pays, setPays] = useState(currentOrg?.pays || '');
  const [ville, setVille] = useState(currentOrg?.ville || '');
  const [adresse, setAdresse] = useState(currentOrg?.adresse || '');
  const [telephone, setTelephone] = useState(currentOrg?.telephone || user?.telephone || '');
  const [email, setEmail] = useState(currentOrg?.email || '');
  const [siteWeb, setSiteWeb] = useState(currentOrg?.site_web || '');
  const [secteur, setSecteur] = useState(currentOrg?.secteur || '');
  const [logoPreview, setLogoPreview] = useState<string | null>(currentOrg?.logo_url || null);

  // ── Retours client n°4 & n°6 : champs dynamiques + sources custom ──
  const {
    settings,
    prospectFields,
    saveProspectFields,
    saveCustomSources,
  } = useOrganizationSettings();
  const [schemaDraft, setSchemaDraft] = useState<CustomFieldDef[]>(prospectFields);
  const [sourcesDraft, setSourcesDraft] = useState<string[]>(settings?.custom_sources ?? []);
  const [fieldsSaving, setFieldsSaving] = useState(false);
  const [sourcesSaving, setSourcesSaving] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setSchemaDraft(settings.prospect_custom_fields_schema ?? []);
    setSourcesDraft(settings.custom_sources ?? []);
  }, [settings]);

  const saveFields = async () => {
    setFieldsSaving(true);
    try {
      await saveProspectFields(schemaDraft);
    } catch {
      /* toast géré par le hook */
    } finally {
      setFieldsSaving(false);
    }
  };

  const saveSources = async () => {
    setSourcesSaving(true);
    try {
      await saveCustomSources(sourcesDraft);
    } catch {
      /* toast géré par le hook */
    } finally {
      setSourcesSaving(false);
    }
  };

  useEffect(() => {
    if (!currentOrg) return;
    setNom(currentOrg.nom || '');
    setPays(currentOrg.pays || '');
    setVille(currentOrg.ville || '');
    setAdresse(currentOrg.adresse || '');
    setTelephone(currentOrg.telephone || user?.telephone || '');
    setEmail(currentOrg.email || '');
    setSiteWeb(currentOrg.site_web || '');
    setSecteur(currentOrg.secteur || '');
    setLogoPreview(currentOrg.logo_url || null);
  }, [currentOrg]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrganization({ nom, pays, ville, adresse, telephone, email, site_web: siteWeb, secteur, logo_url: logoPreview || undefined, devise_defaut: currency });
    toast.success(t('adminOrg.parametres.saved'));
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto font-sans">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          {t('adminOrg.parametres.title')}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {t('adminOrg.parametres.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Logo Section */}
        <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" /> {t('adminOrg.parametres.sections.visual')}
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-border bg-muted/40 flex items-center justify-center overflow-hidden">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <Upload className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-2">
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-input bg-card hover:bg-muted cursor-pointer text-xs font-bold text-foreground transition-all">
                <Upload className="w-3.5 h-3.5" />
                <span>{t('adminOrg.parametres.changeLogo')}</span>
                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              </label>
              <p className="text-[10px] text-muted-foreground">PNG, JPG — max 2 Mo</p>
            </div>
          </div>
        </div>

        {/* General Info */}
        <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" /> {t('adminOrg.parametres.sections.general')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1">{t('adminOrg.parametres.companyName')}</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full p-3 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">{t('adminOrg.parametres.sector')}</label>
              <select
                value={secteur}
                onChange={(e) => setSecteur(e.target.value)}
                className="w-full p-3 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="">{t('adminOrg.parametres.select')}</option>
                <option value="Commerce / Distribution">Commerce / Distribution</option>
                <option value="Télécommunications">Télécommunications</option>
                <option value="Services">Services</option>
                <option value="Industrie">Industrie</option>
                <option value="Immobilier">Immobilier</option>
                <option value="Logistique / Transport">Logistique / Transport</option>
                <option value="Agroalimentaire">Agroalimentaire</option>
                <option value="BTP / Construction">BTP / Construction</option>
                <option value="Technologie / IT">Technologie / IT</option>
                <option value="Éducation / Formation">Éducation / Formation</option>
                <option value="Santé">Santé</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">{t('adminOrg.parametres.currency')}</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-3 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="XOF">FCFA (XOF)</option>
                <option value="EUR">Euro (€)</option>
                <option value="USD">Dollar ($)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Coordonnées */}
        <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" /> {t('adminOrg.parametres.sections.contact')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold mb-1">{t('adminOrg.parametres.country')}</label>
              <select
                value={pays}
                onChange={(e) => setPays(e.target.value)}
                className="w-full p-3 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="Sénégal">Sénégal</option>
                <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                <option value="Mali">Mali</option>
                <option value="Burkina Faso">Burkina Faso</option>
                <option value="Guinée">Guinée</option>
                <option value="Cameroun">Cameroun</option>
                <option value="Bénin">Bénin</option>
                <option value="Togo">Togo</option>
                <option value="Niger">Niger</option>
                <option value="France">France</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">{t('adminOrg.parametres.city')}</label>
              <input
                type="text"
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                className="w-full p-3 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1">{t('adminOrg.parametres.address')}</label>
              <input
                type="text"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                placeholder={t('adminOrg.parametres.addressPlaceholder')}
                className="w-full p-3 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">{t('adminOrg.parametres.phone')}</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-3.5 text-muted-foreground" />
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="w-full pl-9 pr-3 p-3 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-1">{t('adminOrg.parametres.email')}</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-3.5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 p-3 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1">{t('adminOrg.parametres.website')}</label>
              <div className="relative">
                <Globe className="w-3.5 h-3.5 absolute left-3 top-3.5 text-muted-foreground" />
                <input
                  type="url"
                  value={siteWeb}
                  onChange={(e) => setSiteWeb(e.target.value)}
                  placeholder={t('adminOrg.parametres.websitePlaceholder')}
                  className="w-full pl-9 pr-3 p-3 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security — PIN change */}
        <PinChangeSection />

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-gradient-faciloop text-white font-bold shadow-md hover:opacity-95 flex items-center justify-center gap-2 text-sm"
        >
          <Save className="w-4 h-4" />
          <span>{t('adminOrg.parametres.saveBtn')}</span>
        </button>
      </form>

      {/* ── Retour client n°4 — Champs prospects dynamiques ── */}
      <section className="p-5 rounded-2xl border border-border bg-card space-y-4">
        <div>
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-primary" />
            {isEn ? 'Custom prospect fields' : 'Champs prospects personnalisés'}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {isEn
              ? 'Define the extra fields your team fills in for every prospect. They appear on prospect forms and files.'
              : 'Définissez les champs complémentaires à renseigner pour chaque prospect. Ils apparaissent sur les formulaires et les fiches prospects.'}
          </p>
        </div>

        <CustomFieldsSchemaEditor schema={schemaDraft} onChange={setSchemaDraft} isEn={isEn} />

        <button
          type="button"
          onClick={saveFields}
          disabled={fieldsSaving}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 transition-all disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          {fieldsSaving ? (isEn ? 'Saving…' : 'Enregistrement…') : (isEn ? 'Save fields' : 'Enregistrer les champs')}
        </button>
      </section>

      {/* ── Retour client n°6 — Sources de prospect personnalisées ── */}
      <section className="p-5 rounded-2xl border border-border bg-card space-y-4">
        <div>
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Tags className="w-4 h-4 text-primary" />
            {isEn ? 'Custom acquisition sources' : "Sources d'acquisition personnalisées"}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {isEn
              ? 'These sources are added to the default list and offered everywhere a source is chosen.'
              : 'Ces sources s’ajoutent à la liste par défaut et sont proposées partout où l’on choisit une source.'}
          </p>
        </div>

        <CustomSourcesEditor sources={sourcesDraft} onChange={setSourcesDraft} isEn={isEn} />

        <button
          type="button"
          onClick={saveSources}
          disabled={sourcesSaving}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 transition-all disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          {sourcesSaving ? (isEn ? 'Saving…' : 'Enregistrement…') : (isEn ? 'Save sources' : 'Enregistrer les sources')}
        </button>
      </section>
    </div>
  );
};
