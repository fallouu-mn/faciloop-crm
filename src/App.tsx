import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { AppLayout } from './components/layout/AppLayout';

// Public & Auth Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { PendingActivationPage } from './pages/auth/PendingActivationPage';
import { WelcomeOnboardingPage } from './pages/auth/WelcomeOnboardingPage';

// Commercial Pages
import { DashboardCommercial } from './pages/commercial/DashboardCommercial';
import { ProspectsList } from './pages/commercial/ProspectsList';
import { ProspectDetail } from './pages/commercial/ProspectDetail';
import { ProspectKanban } from './pages/commercial/ProspectKanban';
import { RelancesPage } from './pages/commercial/RelancesPage';
import { ObjectifsPage } from './pages/commercial/ObjectifsPage';
import { NotificationsPage } from './pages/commercial/NotificationsPage';

// Admin Org Pages
import { DashboardAdminOrg } from './pages/admin-org/DashboardAdminOrg';
import { EquipeCommerciale } from './pages/admin-org/EquipeCommerciale';
import { ImportExportPage } from './pages/admin-org/ImportExportPage';
import { JournalActionsPage } from './pages/admin-org/JournalActionsPage';
import { ParametresEntreprise } from './pages/admin-org/ParametresEntreprise';
import { AbonnementsPage } from './pages/admin-org/AbonnementsPage';
import { PaiementsPage } from './pages/admin-org/PaiementsPage';

// Super Admin Pages
import { DashboardSuperAdmin } from './pages/super-admin/DashboardSuperAdmin';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public & Authentication Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/pending-activation" element={<PendingActivationPage />} />
          <Route path="/welcome" element={<WelcomeOnboardingPage />} />

          {/* Commercial Espace */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardCommercial />} />
            <Route path="prospects" element={<ProspectsList />} />
            <Route path="prospects/:id" element={<ProspectDetail />} />
            <Route path="pipeline" element={<ProspectKanban />} />
            <Route path="relances" element={<RelancesPage />} />
            <Route path="objectifs" element={<ObjectifsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
          </Route>

          {/* Admin Organisation Espace */}
          <Route path="/admin" element={<AppLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardAdminOrg />} />
            <Route path="prospects" element={<ProspectsList />} />
            <Route path="clients" element={<ProspectsList />} />
            <Route path="pipeline" element={<ProspectKanban />} />
            <Route path="equipe" element={<EquipeCommerciale />} />
            <Route path="objectifs" element={<ObjectifsPage />} />
            <Route path="relances" element={<RelancesPage />} />
            <Route path="abonnements" element={<AbonnementsPage />} />
            <Route path="paiements" element={<PaiementsPage />} />
            <Route path="import-export" element={<ImportExportPage />} />
            <Route path="journal" element={<JournalActionsPage />} />
            <Route path="parametres" element={<ParametresEntreprise />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* Super-Admin Espace */}
          <Route path="/super-admin" element={<AppLayout />}>
            <Route index element={<Navigate to="/super-admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardSuperAdmin />} />
            <Route path="organisations" element={<DashboardSuperAdmin />} />
            <Route path="parametres" element={<ParametresEntreprise />} />
            <Route path="*" element={<Navigate to="/super-admin/dashboard" replace />} />
          </Route>

          {/* Fallback 404 Route */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-4xl font-extrabold text-gradient-faciloop">404 - Page Non Trouvée</h1>
                <p className="text-sm text-muted-foreground mt-2">La page demandée n'existe pas ou l'accès est restreint.</p>
                <a href="/" className="mt-6 px-6 py-3 rounded-xl bg-gradient-faciloop text-white font-bold text-xs shadow-md">
                  Retour à l'accueil
                </a>
              </div>
            }
          />
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
