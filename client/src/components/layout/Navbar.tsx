import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSimulation } from '../../contexts/SimulationContext';
import {
  Layers,
  Box,
  History,
  LayoutDashboard,
  UploadCloud,
  LogOut,
  User,
  Sparkles,
  Home,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, demoLogin } = useAuth();
  const { blockExitA, simulateFuture } = useSimulation();

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/upload-space', label: 'Upload Space', icon: UploadCloud },
    { path: '/simulator', label: 'Simulator', icon: Box },
    { path: '/history', label: 'History', icon: History },
  ];

  const handleStartDemo = async () => {
    if (!isAuthenticated) {
      await demoLogin();
    }
    blockExitA();
    navigate('/simulator');
    setTimeout(() => {
      simulateFuture();
    }, 400);
  };

  return (
    <header className="h-[68px] w-full bg-white border-b border-[#E2E5E9] shadow-[0_1px_3px_rgba(16,24,40,0.04)] z-40 px-4 md:px-8 flex items-center justify-between sticky top-0">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center space-x-2.5 group">
        <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] group-hover:scale-105 transition-transform shadow-xs">
          <Layers className="w-4 h-4 text-[#2563EB]" />
        </div>
        <div className="flex flex-col">
          <span className="text-[15px] font-bold tracking-tight text-[#172033] flex items-center space-x-1 font-sans">
            <span>PREVIA</span>
            <span className="text-[#2563EB]">XR</span>
          </span>
          <span className="text-[10px] text-[#667085] font-normal tracking-normal -mt-0.5">
            Spatial Intelligence
          </span>
        </div>
      </Link>

      {/* Main Nav Links */}
      <nav className="hidden md:flex items-center space-x-1">
        {navLinks.map(link => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold shadow-xs'
                  : 'text-[#667085] hover:text-[#172033] hover:bg-[#F1F3F5]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#2563EB]' : 'text-[#667085]'}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Quick Demo CTA */}
        <button
          onClick={handleStartDemo}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E2E5E9] hover:border-[#2563EB] hover:bg-[#EFF6FF] text-[#172033] hover:text-[#2563EB] font-medium text-xs transition-all shadow-xs"
          title="Run Baseline Demo Simulation"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Demo Complex</span>
        </button>

        {isAuthenticated && user ? (
          <div className="flex items-center space-x-2 pl-2 border-l border-[#E2E5E9]">
            <div className="flex items-center space-x-1.5 text-xs text-[#172033] bg-[#F1F3F5] px-2.5 py-1.5 rounded-lg font-medium border border-[#E2E5E9]">
              <User className="w-3.5 h-3.5 text-[#2563EB]" />
              <span className="max-w-[120px] truncate">{user.name.split(' ')[0]}</span>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-[#667085] hover:text-[#DC2626] hover:bg-[#F1F3F5] rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Link
              to="/login"
              className="text-xs font-medium text-[#667085] hover:text-[#172033] px-3 py-1.5 rounded-lg hover:bg-[#F1F3F5] transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs font-medium text-white bg-[#2563EB] hover:bg-[#1D4ED8] px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
