import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, AlertCircle, Phone, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export const LoginPage: React.FC = () => {
  const [telephone, setTelephone] = useState<string>('77 123 45 67');
  const [codeSecret, setCodeSecret] = useState<string>('1234');
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

    if (!telephone || telephone.length < 6) {
      setErrorMsg('Veuillez entrer un numéro de téléphone valide');
      return;
    }

    if (!codeSecret || codeSecret.length < 4) {
      setErrorMsg('Le code secret doit comporter au moins 4 chiffres');
      return;
    }

    setLoading(true);
    try {
      const session = await login(telephone, codeSecret);
      if (session) {
        redirectByRole(session.role);
      } else {
        setErrorMsg('Numéro de téléphone ou code secret incorrect');
      }
    } catch (err) {
      setErrorMsg('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Quick demo presets
  const handleQuickPreset = async (phone: string, pin: string) => {
    setTelephone(phone);
    setCodeSecret(pin);
    setLoading(true);
    try {
      const session = await login(phone, pin);
      if (session) {
        redirectByRole(session.role);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-3 sm:p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Blur Gradients */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-60 sm:w-80 h-60 sm:h-80 bg-accent/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Responsive Login Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-card border border-border/80 rounded-3xl p-5 sm:p-8 shadow-xl sm:shadow-2xl z-10 relative"
      >
        {/* Faciloop Header Logo & Title */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-faciloop flex items-center justify-center text-white shadow-lg">
              <span className="text-xl sm:text-2xl font-black">F</span>
            </div>
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-gradient-faciloop">faciloop</span>
          </div>

          <h1 className="text-lg sm:text-2xl font-extrabold text-foreground mt-1 sm:mt-2">Connectez-vous</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 max-w-xs">
            Et gérez vos clients et votre activité simplement
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-4 sm:space-y-5">
          {/* Phone Field with Perfectly Aligned Indicator */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Téléphone</label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2.5 sm:px-3 py-3 rounded-xl border border-input bg-muted/50 text-xs font-bold text-foreground shrink-0">
                <span className="text-sm sm:text-base">🇸🇳</span>
                <span>+221</span>
              </div>
              <div className="relative flex-1">
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="77 123 45 67"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
                />
                <Phone className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
              </div>
            </div>
          </div>

          {/* Secret Code Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-foreground">Code secret</label>
              <button
                type="button"
                onClick={() => setErrorMsg('Veuillez contacter votre administrateur Faciloop pour réinitialiser votre code.')}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Code secret oublié ?
              </button>
            </div>
            <div className="relative">
              <input
                type={showCode ? 'text' : 'password'}
                value={codeSecret}
                onChange={(e) => setCodeSecret(e.target.value)}
                placeholder="• • • •"
                maxLength={8}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-input bg-background text-sm font-medium tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
              />
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground"
              >
                {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-input text-primary focus:ring-primary accent-primary cursor-pointer"
            />
            <label htmlFor="remember" className="text-xs font-medium text-muted-foreground cursor-pointer">
              Se souvenir de moi
            </label>
          </div>

          {/* Full-width Imposing Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-faciloop text-white font-extrabold text-sm shadow-lg shadow-primary/25 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-5 sm:mt-6 text-center text-xs text-muted-foreground font-medium">
          Pas encore de compte ?{' '}
          <Link to="/" className="font-bold text-primary hover:underline">
            Découvrir Faciloop SaaS
          </Link>
        </div>

        {/* Quick Demo Presets Bar */}
        <div className="mt-5 pt-4 border-t border-border/60">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground text-center mb-2">
            Accès Rapide Démo
          </p>
          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
            <button
              onClick={() => handleQuickPreset('+221771234567', '1234')}
              className="px-2 py-2 rounded-xl border border-border/80 bg-muted/50 font-bold hover:border-primary active:scale-95 text-foreground transition-all truncate"
            >
              Commercial
            </button>
            <button
              onClick={() => handleQuickPreset('+221789998877', '1111')}
              className="px-2 py-2 rounded-xl border border-border/80 bg-muted/50 font-bold hover:border-primary active:scale-95 text-foreground transition-all truncate"
            >
              Admin Org
            </button>
            <button
              onClick={() => handleQuickPreset('+221770000000', '0000')}
              className="px-2 py-2 rounded-xl border border-border/80 bg-muted/50 font-bold hover:border-primary active:scale-95 text-foreground transition-all truncate"
            >
              Super-Admin
            </button>
          </div>
        </div>
      </motion.div>

      {/* Error Toast Banner */}
      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-faciloop text-white shadow-2xl text-xs font-bold max-w-xs sm:max-w-sm"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </motion.div>
      )}
    </div>
  );
};
