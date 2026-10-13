import React, { useState } from 'react';
import { KeyRound, Eye, EyeOff, CheckCircle2, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useTranslation } from 'react-i18next';

/**
 * Composant réutilisable — Changement de code PIN (6 chiffres)
 * Utilisable par les rôles : commercial, admin_org, super_admin
 */
export const PinChangeSection: React.FC = () => {
  const { t } = useTranslation('common');

  const [nouveau, setNouveau] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setNouveau('');
    setConfirmation('');
    setShowPin(false);
    setError('');
    setSuccess(false);
  };

  const handleSave = async () => {
    setError('');
    setSuccess(false);

    if (nouveau.length !== 6) {
      setError(t('pinChange.errors.pinLength'));
      return;
    }
    if (nouveau !== confirmation) {
      setError(t('pinChange.errors.mismatch'));
      return;
    }

    setIsPending(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: nouveau });
      if (updateError) {
        setError(t('pinChange.errors.update', { message: updateError.message }));
        toast.error(updateError.message);
        return;
      }
      setSuccess(true);
      toast.success(t('pinChange.updated'));
      setTimeout(reset, 2000);
    } catch {
      setError(t('pinChange.errors.unexpected'));
    } finally {
      setIsPending(false);
    }
  };

  const isValid = nouveau.length === 6 && confirmation.length === 6;

  return (
    <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
      {/* Section header */}
      <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-primary" />
        {t('pinChange.title')}
      </h2>
      <p className="text-xs text-muted-foreground -mt-2">
        {t('pinChange.hint')}
      </p>

      {/* New PIN */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-foreground">
          {t('pinChange.newPin')}
        </label>
        <div className="flex items-center gap-3">
          <InputOTP
            maxLength={6}
            value={nouveau}
            onChange={setNouveau}
            disabled={isPending}
            pattern={REGEXP_ONLY_DIGITS}
          >
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} className="w-10 h-12" masked={!showPin} />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <button
            type="button"
            onClick={() => setShowPin((v) => !v)}
            className="shrink-0 h-10 w-10 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            title={t('pinChange.visibility')}
          >
            {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Confirm PIN */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-foreground">
          {t('pinChange.confirmPin')}
        </label>
        <div className="flex items-center gap-3">
          <InputOTP
            maxLength={6}
            value={confirmation}
            onChange={setConfirmation}
            disabled={isPending}
            pattern={REGEXP_ONLY_DIGITS}
          >
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} className="w-10 h-12" masked={!showPin} />
              ))}
            </InputOTPGroup>
          </InputOTP>
          {/* spacer to align with toggle above */}
          <div className="shrink-0 h-10 w-10" />
        </div>
      </div>

      {/* Inline feedback */}
      {error && (
        <p className="text-xs text-red-500 font-semibold">{error}</p>
      )}
      {success && (
        <div className="flex items-center gap-2 text-emerald-600">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <p className="text-xs font-semibold">
            {t('pinChange.updated')}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={reset}
          disabled={isPending || (!nouveau && !confirmation)}
          className="flex-1 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t('pinChange.clear')}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || !isValid}
          className="flex-1 py-2.5 rounded-xl bg-gradient-faciloop text-white text-xs font-bold shadow-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              {t('pinChange.saving')}
            </>
          ) : (
            <>
              <KeyRound className="h-3.5 w-3.5" />
              {t('pinChange.update')}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
