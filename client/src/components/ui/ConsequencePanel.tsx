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
  ChevronLeft,
  Info,
  Check,
  BarChart2,
} from 'lucide-react';

interface ConsequencePanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const ConsequencePanel: React.FC<ConsequencePanelProps> = ({ isOpen, onToggle }) => {
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
    Critical: 'bg-rose-950/90 text-rose-200 border-rose-500',
  };

  if (!isOpen) {
    return (
      <div className="absolute top-20 right-4 z-20">
        <button
          onClick={onToggle}
          className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-950/85 backdrop-blur-xl border border-slate-700/80 text-cyan-300 hover:text-cyan-200 font-mono text-xs font-bold shadow-2xl transition-all hover:scale-105"
          title="Open Step 3: Consequence Analysis"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
          <BarChart2 className="w-3.5 h-3.5 text-violet-400" />
          <span>STEP 3: CONSEQUENCES</span>
          {timelinePhase === 'AFTER' && (
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded">
              +{consequence.estimatedDelay}s
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <aside className="absolute top-20 right-4 z-20 w-84 max-h-[calc(100vh-12rem)] flex flex-col bg-slate-950/85 backdrop-blur-2xl border border-slate-800/90 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded bg-violet-500/20 text-violet-400 flex items-center justify-center font-mono text-xs font-black">
            3
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-violet-400 uppercase font-bold block">
              STEP 3: CONSEQUENCES
            </span>
            <span className="text-xs font-bold text-slate-200 font-mono">
              Live Spatial Analysis
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase ${
              riskBadgeStyles[consequence.riskLevel] || riskBadgeStyles.Medium
            }`}
          >
            {consequence.riskLevel}
          </span>
          <button
            onClick={onToggle}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Collapse Panel for Full 3D View"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Blocked Exits */}
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-0.5">
              <span className="text-[9px] font-mono uppercase">Blocked Exits</span>
              <AlertTriangle className="w-3 h-3 text-amber-400" />
            </div>
            <div className="text-xl font-mono font-extrabold text-slate-100">
              {consequence.blockedExits.length}
            </div>
            <div className="text-[9px] font-mono text-slate-400 truncate">
              {consequence.blockedExits.length > 0
                ? consequence.blockedExits.join(', ')
                : 'None (All Clear)'}
            </div>
          </div>

          {/* Affected People */}
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-0.5">
              <span className="text-[9px] font-mono uppercase">Affected People</span>
              <Users className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="text-xl font-mono font-extrabold text-cyan-300">
              {consequence.affectedPeople}{' '}
              <span className="text-[10px] text-slate-400 font-normal">/ {consequence.totalPeople}</span>
            </div>
            <div className="text-[9px] font-mono text-slate-400">
              {consequence.affectedPeople > 0 ? 'Rerouting in 3D' : 'Optimal'}
            </div>
          </div>

          {/* Congestion Level */}
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-0.5">
              <span className="text-[9px] font-mono uppercase">Congestion</span>
              <Activity className="w-3 h-3 text-violet-400" />
            </div>
            <div className="text-sm font-mono font-bold text-slate-100 mt-0.5">
              {consequence.congestionLevel.split(' ')[0]}
            </div>
            <div className="text-[9px] font-mono text-slate-400">
              {consequence.congestionLevel.split(' ')[1] || 'Density'}
            </div>
          </div>

          {/* Estimated Delay */}
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-0.5">
              <span className="text-[9px] font-mono uppercase">Estimated Delay</span>
              <Clock className="w-3 h-3 text-amber-400" />
            </div>
            <div className="text-xl font-mono font-extrabold text-amber-300">
              {consequence.estimatedDelay > 0 ? `+${consequence.estimatedDelay}s` : '0s'}
            </div>
            <div className="text-[8px] font-mono font-bold text-cyan-400 uppercase">
              *SIMULATED ESTIMATE
            </div>
          </div>
        </div>

        {/* Recommended Alternative Exit */}
        <div className="bg-gradient-to-br from-slate-900/90 to-cyan-950/40 p-3 rounded-xl border border-cyan-500/30">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-mono uppercase text-cyan-300 font-bold flex items-center space-x-1">
              <Navigation className="w-3 h-3 text-cyan-400" />
              <span>Recommended Alternative Exit</span>
            </span>
            <span className="text-[8px] font-mono bg-cyan-950 text-cyan-400 px-1 py-0.5 rounded border border-cyan-800">
              OPTIMAL
            </span>
          </div>
          <div className="text-sm font-bold text-slate-100 font-mono">
            {consequence.recommendedExit}
          </div>
        </div>

        {/* Occupant Rerouting Status List */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
            Occupant Trajectories ({agents.length})
          </span>
          <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
            {agents.map(agent => (
              <div
                key={agent.id}
                className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px]"
              >
                <div className="flex items-center space-x-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      agent.status === 'Rerouting'
                        ? 'bg-amber-400 animate-pulse'
                        : agent.status === 'Reached Exit'
                        ? 'bg-emerald-400'
                        : 'bg-cyan-400'
                    }`}
                  ></span>
                  <span className="font-medium text-slate-200">{agent.name.split(' ')[0]}</span>
                </div>
                <div className="flex items-center space-x-1.5 font-mono text-[10px]">
                  <span
                    className={`${
                      agent.status === 'Rerouting'
                        ? 'text-amber-400 font-bold'
                        : agent.status === 'Reached Exit'
                        ? 'text-emerald-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {agent.status}
                  </span>
                  <span className="text-slate-500">
                    {agent.rerouteDistanceDelta ? `+${agent.rerouteDistanceDelta.toFixed(0)}m` : '0m'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="w-full py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-cyan-500/10"
          >
            {saveStatus === 'saved' ? (
              <>
                <Check className="w-3.5 h-3.5 text-slate-950" />
                <span>Saved to Database!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-slate-950" />
                <span>{saveStatus === 'saving' ? 'Saving...' : 'Save Simulation Run'}</span>
              </>
            )}
          </button>

          <button
            onClick={() => navigate('/comparison')}
            className="w-full py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-medium text-[11px] font-mono flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Split className="w-3 h-3 text-purple-400" />
            <span>Compare With Scenario B</span>
            <ChevronRight className="w-3 h-3 text-slate-500" />
          </button>
        </div>
      </div>
    </aside>
  );
};
