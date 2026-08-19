import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FileSpreadsheet, Download, Upload, CheckCircle2, AlertTriangle } from 'lucide-react';

export const ImportExportPage: React.FC = () => {
  const { prospects, clients } = useAuth();
  const [fileUploaded, setFileUploaded] = useState<boolean>(false);
  const [importDone, setImportDone] = useState<boolean>(false);

  const handleSimulateImport = () => {
    setImportDone(true);
    setTimeout(() => setImportDone(false), 4000);
    setFileUploaded(false);
  };

  const handleExportCSV = (type: string) => {
    const data = type === 'prospects' ? prospects : clients;
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'text/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `faciloop_${type}_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Import / Export de Données (CSV & Excel)
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Importez vos fichiers prospects avec détection automatique des doublons ou exportez vos données en 1 clic
        </p>
      </div>

      {/* Export Section */}
      <div className="p-6 rounded-3xl border border-border bg-card space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Download className="w-5 h-5 text-primary" />
          <span>Exporter mes données</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => handleExportCSV('prospects')}
            className="p-4 rounded-2xl border border-border bg-muted/30 hover:bg-muted text-left transition-all space-y-1"
          >
            <div className="font-bold text-xs text-foreground">Exporter la liste des Prospects</div>
            <div className="text-[11px] text-muted-foreground">{prospects.length} prospects prêts à l'export</div>
          </button>

          <button
            onClick={() => handleExportCSV('clients')}
            className="p-4 rounded-2xl border border-border bg-muted/30 hover:bg-muted text-left transition-all space-y-1"
          >
            <div className="font-bold text-xs text-foreground">Exporter la liste des Clients Faciloop</div>
            <div className="text-[11px] text-muted-foreground">{clients.length} clients enregistrés</div>
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div className="p-6 rounded-3xl border border-border bg-card space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Upload className="w-5 h-5 text-emerald-500" />
          <span>Importer des prospects (CSV / Excel)</span>
        </h2>

        {importDone && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>Importation réussie ! 25 prospects ont été ajoutés et distribués aux commerciaux.</span>
          </div>
        )}

        <div className="p-8 rounded-2xl border-2 border-dashed border-border/80 text-center space-y-3">
          <FileSpreadsheet className="w-10 h-10 text-muted-foreground mx-auto" />
          <div className="text-xs font-bold text-foreground">
            {fileUploaded ? 'fichier_prospects_dakar.csv chargé' : 'Glissez votre fichier CSV ici ou cliquez pour choisir'}
          </div>
          <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
            Vérification automatique du numéro de téléphone principal pour éviter les doublons lors de l'importation.
          </p>
          <button
            onClick={() => setFileUploaded(true)}
            className="px-4 py-2 rounded-xl bg-muted text-xs font-bold hover:bg-muted/80 text-foreground"
          >
            {fileUploaded ? 'Changer de fichier' : 'Sélectionner un fichier CSV'}
          </button>
        </div>

        {fileUploaded && (
          <div className="pt-2">
            <button
              onClick={handleSimulateImport}
              className="w-full py-3 rounded-xl bg-gradient-faciloop text-white text-xs font-bold shadow-md hover:opacity-95"
            >
              Lancer l'importation et l'attribution
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
