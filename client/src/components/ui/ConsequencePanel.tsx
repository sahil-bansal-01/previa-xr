import React, { useState } from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Users,
  Clock,
  Navigation,
  Activity,
  Save,
  Split,
  ChevronRight,
  ShieldAlert,
  Info,
  Check,
} from 'lucide-react';

export const ConsequencePanel: React.FC = () => {
  const { consequence, agents, saveSimulationRun, timelinePhase } = useSimulation();
  const navigate = useNavigate();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSave = async () => {
    setSaveStatus('saving');
    const res = await saveSimulationRun();
    if (res.success) {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('idle');
    }
  };

  const riskBadgeStyles = {
    Low: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40',
    Medium: 'bg-amber-950/70 text-amber-300 border-amber-500/50 animate-pulse',
    High: 'bg-red-950/70 text-red-300 border-red-500/60 animate-pulse',
    Critical: 'bg-rose-950/90 text-rose-200 border-rose-500 animate-bounce',
  };

  return (
    <aside className="w-88 h-full flex flex-col glass-panel border-l border-slate-800/80 bg-slate-950/70 z-20 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-semibold">
            Live Consequence Analysis
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            {consequence.timestamp}
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <h2 className="text-base font-bold text-slate-100 font-mono uppercase tracking-wide">
            SIMULATION RESULT
          </h2>
          <span
            className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${
              riskBadgeStyles[consequence.riskLevel] || riskBadgeStyles.Medium
            }`}
          >
            {consequence.riskLevel} Risk
          </span>
        </div>
      </div>

      <div className="p-4 space-y-5 flex-1">
        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Blocked Exits */}
          <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/90 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">Blocked Exits</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-mono font-extrabold text-slate-100">
              {consequence.blockedExits.length}
            </div>
            <div className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
              {consequence.blockedExits.length > 0
                ? consequence.blockedExits.join(', ')
                : 'None (All Clear)'}
            </div>
          </div>

          {/* Affected People */}
          <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/90 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">Affected People</span>
              <Users className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-2xl font-mono font-extrabold text-cyan-300">
              {consequence.affectedPeople}{' '}
              <span className="text-xs text-slate-400 font-normal">/ {consequence.totalPeople}</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">
              {consequence.affectedPeople > 0 ? 'Forced to reroute' : 'On optimal path'}
            </div>
          </div>

          {/* Congestion Level */}
          <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/90 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">Congestion</span>
              <Activity className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div className="text-base font-mono font-bold text-slate-100 mt-1">
              {consequence.congestionLevel.split(' ')[0]}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">
              {consequence.congestionLevel.split(' ')[1] || 'Crowd Density'}
            </div>
          </div>

          {/* Estimated Evacuation Delay */}
          <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/90 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">Estimated Delay</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-mono font-extrabold text-amber-300">
              {consequence.estimatedDelay > 0 ? `+${consequence.estimatedDelay}s` : '0s'}
            </div>
            <div className="text-[9px] font-mono font-semibold text-cyan-400 mt-0.5 uppercase tracking-wide">
              SIMULATED ESTIMATE
            </div>
          </div>
        </div>

        {/* Recommended Exit Card */}
        <div className="bg-gradient-to-br from-slate-900/90 to-cyan-950/30 p-3.5 rounded-xl border border-cyan-500/30 shadow-md">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-semibold flex items-center space-x-1.5">
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              <span>Recommended Alternative Exit</span>
            </span>
            <span className="text-[9px] font-mono bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-800/40">
              OPTIMAL FLOW
            </span>
          </div>
          <div className="text-base font-bold text-slate-100 font-mono">
            {consequence.recommendedExit}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Engine diverted occupants away from congested bottlenecks to maximize flow velocity.
          </p>
        </div>

        {/* Bottleneck Location Telemetry */}
        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium mb-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">Identified Bottleneck:</span>
            <span className="text-[11px] font-mono text-amber-300 font-semibold">
              {consequence.bottleneckLocation}
            </span>
          </div>
          {/* Progress bar for crowd density */}
          <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                consequence.congestionPercent > 70
                  ? 'bg-red-500'
                  : consequence.congestionPercent > 35
                  ? 'bg-amber-400'
                  : 'bg-cyan-400'
              }`}
              style={{ width: `${Math.min(100, consequence.congestionPercent)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1">
            <span>Crowd Density Index</span>
            <span>{Math.round(consequence.congestionPercent)}% Capacity</span>
          </div>
        </div>

        {/* Occupant Rerouting List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider">
            <span>Occupant Status ({agents.length})</span>
            <span>Detour Distance</span>
          </div>
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {agents.map(agent => (
              <div
                key={agent.id}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 border border-slate-800/60 text-xs"
              >
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      agent.status === 'Rerouting'
                        ? 'bg-amber-400 animate-pulse'
                        : agent.status === 'Reached Exit'
                        ? 'bg-emerald-400'
                        : 'bg-cyan-400'
                    }`}
                  ></span>
                  <span className="font-medium text-slate-200">{agent.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      agent.status === 'Rerouting'
                        ? 'bg-amber-950/70 text-amber-300'
                        : agent.status === 'Reached Exit'
                        ? 'bg-emerald-950/70 text-emerald-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {agent.status}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {agent.rerouteDistanceDelta ? `+${agent.rerouteDistanceDelta.toFixed(1)}m` : '0m'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mandatory Hackathon Label Notice */}
        <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/70 flex items-start space-x-2">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
            <strong className="text-cyan-300 font-mono">SIMULATED ESTIMATE NOTICE:</strong> Predictions are generated through grid A* spatial calculations and deterministic queuing models. They are for spatial preview and planning purposes, not guaranteed physical evacuation times.
          </p>
        </div>

        {/* Action Buttons: Save & Compare */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="w-full py-2.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-cyan-500/10"
          >
            {saveStatus === 'saved' ? (
              <>
                <Check className="w-4 h-4 text-slate-950" />
                <span>Simulation Run Saved to Database!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-slate-950" />
                <span>{saveStatus === 'saving' ? 'Saving to Database...' : 'Save Simulation Run'}</span>
              </>
            )}
          </button>

          <button
            onClick={() => navigate('/comparison')}
            className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 font-medium text-xs flex items-center justify-center space-x-2 transition-colors"
          >
            <Split className="w-3.5 h-3.5 text-purple-400" />
            <span>Compare With Another Scenario</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </div>
    </aside>
  );
};
