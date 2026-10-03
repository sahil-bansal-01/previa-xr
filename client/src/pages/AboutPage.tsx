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
      color: 'text-cyan-400',
      border: 'border-cyan-500/30',
      bg: 'bg-cyan-950/20',
      desc: 'Define or load a spatial 3D scenario with architectural walls, corridors, rooms, emergency exit portals, and occupants.',
    },
    {
      num: '02',
      title: 'ACT',
      icon: Move,
      color: 'text-amber-400',
      border: 'border-amber-500/30',
      bg: 'bg-amber-950/20',
      desc: 'Perform a hypothetical spatial action (e.g. move a heavy industrial trolley or hazard debris to block Emergency Exit A).',
    },
    {
      num: '03',
      title: 'SIMULATE',
      icon: Cpu,
      color: 'text-blue-400',
      border: 'border-blue-500/30',
      bg: 'bg-blue-950/20',
      desc: 'The deterministic A* grid pathfinding engine detects blocked cells and recalculates optimal routing for all affected people.',
    },
    {
      num: '04',
      title: 'OBSERVE',
      icon: Eye,
      color: 'text-emerald-400',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-950/20',
      desc: 'Watch occupants actively detour inside the 3D spatial scene, tracking status transitions from Moving to Rerouting and Evacuated.',
    },
    {
      num: '05',
      title: 'COMPARE',
      icon: Split,
      color: 'text-violet-400',
      border: 'border-violet-500/30',
      bg: 'bg-violet-950/20',
      desc: 'Compare multiple decision futures side-by-side using multi-attribute radar charts and bar telemetry to identify the safest path.',
    },
    {
      num: '06',
      title: 'SAVE',
      icon: Save,
      color: 'text-rose-400',
      border: 'border-rose-500/30',
      bg: 'bg-rose-950/20',
      desc: 'Persist simulation runs and custom scenarios into MongoDB so emergency planners and facility operators can revisit audit trails.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] p-6 md:p-12 max-w-6xl mx-auto flex flex-col space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
          Platform Architecture & Philosophy
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold font-mono text-slate-100 tracking-tight">
          How PREVIA <span className="text-cyan-400">XR</span> Works
        </h1>
        <p className="text-sm md:text-base text-slate-400 font-sans leading-relaxed">
          “Instead of only showing what is happening now, PREVIA XR lets you change the environment and preview what could happen next.”
        </p>
      </div>

      {/* 6-Step Visual Workflow */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map(step => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className={`p-6 rounded-2xl border ${step.border} ${step.bg} backdrop-blur-sm relative flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-transform`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-black font-mono text-slate-600">
                    {step.num}
                  </span>
                  <div className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 ${step.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-lg font-bold font-mono text-slate-100 tracking-wide">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/60 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                Stage {step.num} Execution
              </div>
            </div>
          );
        })}
      </div>

      {/* XR Readiness & AI Integration Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        {/* XR Readiness Card */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-sm font-bold uppercase">
            <Glasses className="w-5 h-5" />
            <span>WebXR Spatial Computing Architecture</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The platform architecture cleanly decouples the 3D Canvas (<code className="text-cyan-300">SpatialScene</code>), navigation layer (<code className="text-cyan-300">PathfindingEngine</code>), and state management (<code className="text-cyan-300">SimulationContext</code>). This modularity allows effortless progressive enhancement into WebXR headsets (Meta Quest, Apple Vision Pro, AR glasses) with 6DOF controller input and hand-tracking.
          </p>
        </div>

        {/* AI Integration Card */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-violet-400 font-mono text-sm font-bold uppercase">
            <Bot className="w-5 h-5" />
            <span>Future AI Consequence Synthesis</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            While PREVIA XR's simulation engine is 100% deterministic and runs locally with zero external API dependencies, the architecture includes dedicated service hooks (<code className="text-violet-300">/api/ai/analyze-consequence</code>) for future LLM integration to generate natural-language safety briefings and multi-lingual evacuation guidance.
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-6">
        <Link
          to="/simulator"
          className="inline-flex items-center space-x-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-extrabold text-sm uppercase tracking-wider shadow-xl shadow-cyan-500/20"
        >
          <span>TRY THE LIVE SIMULATOR NOW</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
