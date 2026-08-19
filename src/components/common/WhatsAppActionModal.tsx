import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MessageSquare, Check, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WhatsAppActionModalProps {
  isOpen: boolean;
  prospectId: string;
  prospectNom: string;
  onClose: () => void;
}

export const WhatsAppActionModal: React.FC<WhatsAppActionModalProps> = ({
  isOpen,
  prospectId,
  prospectNom,
  onClose
}) => {
  const { addInteraction, relances, completeRelance } = useAuth();

  if (!isOpen) return null;

  const handleConfirmSent = () => {
    // 1. Log the interaction
    addInteraction({
      prospect_id: prospectId,
      type: 'whatsapp',
      statut: 'realisee',
      date: new Date().toISOString().split('T')[0],
      heure: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      commentaire: `Message WhatsApp transmis à ${prospectNom}.`,
      prochaine_action: 'Suivre la réponse du prospect'
    });

    // 2. Automatically complete any pending relance for this prospect
    const matchingRelance = relances.find(
      r => r.prospect_id === prospectId && r.statut !== 'realisee'
    );
    if (matchingRelance) {
      completeRelance(matchingRelance.id);
    }

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          className="w-full max-w-sm bg-card border border-border/80 rounded-3xl p-6 shadow-2xl space-y-4 font-sans text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto shadow-md">
            <MessageSquare className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-foreground">
              Avez-vous envoyé le message WhatsApp ?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pour <strong className="text-foreground">{prospectNom}</strong>. Validez pour enregistrer l'échange et mettre à jour vos relances.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleConfirmSent}
              className="w-full py-3 rounded-2xl bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Oui, consigner l'échange</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-2xl border border-input text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              Non / Plus tard
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
