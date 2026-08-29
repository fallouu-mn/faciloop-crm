import React, { useState } from 'react';
import { usePlatformSettings } from '../../hooks/usePlatformSettings';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { FaciloopBrand } from '../../components/common/FaciloopBrand';
import { PhoneInput } from '../../components/common/PhoneInput';
import { PinInput } from '../../components/common/PinInput';
import { LanguageToggle } from '../../components/common/LanguageToggle';
import { useTranslation } from 'react-i18next';

export const LoginPage: React.FC = () => {
  const [phone, setPhone] = useState<string>('');
  const [codeDigits, setCodeDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [showCode, setShowCode] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const platformSettings = usePlatformSettings();

  const isEn = i18n.language?.startsWith('en');

  const supportContact = platformSettings.whatsapp_support || platformSettings.email_support || '';
  const supportMsg = supportContact ? ` — ${supportContact}` : '';

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
      setErrorMsg(isEn ? 'Please enter a valid phone number' : 'Veuillez entrer un numéro de téléphone valide');
      return;
    }

    const pin = codeDigits.join('');
    if (pin.length < 6) {
      setErrorMsg(isEn ? 'Please enter your 6-digit secret PIN code' : 'Veuillez renseigner le code secret à 6 chiffres');
      return;
    }

    setLoading(true);
    try {
      const session = await login(phone, pin);
      if (session) {
        if (session.orgStatut === 'en_attente') {
          navigate('/pending-activation');
        } else if (session.orgStatut === 'suspendu') {
          setErrorMsg(isEn ? `Your organization has been suspended. Contact support${supportMsg}.` : `Votre organisation a été suspendue. Contactez le support${supportMsg}.`);
        } else if (session.orgStatut === 'inactif') {
          setErrorMsg(isEn ? `Your organization account has been deactivated. Contact support${supportMsg}.` : `Le compte de votre organisation a été désactivé. Contactez le support${supportMsg}.`);
        } else {
          redirectByRole(session.role);
        }
      } else {
        setErrorMsg(isEn ? 'Incorrect phone number or PIN code' : 'Numéro de téléphone ou code secret incorrect');
      }
    } catch {
      setErrorMsg(isEn ? 'Connection error. Please try again.' : 'Erreur de connexion. Veuillez réessayer.');
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
        if (session.orgStatut === 'en_attente') {
          navigate('/pending-activation');
        } else if (session.orgStatut === 'suspendu') {
          setErrorMsg(`Organisation suspendue${supportMsg}.`);
        } else if (session.orgStatut === 'inactif') {
          setErrorMsg(`Compte organisation désactivé${supportMsg}.`);
        } else {
          redirectByRole(session.role);
        }
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
          <h1 className="text-xl font-medium text-foreground">{isEn ? 'Log in to your account' : 'Connectez-vous'}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isEn ? 'Manage your prospects and sales activity simply' : 'Gérez vos clients et votre activité simplement'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 space-y-5">
          {/* Phone */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{isEn ? 'Phone Number' : 'Téléphone'}</label>
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
            label={isEn ? 'Secret PIN code (6 digits)' : 'Code secret (6 chiffres)'}
          />

          <p className="text-center">
            <Link
              to="/forgot-pin"
              className="text-xs text-muted-foreground hover:underline hover:text-primary transition-colors"
            >
              {isEn ? 'Forgot secret PIN code?' : 'Code secret oublié ?'}
            </Link>
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
              {isEn ? 'Remember me' : 'Se souvenir de moi'}
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
              isEn ? 'Log in' : 'Se connecter'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 text-center">
          <p className="text-sm text-muted-foreground">
            {isEn ? "Don't have an account yet?" : "Pas encore de compte ?"}{' '}
            <Link to="/signup" className="text-primary hover:underline">
              {isEn ? 'Create an account' : 'Créer un compte'}
            </Link>
          </p>
        </div>

        {/* Quick Demo */}
        {/* <div className="border-t border-border mx-6 px-0 pb-6 pt-4">
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
        </div> */}
      </div>

      {/* Floating Language Switcher Pill (Matching Screenshot Bottom Right) */}
      <div className="fixed bottom-4 right-4 z-50">
        <LanguageToggle />
      </div>
    </div>
  );
};
