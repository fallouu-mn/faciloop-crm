import React, { useState } from 'react';
import { usePlatformSettings } from '../../hooks/usePlatformSettings';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { FaciloopBrand } from '../../components/common/FaciloopBrand';
import { PhoneInput } from '../../components/common/PhoneInput';
import { PinInput } from '../../components/common/PinInput';
import { LanguageToggle } from '../../components/common/LanguageToggle';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { FaciloopToast } from '../../components/common/FaciloopToast';
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
        if (session.commStatut === 'inactif') {
          setErrorMsg(isEn
            ? 'Your account has been deactivated. Please contact your manager.'
            : 'Votre compte a été désactivé. Veuillez contacter votre responsable.'
          );
        } else if (session.orgStatut === 'en_attente') {
          navigate('/pending-activation');
        } else if (session.orgStatut === 'suspendu' || session.orgStatut === 'inactif') {
          navigate('/suspended');
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
        if (session.commStatut === 'inactif') {
          setErrorMsg(isEn
            ? 'Your account has been deactivated. Please contact your manager.'
            : 'Votre compte a été désactivé. Veuillez contacter votre responsable.'
          );
        } else if (session.orgStatut === 'en_attente') {
          navigate('/pending-activation');
        } else if (session.orgStatut === 'suspendu' || session.orgStatut === 'inactif') {
          navigate('/suspended');
        } else {
          redirectByRole(session.role);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
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
      </div>

      {/* Faciloop Dev Style Bottom Floating Toast Notification */}
      <FaciloopToast message={errorMsg} onClose={() => setErrorMsg(null)} />

      {/* Floating Language Switcher Pill */}
      <div className="fixed bottom-4 right-4 z-50">
        <LanguageToggle />
      </div>
    </div>
  );
};
