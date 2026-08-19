import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Prospect, MotifPerte } from '../../types/crm';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  CalendarClock, 
  MessageSquare, 
  Plus, 
  ArrowLeft, 
  UserCheck, 
  X, 
  Check, 
  History,
  PhoneCall,
  Video,
  Send,
  Sparkles,
  ArrowUpRight,
  Clock,
  Briefcase
} from 'lucide-react';
import { WhatsAppActionModal } from '../../components/common/WhatsAppActionModal';
import { motion, AnimatePresence } from 'framer-motion';

export const ProspectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { prospects, interactions, relances, addInteraction, convertProspectToClient } = useAuth();

  const prospect = prospects.find(p => p.id === id);
  const [activeTab, setActiveTab] = useState<'timeline' | 'relances' | 'infos'>('timeline');

  // Interaction Modal State
  const [isInterModalOpen, setIsInterModalOpen] = useState<boolean>(false);
  const [interType, setInterType] = useState<any>('appel');
  const [interComment, setInterComment] = useState<string>('');
  const [interNextAction, setInterNextAction] = useState<string>('');

  // WhatsApp Action Modal State
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState<boolean>(false);

  const handleWhatsAppClick = () => {
    window.open(
      `https://wa.me/${prospect.telephone.replace(/\s+/g, '')}?text=${encodeURIComponent(
        `Bonjour ${prospect.prenom || prospect.nom}, je suis Moussa de Faciloop CRM.`
      )}`,
      '_blank'
    );
    setIsWhatsAppModalOpen(true);
  };

  if (!prospect) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm font-bold text-muted-foreground">Prospect introuvable.</p>
        <Link to="/app/prospects" className="text-xs font-bold text-primary hover:underline">
          ← Retour à la liste des prospects
        </Link>
      </div>
    );
  }

  const prospectInteractions = interactions.filter(i => i.prospect_id === prospect.id);
  const prospectRelances = relances.filter(r => r.prospect_id === prospect.id);

  // Generate Prospect Initials
  const initials = `${prospect.prenom?.[0] || ''}${prospect.nom?.[0] || ''}`.toUpperCase() || 'P';

  const handleAddInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    addInteraction({
      prospect_id: prospect.id,
      type: interType,
      statut: 'realisee',
      date: new Date().toISOString().split('T')[0],
      heure: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      commentaire: interComment,
      prochaine_action: interNextAction
    });
    setIsInterModalOpen(false);
    setInterComment('');
    setInterNextAction('');
  };

  const handleConvert = () => {
    convertProspectToClient(prospect.id, formuleSouscrite);
    setIsConvertModalOpen(false);
    navigate('/admin/clients');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-md flex justify-end">
      {/* Slide-over Drawer Backdrop Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => navigate(-1)}
        className="absolute inset-0"
      />

      {/* Slide-over Content Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-2xl bg-card border-l border-border/80 h-full shadow-2xl overflow-y-auto flex flex-col z-10 font-sans"
      >
        {/* Drawer Header */}
        <div className="sticky top-0 z-20 border-b border-border/80 bg-card/90 backdrop-blur-xl p-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar Pill with Gradient */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-faciloop text-white flex items-center justify-center font-black text-xl shadow-lg shadow-primary/20 shrink-0">
              {initials}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-foreground">{prospect.prenom} {prospect.nom}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary">
                  {prospect.statut_pipeline.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs font-medium text-muted-foreground mt-0.5 flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  {prospect.entreprise}
                </span>
                <span>•</span>
                <span>{prospect.secteur_activite || 'Général'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl border border-input text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            title="Fermer le tiroir"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Bar (WhatsApp, Call, Email & Convert) */}
        <div className="p-6 border-b border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppClick}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 hover:bg-emerald-600 flex items-center gap-2 transition-all active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Direct</span>
            </button>

            <a
              href={`tel:${prospect.telephone}`}
              className="p-2.5 rounded-xl border border-input bg-card text-foreground hover:bg-muted text-xs font-bold transition-all"
              title="Appeler"
            >
              <Phone className="w-4 h-4 text-primary" />
            </a>

            <a
              href={`mailto:${prospect.email || ''}`}
              className="p-2.5 rounded-xl border border-input bg-card text-foreground hover:bg-muted text-xs font-bold transition-all"
              title="Envoyer un e-mail"
            >
              <Mail className="w-4 h-4 text-primary" />
            </a>
          </div>

          {prospect.statut_pipeline !== 'gagne' && (
            <button
              onClick={() => setIsConvertModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-faciloop text-white text-xs font-bold shadow-lg shadow-primary/25 hover:opacity-95 flex items-center gap-1.5 transition-all"
            >
              <UserCheck className="w-4 h-4" />
              <span>Convertir en Client</span>
            </button>
          )}
        </div>

        {/* Fluid Tab Switcher with Framer Motion layoutId */}
        <div className="px-6 pt-4 border-b border-border/80 bg-card">
          <div className="relative flex gap-2 text-xs font-bold">
            {[
              { id: 'timeline', label: `Historique (${prospectInteractions.length})` },
              { id: 'relances', label: `Relances (${prospectRelances.length})` },
              { id: 'infos', label: 'Informations Prospect' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className="relative z-10 px-4 py-3 text-foreground transition-colors"
              >
                {activeTab === t.id && (
                  <motion.div
                    layoutId="prospect-tab-pill"
                    className="absolute inset-0 border-b-2 border-primary -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={activeTab === t.id ? 'text-primary font-black' : 'text-muted-foreground'}>
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Contents Area */}
        <div className="p-6 flex-1 space-y-6">
          {/* Tab 1: Vertical Timeline of Interactions */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                  Frise Chronologique des Échanges
                </h3>
                <button
                  onClick={() => setIsInterModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-primary text-white font-bold text-xs shadow-md shadow-primary/20 hover:opacity-95 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Consigner un échange</span>
                </button>
              </div>

              {prospectInteractions.length === 0 ? (
                <div className="p-8 rounded-3xl border-2 border-dashed border-border text-center space-y-2">
                  <History className="w-8 h-8 text-muted-foreground mx-auto" />
                  <p className="text-xs font-bold text-foreground">Aucune interaction consignée pour le moment.</p>
                  <p className="text-[11px] text-muted-foreground">Enregistrez vos appels, démos ou échanges WhatsApp pour conserver un historique fluide.</p>
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
                  {prospectInteractions.map((inter) => {
                    const getIcon = () => {
                      if (inter.type === 'whatsapp') return <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />;
                      if (inter.type === 'demonstration') return <Video className="w-3.5 h-3.5 text-purple-500" />;
                      if (inter.type === 'email') return <Send className="w-3.5 h-3.5 text-blue-500" />;
                      return <PhoneCall className="w-3.5 h-3.5 text-amber-500" />;
                    };

                    return (
                      <div key={inter.id} className="relative flex items-start gap-4 group">
                        {/* Timeline Circle Node */}
                        <div className="absolute -left-[30px] top-1 w-6 h-6 rounded-full border-2 border-card bg-muted flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          {getIcon()}
                        </div>

                        <div className="flex-1 p-4 rounded-2xl border border-border/80 bg-card shadow-sm hover:shadow-md transition-all space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-extrabold text-foreground capitalize flex items-center gap-1.5">
                              {inter.type}
                            </span>
                            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {inter.date} à {inter.heure}
                            </span>
                          </div>

                          <p className="text-xs text-foreground font-medium leading-relaxed">{inter.commentaire}</p>

                          {inter.prochaine_action && (
                            <div className="pt-2 border-t border-border/50 text-[11px] font-bold text-amber-500 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Prochaine action : {inter.prochaine_action}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Planned Relances */}
          {activeTab === 'relances' && (
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                Relances Commerciales Programmées
              </h3>

              {prospectRelances.length === 0 ? (
                <div className="p-8 rounded-3xl border-2 border-dashed border-border text-center text-xs text-muted-foreground">
                  Aucune relance programmée pour ce prospect.
                </div>
              ) : (
                prospectRelances.map((rel) => (
                  <div key={rel.id} className="p-4 rounded-2xl border border-border bg-card flex justify-between items-center text-xs shadow-sm">
                    <div className="space-y-1">
                      <div className="font-bold text-foreground">{rel.motif || 'Relance suivi commercial'}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3 text-primary" />
                        {rel.date} à {rel.heure}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full font-extrabold uppercase text-[10px] ${
                      rel.statut === 'en_retard' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {rel.statut.replace('_', ' ')}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Detailed Prospect Information Card */}
          {activeTab === 'infos' && (
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                Fiche d'Identité Commerciale
              </h3>

              <div className="p-5 rounded-3xl border border-border bg-card space-y-4 shadow-sm text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-muted-foreground font-semibold">Téléphone Principal</span>
                    <span className="font-bold text-foreground text-sm">{prospect.telephone}</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground font-semibold">Adresse Email</span>
                    <span className="font-bold text-foreground">{prospect.email || 'Non renseigné'}</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground font-semibold">Entreprise</span>
                    <span className="font-bold text-foreground">{prospect.entreprise}</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground font-semibold">Secteur d'Activité</span>
                    <span className="font-bold text-foreground">{prospect.secteur_activite || 'Général'}</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground font-semibold">Source d'Acquisition</span>
                    <span className="font-bold text-foreground capitalize">{prospect.source.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground font-semibold">Budget Estimé</span>
                    <span className="font-bold text-emerald-500 text-sm">
                      {prospect.budget_estime ? `${prospect.budget_estime.toLocaleString()} FCFA` : 'Non défini'}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <span className="block text-muted-foreground font-semibold mb-1">Commercial Responsable</span>
                  <span className="font-extrabold text-primary text-sm">{prospect.commercial_nom || 'Attribué à moi'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Add Interaction Modal */}
      {isInterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Consigner une Interaction</h2>
              <button onClick={() => setIsInterModalOpen(false)} className="p-1 rounded-lg hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddInteraction} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Type d'interaction</label>
                <select
                  value={interType}
                  onChange={(e) => setInterType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-input bg-background font-medium"
                >
                  <option value="appel">Appel Téléphonique</option>
                  <option value="whatsapp">Message WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="demonstration">Démonstration</option>
                  <option value="visite">Visite Client</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Compte-rendu / Commentaire</label>
                <textarea
                  required
                  rows={3}
                  value={interComment}
                  onChange={(e) => setInterComment(e.target.value)}
                  placeholder="Points clés abordés lors de l'échange..."
                  className="w-full p-2.5 rounded-xl border border-input bg-background font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Prochaine Action</label>
                <input
                  type="text"
                  value={interNextAction}
                  onChange={(e) => setInterNextAction(e.target.value)}
                  placeholder="Ex: Envoyer la proposition commerciale"
                  className="w-full p-2.5 rounded-xl border border-input bg-background font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-faciloop text-white font-bold shadow-md hover:opacity-95"
              >
                Enregistrer l'interaction
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Convert to Client Modal */}
      {isConvertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Conversion en Client Faciloop</h2>
              <button onClick={() => setIsConvertModalOpen(false)} className="p-1 rounded-lg hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Vous allez convertir <strong className="text-foreground">{prospect.entreprise}</strong> en Client officiel Faciloop CRM.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Formule SaaS Souscrite</label>
                <select
                  value={formuleSouscrite}
                  onChange={(e) => setFormuleSouscrite(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-input bg-background font-medium"
                >
                  <option value="SaaS Starter">SaaS Starter (250 000 FCFA/an)</option>
                  <option value="SaaS Business Pro">SaaS Business Pro (750 000 FCFA/an)</option>
                  <option value="SaaS Enterprise">SaaS Enterprise (Sur-mesure)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setIsConvertModalOpen(false)}
                className="w-1/2 py-2.5 rounded-xl border text-xs font-bold hover:bg-muted"
              >
                Annuler
              </button>
              <button
                onClick={handleConvert}
                className="w-1/2 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 shadow-md"
              >
                Confirmer la vente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Feedback Action Modal */}
      <WhatsAppActionModal
        isOpen={isWhatsAppModalOpen}
        prospectId={prospect.id}
        prospectNom={`${prospect.prenom} ${prospect.nom}`}
        onClose={() => setIsWhatsAppModalOpen(false)}
      />
    </div>
  );
};
