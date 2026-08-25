import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, Eye, EyeOff, CheckCircle, Smartphone } from 'lucide-react';
import { FaciloopBrand } from '../../components/common/FaciloopBrand';
import { PhoneInput } from '../../components/common/PhoneInput';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../../components/ui/input-otp';
import { REGEXP_ONLY_DIGITS } from 'input-otp';

type Step = 'phone' | 'otp' | 'success';

export const ForgotPinPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSendOtp = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    if (!phone || phone.length < 9) {
      setError('Veuillez entrer un numéro de téléphone valide.');
      return;
    }
    if (cooldown > 0) return;

    setIsLoading(true);
    // TODO: appel API backend — supabase.functions.invoke('reset-pin', { body: { phone, action: 'send_otp' } })
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      setCooldown(60);
    }, 800);
  }, [phone, cooldown]);

  const handleVerifyAndReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 4) {
      setError('Veuillez saisir le code OTP à 4 chiffres.');
      return;
    }
    if (newPin.length !== 6) {
      setError('Le nouveau code secret doit contenir 6 chiffres.');
      return;
    }
    if (newPin !== confirmPin) {
      setError('Les codes ne correspondent pas.');
      return;
    }

    setIsLoading(true);
    // TODO: appel API backend — supabase.functions.invoke('reset-pin', { body: { phone, otp, newPin, action: 'verify_otp' } })
    setTimeout(() => {
      setIsLoading(false);
      // Simulate OTP validation
      if (otp === '0000') {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 3) {
          setError('Trop de tentatives. Veuillez recommencer.');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }
        setError(`Code OTP incorrect. ${3 - newAttempts} tentative(s) restante(s).`);
        return;
      }
      setStep('success');
    }, 800);
  };

  const handleNewPinChange = (value: string) => {
    setNewPin(value);
    if (value.length === 6) {
      setTimeout(() => {
        const el = document.querySelector('[data-confirm-pin]') as HTMLElement;
        el?.focus();
      }, 100);
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

          {step === 'phone' && (
            <>
              <h1 className="text-xl font-medium text-foreground">Code secret oublié ?</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Entrez votre numéro de téléphone pour recevoir un code de vérification par SMS/WhatsApp
              </p>
            </>
          )}
          {step === 'otp' && (
            <>
              <div className="flex justify-center mb-2">
                <Smartphone className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-xl font-medium text-foreground">Vérification</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Saisissez le code reçu puis définissez votre nouveau code secret
              </p>
            </>
          )}
          {step === 'success' && (
            <>
              <div className="flex justify-center mb-2">
                <CheckCircle className="h-12 w-12 text-emerald-500" />
              </div>
              <h1 className="text-xl font-medium text-emerald-600">Code modifié avec succès !</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Vous pouvez maintenant vous connecter avec votre nouveau code secret.
              </p>
            </>
          )}
        </div>

        {/* Step 1: Phone */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="px-6 pb-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Numéro de téléphone</label>
              <PhoneInput
                value={phone}
                onChange={setPhone}
                placeholder="77 123 45 67"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || cooldown > 0}
              className="w-full h-10 rounded-full bg-gradient-faciloop text-white font-semibold text-sm shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Envoyer le code de vérification'
              )}
            </button>

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à la connexion
            </Link>
          </form>
        )}

        {/* Step 2: OTP + New PIN */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyAndReset} className="px-6 pb-6 space-y-5">
            {/* OTP Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Code de vérification (4 chiffres)</label>
              <div className="flex justify-center">
                <InputOTP maxLength={4} value={otp} onChange={setOtp} disabled={isLoading} pattern={REGEXP_ONLY_DIGITS}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="w-12 h-14 text-lg" />
                    <InputOTPSlot index={1} className="w-12 h-14 text-lg" />
                    <InputOTPSlot index={2} className="w-12 h-14 text-lg" />
                    <InputOTPSlot index={3} className="w-12 h-14 text-lg" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Code envoyé au {phone}. Valable 5 minutes.
              </p>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={cooldown > 0 || isLoading}
                  className="text-xs text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
                >
                  {cooldown > 0 ? `Renvoyer dans ${cooldown}s` : 'Renvoyer le code'}
                </button>
              </div>
            </div>

            {/* New PIN */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nouveau code secret</label>
              <div className="flex items-center justify-center gap-2">
                <InputOTP maxLength={6} value={newPin} onChange={handleNewPinChange} disabled={isLoading} pattern={REGEXP_ONLY_DIGITS}>
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

            {/* Confirm PIN */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Confirmer le code secret</label>
              <div className="flex items-center justify-center gap-2">
                <InputOTP maxLength={6} value={confirmPin} onChange={setConfirmPin} disabled={isLoading} pattern={REGEXP_ONLY_DIGITS} data-confirm-pin>
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

            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || otp.length !== 4 || newPin.length !== 6 || confirmPin.length !== 6}
              className="w-full h-10 rounded-full bg-gradient-faciloop text-white font-semibold text-sm shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Réinitialiser mon code secret'
              )}
            </button>

            <button
              type="button"
              onClick={() => { setStep('phone'); setOtp(''); setAttempts(0); setError(''); }}
              className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Changer de numéro
            </button>
          </form>
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <div className="px-6 pb-6">
            <button
              onClick={() => navigate('/login')}
              className="w-full h-10 rounded-full bg-gradient-faciloop text-white font-semibold text-sm shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center"
            >
              Retourner à la connexion
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
