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
    <div className="min-h-screen bg-[#F7F8FA] p-6 md:p-10 max-w-7xl mx-auto flex flex-col space-y-8 text-[#172033]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E5E9] pb-6">
        <div>
          <span className="text-xs font-sans uppercase tracking-widest text-[#2563EB] font-bold">
            What-If Multi-Scenario Analysis
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold font-sans text-[#172033] mt-1">
            Compare Decision Futures
          </h1>
          <p className="text-xs text-[#667085] mt-1 font-sans">
            Evaluate consequences side-by-side: see how changing an obstacle location shifts crowd bottlenecks and delays.
          </p>
        </div>

        <Link
          to="/simulator"
          className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-sans font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition-all shadow-md hover:shadow-lg"
        >
          <span>OPEN 3D SIMULATOR</span>
          <ArrowRight className="w-4 h-4 text-white" />
        </Link>
      </div>

      {/* Selectors for Scenario A and Scenario B */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scenario A Selector */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E5E9] shadow-sm relative space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans font-bold text-[#2563EB] uppercase tracking-wider flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]"></span>
              <span>DECISION FUTURE A</span>
            </span>
            <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
              {scenA.riskLevel} Risk
            </span>
          </div>

          <select
            value={selectedPresetA}
            onChange={e => setSelectedPresetA(e.target.value)}
            className="w-full bg-white border border-[#E2E5E9] focus:border-[#2563EB] text-sm font-sans font-medium text-[#172033] rounded-xl p-2.5 focus:outline-none shadow-xs"
          >
            <option value="exit-a">Hypothetical Action A: Exit A Blocked</option>
            <option value="corridor">Hypothetical Action B: Main Corridor Blocked</option>
            <option value="exit-b">Hypothetical Action C: Exit B Blocked</option>
            <option value="baseline">Baseline: All Exits Clear</option>
          </select>

          <p className="text-xs text-[#667085] font-sans">
            {scenA.action}
          </p>
        </div>

        {/* Scenario B Selector */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E5E9] shadow-sm relative space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans font-bold text-[#14B8A6] uppercase tracking-wider flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#14B8A6]"></span>
              <span>DECISION FUTURE B</span>
            </span>
            <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]">
              {scenB.riskLevel} Risk
            </span>
          </div>

          <select
            value={selectedPresetB}
            onChange={e => setSelectedPresetB(e.target.value)}
            className="w-full bg-white border border-[#E2E5E9] focus:border-[#14B8A6] text-sm font-sans font-medium text-[#172033] rounded-xl p-2.5 focus:outline-none shadow-xs"
          >
            <option value="corridor">Hypothetical Action B: Main Corridor Blocked</option>
            <option value="exit-a">Hypothetical Action A: Exit A Blocked</option>
            <option value="exit-b">Hypothetical Action C: Exit B Blocked</option>
            <option value="baseline">Baseline: All Exits Clear</option>
          </select>

          <p className="text-xs text-[#667085] font-sans">
            {scenB.action}
          </p>
        </div>
      </div>

      {/* Side-by-Side Key Metrics Comparison Table */}
      <div className="bg-white rounded-2xl border border-[#E2E5E9] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#E2E5E9] flex items-center justify-between">
          <h3 className="text-sm font-bold font-sans uppercase text-[#172033]">
            Side-By-Side Consequence Telemetry
          </h3>
          <span className="text-[10px] font-sans text-[#2563EB] uppercase font-bold">
            * SIMULATED ESTIMATES
          </span>
        </div>

        <div className="divide-y divide-[#E2E5E9] font-sans text-xs">
          <div className="grid grid-cols-3 p-3.5 bg-[#F7F8FA] text-[#667085] text-[11px] uppercase tracking-wider font-bold">
            <span>Simulation Metric</span>
            <span className="text-[#2563EB]">Decision A ({scenA.title.split(':')[1] || scenA.title})</span>
            <span className="text-[#14B8A6]">Decision B ({scenB.title.split(':')[1] || scenB.title})</span>
          </div>

          <div className="grid grid-cols-3 p-3.5 items-center">
            <span className="text-[#667085] font-medium flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-[#2563EB]" />
              <span>Affected Occupants</span>
            </span>
            <span className="text-[#2563EB] font-bold text-sm">
              {scenA.affectedPeople} of 10 people
            </span>
            <span className="text-[#14B8A6] font-bold text-sm">
              {scenB.affectedPeople} of 10 people
            </span>
          </div>

          <div className="grid grid-cols-3 p-3.5 items-center">
            <span className="text-[#667085] font-medium flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-[#F59E0B]" />
              <span>Estimated Evacuation Delay</span>
            </span>
            <span className="text-[#DC2626] font-bold text-sm">
              +{scenA.delay} seconds
            </span>
            <span className="text-[#DC2626] font-bold text-sm">
              +{scenB.delay} seconds
            </span>
          </div>

          <div className="grid grid-cols-3 p-3.5 items-center">
            <span className="text-[#667085] font-medium flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-[#DC2626]" />
              <span>Corridor Crowd Density</span>
            </span>
            <span className="text-[#172033] font-semibold">
              {scenA.congestion}% ({scenA.riskLevel})
            </span>
            <span className="text-[#172033] font-semibold">
              {scenB.congestion}% ({scenB.riskLevel})
            </span>
          </div>

          <div className="grid grid-cols-3 p-3.5 items-center">
            <span className="text-[#667085] font-medium flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
              <span>Primary Bottleneck Chokepoint</span>
            </span>
            <span className="text-[#172033] text-xs">
              {scenA.bottleneck}
            </span>
            <span className="text-[#172033] text-xs">
              {scenB.bottleneck}
            </span>
          </div>

          <div className="grid grid-cols-3 p-3.5 items-center">
            <span className="text-[#667085] font-medium flex items-center space-x-1.5">
              <Navigation className="w-4 h-4 text-[#16A34A]" />
              <span>Recommended Alternative Exit</span>
            </span>
            <span className="text-[#16A34A] font-bold">
              {scenA.recommendedExit}
            </span>
            <span className="text-[#16A34A] font-bold">
              {scenB.recommendedExit}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Analytics with Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart Comparison */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E5E9] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-sans text-[#172033] uppercase">
              Comparative Impact Metrics
            </h3>
            <span className="text-[10px] font-sans text-[#667085]">Bar Telemetry</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="metric" stroke="#CBD5E1" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis stroke="#CBD5E1" tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E5E9', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#172033' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Decision A" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Decision B" fill="#14B8A6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart Multi-Attribute Profile */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E5E9] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-sans text-[#172033] uppercase">
              Spatial Risk Profile (Radar)
            </h3>
            <span className="text-[10px] font-sans text-[#667085]">Multi-Vector</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#E2E5E9" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748B' }} />
                <PolarRadiusAxis stroke="#CBD5E1" tick={{ fontSize: 8 }} />
                <Radar name="Decision A" dataKey="A" stroke="#2563EB" fill="#2563EB" fillOpacity={0.2} />
                <Radar name="Decision B" dataKey="B" stroke="#14B8A6" fill="#14B8A6" fillOpacity={0.2} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E5E9', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#172033' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Decision Guidance Synthesis Banner */}
      <div className="p-5 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-start space-x-4 shadow-xs">
        <CheckCircle2 className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold font-sans text-[#172033] uppercase">
            Simulation Recommendation Summary
          </h4>
          <p className="text-xs text-[#667085] leading-relaxed font-sans">
            Blocking <strong className="text-[#2563EB]">{scenA.title.split(':')[1]}</strong> results in a {scenA.delay}s delay with {scenA.affectedPeople} rerouted occupants, whereas <strong className="text-[#14B8A6]">{scenB.title.split(':')[1]}</strong> causes {scenB.delay}s delay and higher chokepoint congestion. If an emergency corridor must be closed for maintenance, <strong className="text-[#16A34A]">Exit A blockage</strong> preserves overall facility evacuation velocity more efficiently.
          </p>
        </div>
      </div>
    </div>
  );
};
