import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
  History 
} from 'lucide-react';

export const ProspectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { prospects, interactions, relances, addInteraction, addRelance, convertProspectToClient } = useAuth();

  const prospect = prospects.find(p => p.id === id);

  const [activeTab, setActiveTab] = useState<'timeline' | 'relances' | 'infos'>('timeline');

  // Interaction Modal State
  const [isInterModalOpen, setIsInterModalOpen] = useState<boolean>(false);
  const [interType, setInterType] = useState<any>('appel');
  const [interComment, setInterComment] = useState<string>('');
  const [interNextAction, setInterNextAction] = useState<string>('');

  // Conversion Modal State
  const [isConvertModalOpen, setIsConvertModalOpen] = useState<boolean>(false);
  const [formuleSouscrite, setFormuleSouscrite] = useState<string>('SaaS Business Pro');

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

  const handleAddInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    addInteraction({
      prospect_id: prospect.id,
      type: interType,
      statut: 'realisee',
      date: new Date().toISOString().split('T')[0],
      heure: '10:00',
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
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/app/prospects" className="p-2 rounded-xl border border-input bg-card hover:bg-muted">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-foreground">{prospect.prenom} {prospect.nom}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary/10 text-primary">
                {prospect.statut_pipeline.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{prospect.entreprise} • {prospect.secteur_activite || 'Général'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`https://wa.me/${prospect.telephone.replace(/\s+/g, '')}?text=${encodeURIComponent(
              `Bonjour ${prospect.prenom || prospect.nom}, je suis Moussa de Faciloop CRM.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold shadow-md hover:bg-emerald-600 flex items-center gap-1.5"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Direct</span>
          </a>

          {prospect.statut_pipeline !== 'gagne' && (
            <button
              onClick={() => setIsConvertModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-faciloop text-white text-xs font-bold shadow-lg shadow-primary/25 hover:opacity-95 flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>Convertir en Client</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Contact Summary Card */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Informations Contact</h2>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span className="font-semibold text-foreground">{prospect.telephone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span className="font-semibold text-foreground">{prospect.email || 'Non renseigné'}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span className="font-semibold text-foreground">{prospect.ville || 'Dakar'}, {prospect.pays}</span>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-primary shrink-0" />
                <span className="font-semibold text-foreground">{prospect.entreprise}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Source:</span>
                <span className="font-bold capitalize">{prospect.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Budget Estimé:</span>
                <span className="font-bold text-emerald-500">{prospect.budget_estime ? `${prospect.budget_estime} FCFA` : 'Non défini'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Tabs Timeline / Relances */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tab Headers */}
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'timeline' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                Historique des Interactions ({prospectInteractions.length})
              </button>
              <button
                onClick={() => setActiveTab('relances')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'relances' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                Relances Planifiées ({prospectRelances.length})
              </button>
            </div>

            <button
              onClick={() => setIsInterModalOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-primary text-primary font-bold text-xs hover:bg-primary/10 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Consigner interaction</span>
            </button>
          </div>

          {/* Timeline View */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {prospectInteractions.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-border text-center text-xs text-muted-foreground">
                  Aucune interaction enregistrée pour le moment.
                </div>
              ) : (
                prospectInteractions.map((inter) => (
                  <div key={inter.id} className="p-4 rounded-2xl border border-border bg-card space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-primary capitalize">Type: {inter.type}</span>
                      <span className="text-muted-foreground">{inter.date} {inter.heure}</span>
                    </div>
                    <p className="text-xs text-foreground font-medium">{inter.commentaire}</p>
                    {inter.prochaine_action && (
                      <div className="text-[11px] font-bold text-amber-500">
                        Prochaine action: {inter.prochaine_action}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Relances View */}
          {activeTab === 'relances' && (
            <div className="space-y-3">
              {prospectRelances.map((rel) => (
                <div key={rel.id} className="p-4 rounded-2xl border border-border bg-card flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-foreground">{rel.motif || 'Relance commercial'}</div>
                    <div className="text-muted-foreground">{rel.date} à {rel.heure}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 font-bold uppercase text-[10px]">
                    {rel.statut}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
                  <option value="SaaS Enterprise">SaaS Enterprise (Sur sur-mesure)</option>
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
    </div>
  );
};
