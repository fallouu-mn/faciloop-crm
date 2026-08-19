import React from 'react';
import { mockActionLogs } from '../../lib/mockData';
import { History, Shield, Clock, UserCheck, Activity, ArrowRight } from 'lucide-react';

export const JournalActionsPage: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
          Journal des Actions Sensibles (Audit Log)
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Historique chronologique des modifications et opérations critiques effectuées par l'équipe
        </p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-sm">
        <table className="w-full text-left text-xs min-w-[700px]">
          <thead className="border-b border-border/80 bg-muted/60 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-4">Date & Heure</th>
              <th className="p-4">Utilisateur</th>
              <th className="p-4">Action</th>
              <th className="p-4">Cible</th>
              <th className="p-4">Ancienne Valeur</th>
              <th className="p-4">Nouvelle Valeur</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-[11px]">
            {mockActionLogs.map((log) => (
              <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                <td className="p-4 text-muted-foreground font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{log.date} à {log.heure}</span>
                </td>
                <td className="p-4 font-extrabold text-foreground">{log.utilisateur_nom}</td>
                <td className="p-4 font-bold text-primary">{log.action}</td>
                <td className="p-4 font-medium text-foreground">{log.cible}</td>
                <td className="p-4 text-muted-foreground font-medium">{log.ancienne_valeur || '-'}</td>
                <td className="p-4 font-extrabold text-emerald-500">{log.nouvelle_valeur || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards View (Solves Screenshot 2) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {mockActionLogs.map((log) => (
          <div key={log.id} className="p-4 rounded-2xl border border-border/80 bg-card space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-primary flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                <span>{log.action}</span>
              </span>
              <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {log.date} à {log.heure}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
              <span className="font-semibold text-muted-foreground">Exécuté par :</span>
              <span className="font-extrabold text-foreground">{log.utilisateur_nom}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-muted-foreground">Élément cible :</span>
              <span className="font-bold text-foreground">{log.cible}</span>
            </div>

            {(log.ancienne_valeur || log.nouvelle_valeur) && (
              <div className="p-2.5 rounded-xl bg-muted/50 text-[11px] font-medium flex items-center justify-between gap-2 border border-border/40">
                <span className="text-muted-foreground line-through">{log.ancienne_valeur || 'Non défini'}</span>
                <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="font-bold text-emerald-500">{log.nouvelle_valeur || 'Modifié'}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
