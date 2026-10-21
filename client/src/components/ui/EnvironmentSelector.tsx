import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../../contexts/SimulationContext';
import {
  Compass,
  UploadCloud,
  ChevronDown,
  Building,
  CheckCircle2,
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
      const chosen = userEnvironments.find(env => (env._id === val || env.id === val));
      if (chosen) {
        loadEnvironment(chosen);
      }
    }
  };

  const getCleanDisplayName = (name: string): string => {
    if (!name) return 'Custom Space';
    return name.trim();
  };

  return (
    <div className="flex items-center space-x-2 bg-white/95 backdrop-blur-md border border-[#E2E5E9] rounded-xl px-3 py-1.5 shadow-md text-xs font-sans">
      <div className="flex items-center space-x-1.5 text-[#172033] font-bold uppercase tracking-wider">
        <Building className="w-3.5 h-3.5 text-[#2563EB]" />
        <span className="hidden sm:inline">ENVIRONMENT:</span>
      </div>

      <div className="relative">
        <select
          value={activeEnvironment ? (activeEnvironment._id || activeEnvironment.id) : 'demo'}
          onChange={handleSelectChange}
          className="appearance-none bg-white border border-[#E2E5E9] hover:border-[#2563EB] text-[#172033] py-1 pl-2.5 pr-7 rounded-lg text-xs font-sans font-semibold focus:outline-none focus:ring-1 focus:ring-[#2563EB] cursor-pointer transition-all shadow-xs"
        >
          <option value="demo">DEMO ENVIRONMENT (Campus Complex)</option>
          {userEnvironments.map(env => {
            const envKey = env._id || env.id || 'env';
            const name = getCleanDisplayName(env.name);
            const statusTag = env.analysisStatus === 'confirmed' ? 'Verified' : 'Draft';
            return (
              <option key={envKey} value={envKey}>
                CUSTOM SPACE — {name} ({statusTag})
              </option>
            );
          })}
          <option value="upload_new">+ Upload Your Space...</option>
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-[#667085] pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
      </div>

      {activeEnvironment ? (
        <span className="hidden md:inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#DCFCE7] border border-[#BBF7D0] text-[#16A34A] text-[10px] font-sans font-bold tracking-wider uppercase">
          <CheckCircle2 className="w-3 h-3" />
          <span>CUSTOM SPACE</span>
        </span>
      ) : (
        <span className="hidden md:inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] text-[10px] font-sans font-bold tracking-wider uppercase">
          <Compass className="w-3 h-3" />
          <span>DEMO ENVIRONMENT</span>
        </span>
      )}

      <button
        type="button"
        onClick={() => navigate('/upload-space')}
        title="Upload walkthrough video or images to create a new space"
        className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#F1F3F5] border border-[#E2E5E9] text-[#2563EB] text-xs font-sans font-semibold flex items-center space-x-1 transition-all shadow-xs"
      >
        <UploadCloud className="w-3.5 h-3.5 text-[#2563EB]" />
        <span className="hidden lg:inline">Upload Space</span>
      </button>
    </div>
  );
};
