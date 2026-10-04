import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSimulation } from '../contexts/SimulationContext';
import {
  UploadCloud,
  Sparkles,
  ArrowRight,
  MapPin,
  SlidersHorizontal,
  Compass,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
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
    <div className="min-h-screen bg-[#F7F8FA] text-[#172033] flex flex-col spatial-grid-bg font-sans">
      {/* Hero Section */}
      <section className="pt-20 pb-14 md:pt-28 md:pb-20 px-6 max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Logo Tag */}
        <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] px-3.5 py-1.5 rounded-full mb-6">
          PREVIA XR
        </span>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#172033] leading-[1.1]">
          Preview Before <br className="hidden sm:inline" />
          <span className="text-[#2563EB]">You Act.</span>
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-[#667085] max-w-2xl mt-6 font-normal leading-relaxed">
          Bring your space into PREVIA, change a condition, and see how people and routes respond.
        </p>

        {/* Core Action CTAs */}
        <div className="mt-9 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            to="/upload-space"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm tracking-normal flex items-center justify-center space-x-2 transition-all shadow-sm hover:shadow-md"
          >
            <UploadCloud className="w-4 h-4" />
            <span>UPLOAD YOUR SPACE</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={handleStartDemo}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-[#F8FAFC] border border-[#E2E5E9] hover:border-[#CBD5E1] text-[#172033] font-semibold text-sm tracking-normal flex items-center justify-center space-x-2 transition-all shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-[#2563EB]" />
            <span>TRY DEMO</span>
          </button>
        </div>
      </section>

      {/* Exactly Three Steps */}
      <section className="py-12 px-6 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 01 */}
          <div className="bg-white p-7 rounded-2xl border border-[#E2E5E9] shadow-subtle flex flex-col text-left">
            <span className="text-xs font-bold text-[#2563EB] tracking-wider mb-2 font-mono">
              01
            </span>
            <div className="flex items-center space-x-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB]">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#172033]">
                DEFINE YOUR SPACE
              </h3>
            </div>
            <p className="text-xs md:text-sm text-[#667085] leading-relaxed">
              Upload walkthrough footage or floor images, then verify walls, exits, and people in the clean 2D editor.
            </p>
          </div>

          {/* Step 02 */}
          <div className="bg-white p-7 rounded-2xl border border-[#E2E5E9] shadow-subtle flex flex-col text-left">
            <span className="text-xs font-bold text-[#2563EB] tracking-wider mb-2 font-mono">
              02
            </span>
            <div className="flex items-center space-x-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB]">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#172033]">
                CHANGE A CONDITION
              </h3>
            </div>
            <p className="text-xs md:text-sm text-[#667085] leading-relaxed">
              Hypothesize what happens if you block an exit, close a corridor, or introduce a physical obstacle.
            </p>
          </div>

          {/* Step 03 */}
          <div className="bg-white p-7 rounded-2xl border border-[#E2E5E9] shadow-subtle flex flex-col text-left">
            <span className="text-xs font-bold text-[#2563EB] tracking-wider mb-2 font-mono">
              03
            </span>
            <div className="flex items-center space-x-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB]">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#172033]">
                SEE THE FUTURE
              </h3>
            </div>
            <p className="text-xs md:text-sm text-[#667085] leading-relaxed">
              Watch real-time 3D occupant rerouting, congestion points, and precise delay consequences instantly.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
