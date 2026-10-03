import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSimulation } from '../contexts/SimulationContext';
import { Preloader } from '../components/ui/Preloader';
import {
  Compass,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Cpu,
  Layers,
  ChevronRight,
  ShieldAlert,
  Users,
  Clock,
  RotateCcw,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [showPreloader, setShowPreloader] = useState(() => {
    // Show once per session
    const seen = sessionStorage.getItem('previa_seen_preloader');
    if (!seen) {
      sessionStorage.setItem('previa_seen_preloader', 'true');
      return true;
    }
    return false;
  });

  const navigate = useNavigate();
  const { demoLogin, isAuthenticated } = useAuth();
  const { blockExitA, simulateFuture } = useSimulation();

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
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col cyber-grid-bg relative overflow-hidden">
      {/* Short Preloader */}
      {showPreloader && <Preloader onComplete={() => setShowPreloader(false)} duration={1800} />}

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 px-6 max-w-6xl mx-auto flex flex-col items-center text-center z-10">
        {/* Subtle pill badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-medium mb-8 backdrop-blur-md shadow-lg shadow-cyan-500/10">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          <span>XR-INSPIRED DECISION SIMULATION PLATFORM</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight font-mono text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 max-w-4xl leading-tight">
          PREVIA <span className="text-cyan-400">XR</span>
        </h1>

        {/* Tagline */}
        <p className="text-xl md:text-2xl font-bold text-cyan-300 font-mono tracking-wide mt-3">
          Preview Before You Act.
        </p>

        {/* Supporting text */}
        <p className="text-base md:text-lg text-slate-400 max-w-2xl mt-5 font-sans leading-relaxed">
          An environment-aware spatial what-if simulator. PREVIA does not decide what your environment looks like — you define or verify the space, and PREVIA explores what could happen if you change something.
        </p>

        {/* Core Statement Banner */}
        <div className="mt-8 px-5 py-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs md:text-sm font-mono text-slate-300 flex flex-col sm:flex-row items-center gap-2 backdrop-blur-md shadow-lg shadow-cyan-500/5">
          <span className="text-cyan-400 font-extrabold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>CORE PHILOSOPHY:</span>
          </span>
          <span className="text-center sm:text-left">
            You Define Your Space &bull; PREVIA Simulates The Future
          </span>
        </div>

        {/* CTAs: UPLOAD YOUR SPACE (Primary) | TRY DEMO ENVIRONMENT (Secondary) | ENTER SIMULATOR */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link
            to="/upload-space"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-mono font-extrabold text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-xl shadow-cyan-500/30 hover:scale-105"
          >
            <span>UPLOAD YOUR SPACE</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={handleStartDemo}
            className="w-full sm:w-auto px-7 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg hover:border-cyan-400"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>TRY DEMO ENVIRONMENT</span>
          </button>

          <Link
            to="/simulator"
            className="w-full sm:w-auto px-6 py-4 rounded-xl text-slate-400 hover:text-slate-200 font-mono text-sm uppercase tracking-wider flex items-center justify-center space-x-1 transition-colors"
          >
            <span>ENTER SIMULATOR</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Visual Explanation: ACTION → SIMULATION → CONSEQUENCE */}
      <section className="py-12 px-6 max-w-5xl mx-auto w-full z-10">
        <div className="text-center mb-10">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
            Predictive Decision Engine
          </span>
          <h2 className="text-2xl md:text-3xl font-bold font-mono text-slate-100 mt-1">
            ACTION → SIMULATION → CONSEQUENCE
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1: Action */}
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 hover:border-amber-500/40 transition-all flex flex-col relative group">
            <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-widest">
              Stage 1: Action
            </span>
            <h3 className="text-lg font-bold text-slate-100 font-mono mt-1">
              Hypothetical Change
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Place obstacles or block key corridors (e.g. "What if Emergency Exit A becomes obstructed by debris?").
            </p>
          </div>

          {/* Step 2: Simulation */}
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 hover:border-cyan-500/40 transition-all flex flex-col relative group">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Stage 2: Simulation
            </span>
            <h3 className="text-lg font-bold text-slate-100 font-mono mt-1">
              Spatial Pathfinding
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              The A* navigation engine recalculates 3D routes in real time, detecting chokepoints and agent redirection.
            </p>
          </div>

          {/* Step 3: Consequence */}
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 hover:border-violet-500/40 transition-all flex flex-col relative group">
            <div className="w-12 h-12 rounded-xl bg-violet-950/60 border border-violet-500/40 flex items-center justify-center text-violet-400 mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-mono font-bold text-violet-400 uppercase tracking-widest">
              Stage 3: Consequence
            </span>
            <h3 className="text-lg font-bold text-slate-100 font-mono mt-1">
              Predictive Analysis
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Visualize crowd congestion, calculate simulated evacuation delay (+18s), and receive optimal exit routing.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Demo Teaser Card */}
      <section className="py-12 px-6 max-w-4xl mx-auto w-full z-10 mb-12">
        <div className="glass-panel-glow p-8 rounded-3xl border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Emergency Preparedness Prototype
            </span>
            <h3 className="text-2xl font-bold font-mono text-slate-100">
              Test "Exit A Blocked" Now
            </h3>
            <p className="text-xs text-slate-400 max-w-md">
              Watch 10 simulated occupants automatically reroute to Exit B, highlighting corridor bottlenecks and safety margins.
            </p>
          </div>
          <button
            onClick={handleStartDemo}
            className="px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-extrabold text-xs uppercase tracking-wider flex items-center space-x-2 transition-all shadow-lg shadow-cyan-500/20 shrink-0"
          >
            <span>LAUNCH 3D DEMO</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
