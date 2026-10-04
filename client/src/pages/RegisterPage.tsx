import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Compass, UserPlus, User, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/simulator');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
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
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center mx-auto text-[#2563EB]">
            <Compass className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold font-sans text-[#172033]">
            Register Spatial Account
          </h1>
          <p className="text-xs text-[#667085] font-sans">
            Create an account to save simulations and custom spatial environments
          </p>
        </div>

        <button
          onClick={handleDemoAccess}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold font-sans text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md hover:shadow-lg"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>USE ONE-CLICK DEMO ACCOUNT</span>
        </button>

        <div className="flex items-center space-x-2 text-[#98A2B3] text-xs font-sans">
          <div className="h-px bg-[#E2E5E9] flex-1"></div>
          <span>OR FILL REGISTRATION</span>
          <div className="h-px bg-[#E2E5E9] flex-1"></div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] text-xs flex items-center space-x-2 font-sans font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-sans font-semibold uppercase text-[#667085] mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#98A2B3] absolute left-3 top-3.5" />
              <input
                type="text"
                required
                placeholder="Dr. Alex Rivera"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-white border border-[#E2E5E9] focus:border-[#2563EB] rounded-xl pl-9 pr-3 py-2.5 text-sm text-[#172033] focus:outline-none shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-sans font-semibold uppercase text-[#667085] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#98A2B3] absolute left-3 top-3.5" />
              <input
                type="email"
                required
                placeholder="alex.rivera@previa.xr"
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
            <UserPlus className="w-4 h-4 text-[#2563EB]" />
            <span>{loading ? 'Registering...' : 'Create Account'}</span>
          </button>
        </form>

        <div className="text-center text-xs text-[#667085] font-sans">
          Already registered?{' '}
          <Link to="/login" className="text-[#2563EB] hover:underline font-semibold">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
};
