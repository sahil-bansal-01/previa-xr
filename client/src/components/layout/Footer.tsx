import React from 'react';
import { Layers, Shield, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#E2E5E9] bg-white py-8 px-6 text-[#667085] text-xs font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-[#2563EB]" />
          <span className="font-bold text-[#172033]">PREVIA XR</span>
          <span>&mdash; Preview Before You Act.</span>
        </div>

        <div className="flex items-center space-x-6 text-[11px]">
          <span className="flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Grid A* Pathfinding Engine</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Deterministic Spatial Computing</span>
          </span>
        </div>

        <div className="text-[#98A2B3] text-[11px]">
          <span>You Define Your Space &bull; PREVIA Simulates The Future</span>
        </div>
      </div>
    </footer>
  );
};
