import { useState } from 'react';
import { KeyRound, LogOut, Mail, Phone, User, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

export function ProfilPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ancien, setAncien] = useState('');
  const [nouveau, setNouveau] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPin, setShowPin] = useState(false);

  const initiales = user
    ? `${user.prenom[0]}${user.nom[0]}`.toUpperCase()
    : '?';

  const handleChangePassword = () => {
    if (nouveau.length !== 6) {
      alert('Le code secret doit contenir exactement 6 chiffres.');
      return;
    }
    if (nouveau !== confirmation) {
      alert('Les codes ne correspondent pas.');
      return;
    }
    // TODO: appel API backend
    alert('Code secret modifié avec succès.');
    setDialogOpen(false);
    setAncien('');
    setNouveau('');
    setConfirmation('');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground">Mon Profil</h2>

      {/* Avatar & Info */}
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="h-20 w-20 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-primary/30">
          {initiales}
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-foreground">
            {user?.prenom} {user?.nom}
          </h3>
          <p className="text-sm text-muted-foreground">Commercial</p>
        </div>
      </div>

      {/* Info Card */}
      <div className="rounded-2xl border border-border p-4 space-y-3">
        <div className="flex items-center gap-3">
          <User className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex-1 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Nom complet</span>
            <span className="text-sm font-medium">{user?.prenom} {user?.nom}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex-1 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Email</span>
            <span className="text-sm font-medium">{user?.email}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex-1 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Téléphone</span>
            <span className="text-sm font-medium">{user?.telephone}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex-1 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Rôle</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Commercial
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-background hover:bg-muted transition-all text-left"
        >
          <KeyRound className="h-4 w-4 text-primary" />
          <div className="flex-1">
            <span className="text-sm font-bold text-foreground">Modifier mon code secret</span>
            <p className="text-xs text-muted-foreground">Changer votre code PIN de connexion</p>
          </div>
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-red-200 dark:border-red-800/40 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 transition-all text-left"
        >
          <LogOut className="h-4 w-4 text-red-500" />
          <div className="flex-1">
            <span className="text-sm font-bold text-red-700 dark:text-red-400">Se déconnecter</span>
            <p className="text-xs text-red-600/70 dark:text-red-400/60">Fermer votre session</p>
          </div>
        </button>
      </div>

      {/* Dialog Changement code secret */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 space-y-4 shadow-2xl">
            <div className="text-center">
              <h3 className="text-base font-bold text-foreground">Modifier le code secret</h3>
              <p className="text-xs text-muted-foreground mt-1">Entrez votre ancien code puis le nouveau (6 chiffres)</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Code actuel</label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    maxLength={6}
                    value={ancien}
                    onChange={(e) => setAncien(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full h-9 text-sm font-bold text-center tracking-widest rounded-lg border border-border bg-background px-3"
                    placeholder="• • • • • •"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Nouveau code</label>
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={6}
                  value={nouveau}
                  onChange={(e) => setNouveau(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full h-9 text-sm font-bold text-center tracking-widest rounded-lg border border-border bg-background px-3"
                  placeholder="• • • • • •"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Confirmer le nouveau code</label>
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={6}
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full h-9 text-sm font-bold text-center tracking-widest rounded-lg border border-border bg-background px-3"
                  placeholder="• • • • • •"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setDialogOpen(false); setAncien(''); setNouveau(''); setConfirmation(''); }}
                className="flex-1 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted transition-all"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleChangePassword}
                className="flex-1 py-2.5 rounded-xl bg-gradient-faciloop text-white text-xs font-bold shadow-md hover:opacity-90 transition-all"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
