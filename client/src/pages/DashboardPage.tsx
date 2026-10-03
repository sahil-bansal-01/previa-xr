import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { scenarioService } from '../services/scenarioService';
import { simulationService } from '../services/simulationService';
import { useAuth } from '../contexts/AuthContext';
import { useSimulation } from '../contexts/SimulationContext';
import { Scenario, SimulationRun } from '../simulation/types/simulationTypes';
import {
  Sparkles,
  Layers,
  Activity,
  History,
  Clock,
  ArrowRight,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { blockExitA, simulateFuture } = useSimulation();

  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [simulations, setSimulations] = useState<SimulationRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scenRes, simRes] = await Promise.all([
          scenarioService.getScenarios().catch(() => ({ data: [] })),
          simulationService.getSimulations().catch(() => ({ data: [] })),
        ]);
        setScenarios(scenRes.data || []);
        setSimulations(simRes.data || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStartDemo = () => {
    blockExitA();
    navigate('/simulator');
    setTimeout(() => {
      simulateFuture();
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#07090e] p-6 md:p-10 max-w-7xl mx-auto flex flex-col space-y-8">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
            Operator Dashboard
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold font-mono text-slate-100 mt-1">
            Welcome, {user?.name || 'Simulation Operator'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor spatial environments, revisit simulation outcomes, and execute hypothetical tests.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleStartDemo}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-extrabold text-xs uppercase tracking-wider flex items-center space-x-2 transition-all shadow-lg shadow-cyan-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>START DEMO (EXIT A)</span>
          </button>

          <Link
            to="/simulator"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition-colors"
          >
            <Play className="w-3.5 h-3.5 text-cyan-400" />
            <span>OPEN 3D SIMULATOR</span>
          </Link>
        </div>
      </div>

      {/* High-Level Simulation Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase">Total Scenarios</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-slate-100">
            {scenarios.length || 1}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">1 Default Campus Facility</span>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase">Total Simulations</span>
            <Activity className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-violet-300">
            {simulations.length}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Stored in MongoDB</span>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase">Avg. Evacuation Delay</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-amber-300">
            +18s
          </div>
          <span className="text-[9px] text-cyan-400 font-mono uppercase">SIMULATED ESTIMATE</span>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase">Active Exits Checked</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-emerald-400">
            3 Exits
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Exit A, Exit B, Exit C</span>
        </div>
      </div>

      {/* Two Column Layout: Recent Scenarios & Recent Simulations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Scenarios */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-mono text-slate-100 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Spatial Scenarios</span>
            </h2>
            <Link
              to="/scenarios"
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {scenarios.map(scen => (
              <div
                key={scen._id || scen.id}
                className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-200 font-mono">
                    {scen.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                    {scen.description}
                  </p>
                  <div className="flex items-center space-x-3 mt-2 text-[10px] font-mono text-slate-500">
                    <span>10 Occupants</span>
                    <span>•</span>
                    <span>3 Exit Portals</span>
                    <span>•</span>
                    <span className="text-emerald-400">Campus Facility</span>
                  </div>
                </div>

                <Link
                  to="/simulator"
                  className="px-3 py-1.5 rounded-lg bg-cyan-950/70 text-cyan-300 border border-cyan-800/80 hover:bg-cyan-900/80 text-xs font-mono font-medium transition-colors shrink-0 ml-4"
                >
                  Load in 3D
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Simulation Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-mono text-slate-100 flex items-center space-x-2">
              <History className="w-4 h-4 text-violet-400" />
              <span>Recent Simulation Runs</span>
            </h2>
            <Link
              to="/history"
              className="text-xs font-mono text-violet-400 hover:text-violet-300 flex items-center space-x-1"
            >
              <span>View History</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {simulations.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/30 rounded-xl border border-slate-800 text-slate-500 text-xs font-mono">
                No simulations run yet. Go to Simulator to test your first hypothetical decision!
              </div>
            ) : (
              simulations.slice(0, 4).map(run => (
                <div
                  key={run._id || run.id}
                  className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold font-mono text-slate-200">
                        {run.actionPerformed}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800/60">
                        {run.riskLevel} Risk
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-[11px] font-mono text-slate-400">
                      <span>Affected: <strong className="text-cyan-300">{run.affectedPeople}</strong></span>
                      <span>Delay: <strong className="text-amber-300">+{run.estimatedDelay}s</strong></span>
                      <span>Optimal: <strong className="text-slate-200">{run.recommendedExit}</strong></span>
                    </div>
                  </div>

                  <Link
                    to="/history"
                    className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
