import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { Mail, Phone, User, ShieldCheck } from 'lucide-react';
import { PinChangeSection } from '../../components/common/PinChangeSection';

/**
 * Page Profil partagée — admin_org & super_admin
 * Route : /admin/profil  |  /super-admin/profil
 */
export const ProfilAdminPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');
  const navigate = useNavigate();

  useEffect(() => {
    refreshUser();
  }, []);

  if (!user) return null;

  const initiales = `${user.prenom?.[0] ?? ''}${user.nom?.[0] ?? ''}`.toUpperCase() || '?';

  const roleLabel = (() => {
    if (user.role === 'super_admin') return isEn ? 'Super Administrator' : 'Super Administrateur';
    if (user.role === 'admin_org')  return isEn ? 'Organisation Manager' : 'Directeur d\'Organisation';
    return isEn ? 'Sales Representative' : 'Commercial';
  })();

  return (
    <div className="space-y-6 max-w-lg mx-auto font-sans pb-12">
      {/* Page title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          {isEn ? 'My Profile' : 'Mon Profil'}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {isEn
            ? 'View your account information and update your security PIN.'
            : 'Consultez vos informations et mettez à jour votre code PIN de connexion.'}
        </p>
      </div>

      {/* Avatar & identity */}
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="h-20 w-20 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-primary/30 select-none">
          {initiales}
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-foreground">
            {user.prenom} {user.nom}
          </h3>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            {roleLabel}
          </span>
        </div>
      </div>

      {/* Info card */}
      <div className="rounded-2xl border border-border p-4 space-y-3 bg-card">
        <InfoRow icon={User}  label={isEn ? 'Full Name' : 'Nom complet'} value={`${user.prenom} ${user.nom}`} />
        <InfoRow icon={Mail}  label="Email"                               value={user.email} />
        <InfoRow icon={Phone} label={isEn ? 'Phone' : 'Téléphone'}       value={user.telephone} />
        <InfoRow
          icon={ShieldCheck}
          label={isEn ? 'Role' : 'Rôle'}
          value={roleLabel}
          highlight
        />
      </div>

      {/* PIN change */}
      <PinChangeSection />
    </div>
  );
};

/* ── Utility sub-component ─────────────────────────────────────────── */
function InfoRow({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
        <span className="text-xs text-muted-foreground shrink-0">{label}</span>
        {highlight ? (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 truncate">
            {value}
          </span>
        ) : (
          <span className="text-sm font-medium truncate">{value}</span>
        )}
      </div>
    </div>
  );
}
