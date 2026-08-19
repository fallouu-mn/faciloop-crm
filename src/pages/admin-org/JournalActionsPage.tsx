import React from 'react';
import { mockActionLogs } from '../../lib/mockData';
import { History, Shield } from 'lucide-react';

export const JournalActionsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Journal des Actions Sensibles (Audit Log)
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Historique chronologique des modifications et opérations critiques effectuées par l'équipe
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-muted/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-4">Date & Heure</th>
              <th className="p-4">Utilisateur</th>
              <th className="p-4">Action</th>
              <th className="p-4">Cible</th>
              <th className="p-4">Ancienne Valeur</th>
              <th className="p-4">Nouvelle Valeur</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockActionLogs.map((log) => (
              <tr key={log.id} className="hover:bg-muted/30">
                <td className="p-4 text-muted-foreground">{log.date} à {log.heure}</td>
                <td className="p-4 font-bold text-foreground">{log.utilisateur_nom}</td>
                <td className="p-4 font-semibold text-primary">{log.action}</td>
                <td className="p-4 font-medium text-foreground">{log.cible}</td>
                <td className="p-4 text-muted-foreground">{log.ancienne_valeur || '-'}</td>
                <td className="p-4 font-bold text-emerald-500">{log.nouvelle_valeur || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
