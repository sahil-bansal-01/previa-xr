import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SimulationProvider } from './contexts/SimulationContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { UploadSpacePage } from './pages/UploadSpacePage';
import { EnvironmentReviewPage } from './pages/EnvironmentReviewPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { DashboardPage } from './pages/DashboardPage';
import { ScenariosPage } from './pages/ScenariosPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { HistoryPage } from './pages/HistoryPage';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isFullscreenView =
    location.pathname === '/simulator' || location.pathname.includes('/review');

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA] text-[#172033] font-sans selection:bg-blue-500/20 selection:text-blue-700">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/upload" element={<UploadSpacePage />} />
          <Route path="/upload-space" element={<UploadSpacePage />} />
          <Route path="/environment/:id/review" element={<EnvironmentReviewPage />} />
          <Route path="/environment-review/:id" element={<EnvironmentReviewPage />} />
          <Route path="/simulator" element={<SimulatorPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/scenarios" element={<ScenariosPage />} />
          <Route path="/comparison" element={<ComparisonPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>
      {!isFullscreenView && <Footer />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <SimulationProvider>
          <AppLayout />
        </SimulationProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
