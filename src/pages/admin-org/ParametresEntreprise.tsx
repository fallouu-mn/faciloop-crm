import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Building2, Save, Upload, Check } from 'lucide-react';

export const ParametresEntreprise: React.FC = () => {
  const { currentOrg, currency, setCurrency } = useAuth();
  const [nom, setNom] = useState<string>(currentOrg?.nom || "Teranga Logistique SA");
  const [saved, setSaved] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Paramètres de l'Entreprise
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Modifiez le nom, le logo et les devises par défaut de votre organisation
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Paramètres sauvegardés avec succès !</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-6 rounded-3xl border border-border bg-card space-y-4 text-xs">
        <div>
          <label className="block font-semibold mb-1">Nom de l'Entreprise</label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full p-3 rounded-xl border border-input bg-background font-bold text-sm"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Devise par défaut</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full p-3 rounded-xl border border-input bg-background font-bold"
          >
            <option value="XOF">FCFA (XOF)</option>
            <option value="EUR">Euro (€)</option>
            <option value="USD">Dollar ($)</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-gradient-faciloop text-white font-bold shadow-md hover:opacity-95 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Enregistrer les modifications</span>
        </button>
      </form>
    </div>
  );
};
