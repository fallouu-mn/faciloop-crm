import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { FaciloopBrand } from '../../components/common/FaciloopBrand';
import { PhoneInput } from '../../components/common/PhoneInput';
import { PinInput } from '../../components/common/PinInput';

export const LoginPage: React.FC = () => {
  const [phone, setPhone] = useState<string>('');
  const [codeDigits, setCodeDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [showCode, setShowCode] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const redirectByRole = (role: string) => {
    if (role === 'super_admin') {
      navigate('/super-admin/dashboard');
    } else if (role === 'admin_org') {
      navigate('/admin/dashboard');
    } else {
      navigate('/app/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!phone || phone.length < 9) {
      setErrorMsg('Veuillez entrer un numéro de téléphone valide');
      return;
    }

    const pin = codeDigits.join('');
    if (pin.length < 6) {
      setErrorMsg('Veuillez renseigner le code secret à 6 chiffres');
      return;
    }

    setLoading(true);
    try {
      const session = await login(phone, pin);
      if (session) {
        redirectByRole(session.role);
      } else {
        setErrorMsg('Numéro de téléphone ou code secret incorrect');
      }
    } catch {
      setErrorMsg('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPreset = async (phoneVal: string, pin: string) => {
    setPhone(phoneVal);
    setCodeDigits(pin.split(''));
    setLoading(true);
    try {
      const session = await login(phoneVal, pin);
      if (session) {
        redirectByRole(session.role);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-sm">
        {/* Header */}
        <div className="text-center px-6 pt-6 pb-4">
          <div className="flex justify-center mb-4">
            <FaciloopBrand className="h-12 w-auto" />
          </div>
          <h1 className="text-xl font-medium text-foreground">Connectez-vous</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez vos clients et votre activité simplement
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 space-y-5">
          {/* Phone */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Téléphone</label>
            <PhoneInput
              value={phone}
              onChange={setPhone}
              placeholder="77 123 45 67"
              disabled={loading}
            />
          </div>

          {/* PIN */}
          <PinInput
            value={codeDigits}
            onChange={setCodeDigits}
            showPin={showCode}
            onToggleShow={() => setShowCode(!showCode)}
            disabled={loading}
            label="Code secret (6 chiffres)"
          />

          <p className="text-center">
            <button
              type="button"
              onClick={() => setErrorMsg('Veuillez contacter votre administrateur Faciloop pour réinitialiser votre code.')}
              className="text-xs text-muted-foreground hover:underline"
            >
              Code secret oublié ?
            </button>
          </p>

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary accent-primary cursor-pointer"
            />
            <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
              Se souvenir de moi
            </label>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              {errorMsg}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-full bg-gradient-faciloop text-white font-semibold text-sm shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 text-center">
          <p className="text-sm text-muted-foreground">
            Pas encore de compte ?{' '}
            <Link to="/signup" className="text-primary hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>

        {/* Quick Demo */}
        <div className="border-t border-border mx-6 px-0 pb-6 pt-4">
          <p className="text-xs font-medium text-muted-foreground text-center mb-2">
            Accès Rapide Démo
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickPreset('221771234567', '123456')}
              className="px-2 py-2 rounded-full border border-border font-medium hover:bg-muted text-foreground transition-colors"
            >
              Commercial
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('221789998877', '111111')}
              className="px-2 py-2 rounded-full border border-border font-medium hover:bg-muted text-foreground transition-colors"
            >
              Admin Org
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('221770000000', '000000')}
              className="px-2 py-2 rounded-full border border-border font-medium hover:bg-muted text-foreground transition-colors"
            >
              Super-Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
