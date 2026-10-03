import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import {
  Split,
  AlertTriangle,
  Clock,
  Users,
  Activity,
  Navigation,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ComparisonPage: React.FC = () => {
  const [selectedPresetA, setSelectedPresetA] = useState('exit-a');
  const [selectedPresetB, setSelectedPresetB] = useState('corridor');

  // Scenario presets for hackathon what-if comparison
  const scenarioOptions = {
    'exit-a': {
      title: 'Hypothetical Action A: Exit A Blocked',
      action: 'Debris placed directly blocking Emergency Exit A',
      blockedExits: ['Exit A (North Wing)'],
      affectedPeople: 6,
      congestion: 48,
      delay: 18,
      riskLevel: 'Medium',
      recommendedExit: 'Exit B (West Concourse)',
      bottleneck: 'Central Concourse Junction & Corridor B',
      flowVelocity: 68,
    },
    'corridor': {
      title: 'Hypothetical Action B: Main Corridor Blocked',
      action: 'Hazard obstruction placed across central intersection',
      blockedExits: ['None (Corridor Chokepoint)'],
      affectedPeople: 8,
      congestion: 74,
      delay: 24,
      riskLevel: 'High',
      recommendedExit: 'Exit C (South Corridor)',
      bottleneck: 'Narrow Side Passageway',
      flowVelocity: 42,
    },
    'exit-b': {
      title: 'Hypothetical Action C: Exit B Blocked',
      action: 'West wing access door obstructed',
      blockedExits: ['Exit B (West Concourse)'],
      affectedPeople: 4,
      congestion: 38,
      delay: 12,
      riskLevel: 'Medium',
      recommendedExit: 'Exit A (North Wing)',
      bottleneck: 'East Hallway Concourse',
      flowVelocity: 78,
    },
    'baseline': {
      title: 'Baseline: All Exits Operational',
      action: 'Standard unimpeded facility evacuation routes',
      blockedExits: ['None'],
      affectedPeople: 0,
      congestion: 12,
      delay: 0,
      riskLevel: 'Low',
      recommendedExit: 'Nearest Assigned Exit',
      bottleneck: 'None (Smooth Flow)',
      flowVelocity: 100,
    },
  };

  const scenA = scenarioOptions[selectedPresetA as keyof typeof scenarioOptions];
  const scenB = scenarioOptions[selectedPresetB as keyof typeof scenarioOptions];

  // Recharts bar comparison data
  const barData = [
    {
      metric: 'Affected People',
      'Decision A': scenA.affectedPeople,
      'Decision B': scenB.affectedPeople,
    },
    {
      metric: 'Est. Delay (+sec)',
      'Decision A': scenA.delay,
      'Decision B': scenB.delay,
    },
    {
      metric: 'Congestion Index (%)',
      'Decision A': scenA.congestion,
      'Decision B': scenB.congestion,
    },
  ];

  // Radar multi-attribute assessment
  const radarData = [
    { subject: 'Delay (sec)', A: scenA.delay * 3.5, B: scenB.delay * 3.5, fullMark: 100 },
    { subject: 'Crowd Density', A: scenA.congestion, B: scenB.congestion, fullMark: 100 },
    { subject: 'Disrupted People', A: scenA.affectedPeople * 10, B: scenB.affectedPeople * 10, fullMark: 100 },
    { subject: 'Chokepoint Severity', A: scenA.riskLevel === 'High' ? 85 : 55, B: scenB.riskLevel === 'High' ? 85 : 55, fullMark: 100 },
    { subject: 'Evacuation Velocity', A: scenA.flowVelocity, B: scenB.flowVelocity, fullMark: 100 },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] p-6 md:p-10 max-w-7xl mx-auto flex flex-col space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
            What-If Multi-Scenario Analysis
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold font-mono text-slate-100 mt-1">
            Compare Decision Futures
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Evaluate consequences side-by-side: see how changing an obstacle location shifts crowd bottlenecks and delays.
          </p>
        </div>

        <Link
          to="/simulator"
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition-all shadow-md shadow-cyan-500/20"
        >
          <span>OPEN 3D SIMULATOR</span>
          <ArrowRight className="w-4 h-4 text-slate-950" />
        </Link>
      </div>

      {/* Selectors for Scenario A and Scenario B */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scenario A Selector */}
        <div className="bg-slate-900/70 p-5 rounded-2xl border border-cyan-500/40 relative space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span>DECISION FUTURE A</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              {scenA.riskLevel} Risk
            </span>
          </div>

          <select
            value={selectedPresetA}
            onChange={e => setSelectedPresetA(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 text-sm font-mono text-slate-100 rounded-lg p-2.5 focus:outline-none"
          >
            <option value="exit-a">Hypothetical Action A: Exit A Blocked</option>
            <option value="corridor">Hypothetical Action B: Main Corridor Blocked</option>
            <option value="exit-b">Hypothetical Action C: Exit B Blocked</option>
            <option value="baseline">Baseline: All Exits Clear</option>
          </select>

          <p className="text-xs text-slate-400 font-sans">
            {scenA.action}
          </p>
        </div>

        {/* Scenario B Selector */}
        <div className="bg-slate-900/70 p-5 rounded-2xl border border-violet-500/40 relative space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-violet-300 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-400"></span>
              <span>DECISION FUTURE B</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800">
              {scenB.riskLevel} Risk
            </span>
          </div>

          <select
            value={selectedPresetB}
            onChange={e => setSelectedPresetB(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 text-sm font-mono text-slate-100 rounded-lg p-2.5 focus:outline-none"
          >
            <option value="corridor">Hypothetical Action B: Main Corridor Blocked</option>
            <option value="exit-a">Hypothetical Action A: Exit A Blocked</option>
            <option value="exit-b">Hypothetical Action C: Exit B Blocked</option>
            <option value="baseline">Baseline: All Exits Clear</option>
          </select>

          <p className="text-xs text-slate-400 font-sans">
            {scenB.action}
          </p>
        </div>
      </div>

      {/* Side-by-Side Key Metrics Comparison Table */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold font-mono uppercase text-slate-200">
            Side-By-Side Consequence Telemetry
          </h3>
          <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">
            * SIMULATED ESTIMATES
          </span>
        </div>

        <div className="divide-y divide-slate-800/80 font-mono text-xs">
          <div className="grid grid-cols-3 p-3.5 bg-slate-950/40 text-slate-400 text-[10px] uppercase tracking-wider">
            <span>Simulation Metric</span>
            <span className="text-cyan-400">Decision A ({scenA.title.split(':')[1] || scenA.title})</span>
            <span className="text-violet-400">Decision B ({scenB.title.split(':')[1] || scenB.title})</span>
          </div>

          <div className="grid grid-cols-3 p-3.5 items-center">
            <span className="text-slate-300 font-sans flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Affected Occupants</span>
            </span>
            <span className="text-cyan-300 font-bold text-sm">
              {scenA.affectedPeople} of 10 people
            </span>
            <span className="text-violet-300 font-bold text-sm">
              {scenB.affectedPeople} of 10 people
            </span>
          </div>

          <div className="grid grid-cols-3 p-3.5 items-center">
            <span className="text-slate-300 font-sans flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Estimated Evacuation Delay</span>
            </span>
            <span className="text-amber-300 font-bold text-sm">
              +{scenA.delay} seconds
            </span>
            <span className="text-amber-300 font-bold text-sm">
              +{scenB.delay} seconds
            </span>
          </div>

          <div className="grid grid-cols-3 p-3.5 items-center">
            <span className="text-slate-300 font-sans flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-rose-400" />
              <span>Corridor Crowd Density</span>
            </span>
            <span className="text-slate-200">
              {scenA.congestion}% ({scenA.riskLevel})
            </span>
            <span className="text-slate-200">
              {scenB.congestion}% ({scenB.riskLevel})
            </span>
          </div>

          <div className="grid grid-cols-3 p-3.5 items-center">
            <span className="text-slate-300 font-sans flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Primary Bottleneck Chokepoint</span>
            </span>
            <span className="text-slate-300 font-sans text-[11px]">
              {scenA.bottleneck}
            </span>
            <span className="text-slate-300 font-sans text-[11px]">
              {scenB.bottleneck}
            </span>
          </div>

          <div className="grid grid-cols-3 p-3.5 items-center">
            <span className="text-slate-300 font-sans flex items-center space-x-1.5">
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>Recommended Alternative Exit</span>
            </span>
            <span className="text-emerald-400 font-bold">
              {scenA.recommendedExit}
            </span>
            <span className="text-emerald-400 font-bold">
              {scenB.recommendedExit}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Analytics with Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart Comparison */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-mono text-slate-100 uppercase">
              Comparative Impact Metrics
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Bar Telemetry</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="metric" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Decision A" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Decision B" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart Multi-Attribute Profile */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-mono text-slate-100 uppercase">
              Spatial Risk Profile (Radar)
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Multi-Vector</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <PolarRadiusAxis stroke="#334155" tick={{ fontSize: 8 }} />
                <Radar name="Decision A" dataKey="A" stroke="#00f0ff" fill="#00f0ff" fillOpacity={0.25} />
                <Radar name="Decision B" dataKey="B" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Decision Guidance Synthesis Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 flex items-start space-x-4">
        <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold font-mono text-slate-100 uppercase">
            Simulation Recommendation Summary
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Blocking <strong className="text-cyan-300">{scenA.title.split(':')[1]}</strong> results in a {scenA.delay}s delay with {scenA.affectedPeople} rerouted occupants, whereas <strong className="text-violet-300">{scenB.title.split(':')[1]}</strong> causes {scenB.delay}s delay and higher chokepoint congestion. If an emergency corridor must be closed for maintenance, <strong className="text-emerald-400">Exit A blockage</strong> preserves overall facility evacuation velocity more efficiently.
          </p>
        </div>
      </div>
    </div>
  );
};
