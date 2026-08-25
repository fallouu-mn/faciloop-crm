import { useState } from 'react';
import { KeyRound, LogOut, Mail, Phone, User, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../../components/ui/input-otp';
import { REGEXP_ONLY_DIGITS } from 'input-otp';

export function ProfilPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nouveau, setNouveau] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');

  const initiales = user
    ? `${user.prenom[0]}${user.nom[0]}`.toUpperCase()
    : '?';

  const handleChangePassword = () => {
    setError('');
    if (nouveau.length !== 6) {
      setError('Le code secret doit contenir exactement 6 chiffres.');
      return;
    }
    if (nouveau !== confirmation) {
      setError('Les codes ne correspondent pas.');
      return;
    }
    setIsPending(true);
    // TODO: appel API backend (supabase.auth.updateUser)
    setTimeout(() => {
      setIsPending(false);
      setDialogOpen(false);
      setNouveau('');
      setConfirmation('');
      setError('');
    }, 500);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setNouveau('');
    setConfirmation('');
    setShowPin(false);
    setError('');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-lg mx-auto font-sans">
      {/* Header */}

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

        {/* <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-red-200 dark:border-red-800/40 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 transition-all text-left"
        >
          <LogOut className="h-4 w-4 text-red-500" />
          <div className="flex-1">
            <span className="text-sm font-bold text-red-700 dark:text-red-400">Se déconnecter</span>
            <p className="text-xs text-red-600/70 dark:text-red-400/60">Fermer votre session</p>
          </div>
        </button> */}
      </div>

      {/* Dialog Changement code secret - style Faciloop-dev avec InputOTP */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 space-y-5 shadow-2xl">
            <div className="text-center">
              <h3 className="text-base font-bold text-foreground">Changer le code secret</h3>
              <p className="text-xs text-muted-foreground mt-1">Entrez votre nouveau code PIN (6 chiffres)</p>
            </div>

            <div className="space-y-4">
              {/* Nouveau code */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Nouveau code secret</label>
                <div className="flex items-center justify-center gap-2">
                  <InputOTP
                    maxLength={6}
                    value={nouveau}
                    onChange={setNouveau}
                    disabled={isPending}
                    pattern={REGEXP_ONLY_DIGITS}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="w-10 h-12" masked={!showPin} />
                      <InputOTPSlot index={1} className="w-10 h-12" masked={!showPin} />
                      <InputOTPSlot index={2} className="w-10 h-12" masked={!showPin} />
                      <InputOTPSlot index={3} className="w-10 h-12" masked={!showPin} />
                      <InputOTPSlot index={4} className="w-10 h-12" masked={!showPin} />
                      <InputOTPSlot index={5} className="w-10 h-12" masked={!showPin} />
                    </InputOTPGroup>
                  </InputOTP>
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="shrink-0 h-10 w-10 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  >
                    {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmation */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Confirmer le code secret</label>
                <div className="flex items-center justify-center gap-2">
                  <InputOTP
                    maxLength={6}
                    value={confirmation}
                    onChange={setConfirmation}
                    disabled={isPending}
                    pattern={REGEXP_ONLY_DIGITS}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="w-10 h-12" masked={!showPin} />
                      <InputOTPSlot index={1} className="w-10 h-12" masked={!showPin} />
                      <InputOTPSlot index={2} className="w-10 h-12" masked={!showPin} />
                      <InputOTPSlot index={3} className="w-10 h-12" masked={!showPin} />
                      <InputOTPSlot index={4} className="w-10 h-12" masked={!showPin} />
                      <InputOTPSlot index={5} className="w-10 h-12" masked={!showPin} />
                    </InputOTPGroup>
                  </InputOTP>
                  <div className="shrink-0 h-10 w-10" />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 font-semibold text-center">{error}</p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted transition-all"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={isPending || nouveau.length !== 6 || confirmation.length !== 6}
                className="flex-1 py-2.5 rounded-xl bg-gradient-faciloop text-white text-xs font-bold shadow-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Enregistrement…' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
