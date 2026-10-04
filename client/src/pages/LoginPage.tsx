import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Compass, Sparkles, LogIn, Lock, Mail, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/simulator');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    setLoading(true);
    try {
      await demoLogin();
      navigate('/simulator');
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.25rem)] flex items-center justify-center p-6 bg-[#F7F8FA] text-[#172033]">
      <div className="bg-white border border-[#E2E5E9] rounded-3xl p-8 w-full max-w-md shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center mx-auto text-[#2563EB]">
            <Compass className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold font-sans text-[#172033]">
            PREVIA <span className="text-[#2563EB]">XR</span>
          </h1>
          <p className="text-xs text-[#667085] font-sans">
            Sign in to access persistent spatial simulation environments
          </p>
        </div>

        {/* Demo Fast Track Button */}
        <button
          onClick={handleDemoAccess}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold font-sans text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md hover:shadow-lg"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>ONE-CLICK HACKATHON DEMO LOGIN</span>
        </button>

        <div className="flex items-center space-x-2 text-[#98A2B3] text-xs font-sans">
          <div className="h-px bg-[#E2E5E9] flex-1"></div>
          <span>OR SIGN IN WITH EMAIL</span>
          <div className="h-px bg-[#E2E5E9] flex-1"></div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] text-xs flex items-center space-x-2 font-sans font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-sans font-semibold uppercase text-[#667085] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#98A2B3] absolute left-3 top-3.5" />
              <input
                type="email"
                required
                placeholder="operator@previa.xr"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white border border-[#E2E5E9] focus:border-[#2563EB] rounded-xl pl-9 pr-3 py-2.5 text-sm text-[#172033] focus:outline-none shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-sans font-semibold uppercase text-[#667085] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#98A2B3] absolute left-3 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white border border-[#E2E5E9] focus:border-[#2563EB] rounded-xl pl-9 pr-3 py-2.5 text-sm text-[#172033] focus:outline-none shadow-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-white hover:bg-[#F1F3F5] text-[#172033] font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors border border-[#E2E5E9] shadow-xs"
          >
            <LogIn className="w-4 h-4 text-[#2563EB]" />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="text-center text-xs text-[#667085] font-sans">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#2563EB] hover:underline font-semibold">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
