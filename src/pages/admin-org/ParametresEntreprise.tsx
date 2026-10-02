import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Building2, Save, Upload, Globe, Phone, Mail, MapPin, Briefcase, Plus, Trash2, Tag, Pencil, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { PinChangeSection } from '../../components/common/PinChangeSection';
import { useSourcesConfig } from '@/hooks/useSourcesConfig';
import { DEFAULT_SOURCES } from '@/services/sourcesConfig';

const SourcesSection: React.FC = () => {
  const { t, i18n } = useTranslation('admin');
  const isEn = i18n.language?.startsWith('en');
  const { sources, customRows, addSource, editSource, removeSource } = useSourcesConfig();

  const [newValue, setNewValue] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');

  const toSlug = (str: string) =>
    str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

  const handleAdd = async () => {
    const label = newLabel.trim();
    if (!label) return;
    const value = toSlug(label);
    if (sources.some(s => s.value === value)) {
      toast.error(isEn ? 'This source already exists.' : 'Cette source existe déjà.');
      return;
    }
    try {
      await addSource.mutateAsync({ value, label, ordre: sources.length });
      setNewLabel('');
      setNewValue('');
      toast.success(isEn ? 'Source added!' : 'Source ajoutée !');
    } catch {
      toast.error(isEn ? 'Error adding source.' : "Erreur lors de l'ajout.");
    }
  };

  const handleSaveEdit = async (id: string) => {
    if (!editLabel.trim()) return;
    try {
      await editSource.mutateAsync({ id, label: editLabel.trim() });
      setEditingId(null);
    } catch {
      toast.error(isEn ? 'Error updating source.' : 'Erreur lors de la modification.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeSource.mutateAsync(id);
      toast.success(isEn ? 'Source deleted.' : 'Source supprimée.');
    } catch {
      toast.error(isEn ? 'Error deleting source.' : 'Erreur lors de la suppression.');
    }
  };

  return (
    <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
      <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
        <Tag className="w-4 h-4 text-primary" />
        {isEn ? 'Prospect Sources' : 'Sources de prospects'}
      </h2>
      <p className="text-xs text-muted-foreground">
        {isEn
          ? 'Manage the acquisition sources available in prospect forms. Default sources are always present.'
          : "Gérez les sources d'acquisition disponibles dans les formulaires prospect. Les sources par défaut sont toujours présentes."}
      </p>

      {/* Default sources (read-only) */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {isEn ? 'Default sources' : 'Sources par défaut'}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {DEFAULT_SOURCES.map(s => (
            <span key={s.value} className="px-2.5 py-1 rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Custom sources (editable) */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {isEn ? 'Custom sources' : 'Sources personnalisées'}
        </p>
        {customRows.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            {isEn ? 'No custom source yet.' : 'Aucune source personnalisée pour le moment.'}
          </p>
        ) : (
          <div className="space-y-1.5">
            {customRows.map(row => (
              <div key={row.id} className="flex items-center gap-2 p-2 rounded-xl border border-border bg-background">
                {editingId === row.id ? (
                  <>
                    <input
                      value={editLabel}
                      onChange={e => setEditLabel(e.target.value)}
                      className="flex-1 p-1.5 rounded-lg border border-input bg-card text-xs font-medium focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      autoFocus
                    />
                    <button onClick={() => handleSaveEdit(row.id)} className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-xs font-semibold text-foreground">{row.label}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{row.value}</span>
                    <button onClick={() => { setEditingId(row.id); setEditLabel(row.label); }} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(row.id)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add new source */}
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-semibold text-foreground">
            {isEn ? 'New source' : 'Nouvelle source'}
          </label>
          <input
            type="text"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            placeholder={isEn ? 'e.g. LinkedIn, Salon Dakar...' : 'ex. LinkedIn, Salon Dakar...'}
            className="w-full p-2.5 rounded-xl border border-input bg-background text-xs font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={!newLabel.trim() || addSource.isPending}
          className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          {isEn ? 'Add' : 'Ajouter'}
        </button>
      </div>
    </div>
  );
};

export const ParametresEntreprise: React.FC = () => {
  const { t } = useTranslation('admin');
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

        {/* Sources de prospects */}
        <SourcesSection />

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
    </div>
  );
};
