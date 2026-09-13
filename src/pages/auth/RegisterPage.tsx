import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { FaciloopBrand } from '../../components/common/FaciloopBrand';
import { PhoneInput } from '../../components/common/PhoneInput';
import { PinInput } from '../../components/common/PinInput';
import { LanguageToggle } from '../../components/common/LanguageToggle';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { FaciloopToast } from '../../components/common/FaciloopToast';
import { TermsContent } from '../public/TermsPage';
import { PrivacyContent } from '../public/PrivacyPage';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const isEn = i18n.language?.startsWith('en');

  const [prenom, setPrenom] = useState<string>('');
  const [nom, setNom] = useState<string>('');
  const [entreprise, setEntreprise] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [showParrainage, setShowParrainage] = useState<boolean>(false);
  const [codeParrainage, setCodeParrainage] = useState<string>('');
  const [codeDigits, setCodeDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [confirmDigits, setConfirmDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [showCode, setShowCode] = useState<boolean>(false);
  const [showConfirmCode, setShowConfirmCode] = useState<boolean>(false);
  const [acceptTerms, setAcceptTerms] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null);

  const pin = codeDigits.join('');
  const confirmPin = confirmDigits.join('');
  const pinsMatch = pin.length === 6 && confirmPin.length === 6 && pin === confirmPin;
  const pinsMismatch = pin.length === 6 && confirmPin.length === 6 && pin !== confirmPin;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!prenom.trim() || !nom.trim()) {
      setErrorMsg(isEn ? 'Please enter your first and last name' : 'Veuillez renseigner votre prénom et votre nom');
      return;
    }

    if (!entreprise.trim()) {
      setErrorMsg(isEn ? 'Company name is required' : "Le nom de votre entreprise est indispensable");
      return;
    }

    if (!phone || phone.length < 9) {
      setErrorMsg(isEn ? 'Please enter a valid phone number' : 'Veuillez entrer un numéro de téléphone valide');
      return;
    }

    if (pin.length < 6) {
      setErrorMsg(isEn ? 'PIN code must contain exactly 6 digits' : 'Le code secret doit comporter exactement 6 chiffres');
      return;
    }

    if (pin !== confirmPin) {
      setErrorMsg(isEn ? 'The two PIN codes do not match' : 'Les deux codes secrets ne correspondent pas');
      return;
    }

    if (!acceptTerms) {
      setErrorMsg(isEn ? 'Please accept the Terms of Service' : "Veuillez accepter les Conditions Générales d'Utilisation");
      return;
    }

    setLoading(true);

    try {
      const cleanPhone = phone.replace(/\s+/g, '');

      // Appeler l'Edge Function register-user si une URL Supabase valide est configurée
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      let response: Response | null = null;
      let result: any = null;

      if (supabaseUrl && !supabaseUrl.includes('placeholder') && !supabaseUrl.includes('faciloop-crm.supabase.co')) {
        try {
          response = await fetch(`${supabaseUrl}/functions/v1/register-user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': anonKey || '',
            },
            body: JSON.stringify({
              telephone: cleanPhone,
              pin,
              nom_org: entreprise.trim(),
              prenom: prenom.trim(),
              nom: nom.trim(),
            }),
          });
          if (response) {
            result = await response.json().catch(() => null);
          }
        } catch (fetchErr) {
          console.warn('Edge Function indisponible ou hors-ligne, mode inscription locale activé:', fetchErr);
        }
      }

      if (response && !response.ok) {
        if (response.status === 409) {
          setErrorMsg(isEn ? 'This phone number is already registered' : 'Ce numéro de téléphone est déjà enregistré');
        } else {
          setErrorMsg(result?.error || (isEn ? 'Registration failed. Please try again.' : "L'inscription a échoué. Veuillez réessayer."));
        }
        setLoading(false);
        return;
      }

      // Sauvegarder pour la page pending-activation
      const registrationData = {
        prenom,
        nom,
        entreprise,
        telephone: phone,
        registeredAt: new Date().toISOString(),
      };
      localStorage.setItem('faciloop_pending_registration', JSON.stringify(registrationData));

      navigate('/pending-activation', { state: registrationData });
    } catch (err) {
      console.error('Registration error:', err);
      setErrorMsg(isEn ? 'An unexpected error occurred' : 'Une erreur inattendue est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans relative">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-sm my-6">
        {/* Header */}
        <div className="text-center px-6 pt-6 pb-4">
          <div className="flex justify-center mb-4">
            <FaciloopBrand className="h-12 w-auto" />
          </div>
          <h1 className="text-xl font-medium text-foreground">
            {isEn ? 'Create your account' : 'Créer votre compte'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isEn ? 'Sign up and manage your sales activity easily' : 'Inscrivez-vous et gérez votre activité simplement'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 space-y-4">
          {/* Prénom / Nom */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {isEn ? 'First Name *' : 'Prénom *'}
              </label>
              <input
                type="text"
                required
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Kira"
                disabled={loading}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none disabled:opacity-50 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {isEn ? 'Last Name *' : 'Nom *'}
              </label>
              <input
                type="text"
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Dupont"
                disabled={loading}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none disabled:opacity-50 transition-all"
              />
            </div>
          </div>

          {/* Entreprise */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              {isEn ? 'Company Name *' : 'Nom de votre entreprise *'}
            </label>
            <input
              type="text"
              required
              value={entreprise}
              onChange={(e) => setEntreprise(e.target.value)}
              placeholder={isEn ? "E.g.: Salon Aminata, Boutique Diallo..." : "Ex : Salon Aminata, Boutique Diallo..."}
              disabled={loading}
              className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none disabled:opacity-50 transition-all"
            />
            <p className="text-xs text-muted-foreground">
              {isEn ? 'Required to access subscription plans' : 'Indispensable pour accéder aux abonnements'}
            </p>
          </div>

          {/* Téléphone */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              {isEn ? 'Phone Number *' : 'Téléphone *'}
            </label>
            <PhoneInput
              value={phone}
              onChange={setPhone}
              placeholder="77 123 45 67"
              disabled={loading}
            />
          </div>

          {/* Code parrainage */}
          {/* <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowParrainage(!showParrainage)}
              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <Gift className="h-4 w-4" />
              <span>{isEn ? 'Do you have a referral code?' : 'Vous avez un code de parrainage ?'}</span>
              {showParrainage ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {showParrainage && (
              <input
                type="text"
                value={codeParrainage}
                onChange={(e) => setCodeParrainage(e.target.value.toUpperCase())}
                placeholder="Ex : ABC123"
                disabled={loading}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm uppercase focus:outline-none focus:ring-2 focus:ring-ring text-foreground disabled:opacity-50"
              />
            )}
          </div> */}

          {/* Code secret */}
          <PinInput
            value={codeDigits}
            onChange={setCodeDigits}
            showPin={showCode}
            onToggleShow={() => setShowCode(!showCode)}
            disabled={loading}
            label={isEn ? 'Secret PIN code (6 digits) *' : 'Code secret (6 chiffres) *'}
          />
          <p className="text-xs text-muted-foreground text-center -mt-1">
            {isEn ? 'This code will be used to log into your account' : 'Ce code vous servira à vous connecter'}
          </p>

          {/* Confirmation code */}
          <div className="space-y-2">
              <PinInput
                value={confirmDigits}
                onChange={setConfirmDigits}
                showPin={showConfirmCode}
                onToggleShow={() => setShowConfirmCode(!showConfirmCode)}
                disabled={loading}
                label={isEn ? 'Confirm PIN code *' : 'Confirmez le code *'}
              />
            <div className="flex items-center justify-center gap-1.5">
              {pinsMatch && (
                <span className="flex items-center gap-1 text-xs text-emerald-600">
                  <CheckCircle className="h-3.5 w-3.5" /> {isEn ? 'PIN codes match' : 'Codes identiques'}
                </span>
              )}
              {pinsMismatch && (
                <span className="flex items-center gap-1 text-xs text-destructive">
                  <XCircle className="h-3.5 w-3.5" /> {isEn ? 'PIN codes do not match' : 'Les codes ne correspondent pas'}
                </span>
              )}
            </div>
          </div>

          {/* CGU */}
          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="acceptTerms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              disabled={loading}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary accent-primary cursor-pointer mt-0.5"
            />
            <label htmlFor="acceptTerms" className="text-xs text-muted-foreground cursor-pointer leading-relaxed">
              {isEn ? 'I accept the ' : "J'accepte les "}
              <button type="button" onClick={() => setLegalModal('terms')} className="text-primary hover:underline">{isEn ? 'Terms of Service' : 'Conditions Générales'}</button>
              {isEn ? ' and the ' : ' et la '}
              <button type="button" onClick={() => setLegalModal('privacy')} className="text-primary hover:underline">{isEn ? 'Privacy Policy' : 'Politique de Confidentialité'}</button>.
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
              <>
                <span>{isEn ? 'Sign Up and Continue' : "S'inscrire et continuer"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 text-center">
          <p className="text-sm text-muted-foreground">
            {isEn ? 'Already have an account? ' : 'Déjà un compte ? '}
            <Link to="/login" className="text-primary hover:underline">
              {isEn ? 'Log in' : 'Se connecter'}
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

      {/* Legal Modal — same layout as Faciloop-dev LegalDialog */}
      {legalModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setLegalModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="pointer-events-auto relative w-[95vw] max-w-2xl max-h-[85vh] border bg-background shadow-lg sm:rounded-lg flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 pt-6 pb-3 border-b border-border shrink-0 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  {legalModal === 'terms' ? t('legal:terms.title') : t('legal:privacy.title')}
                </h2>
                <button type="button" onClick={() => setLegalModal(null)} className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="max-h-[calc(85vh-80px)] overflow-y-auto px-6 py-4">
                {legalModal === 'terms' ? (
                  <TermsContent embedded />
                ) : (
                  <PrivacyContent embedded />
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
