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
import { useTranslation } from 'react-i18next';

export const GlobalFab: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

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
      entreprise: entreprise || (isEn ? 'Individual Company' : 'Entreprise Individuelle'),
      telephone: formattedPhone,
      source: 'prospection_directe',
      statut_pipeline: 'nouveau',
      commentaire: noteRapide || (isEn ? 'Quick entry via Floating Action Button' : 'Saisie rapide via Floating Action Button')
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
          prochaine_action: isEn ? 'First sales follow-up' : 'Premier suivi commercial'
        });
      }

      setSuccessToast(isEn ? 'Prospect and quick note added successfully!' : 'Prospect et note rapide ajoutés avec succès !');
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
            className="fixed bottom-24 right-6 z-50 p-4 rounded-2xl bg-emerald-500 text-white font-extrabold text-xs shadow-2xl flex items-center gap-2 max-w-sm"
          >
            <Check className="w-5 h-5 shrink-0" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Express Creation Bottom Sheet Modal on Mobile, Centered on PC */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm font-sans">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-card border-t sm:border border-border/80 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl relative space-y-4 font-sans"
            >
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto sm:hidden mb-1" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-2xl bg-primary/10 text-primary">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-foreground">
                      {isEn ? '5-Second Express Entry' : 'Saisie Express 5 Secondes'}
                    </h2>
                    <p className="text-xs font-semibold text-muted-foreground">
                      {isEn ? 'Quick field entry' : 'Création rapide sur le terrain'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl border border-input text-muted-foreground hover:bg-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {duplicateAlert && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{isEn ? 'This phone number already exists in the company!' : "Ce numéro de téléphone existe déjà dans l'entreprise !"}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-foreground mb-1">{isEn ? 'Name / Contact *' : 'Nom / Contact *'}</label>
                  <input
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Moussa Ndiaye"
                    className="w-full p-3 rounded-2xl border border-input bg-background font-semibold focus:ring-2 focus:ring-primary/50 text-foreground"
                  />
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">{isEn ? 'Primary Phone *' : 'Téléphone Principal *'}</label>
                  <input
                    type="tel"
                    required
                    value={telephone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder={isEn ? "77 123 45 67 or +221..." : "77 123 45 67 ou +221..."}
                    className="w-full p-3 rounded-2xl border border-input bg-background font-semibold focus:ring-2 focus:ring-primary/50 text-foreground"
                  />
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">{isEn ? 'Company / Business (Optional)' : 'Entreprise / Société (Optionnel)'}</label>
                  <input
                    type="text"
                    value={entreprise}
                    onChange={(e) => setEntreprise(e.target.value)}
                    placeholder="Dakar Tech SARL"
                    className="w-full p-3 rounded-2xl border border-input bg-background font-semibold focus:ring-2 focus:ring-primary/50 text-foreground"
                  />
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">{isEn ? 'Quick Note / Report (Optional)' : 'Note Rapide / Compte-rendu (Optionnel)'}</label>
                  <textarea
                    rows={2}
                    value={noteRapide}
                    onChange={(e) => setNoteRapide(e.target.value)}
                    placeholder={isEn ? "E.g. Interested in Pro plan, call back tomorrow at 2pm..." : "Ex: Intéressé par la formule Pro, rappeler demain à 14h..."}
                    className="w-full p-3 rounded-2xl border border-input bg-background font-semibold focus:ring-2 focus:ring-primary/50 text-foreground"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-full sm:w-1/3 py-3 rounded-2xl border border-input font-bold hover:bg-muted text-foreground"
                  >
                    {isEn ? 'Cancel' : 'Annuler'}
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-2/3 py-3 rounded-2xl bg-gradient-faciloop text-white font-extrabold shadow-lg shadow-primary/25 hover:opacity-95 flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isEn ? 'Create and save' : 'Créer et enregistrer'}</span>
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
