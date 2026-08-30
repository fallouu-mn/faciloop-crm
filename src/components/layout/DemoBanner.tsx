import React from 'react';
import { FlaskConical } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DemoBanner: React.FC = () => (
  <div className="w-full bg-amber-500/90 backdrop-blur-sm text-amber-950 text-xs font-extrabold flex items-center justify-between px-4 py-2 border-b border-amber-600/40 shrink-0">
    <div className="flex items-center gap-2">
      <FlaskConical className="w-3.5 h-3.5 shrink-0" />
      <span className="hidden sm:inline">Mode Démo — Données fictives · Aucune modification n'est enregistrée</span>
      <span className="sm:hidden">Mode Démo — Données fictives</span>
    </div>
    <Link
      to="/signup"
      className="ml-4 shrink-0 px-3 py-1 rounded-full bg-amber-950 text-amber-100 text-[11px] font-black hover:bg-amber-900 transition-colors whitespace-nowrap"
    >
      Créer mon compte →
    </Link>
  </div>
);
