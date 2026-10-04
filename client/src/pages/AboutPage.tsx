import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  Sparkles,
  Layers,
  Move,
  Cpu,
  Eye,
  Split,
  Save,
  Glasses,
  Bot,
  ShieldCheck,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'CREATE',
      icon: Layers,
      color: 'text-[#2563EB]',
      border: 'border-[#E2E5E9]',
      bg: 'bg-white',
      desc: 'Define or load a spatial 3D scenario with architectural walls, corridors, rooms, emergency exit portals, and occupants.',
    },
    {
      num: '02',
      title: 'ACT',
      icon: Move,
      color: 'text-[#F59E0B]',
      border: 'border-[#E2E5E9]',
      bg: 'bg-white',
      desc: 'Perform a hypothetical spatial action (e.g. move a heavy industrial trolley or hazard debris to block Emergency Exit A).',
    },
    {
      num: '03',
      title: 'SIMULATE',
      icon: Cpu,
      color: 'text-[#2563EB]',
      border: 'border-[#E2E5E9]',
      bg: 'bg-white',
      desc: 'The deterministic A* grid pathfinding engine detects blocked cells and recalculates optimal routing for all affected people.',
    },
    {
      num: '04',
      title: 'OBSERVE',
      icon: Eye,
      color: 'text-[#16A34A]',
      border: 'border-[#E2E5E9]',
      bg: 'bg-white',
      desc: 'Watch occupants actively detour inside the 3D spatial scene, tracking status transitions from Moving to Rerouting and Evacuated.',
    },
    {
      num: '05',
      title: 'COMPARE',
      icon: Split,
      color: 'text-[#14B8A6]',
      border: 'border-[#E2E5E9]',
      bg: 'bg-white',
      desc: 'Compare multiple decision futures side-by-side using multi-attribute radar charts and bar telemetry to identify the safest path.',
    },
    {
      num: '06',
      title: 'SAVE',
      icon: Save,
      color: 'text-[#DC2626]',
      border: 'border-[#E2E5E9]',
      bg: 'bg-white',
      desc: 'Persist simulation runs and custom scenarios into MongoDB so emergency planners and facility operators can revisit audit trails.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] p-6 md:p-12 max-w-6xl mx-auto flex flex-col space-y-12 text-[#172033]">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-sans uppercase tracking-widest text-[#2563EB] font-bold">
          Platform Architecture &amp; Philosophy
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold font-sans text-[#172033] tracking-tight">
          How PREVIA <span className="text-[#2563EB]">XR</span> Works
        </h1>
        <p className="text-sm md:text-base text-[#667085] font-sans leading-relaxed">
          &ldquo;Instead of only showing what is happening now, PREVIA XR lets you change the environment and preview what could happen next.&rdquo;
        </p>
      </div>

      {/* 6-Step Visual Workflow */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map(step => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className={`p-6 rounded-2xl border ${step.border} ${step.bg} shadow-sm relative flex flex-col justify-between space-y-4 hover:shadow-md hover:-translate-y-1 transition-all`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-black font-sans text-[#CBD5E1]">
                    {step.num}
                  </span>
                  <div className={`p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E5E9] ${step.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-lg font-bold font-sans text-[#172033] tracking-wide">
                  {step.title}
                </h3>
                <p className="text-xs text-[#667085] mt-2 leading-relaxed font-sans">
                  {step.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E2E5E9] text-[10px] font-sans text-[#98A2B3] uppercase tracking-widest font-semibold">
                Stage {step.num} Execution
              </div>
            </div>
          );
        })}
      </div>

      {/* XR Readiness & AI Integration Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        {/* XR Readiness Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E5E9] shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-[#2563EB] font-sans text-sm font-bold uppercase">
            <Glasses className="w-5 h-5" />
            <span>WebXR Spatial Computing Architecture</span>
          </div>
          <p className="text-xs text-[#667085] leading-relaxed font-sans">
            The platform architecture cleanly decouples the 3D Canvas (<code className="text-[#2563EB]">SpatialScene</code>), navigation layer (<code className="text-[#2563EB]">PathfindingEngine</code>), and state management (<code className="text-[#2563EB]">SimulationContext</code>). This modularity allows effortless progressive enhancement into WebXR headsets with 6DOF controller input and hand-tracking.
          </p>
        </div>

        {/* AI Integration Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E5E9] shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-[#14B8A6] font-sans text-sm font-bold uppercase">
            <Bot className="w-5 h-5" />
            <span>AI Consequence Synthesis</span>
          </div>
          <p className="text-xs text-[#667085] leading-relaxed font-sans">
            While PREVIA XR's simulation engine is 100% deterministic and runs locally with zero external API dependencies, the architecture includes dedicated service hooks (<code className="text-[#14B8A6]">/api/ai/analyze-consequence</code>) for future LLM integration to generate natural-language safety briefings and multi-lingual evacuation guidance.
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-6">
        <Link
          to="/simulator"
          className="inline-flex items-center space-x-2 px-8 py-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-sans font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all"
        >
          <span>TRY THE LIVE SIMULATOR NOW</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
