import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { mockCommerciaux } from '../../lib/mockData';
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  UserPlus, 
  FileText, 
  Check, 
  X,
  Users
} from 'lucide-react';

interface ParsedProspectRow {
  nom: string;
  prenom: string;
  entreprise: string;
  telephone: string;
  source: string;
  commentaire: string;
  isDuplicate: boolean;
}

export const ImportExportPage: React.FC = () => {
  const { prospects, clients, addProspect } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Import State
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedProspectRow[]>([]);
  const [selectedCommercialId, setSelectedCommercialId] = useState<string>(mockCommerciaux[0].id);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; commercialNom: string } | null>(null);

  // Helper: Detect delimiter (, or ;) and parse CSV text
  const parseCSVText = (text: string): ParsedProspectRow[] => {
    const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return [];

    // Determine delimiter
    const headerLine = lines[0];
    const delimiter = headerLine.includes(';') ? ';' : ',';

    const rawHeaders = headerLine.split(delimiter).map(h => h.trim().toLowerCase().replace(/"/g, ''));

    // Map column indexes
    const nomIdx = rawHeaders.findIndex(h => h.includes('nom') || h.includes('contact') || h.includes('prospect'));
    const prenomIdx = rawHeaders.findIndex(h => h.includes('prenom') || h.includes('first'));
    const entrepriseIdx = rawHeaders.findIndex(h => h.includes('entreprise') || h.includes('societe') || h.includes('company'));
    const phoneIdx = rawHeaders.findIndex(h => h.includes('tel') || h.includes('phone') || h.includes('mobile') || h.includes('whatsapp'));
    const sourceIdx = rawHeaders.findIndex(h => h.includes('source') || h.includes('canal') || h.includes('origine'));
    const commentIdx = rawHeaders.findIndex(h => h.includes('comment') || h.includes('note') || h.includes('desc'));

    const existingPhones = new Set(prospects.map(p => p.telephone.replace(/\s+/g, '')));

    const rows: ParsedProspectRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(delimiter).map(p => p.trim().replace(/"/g, ''));
      if (parts.length === 0 || !parts.some(p => p.length > 0)) continue;

      const nomVal = nomIdx !== -1 ? parts[nomIdx] : parts[0] || 'Inconnu';
      const prenomVal = prenomIdx !== -1 ? parts[prenomIdx] : '';
      const entrepriseVal = entrepriseIdx !== -1 ? parts[entrepriseIdx] : parts[1] || 'Entreprise';
      const phoneVal = phoneIdx !== -1 ? parts[phoneIdx] : parts[2] || '+221 77 000 00 00';
      const sourceVal = sourceIdx !== -1 ? parts[sourceIdx] : 'prospection_directe';
      const commentVal = commentIdx !== -1 ? parts[commentIdx] : 'Importé via fichier CSV';

      const cleanPhone = phoneVal.replace(/\s+/g, '');
      const isDuplicate = existingPhones.has(cleanPhone);

      rows.push({
        nom: nomVal,
        prenom: prenomVal,
        entreprise: entrepriseVal,
        telephone: phoneVal,
        source: sourceVal,
        commentaire: commentVal,
        isDuplicate
      });
    }

    return rows;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const rows = parseCSVText(content);
        setParsedRows(rows);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;

    const comm = mockCommerciaux.find(c => c.id === selectedCommercialId) || mockCommerciaux[0];
    const commNom = `${comm.prenom} ${comm.nom}`;

    let importedCount = 0;
    let skippedCount = 0;

    parsedRows.forEach(row => {
      if (row.isDuplicate) {
        skippedCount++;
      } else {
        addProspect({
          nom: row.nom,
          prenom: row.prenom,
          entreprise: row.entreprise,
          telephone: row.telephone,
          source: (row.source as any) || 'prospection_directe',
          commentaire: row.commentaire,
          statut_pipeline: 'nouveau',
          commercial_id: comm.id,
          commercial_nom: commNom
        });
        importedCount++;
      }
    });

    setImportResult({
      imported: importedCount,
      skipped: skippedCount,
      commercialNom: commNom
    });

    // Reset preview
    setParsedRows([]);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Real CSV Generator
  const handleExportCSV = (type: 'prospects' | 'clients') => {
    let csvHeaders = '';
    let csvRows = '';

    if (type === 'prospects') {
      csvHeaders = 'Nom;Prenom;Entreprise;Telephone;Source;Etape_Pipeline;Budget_Estime;Commercial\n';
      csvRows = prospects
        .map(
          p =>
            `"${p.nom}";"${p.prenom || ''}";"${p.entreprise}";"${p.telephone}";"${p.source}";"${p.statut_pipeline}";"${p.budget_estime || 0}";"${p.commercial_nom || ''}"`
        )
        .join('\n');
    } else {
      csvHeaders = 'Entreprise;Responsable;Telephone;Email;Formule_Souscrite;Montant_Paye;Statut_Compte\n';
      csvRows = clients
        .map(
          c =>
            `"${c.entreprise}";"${c.nom_responsable}";"${c.telephone}";"${c.email || ''}";"${c.formule_souscrite}";"${c.montant_paye}";"${c.statut_compte}"`
        )
        .join('\n');
    }

    const blob = new Blob([csvHeaders + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `faciloop_${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const validRows = parsedRows.filter(r => !r.isDuplicate);
  const duplicateRows = parsedRows.filter(r => r.isDuplicate);
  const selectedComm = mockCommerciaux.find(c => c.id === selectedCommercialId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Import / Export de Données (CSV & Excel)
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Importez des listes de prospects, attribuez-les en masse à un commercial et prévenez les doublons
        </p>
      </div>

      {/* Import Result Notification */}
      {importResult && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-bold space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Importation exécutée avec succès !</span>
          </div>
          <p className="text-xs font-normal text-foreground">
            <strong>{importResult.imported} prospects</strong> ont été importés et attribués à <strong>{importResult.commercialNom}</strong>.
            {importResult.skipped > 0 && ` (${importResult.skipped} doublons ignorés).`}
          </p>
        </div>
      )}

      {/* Export Section */}
      <div className="p-6 rounded-3xl border border-border bg-card space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Download className="w-5 h-5 text-primary" />
          <span>Exporter mes données en CSV</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => handleExportCSV('prospects')}
            className="p-4 rounded-2xl border border-border bg-muted/30 hover:bg-muted text-left transition-all space-y-1 group"
          >
            <div className="font-bold text-xs text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
              <span>Exporter les Prospects ({prospects.length})</span>
              <Download className="w-4 h-4" />
            </div>
            <div className="text-[11px] text-muted-foreground">Fichier CSV prêt avec toutes les colonnes du CRM</div>
          </button>

          <button
            onClick={() => handleExportCSV('clients')}
            className="p-4 rounded-2xl border border-border bg-muted/30 hover:bg-muted text-left transition-all space-y-1 group"
          >
            <div className="font-bold text-xs text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
              <span>Exporter les Clients Faciloop ({clients.length})</span>
              <Download className="w-4 h-4" />
            </div>
            <div className="text-[11px] text-muted-foreground">Fichier CSV complet avec formules souscrites et montants</div>
          </button>
        </div>
      </div>

      {/* Real CSV Import Section */}
      <div className="p-6 rounded-3xl border border-border bg-card space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Upload className="w-5 h-5 text-emerald-500" />
              <span>Importer une liste de prospects (Fichier CSV)</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Accepte les séparateurs virgule (,) et point-virgule (;)
            </p>
          </div>

          {/* Commercial Attribution Dropdown */}
          <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-xl border border-border">
            <Users className="w-4 h-4 text-primary shrink-0" />
            <div className="text-xs">
              <span className="block text-[10px] font-bold text-muted-foreground uppercase">Attribuer la liste à :</span>
              <select
                value={selectedCommercialId}
                onChange={(e) => setSelectedCommercialId(e.target.value)}
                className="bg-transparent font-bold text-foreground focus:outline-none"
              >
                {mockCommerciaux.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.prenom} {c.nom} ({c.email})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Upload Zone */}
        <div className="p-8 rounded-2xl border-2 border-dashed border-border/80 text-center space-y-3 bg-muted/20">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv, .txt"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-file-input"
          />
          <FileSpreadsheet className="w-10 h-10 text-muted-foreground mx-auto" />
          <div className="text-xs font-bold text-foreground">
            {fileName ? `Fichier prêt : ${fileName}` : 'Glissez votre fichier CSV ici ou choisissez un fichier'}
          </div>
          <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
            Les champs <strong>Nom</strong>, <strong>Entreprise</strong> et <strong>Téléphone</strong> seront extraits automatiquement.
          </p>
          <label
            htmlFor="csv-file-input"
            className="inline-block px-4 py-2 rounded-xl bg-gradient-faciloop text-white text-xs font-bold shadow hover:opacity-95 cursor-pointer transition-all"
          >
            {fileName ? 'Changer de fichier CSV' : 'Choisir un fichier CSV'}
          </label>
        </div>

        {/* Parsed Preview Table & Validation Feedback */}
        {parsedRows.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-muted/50 border border-border">
              <div className="space-y-1 text-xs">
                <div className="font-bold text-foreground text-sm">
                  Résumé de l'importation avant confirmation :
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span className="text-emerald-500 font-bold">✓ {validRows.length} prospects à importer</span>
                  {duplicateRows.length > 0 && (
                    <span className="text-amber-500 font-bold">⚠️ {duplicateRows.length} doublons détectés (seront ignorés)</span>
                  )}
                  <span>Attribution : <strong>{selectedComm?.prenom} {selectedComm?.nom}</strong></span>
                </div>
              </div>

              <button
                onClick={handleConfirmImport}
                disabled={validRows.length === 0}
                className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 disabled:opacity-50 transition-all shrink-0"
              >
                Confirmer l'import ({validRows.length} prospects)
              </button>
            </div>

            {/* Preview Data Grid */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/50 text-[11px] font-bold uppercase text-muted-foreground">
                  <tr>
                    <th className="p-3">Nom</th>
                    <th className="p-3">Entreprise</th>
                    <th className="p-3">Téléphone</th>
                    <th className="p-3">Source</th>
                    <th className="p-3">Statut Anti-Doublon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-[11px]">
                  {parsedRows.map((r, idx) => (
                    <tr key={idx} className={r.isDuplicate ? 'bg-amber-500/5' : 'hover:bg-muted/30'}>
                      <td className="p-3 font-bold text-foreground">{r.prenom} {r.nom}</td>
                      <td className="p-3 text-muted-foreground">{r.entreprise}</td>
                      <td className="p-3 font-medium text-foreground">{r.telephone}</td>
                      <td className="p-3 capitalize text-muted-foreground">{r.source}</td>
                      <td className="p-3">
                        {r.isDuplicate ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-bold text-[10px]">
                            ⚠️ Doublon (Téléphone existant)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">
                            ✓ Prêt à l'import
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
