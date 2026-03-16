import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';

// Layout & Components
import Layout from './components/Layout';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ToastContainer from './components/ToastContainer';

// Public
import Landing from './components/Landing';
import Login from './pages/Login';
import SimLanding from './pages/sim/SimLanding';
import SimTransparency from './pages/sim/SimTransparency';

// Admin / Analyst / Defender pages
import Dashboard from './pages/Dashboard';
import ScenarioList from './pages/ScenarioList';
import ScenarioNew from './pages/ScenarioNew';
import ScenarioDetail from './pages/ScenarioDetail';
import ScenarioLive from './pages/ScenarioLive';
import KillChain from './pages/KillChain';
import ScenarioAnalytics from './pages/ScenarioAnalytics';
import FinancialRisk from './pages/FinancialRisk';
import BoardReport from './pages/BoardReport';
import EmployeeList from './pages/EmployeeList';
import EmployeeDetail from './pages/EmployeeDetail';
import Leaderboard from './pages/Leaderboard';
import DefenderDashboard from './pages/DefenderDashboard';
import DefenderLive from './pages/DefenderLive';
import SendPhishing from './pages/SendPhishing';

// Knowledge Base
import NormalAttacks from './pages/knowledge/NormalAttacks';
import SophisticatedAttacks from './pages/knowledge/SophisticatedAttacks';
import SimSwapStoryboard from './pages/knowledge/SimSwapStoryboard';
import ThreatMap from './pages/knowledge/ThreatMap';

// Employee pages
import PersonalDashboard from './pages/me/PersonalDashboard';
import ModuleList from './pages/me/ModuleList';
import ModuleViewer from './pages/me/ModuleViewer';
import Debrief from './pages/me/Debrief';

// Redirect logic
const HomeRedirect = () => {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return null;
  if (!user) return <Navigate to="/" replace />;
  if (user.role === 'employee') return <Navigate to="/me" replace />;
  return <Navigate to="/dashboard" replace />;
};

const Placeholder = ({ title }) => (
  <Layout>
    <div className="p-8 max-w-4xl mx-auto">
      <div className="card animate-fadeUp">
        <h2 className="h2 mb-2">{title}</h2>
        <p className="text-[var(--as-muted)] text-[13px]">This section is under construction.</p>
      </div>
    </div>
  </Layout>
);

const NotFound = () => (
  <Layout>
    <div className="card animate-fadeUp text-center mx-auto max-w-md mt-20">
      <div className="text-[48px] mb-4">⚡</div>
      <h2 className="h2 text-[var(--as-accent)] mb-2">404 — Area Restricted</h2>
      <p className="text-[var(--as-muted)] text-[13px]">The route you're looking for doesn't exist or you're not authorized.</p>
    </div>
  </Layout>
);

// Shorthand: wrap a page in Layout + ProtectedRoute
const Protected = ({ roles, children }) => (
  <ProtectedRoute allowedRoles={roles}>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);

// Employee wrapper: Navbar only, no sidebar
const EmployeeRoute = ({ children }) => (
  <div className="min-h-screen bg-[var(--as-bg)]">
    <ProtectedRoute allowedRoles={['employee']}>
      <Navbar />
      <div className="pt-4">{children}</div>
    </ProtectedRoute>
  </div>
);

const AdminAnalystDef = ['admin', 'analyst', 'defender'];
const AdminAnalyst    = ['admin', 'analyst'];
const AdminOnly       = ['admin'];

