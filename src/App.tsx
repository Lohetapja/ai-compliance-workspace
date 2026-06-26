import { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { AppearanceManager } from './components/AppearanceManager';
import { useStore } from './store/useStore';
import { DashboardPage } from './pages/DashboardPage';
import { SystemsPage } from './pages/SystemsPage';
import { SystemDetailPage } from './pages/SystemDetailPage';
import { RiskHelperPage } from './pages/RiskHelperPage';
import { RiskRegisterPage } from './pages/RiskRegisterPage';
import { ControlsEvidencePage } from './pages/ControlsEvidencePage';
import { GapActionsPage } from './pages/GapActionsPage';
import { DecisionsPage } from './pages/DecisionsPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { ReportsPage } from './pages/ReportsPage';
import { FrameworksPage } from './pages/FrameworksPage';
import { FrameworkLensesPage } from './pages/FrameworkLensesPage';
import { UseCaseIntakePage } from './pages/UseCaseIntakePage';
import { VendorRegisterPage } from './pages/VendorRegisterPage';
import { ResearchSourcesPage } from './pages/ResearchSourcesPage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutProjectPage } from './pages/AboutProjectPage';

const SEED_FLAG = 'ai-compliance-workspace:seeded';

/** Seed the fictional demo data once, on the very first visit only. */
function useFirstRunSeed() {
  const loadSampleData = useStore((s) => s.loadSampleData);
  useEffect(() => {
    if (!localStorage.getItem(SEED_FLAG)) {
      const empty = useStore.getState().data.systems.length === 0;
      if (empty) loadSampleData();
      localStorage.setItem(SEED_FLAG, '1');
    }
  }, [loadSampleData]);
}

export function App() {
  useFirstRunSeed();
  return (
    <>
      <AppearanceManager />
      <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/systems" element={<SystemsPage />} />
          <Route path="/systems/:id" element={<SystemDetailPage />} />
          <Route path="/risk-helper" element={<RiskHelperPage />} />
          <Route path="/risks" element={<RiskRegisterPage />} />
          <Route path="/controls" element={<ControlsEvidencePage />} />
          <Route path="/gap-actions" element={<GapActionsPage />} />
          <Route path="/use-cases" element={<UseCaseIntakePage />} />
          <Route path="/vendors" element={<VendorRegisterPage />} />
          <Route path="/decisions" element={<DecisionsPage />} />
          <Route path="/incidents" element={<IncidentsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/framework-lenses" element={<FrameworkLensesPage />} />
          <Route path="/frameworks" element={<FrameworksPage />} />
          <Route path="/research" element={<ResearchSourcesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/about" element={<AboutProjectPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
      </HashRouter>
    </>
  );
}
