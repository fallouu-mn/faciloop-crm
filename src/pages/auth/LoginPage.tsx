import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, AlertCircle, Phone, Lock, ChevronDown, ArrowLeft, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export const LoginPage: React.FC = () => {
  const [telephone, setTelephone] = useState<string>('77 123 45 67');
  const [codeSecret, setCodeSecret] = useState<string>('123456');
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
      setErrorMsg('Le code secret doit comporter 6 chiffres');
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-3 sm:p-4 relative overflow-hidden font-sans selection:bg-primary/20 selection:text-primary">
      {/* Background Decorative Blur Gradients */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-60 sm:w-80 h-60 sm:h-80 bg-accent/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top-Left Professional Back to Home Button */}
      <Link
        to="/"
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-30 inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl border border-border/80 bg-card/85 backdrop-blur-xl text-xs font-extrabold text-foreground shadow-lg hover:bg-muted active:scale-95 transition-all group"
        title="Retourner à la page d'accueil Faciloop"
      >
        <ArrowLeft className="w-4 h-4 text-primary group-hover:-translate-x-1 transition-transform" />
        <span>Accueil</span>
      </Link>

      {/* Main Responsive Login Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-card border border-border/80 rounded-3xl p-5 sm:p-8 shadow-xl sm:shadow-2xl z-10 relative mt-10 sm:mt-0"
      >
        {/* Faciloop Header Logo & Title */}
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="flex items-center gap-2 mb-2 sm:mb-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-faciloop flex items-center justify-center text-white shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform">
              <span className="text-xl sm:text-2xl font-black">F</span>
            </div>
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-gradient-faciloop">faciloop</span>
          </Link>

          <h1 className="text-lg sm:text-2xl font-black text-foreground mt-1">Connectez-vous</h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-semibold mt-0.5 max-w-xs">
            Et gérez vos clients et votre activité simplement
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-4 text-xs font-sans">
          {/* Phone Field with Perfectly Aligned Senegal Indicator */}
          <div>
            <label className="block text-xs font-extrabold text-foreground mb-1.5">Téléphone *</label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-3 rounded-2xl border border-input bg-muted/60 text-xs font-extrabold text-foreground shrink-0">
                <span className="text-base">🇸🇳</span>
                <span>+221</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-0.5" />
              </div>
              <div className="relative flex-1">
                <input
                  type="tel"
                  required
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="77 123 45 67"
                  className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
                />
                <Phone className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
              </div>
            </div>
          </div>

          {/* Secret Code Field (6 Digits Format) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-extrabold text-foreground">Code secret (6 chiffres) *</label>
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
                placeholder="• • • • • •"
                maxLength={6}
                className="w-full pl-10 pr-10 py-3 rounded-2xl border border-input bg-background text-sm font-black tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
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
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-faciloop text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-primary/25 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Se connecter</span>
            )}
          </button>
        </form>

        {/* Link to Registration Page */}
        <div className="mt-5 text-center text-xs text-muted-foreground font-semibold">
          Pas encore de compte ?{' '}
          <Link to="/register" className="font-extrabold text-primary hover:underline">
            S'inscrire en 1 min
          </Link>
        </div>

        {/* Quick Demo Presets Bar */}
        <div className="mt-5 pt-4 border-t border-border/60">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground text-center mb-2">
            Accès Rapide Démo
          </p>
          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
            <button
              onClick={() => handleQuickPreset('+221771234567', '123456')}
              className="px-2 py-2 rounded-xl border border-border/80 bg-muted/50 font-extrabold hover:border-primary active:scale-95 text-foreground transition-all truncate"
            >
              Commercial
            </button>
            <button
              onClick={() => handleQuickPreset('+221789998877', '111111')}
              className="px-2 py-2 rounded-xl border border-border/80 bg-muted/50 font-extrabold hover:border-primary active:scale-95 text-foreground transition-all truncate"
            >
              Admin Org
            </button>
            <button
              onClick={() => handleQuickPreset('+221770000000', '000000')}
              className="px-2 py-2 rounded-xl border border-border/80 bg-muted/50 font-extrabold hover:border-primary active:scale-95 text-foreground transition-all truncate"
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
