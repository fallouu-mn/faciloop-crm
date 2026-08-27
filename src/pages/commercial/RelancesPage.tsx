import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, CheckCircle2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const RelancesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, myRelances, myProspects, addRelance, completeRelance } = useAuth();
  const [filterStatut, setFilterStatut] = useState<string>('all');

  const isEn = i18n.language?.startsWith('en');

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [prospectId, setProspectId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [heure, setHeure] = useState<string>('09:30');
  const [canal, setCanal] = useState<any>('whatsapp');
  const [motif, setMotif] = useState<string>('Relance de courtoisie');
  const [commentaire, setCommentaire] = useState<string>('');

  const filtered = myRelances.filter(r => filterStatut === 'all' || r.statut === filterStatut);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const p = myProspects.find(item => item.id === prospectId) || myProspects[0];
    addRelance({
      prospect_id: p.id,
      prospect_nom: `${p.prenom || ''} ${p.nom}`.trim(),
      prospect_entreprise: p.entreprise,
      date,
      heure,
      canal,
      motif,
      commentaire,
      statut: 'prevue'
    });
    setIsModalOpen(false);
  };

  const getTabLabel = (st: string) => {
    if (!isEn) {
      if (st === 'all') return 'Toutes les relances';
      if (st === 'prevue') return 'Prévue';
      if (st === 'en_retard') return 'En Retard';
      if (st === 'realisee') return 'Réalisée';
      return st;
    }
    if (st === 'all') return 'All Follow-ups';
    if (st === 'prevue') return 'Scheduled';
    if (st === 'en_retard') return 'Overdue';
    if (st === 'realisee') return 'Completed';
    return st;
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {isEn ? 'Daily Follow-ups Tracking' : 'Suivi des Relances Quotidiennes'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
            {isEn ? 'Never miss an opportunity to engage with your prospects' : "Ne laissez passer aucune opportunité d'échange avec vos prospects"}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-faciloop px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-primary/25 hover:opacity-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>{isEn ? '+ Schedule a Follow-up' : 'Programmer une relance'}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex rounded-xl bg-muted p-1 text-xs font-bold w-fit">
        {['all', 'prevue', 'en_retard', 'realisee'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatut(st)}
            className={`px-4 py-2 rounded-lg font-extrabold transition-all ${
              filterStatut === st ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            {getTabLabel(st)}
          </button>
        ))}
      </div>

      {/* Relances List Grid */}
      <div className="space-y-3">
        {filtered.map((relance) => (
          <div
            key={relance.id}
            className={`p-4 rounded-2xl border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              relance.statut === 'en_retard' ? 'border-rose-500/50 bg-rose-500/5' : 'border-border'
            }`}
          >
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-foreground">{relance.prospect_nom}</span>
                <span className="text-muted-foreground">({relance.prospect_entreprise})</span>
              </div>
              <p className="text-muted-foreground font-medium">{relance.commentaire || relance.motif}</p>
              <div className="flex items-center gap-4 text-[10px] font-semibold text-muted-foreground">
                <span>Date: {relance.date} {isEn ? 'at' : 'à'} {relance.heure}</span>
                <span className="capitalize">Channel: {relance.canal}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {relance.statut !== 'realisee' && (
                <button
                  onClick={() => completeRelance(relance.id)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow hover:bg-emerald-600 flex items-center gap-1 transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Mark completed' : 'Marquer effectuée'}</span>
                </button>
              )}
              <Link
                to={`/app/prospects/${relance.prospect_id}`}
                className="px-3 py-1.5 rounded-xl border text-xs font-bold text-foreground hover:bg-muted transition-all"
              >
                {isEn ? 'View prospect' : 'Voir prospect'}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Schedule Relance */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {isEn ? 'Schedule a Follow-up' : 'Programmer une Relance'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">
                  {isEn ? 'Prospect to follow-up' : 'Prospect à relancer'}
                </label>
                <select
                  required
                  value={prospectId}
                  onChange={(e) => setProspectId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="">{isEn ? 'Select a prospect' : 'Sélectionner un prospect'}</option>
                  {myProspects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.prenom} {p.nom} - {p.entreprise}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">{isEn ? 'Date' : 'Date'}</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">{isEn ? 'Time' : 'Heure'}</label>
                  <input
                    type="time"
                    required
                    value={heure}
                    onChange={(e) => setHeure(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">{isEn ? 'Follow-up channel' : 'Canal de relance'}</label>
                <select
                  value={canal}
                  onChange={(e) => setCanal(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="appel">{isEn ? 'Phone Call' : 'Appel Téléphonique'}</option>
                  <option value="email">Email</option>
                  <option value="visite">{isEn ? 'Visit' : 'Visite'}</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">{isEn ? 'Reason / Comment' : 'Motif / Commentaire'}</label>
                <input
                  type="text"
                  required
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  placeholder={isEn ? "Ex: Confirm meeting next week" : "Ex: Confirmer la prise de RDV pour la semaine prochaine"}
                  className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-faciloop text-white font-bold shadow-md hover:opacity-95 transition-all"
              >
                {isEn ? 'Confirm Follow-up' : 'Valider la relance'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
