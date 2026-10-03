import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../../contexts/SimulationContext';
import {
  Compass,
  UploadCloud,
  ChevronDown,
  Building,
  CheckCircle2,
  Sparkles,
  Layers,
} from 'lucide-react';

export const EnvironmentSelector: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeEnvironment,
    userEnvironments,
    loadEnvironment,
    loadDemoEnvironment,
  } = useSimulation();

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'demo') {
      loadDemoEnvironment();
    } else if (val === 'upload_new') {
      navigate('/upload-space');
    } else {
      const chosen = userEnvironments.find(env => env._id === val);
      if (chosen) {
        loadEnvironment(chosen);
      }
    }
  };

  return (
    <div className="flex items-center space-x-2 bg-slate-950/85 backdrop-blur-xl border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-xl text-xs font-mono">
      <div className="flex items-center space-x-1.5 text-cyan-400 font-bold uppercase tracking-wider">
        <Building className="w-3.5 h-3.5 text-cyan-400" />
        <span className="hidden sm:inline">ENVIRONMENT:</span>
      </div>

      <div className="relative">
        <select
          value={activeEnvironment ? activeEnvironment._id : 'demo'}
          onChange={handleSelectChange}
          className="appearance-none bg-slate-900 border border-slate-700 hover:border-cyan-500/70 text-slate-100 py-1 pl-2.5 pr-7 rounded-lg text-xs font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer transition-all"
        >
          <option value="demo">Demo Campus Complex (Fixed)</option>
          {userEnvironments.map(env => (
            <option key={env._id} value={env._id}>
              {env.name} ({env.analysisStatus === 'confirmed' ? 'Verified' : 'Draft'})
            </option>
          ))}
          <option value="upload_new">+ Upload Your Space...</option>
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
      </div>

      {activeEnvironment ? (
        <span className="hidden md:inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono">
          <CheckCircle2 className="w-3 h-3" />
          <span>Custom Space</span>
        </span>
      ) : (
        <span className="hidden md:inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono">
          <Compass className="w-3 h-3" />
          <span>Demo Complex</span>
        </span>
      )}

      <button
        type="button"
        onClick={() => navigate('/upload-space')}
        title="Upload walkthrough video or images to create a new space"
        className="px-2 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-[11px] font-mono flex items-center space-x-1 transition-all"
      >
        <UploadCloud className="w-3 h-3" />
        <span className="hidden lg:inline">Upload Space</span>
      </button>
    </div>
  );
};
