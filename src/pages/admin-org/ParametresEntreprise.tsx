import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Building2, Save, Upload, Check, Globe, Phone, Mail, MapPin, Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const ParametresEntreprise: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { currentOrg, currency, setCurrency, updateOrganization } = useAuth();
  const [nom, setNom] = useState(currentOrg?.nom || "Teranga Logistique SA");
  const [pays, setPays] = useState('Sénégal');
  const [ville, setVille] = useState('Dakar');
  const [adresse, setAdresse] = useState('Km 4.5, Route de Rufisque');
  const [telephone, setTelephone] = useState('+221 33 800 00 00');
  const [email, setEmail] = useState('contact@teranga-logistique.sn');
  const [siteWeb, setSiteWeb] = useState('https://teranga-logistique.sn');
  const [secteur, setSecteur] = useState('Logistique / Transport');
  const [logoPreview, setLogoPreview] = useState<string | null>(currentOrg?.logo_url || null);
  const [saved, setSaved] = useState(false);

  const isEn = i18n.language?.startsWith('en');

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
    updateOrganization({ nom, pays, ville, adresse, telephone, email, site_web: siteWeb, secteur, logo_url: logoPreview || undefined, devise: currency });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto font-sans">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          {isEn ? 'Company Settings' : "Paramètres de l'Entreprise"}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {isEn ? 'General information, contact details, and organization preferences' : 'Informations générales, coordonnées et préférences de votre organisation'}
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{isEn ? 'Settings saved successfully!' : 'Paramètres sauvegardés avec succès !'}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Logo Section */}
        <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" /> {isEn ? 'Visual Identity' : 'Identité visuelle'}
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
                <span>Changer le logo</span>
                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              </label>
              <p className="text-[10px] text-muted-foreground">PNG, JPG — max 2 Mo</p>
            </div>
          </div>
        </div>

        {/* General Info */}
        <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" /> Informations générales
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1">Nom de l'entreprise *</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full p-3 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Secteur d'activité</label>
              <select
                value={secteur}
                onChange={(e) => setSecteur(e.target.value)}
                className="w-full p-3 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
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
              <label className="block font-semibold mb-1">Devise par défaut</label>
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
            <MapPin className="w-4 h-4 text-primary" /> Coordonnées
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold mb-1">Pays</label>
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
              <label className="block font-semibold mb-1">Ville</label>
              <input
                type="text"
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                className="w-full p-3 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1">Adresse complète</label>
              <input
                type="text"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                placeholder="Numéro, rue, quartier..."
                className="w-full p-3 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Téléphone</label>
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
              <label className="block font-semibold mb-1">Email professionnel</label>
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
              <label className="block font-semibold mb-1">Site web</label>
              <div className="relative">
                <Globe className="w-3.5 h-3.5 absolute left-3 top-3.5 text-muted-foreground" />
                <input
                  type="url"
                  value={siteWeb}
                  onChange={(e) => setSiteWeb(e.target.value)}
                  placeholder="https://..."
                  className="w-full pl-9 pr-3 p-3 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-gradient-faciloop text-white font-bold shadow-md hover:opacity-95 flex items-center justify-center gap-2 text-sm"
        >
          <Save className="w-4 h-4" />
          <span>Enregistrer les modifications</span>
        </button>
      </form>
    </div>
  );
};
