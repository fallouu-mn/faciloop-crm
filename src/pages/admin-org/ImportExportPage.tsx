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
  Users,
  Sparkles,
  Loader2,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  
  // UX Refactoring States: DragOver, Parsing Loader & Success Button State
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [isImportSuccess, setIsImportSuccess] = useState<boolean>(false);

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

  const processFile = (file: File) => {
    setFileName(file.name);
    setImportResult(null);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        // Micro parsing simulation delay (600ms) for elite UX feel
        setTimeout(() => {
          const rows = parseCSVText(content);
          setParsedRows(rows);
          setIsParsing(false);
        }, 600);
      } else {
        setIsParsing(false);
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
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

    setIsImportSuccess(true);
    setImportResult({
      imported: importedCount,
      skipped: skippedCount,
      commercialNom: commNom
    });

    setTimeout(() => {
      setIsImportSuccess(false);
      setParsedRows([]);
      setFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 2500);
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
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Import / Export de Données (CSV & Excel)
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Importez des listes de prospects, attribuez-les en masse et prévenez les doublons
        </p>
      </div>

      {/* Import Result Notification */}
      <AnimatePresence>
        {importResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-bold space-y-1 shadow-lg shadow-emerald-500/10"
          >
            <div className="flex items-center gap-2 text-base">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Importation exécutée avec succès !</span>
            </div>
            <p className="text-xs font-medium text-foreground">
              <strong>{importResult.imported} prospects</strong> ont été importés et attribués à <strong>{importResult.commercialNom}</strong>.
              {importResult.skipped > 0 && ` (${importResult.skipped} doublons ignorés).`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Section */}
      <div className="p-6 rounded-3xl border border-border/80 bg-card space-y-4 shadow-sm">
        <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
          <Download className="w-5 h-5 text-primary" />
          <span>Exporter mes données en CSV</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ y: -3, scale: 1.01 }}
            onClick={() => handleExportCSV('prospects')}
            className="p-5 rounded-2xl border border-border/80 bg-card hover:bg-muted/40 text-left transition-all space-y-1 shadow-sm hover:shadow-md group"
          >
            <div className="font-extrabold text-xs text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
              <span>Exporter les Prospects ({prospects.length})</span>
              <Download className="w-4 h-4" />
            </div>
            <div className="text-[11px] text-muted-foreground font-medium">Fichier CSV prêt avec toutes les colonnes du CRM</div>
          </motion.button>

          <motion.button
            whileHover={{ y: -3, scale: 1.01 }}
            onClick={() => handleExportCSV('clients')}
            className="p-5 rounded-2xl border border-border/80 bg-card hover:bg-muted/40 text-left transition-all space-y-1 shadow-sm hover:shadow-md group"
          >
            <div className="font-extrabold text-xs text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
              <span>Exporter les Clients Faciloop ({clients.length})</span>
              <Download className="w-4 h-4" />
            </div>
            <div className="text-[11px] text-muted-foreground font-medium">Fichier CSV complet avec formules souscrites et montants</div>
          </motion.button>
        </div>
      </div>

      {/* Animated Dropzone Import Section */}
      <div className="p-6 rounded-3xl border border-border/80 bg-card space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Upload className="w-5 h-5 text-emerald-500" />
              <span>Importer une liste de prospects (Fichier CSV)</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Accepte les séparateurs virgule (,) et point-virgule (;)
            </p>
          </div>

          {/* Commercial Attribution Dropdown */}
          <div className="flex items-center gap-2 bg-muted/60 p-2.5 rounded-2xl border border-border">
            <Users className="w-4 h-4 text-primary shrink-0" />
            <div className="text-xs">
              <span className="block text-[10px] font-extrabold text-muted-foreground uppercase">Attribuer la liste à :</span>
              <select
                value={selectedCommercialId}
                onChange={(e) => setSelectedCommercialId(e.target.value)}
                className="bg-transparent font-extrabold text-foreground focus:outline-none"
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

        {/* Polished Dropzone with Framer Motion Drop Highlight */}
        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          animate={{
            borderColor: isDraggingFile ? '#3b82f6' : 'rgba(150, 150, 150, 0.4)',
            backgroundColor: isDraggingFile ? 'rgba(59, 130, 246, 0.08)' : 'rgba(0, 0, 0, 0.02)'
          }}
          className={`p-10 rounded-3xl border-2 border-dashed text-center space-y-4 transition-colors relative overflow-hidden ${
            isDraggingFile ? 'ring-4 ring-primary/20 scale-[1.01]' : ''
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv, .txt"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-file-input"
          />

          <motion.div
            animate={{ scale: isDraggingFile ? 1.15 : 1 }}
            className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-md"
          >
            <FileSpreadsheet className="w-8 h-8" />
          </motion.div>

          <div className="space-y-1">
            <div className="text-sm font-extrabold text-foreground">
              {fileName ? `Fichier chargé : ${fileName}` : 'Glissez-déposez votre fichier CSV ici'}
            </div>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Ou cliquez ci-dessous pour sélectionner un fichier. Extraction automatique des colonnes <strong>Nom</strong>, <strong>Entreprise</strong> et <strong>Téléphone</strong>.
            </p>
          </div>

          <label
            htmlFor="csv-file-input"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-faciloop text-white text-xs font-extrabold shadow-lg shadow-primary/25 hover:opacity-95 cursor-pointer transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>{fileName ? 'Changer de fichier CSV' : 'Parcourir mes fichiers'}</span>
          </label>
        </motion.div>

        {/* Micro Parsing Loader State */}
        {isParsing && (
          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center gap-3 text-xs font-bold text-primary animate-pulse">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Analyse du fichier CSV & scanner anti-doublon en cours...</span>
          </div>
        )}

        {/* Parsed Preview Table & Validation Feedback */}
        {!isParsing && parsedRows.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-border/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-muted/50 border border-border/80">
              <div className="space-y-1 text-xs">
                <div className="font-extrabold text-foreground text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Résumé de la prévisualisation avant validation :</span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground pt-1">
                  <span className="text-emerald-500 font-extrabold bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                    ✓ {validRows.length} prêts à l'import
                  </span>
                  {duplicateRows.length > 0 && (
                    <span className="text-rose-500 font-extrabold bg-rose-500/10 px-2.5 py-0.5 rounded-full animate-pulse">
                      ⚠️ {duplicateRows.length} doublons ignorés
                    </span>
                  )}
                  <span>Attribution : <strong>{selectedComm?.prenom} {selectedComm?.nom}</strong></span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirmImport}
                disabled={validRows.length === 0 || isImportSuccess}
                className={`px-6 py-3.5 rounded-2xl font-extrabold text-xs shadow-xl transition-all shrink-0 flex items-center gap-2 ${
                  isImportSuccess
                    ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                    : 'bg-gradient-faciloop text-white shadow-primary/25 hover:opacity-95'
                }`}
              >
                {isImportSuccess ? (
                  <>
                    <Check className="w-4 h-4 animate-bounce" />
                    <span>Prospects importés !</span>
                  </>
                ) : (
                  <>
                    <span>Valider l'importation ({validRows.length})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>

            {/* Preview Data Grid with Polished Badges */}
            <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/80 bg-muted/60 text-[11px] font-extrabold uppercase text-muted-foreground">
                  <tr>
                    <th className="p-4">Nom / Contact</th>
                    <th className="p-4">Entreprise</th>
                    <th className="p-4">Téléphone</th>
                    <th className="p-4">Source</th>
                    <th className="p-4">Statut Anti-Doublon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-[11px]">
                  {parsedRows.map((r, idx) => (
                    <tr key={idx} className={r.isDuplicate ? 'bg-rose-500/5' : 'hover:bg-muted/30 transition-colors'}>
                      <td className="p-4 font-extrabold text-foreground">{r.prenom} {r.nom}</td>
                      <td className="p-4 text-muted-foreground font-medium">{r.entreprise}</td>
                      <td className="p-4 font-semibold text-foreground">{r.telephone}</td>
                      <td className="p-4 capitalize text-muted-foreground">{r.source}</td>
                      <td className="p-4">
                        {r.isDuplicate ? (
                          <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 font-extrabold text-[10px] inline-flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" />
                            <span>⚠️ Doublon (Existante - Ignoré)</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-extrabold text-[10px] inline-flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>✓ Prêt à l'import</span>
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
