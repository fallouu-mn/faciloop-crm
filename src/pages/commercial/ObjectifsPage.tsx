import React from 'react';
import { mockObjectifs } from '../../lib/mockData';
import { Target, CheckCircle2, TrendingUp } from 'lucide-react';

export const ObjectifsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Mes Objectifs Commerciaux
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Suivez l'avancement de vos cibles mensuelles et trimestrielles
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockObjectifs.map((obj) => {
          const percent = Math.min(100, Math.round((obj.valeur_actuelle / obj.valeur_cible) * 100));

          return (
            <div key={obj.id} className="p-5 rounded-2xl border border-border bg-card space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Période: {obj.periode}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  obj.statut === 'depasse' || obj.statut === 'atteint' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'
                }`}>
                  {obj.statut}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-foreground capitalize">Objectif {obj.type.replace('_', ' ')}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Cible: {obj.type === 'ca' ? `${obj.valeur_cible.toLocaleString()} FCFA` : obj.valeur_cible}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span>Progression</span>
                  <span>{percent}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${percent >= 100 ? 'bg-emerald-500' : 'bg-gradient-faciloop'}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Actuel: {obj.type === 'ca' ? `${obj.valeur_actuelle.toLocaleString()} FCFA` : obj.valeur_actuelle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
