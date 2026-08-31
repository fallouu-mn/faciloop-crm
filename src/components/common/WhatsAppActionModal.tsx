import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MessageSquare, Check, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

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
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');
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
      commentaire: isEn ? `WhatsApp message sent to ${prospectNom}.` : `Message WhatsApp transmis à ${prospectNom}.`,
      prochaine_action: isEn ? 'Follow prospect reply' : 'Suivre la réponse du prospect'
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
      {/* Responsive Bottom Sheet Overlay on Mobile, Centered on Desktop */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm font-sans">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-sm bg-card border-t sm:border border-border/80 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 font-sans text-center relative"
        >
          {/* Mobile Bottom Sheet Pull Handle */}
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto sm:hidden mb-1" />

          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto shadow-md">
            <MessageSquare className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base sm:text-lg font-extrabold text-foreground">
              {isEn ? 'Did you send the message?' : 'Avez-vous envoyé le message ?'}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground font-semibold leading-relaxed">
              {isEn 
                ? <>For <strong className="text-foreground font-extrabold">{prospectNom}</strong>. Confirm to log exchange and close follow-ups.</>
                : <>Pour <strong className="text-foreground font-extrabold">{prospectNom}</strong>. Validez pour consigner l'échange et clore vos relances.</>}
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleConfirmSent}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{isEn ? "Yes, log the exchange" : "Oui, consigner l'échange"}</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl border border-input text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-95"
            >
              {isEn ? 'No / Later' : 'Non / Plus tard'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