function App() {
  const { fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return (
    <BrowserRouter>
      {/* Global Notifications */}
      <ToastContainer />

      <Routes>
        {/* ── Public ── */}
        <Route path="/"      element={<Landing />} />
        <Route path="/login" element={<Login />} />
        
        {/* Simulation (External look) */}
        <Route path="/sim/landing"      element={<SimLanding />} />
        <Route path="/sim/transparency" element={<SimTransparency />} />

        {/* Home Redirect */}
        <Route path="/home" element={<HomeRedirect />} />

        {/* ── Admin / Analyst / Defender ── */}
        <Route path="/dashboard" element={
          <Protected roles={AdminAnalystDef}><Dashboard /></Protected>
        } />

        {/* Send Phishing — execute by channel from UI */}
        <Route path="/send-phishing" element={
          <Protected roles={AdminAnalystDef}><SendPhishing /></Protected>
        } />

        {/* Scenarios */}
        <Route path="/scenarios" element={
          <Protected roles={AdminAnalystDef}><ScenarioList /></Protected>
        } />
        <Route path="/scenarios/new" element={
          <Protected roles={AdminOnly}><ScenarioNew /></Protected>
        } />
        <Route path="/scenarios/:id" element={
          <Protected roles={AdminAnalystDef}><ScenarioDetail /></Protected>
        } />
        <Route path="/scenarios/:id/live" element={
          <ProtectedRoute allowedRoles={AdminAnalystDef}><ScenarioLive /></ProtectedRoute>
        } />
        <Route path="/scenarios/:id/killchain" element={
          <Protected roles={AdminAnalyst}><KillChain /></Protected>
        } />
        <Route path="/scenarios/:id/analytics" element={
          <Protected roles={AdminAnalyst}><ScenarioAnalytics /></Protected>
        } />
        <Route path="/scenarios/:id/report" element={
          <Protected roles={AdminOnly}><BoardReport /></Protected>
        } />

        {/* Global Dashboard Views (using sc-1 as default) */}
        <Route path="/killchain" element={
          <Protected roles={AdminAnalyst}><KillChain /></Protected>
        } />
        <Route path="/analytics" element={
          <Protected roles={AdminAnalyst}><ScenarioAnalytics /></Protected>
        } />
        <Route path="/livemap" element={
          <ProtectedRoute allowedRoles={AdminAnalystDef}><ScenarioLive /></ProtectedRoute>
        } />

        {/* Organization */}
        <Route path="/org/employees" element={
          <Protected roles={AdminAnalyst}><EmployeeList /></Protected>
        } />
        <Route path="/org/employees/:id" element={
          <Protected roles={AdminAnalyst}><EmployeeDetail /></Protected>
        } />

        {/* Defender Operations */}
        <Route path="/defender" element={
          <Protected roles={['admin', 'defender']}><DefenderDashboard /></Protected>
        } />
        <Route path="/defender/live/:id" element={
          <ProtectedRoute allowedRoles={['admin', 'defender']}><DefenderLive /></ProtectedRoute>
        } />

        {/* Risk & Rankings */}
        <Route path="/financial" element={
          <Protected roles={AdminAnalyst}><FinancialRisk /></Protected>
        } />
        <Route path="/leaderboard" element={
          <Protected roles={AdminAnalystDef}><Leaderboard /></Protected>
        } />

        {/* Knowledge Base */}
        <Route path="/knowledge/normal"  element={<Protected roles={AdminAnalystDef}><NormalAttacks /></Protected>} />
        <Route path="/knowledge/advanced" element={<Protected roles={AdminAnalystDef}><SophisticatedAttacks /></Protected>} />
        <Route path="/knowledge/simswap"  element={<Protected roles={AdminAnalystDef}><SimSwapStoryboard /></Protected>} />
        <Route path="/knowledge/threatmap" element={<Protected roles={AdminAnalystDef}><ThreatMap /></Protected>} />

        {/* ── Employee Self-Service ── */}
        <Route path="/me" element={
          <EmployeeRoute><PersonalDashboard /></EmployeeRoute>
        } />
        <Route path="/me/modules" element={
          <EmployeeRoute><ModuleList /></EmployeeRoute>
        } />
        <Route path="/me/modules/:id" element={
          <EmployeeRoute><ModuleViewer /></EmployeeRoute>
        } />
        <Route path="/me/debrief/:scenarioId" element={
          <EmployeeRoute><Debrief /></EmployeeRoute>
        } />

        {/* ── 404 ── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
