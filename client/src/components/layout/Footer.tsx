import React from 'react';
import { Compass, Shield, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/80 py-8 px-6 text-slate-500 text-xs font-mono">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Compass className="w-4 h-4 text-cyan-500" />
          <span className="font-bold text-slate-300">PREVIA XR</span>
          <span>— Preview Before You Act.</span>
        </div>

        <div className="flex items-center space-x-6 text-[11px]">
          <span className="flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Grid A* Simulation Engine</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Deterministic Spatial Computing</span>
          </span>
        </div>

        <div>
          <span>Different Decisions → Different Possible Futures</span>
        </div>
      </div>
    </footer>
  );
};
