import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSimulation } from '../../contexts/SimulationContext';
import {
  Compass,
  Box,
  Split,
  History,
  Layers,
  Info,
  LogOut,
  User,
  Sparkles,
  LayoutDashboard,
  UploadCloud,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, demoLogin } = useAuth();
  const { blockExitA, simulateFuture } = useSimulation();

  const navLinks = [
    { path: '/upload-space', label: 'Upload Space', icon: UploadCloud },
    { path: '/simulator', label: 'Simulator', icon: Box },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/scenarios', label: 'Scenarios', icon: Layers },
    { path: '/comparison', label: 'Comparison', icon: Split },
    { path: '/history', label: 'History', icon: History },
    { path: '/about', label: 'How It Works', icon: Info },
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
    <header className="h-16 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 z-30 px-4 md:px-8 flex items-center justify-between sticky top-0 backdrop-blur-xl">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center space-x-3 group">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Compass className="w-5 h-5 text-cyan-400 group-hover:rotate-45 transition-transform duration-500" />
          </div>
        </div>
        <div>
          <span className="text-base font-extrabold tracking-widest text-slate-100 font-mono flex items-center space-x-1">
            <span>PREVIA</span>
            <span className="text-cyan-400">XR</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono block -mt-1 tracking-wider uppercase">
            Preview Before You Act
          </span>
        </div>
      </Link>

      {/* Nav Links */}
      <nav className="hidden md:flex items-center space-x-1">
        {navLinks.map(link => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Right Actions */}
      <div className="flex items-center space-x-3">
        {/* Quick Demo Button */}
        <button
          onClick={handleStartDemo}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider transition-all shadow-md shadow-cyan-500/20 hover:scale-105"
          title="Instant 1-Click Hackathon Evaluation Flow"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>START DEMO</span>
        </button>

        {isAuthenticated && user ? (
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-300 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span className="max-w-[120px] truncate">{user.name.split(' ')[0]}</span>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Link
              to="/login"
              className="text-xs font-mono text-slate-300 hover:text-cyan-400 px-3 py-1.5 rounded-lg hover:bg-slate-900 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-xs font-mono font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-800/80 px-3 py-1.5 rounded-lg hover:bg-cyan-900/60 transition-colors"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
