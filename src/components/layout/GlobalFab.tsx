import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { formatPhoneNumber } from '../../lib/phoneUtils';
import { 
  Plus, 
  X, 
  Sparkles, 
  MessageSquare, 
  Phone, 
  Check, 
  AlertTriangle,
  Mic,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GlobalFab: React.FC = () => {
  const { user, prospects, addProspect, addInteraction } = useAuth();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [nom, setNom] = useState<string>('');
  const [entreprise, setEntreprise] = useState<string>('');
  const [telephone, setTelephone] = useState<string>('');
  const [noteRapide, setNoteRapide] = useState<string>('');
  
  const [duplicateAlert, setDuplicateAlert] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Phone input formatting & duplicate scan
  const handlePhoneChange = (val: string) => {
    setTelephone(val);
    const formatted = formatPhoneNumber(val);
    if (formatted.length >= 8) {
      const exists = prospects.some(p => formatPhoneNumber(p.telephone) === formatted);
      setDuplicateAlert(exists);
    } else {
      setDuplicateAlert(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom || !telephone) return;

    const formattedPhone = formatPhoneNumber(telephone);

    const res = addProspect({
      nom: nom,
      entreprise: entreprise || 'Entreprise Individuelle',
      telephone: formattedPhone,
      source: 'prospection_directe',
      statut_pipeline: 'nouveau',
      commentaire: noteRapide || 'Saisie rapide via Floating Action Button'
    });

    if (res.duplicate) {
      setDuplicateAlert(true);
      return;
    }

    if (res.success && res.prospect) {
      if (noteRapide) {
        addInteraction({
          prospect_id: res.prospect.id,
          type: 'appel',
          statut: 'realisee',
          date: new Date().toISOString().split('T')[0],
          heure: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          commentaire: noteRapide,
          prochaine_action: 'Premier suivi commercial'
        });
      }

      setSuccessToast('Prospect et note rapide ajoutés avec succès !');
      setTimeout(() => setSuccessToast(null), 3500);

      // Reset
      setNom('');
      setEntreprise('');
      setTelephone('');
      setNoteRapide('');
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-6 z-50 p-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-2xl flex items-center gap-2 max-w-sm"
          >
            <Check className="w-5 h-5 shrink-0" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button (FAB) */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-faciloop text-white shadow-2xl shadow-primary/40 flex items-center gap-2.5 font-bold text-xs group ring-4 ring-primary/20"
        title="Saisie Express Prospect"
      >
        <div className="p-1 rounded-full bg-white/20">
          <Zap className="w-5 h-5 animate-pulse" />
        </div>
        <span className="hidden sm:inline pr-1">Saisie Express</span>
      </motion.button>

      {/* Express Creation Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="w-full max-w-md bg-card border border-border/80 rounded-3xl p-6 shadow-2xl relative space-y-4 font-sans"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-2xl bg-primary/10 text-primary">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-foreground">Saisie Express 5 Secondes</h2>
                    <p className="text-[11px] text-muted-foreground">Création rapide sur le terrain</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl border border-input text-muted-foreground hover:bg-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {duplicateAlert && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Ce numéro de téléphone existe déjà dans l'entreprise !</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-foreground mb-1">Nom / Contact *</label>
                  <input
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Moussa Ndiaye"
                    className="w-full p-3 rounded-xl border border-input bg-background font-medium focus:ring-2 focus:ring-primary/50 text-foreground"
                  />
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">Téléphone Principal *</label>
                  <input
                    type="tel"
                    required
                    value={telephone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="77 123 45 67 ou +221..."
                    className="w-full p-3 rounded-xl border border-input bg-background font-medium focus:ring-2 focus:ring-primary/50 text-foreground"
                  />
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">Entreprise / Société (Optionnel)</label>
                  <input
                    type="text"
                    value={entreprise}
                    onChange={(e) => setEntreprise(e.target.value)}
                    placeholder="Dakar Tech SARL"
                    className="w-full p-3 rounded-xl border border-input bg-background font-medium focus:ring-2 focus:ring-primary/50 text-foreground"
                  />
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">Note Rapide / Compte-rendu (Optionnel)</label>
                  <textarea
                    rows={2}
                    value={noteRapide}
                    onChange={(e) => setNoteRapide(e.target.value)}
                    placeholder="Ex: Intéressé par la formule Pro, rappeler demain à 14h..."
                    className="w-full p-3 rounded-xl border border-input bg-background font-medium focus:ring-2 focus:ring-primary/50 text-foreground"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-1/3 py-3 rounded-xl border border-input font-bold hover:bg-muted text-foreground"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-3 rounded-xl bg-gradient-faciloop text-white font-extrabold shadow-lg shadow-primary/25 hover:opacity-95 flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Créer et enregistrer</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
