import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, AlertCircle, Phone, Lock, Gift, ChevronDown, Check, Building2, User, HelpCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [prenom, setPrenom] = useState<string>('');
  const [nom, setNom] = useState<string>('');
  const [entreprise, setEntreprise] = useState<string>('');
  const [telephone, setTelephone] = useState<string>('');
  
  // Parrainage toggle state
  const [showParrainage, setShowParrainage] = useState<boolean>(false);
  const [codeParrainage, setCodeParrainage] = useState<string>('');

  // 6-digit PIN secret code boxes
  const [codeDigits, setCodeDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [confirmDigits, setConfirmDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [showCode, setShowCode] = useState<boolean>(false);
  const [showConfirmCode, setShowConfirmCode] = useState<boolean>(false);

  // Secret Question
  const [questionSecrete, setQuestionSecrete] = useState<string>('');
  const [reponseSecrete, setReponseSecrete] = useState<string>('');

  // CGU agreement
  const [acceptTerms, setAcceptTerms] = useState<boolean>(true);

  // Language selector
  const [language, setLanguage] = useState<'FR' | 'WO' | 'EN'>('FR');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Refs for 6-digit PIN navigation
  const codeRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  const confirmRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  const handleDigitChange = (
    index: number,
    value: string,
    digitsArr: string[],
    setDigits: React.Dispatch<React.SetStateAction<string[]>>,
    refsArr: React.RefObject<HTMLInputElement>[]
  ) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digitsArr];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    // Auto-advance focus to next digit box
    if (value && index < 5) {
      refsArr[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
    digitsArr: string[],
    refsArr: React.RefObject<HTMLInputElement>[]
  ) => {
    if (e.key === 'Backspace' && !digitsArr[index] && index > 0) {
      refsArr[index - 1].current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!prenom.trim() || !nom.trim()) {
      setErrorMsg('Veuillez renseigner votre prénom et votre nom');
      return;
    }

    if (!entreprise.trim()) {
      setErrorMsg('Le nom de votre entreprise est indispensable');
      return;
    }

    if (!telephone.trim() || telephone.length < 8) {
      setErrorMsg('Veuillez entrer un numéro de téléphone valide');
      return;
    }

    const pin = codeDigits.join('');
    const confirmPin = confirmDigits.join('');

    if (pin.length < 6) {
      setErrorMsg('Le code secret doit comporter exactement 6 chiffres');
      return;
    }

    if (pin !== confirmPin) {
      setErrorMsg('Les deux codes secrets ne correspondent pas');
      return;
    }

    if (!acceptTerms) {
      setErrorMsg('Veuillez accepter les Conditions Générales d’Utilisation');
      return;
    }

    setLoading(true);

    // Save registration payload to localStorage for activation workflow
    const registrationData = {
      prenom,
      nom,
      entreprise,
      telephone: `+221${telephone.replace(/\s+/g, '')}`,
      codeSecret: pin,
      questionSecrete,
      codeParrainage,
      registeredAt: new Date().toISOString()
    };
    localStorage.setItem('faciloop_pending_registration', JSON.stringify(registrationData));

    setTimeout(() => {
      setLoading(false);
      // Redirect to Pending Super-Admin Activation Screen
      navigate('/pending-activation', { state: registrationData });
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-3 sm:p-6 relative overflow-x-hidden font-sans selection:bg-primary/20 selection:text-primary">
      {/* Background Decorative Blur Gradients */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 sm:w-[500px] h-80 sm:h-[500px] bg-primary/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-70 sm:w-[400px] h-70 sm:h-[400px] bg-accent/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top-Left Professional Back to Home Button */}
      <Link
        to="/"
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-30 inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl border border-border/80 bg-card/85 backdrop-blur-xl text-xs font-extrabold text-foreground shadow-lg hover:bg-muted active:scale-95 transition-all group"
        title="Retourner à la page d'accueil Faciloop"
      >
        <ArrowLeft className="w-4 h-4 text-primary group-hover:-translate-x-1 transition-transform" />
        <span>Accueil</span>
      </Link>

      {/* Main Responsive Registration Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-lg bg-card border border-border/80 rounded-3xl p-5 sm:p-8 shadow-2xl z-10 relative my-6 mt-12 sm:mt-6"
      >
        {/* Faciloop Header Logo & Title */}
        <div className="flex flex-col items-center text-center space-y-1">
          <Link to="/" className="flex items-center gap-2 mb-2 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-faciloop flex items-center justify-center text-white shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform">
              <span className="text-xl sm:text-2xl font-black">F</span>
            </div>
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-gradient-faciloop">faciloop</span>
          </Link>

          <h1 className="text-xl sm:text-2xl font-black text-foreground">Inscrivez-vous en moins d'une minute</h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-semibold max-w-sm">
            et gérez vos clients et votre activité simplement
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs font-sans">
          {/* Prénom & Nom Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-extrabold text-foreground mb-1">Prénom *</label>
              <input
                type="text"
                required
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Kira"
                className="w-full p-3 rounded-2xl border border-input bg-background font-semibold focus:ring-2 focus:ring-primary/50 text-foreground"
              />
            </div>
            <div>
              <label className="block font-extrabold text-foreground mb-1">Nom *</label>
              <input
                type="text"
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Dupont"
                className="w-full p-3 rounded-2xl border border-input bg-background font-semibold focus:ring-2 focus:ring-primary/50 text-foreground"
              />
            </div>
          </div>

          {/* Nom Entreprise / Activité */}
          <div>
            <label className="block font-extrabold text-foreground mb-1">Nom de votre entreprise / activité *</label>
            <input
              type="text"
              required
              value={entreprise}
              onChange={(e) => setEntreprise(e.target.value)}
              placeholder="Ex : Salon Aminata, Boutique Diallo..."
              className="w-full p-3 rounded-2xl border border-input bg-background font-semibold focus:ring-2 focus:ring-primary/50 text-foreground"
            />
            <p className="text-[10px] text-muted-foreground font-medium mt-1">
              Indispensable pour accéder aux abonnements
            </p>
          </div>

          {/* Téléphone Principal (+221 Selector) */}
          <div>
            <label className="block font-extrabold text-foreground mb-1">Téléphone *</label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-3 rounded-2xl border border-input bg-muted/60 text-xs font-extrabold text-foreground shrink-0">
                <span className="text-base">🇸🇳</span>
                <span>+221</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-0.5" />
              </div>
              <input
                type="tel"
                required
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="77 123 45 67"
                className="flex-1 p-3 rounded-2xl border border-input bg-background font-semibold focus:ring-2 focus:ring-primary/50 text-foreground"
              />
            </div>
          </div>

          {/* Parrainage Optional Collapsible Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowParrainage(!showParrainage)}
              className="text-xs font-extrabold text-amber-500 hover:text-amber-600 flex items-center gap-1.5 transition-colors"
            >
              <Gift className="w-4 h-4" />
              <span>Vous avez un code de parrainage ?</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showParrainage ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showParrainage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 overflow-hidden"
                >
                  <input
                    type="text"
                    value={codeParrainage}
                    onChange={(e) => setCodeParrainage(e.target.value)}
                    placeholder="Entrez votre code de parrainage"
                    className="w-full p-3 rounded-2xl border border-amber-500/40 bg-amber-500/5 font-semibold text-foreground"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Code Secret (6 Chiffres) PIN Boxes */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-extrabold text-foreground">Code secret (6 chiffres) *</label>
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                className="text-muted-foreground hover:text-foreground p-1"
                title="Afficher/Masquer le code"
              >
                {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* 6 Square PIN Input Boxes */}
            <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
              {codeDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={codeRefs[idx]}
                  type={showCode ? 'text' : 'password'}
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value, codeDigits, setCodeDigits, codeRefs)}
                  onKeyDown={(e) => handleKeyDown(idx, e, codeDigits, codeRefs)}
                  className="w-full h-12 text-center text-lg font-black rounded-2xl border border-input bg-background focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
                />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground text-center font-medium mt-1">
              Ce code vous servira à vous connecter
            </p>
          </div>

          {/* Confirmez le Code (6 Chiffres) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-extrabold text-foreground">Confirmez le code *</label>
              <button
                type="button"
                onClick={() => setShowConfirmCode(!showConfirmCode)}
                className="text-muted-foreground hover:text-foreground p-1"
                title="Afficher/Masquer le code"
              >
                {showConfirmCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
              {confirmDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={confirmRefs[idx]}
                  type={showConfirmCode ? 'text' : 'password'}
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value, confirmDigits, setConfirmDigits, confirmRefs)}
                  onKeyDown={(e) => handleKeyDown(idx, e, confirmDigits, confirmRefs)}
                  className="w-full h-12 text-center text-lg font-black rounded-2xl border border-input bg-background focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
                />
              ))}
            </div>
          </div>

          {/* Question Secrète Dropdown */}
          <div>
            <label className="block font-extrabold text-foreground mb-1">Question secrète *</label>
            <select
              value={questionSecrete}
              onChange={(e) => setQuestionSecrete(e.target.value)}
              className="w-full p-3 rounded-2xl border border-input bg-background font-semibold text-foreground focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Choisissez une question</option>
              <option value="animal">Quel est le nom de votre premier animal domestique ?</option>
              <option value="ville">Quelle est votre ville de naissance ?</option>
              <option value="mere">Quel est le prénom de votre mère ?</option>
              <option value="ecole">Quel est le nom de votre première école ?</option>
            </select>
          </div>

          {questionSecrete && (
            <div>
              <label className="block font-extrabold text-foreground mb-1">Réponse à la question secrète *</label>
              <input
                type="text"
                required
                value={reponseSecrete}
                onChange={(e) => setReponseSecrete(e.target.value)}
                placeholder="Votre réponse secrète..."
                className="w-full p-3 rounded-2xl border border-input bg-background font-semibold text-foreground"
              />
            </div>
          )}

          {/* CGU Terms Checkbox */}
          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="acceptTerms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="w-4 h-4 rounded border-input text-primary focus:ring-primary accent-primary cursor-pointer mt-0.5"
            />
            <label htmlFor="acceptTerms" className="text-xs font-semibold text-muted-foreground cursor-pointer leading-tight">
              J'accepte les <span className="text-foreground font-extrabold underline">Conditions Générales d'Utilisation</span> et la <span className="text-foreground font-extrabold underline">Politique de Confidentialité</span>.
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-faciloop text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-primary/25 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>S'inscrire et continuer</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Language Selector Bar at Bottom */}
        <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-2xl border border-border/60">
            <button
              type="button"
              onClick={() => setLanguage('FR')}
              className={`px-3 py-1 rounded-xl text-[11px] font-black transition-all ${
                language === 'FR' ? 'bg-gradient-faciloop text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              🇫🇷 FR
            </button>
            <button
              type="button"
              onClick={() => setLanguage('WO')}
              className={`px-3 py-1 rounded-xl text-[11px] font-black transition-all ${
                language === 'WO' ? 'bg-gradient-faciloop text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              🇸🇳 WO
            </button>
            <button
              type="button"
              onClick={() => setLanguage('EN')}
              className={`px-3 py-1 rounded-xl text-[11px] font-black transition-all ${
                language === 'EN' ? 'bg-gradient-faciloop text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              🇬🇧 EN
            </button>
          </div>

          <Link to="/login" className="text-xs font-extrabold text-primary hover:underline">
            Déjà un compte ? Se connecter
          </Link>
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
