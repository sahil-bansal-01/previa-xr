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
    <div className="min-h-screen bg-[#F7F8FA] p-6 md:p-10 max-w-7xl mx-auto flex flex-col space-y-8 text-[#172033]">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E5E9] pb-6">
        <div>
          <span className="text-xs font-sans uppercase tracking-widest text-[#2563EB] font-bold">
            Operator Dashboard
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold font-sans text-[#172033] mt-1">
            Welcome, {user?.name || 'Spatial Analyst'}
          </h1>
          <p className="text-xs text-[#667085] mt-1 font-sans">
            Monitor spatial environments, revisit simulation outcomes, and execute what-if decision tests.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleStartDemo}
            className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-sans font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition-all shadow-md hover:shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>START DEMO (EXIT A)</span>
          </button>

          <Link
            to="/simulator"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#F1F3F5] border border-[#E2E5E9] text-[#172033] font-sans font-semibold text-xs uppercase tracking-wider flex items-center space-x-2 transition-colors shadow-xs"
          >
            <Play className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>OPEN 3D SIMULATOR</span>
          </Link>
        </div>
      </div>

      {/* High-Level Simulation Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E2E5E9] shadow-sm">
          <div className="flex items-center justify-between text-[#667085] mb-1">
            <span className="text-[10px] font-sans uppercase font-bold tracking-wide">Saved Environments</span>
            <Layers className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="text-3xl font-sans font-extrabold text-[#172033]">
            {scenarios.length || 1}
          </div>
          <span className="text-[11px] text-[#667085] font-sans mt-0.5 block">1 Default Campus Facility</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E5E9] shadow-sm">
          <div className="flex items-center justify-between text-[#667085] mb-1">
            <span className="text-[10px] font-sans uppercase font-bold tracking-wide">Simulation Runs</span>
            <Activity className="w-4 h-4 text-[#14B8A6]" />
          </div>
          <div className="text-3xl font-sans font-extrabold text-[#14B8A6]">
            {simulations.length}
          </div>
          <span className="text-[11px] text-[#667085] font-sans mt-0.5 block">Logged Simulations</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E5E9] shadow-sm">
          <div className="flex items-center justify-between text-[#667085] mb-1">
            <span className="text-[10px] font-sans uppercase font-bold tracking-wide">Avg. Delay</span>
            <Clock className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="text-3xl font-sans font-extrabold text-[#F59E0B]">
            +18s
          </div>
          <span className="text-[10px] text-[#2563EB] font-sans uppercase font-semibold mt-0.5 block">SIMULATED ESTIMATE</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E5E9] shadow-sm">
          <div className="flex items-center justify-between text-[#667085] mb-1">
            <span className="text-[10px] font-sans uppercase font-bold tracking-wide">Active Exits</span>
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div className="text-3xl font-sans font-extrabold text-[#16A34A]">
            3 Exits
          </div>
          <span className="text-[11px] text-[#667085] font-sans mt-0.5 block">Exit A, Exit B, Exit C</span>
        </div>
      </div>

      {/* Two Column Layout: Recent Scenarios & Recent Simulations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Scenarios */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E5E9] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-sans text-[#172033] flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#2563EB]" />
              <span>Spatial Scenarios</span>
            </h2>
            <Link
              to="/scenarios"
              className="text-xs font-sans font-semibold text-[#2563EB] hover:underline flex items-center space-x-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {scenarios.map(scen => (
              <div
                key={scen._id || scen.id}
                className="bg-[#F7F8FA] p-4 rounded-xl border border-[#E2E5E9] hover:border-[#2563EB] transition-all flex items-center justify-between"
              >
                <div>
                  <h3 className="text-sm font-bold text-[#172033] font-sans">
                    {scen.title}
                  </h3>
                  <p className="text-xs text-[#667085] line-clamp-1 mt-0.5 font-sans">
                    {scen.description}
                  </p>
                  <div className="flex items-center space-x-3 mt-2 text-[11px] font-sans text-[#667085]">
                    <span>10 Occupants</span>
                    <span>&bull;</span>
                    <span>3 Exit Portals</span>
                    <span>&bull;</span>
                    <span className="text-[#16A34A] font-semibold">Campus Facility</span>
                  </div>
                </div>

                <Link
                  to="/simulator"
                  className="px-3.5 py-1.5 rounded-lg bg-white text-[#2563EB] border border-[#BFDBFE] hover:bg-[#EFF6FF] text-xs font-sans font-semibold transition-colors shrink-0 ml-4 shadow-xs"
                >
                  Load in 3D
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Simulation Results */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E5E9] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-sans text-[#172033] flex items-center space-x-2">
              <History className="w-4 h-4 text-[#2563EB]" />
              <span>Recent Simulation Runs</span>
            </h2>
            <Link
              to="/history"
              className="text-xs font-sans font-semibold text-[#2563EB] hover:underline flex items-center space-x-1"
            >
              <span>View History</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {simulations.length === 0 ? (
              <div className="p-8 text-center bg-[#F7F8FA] rounded-xl border border-[#E2E5E9] text-[#667085] text-xs font-sans">
                No simulations run yet. Go to Simulator to test your first hypothetical decision!
              </div>
            ) : (
              simulations.slice(0, 4).map(run => (
                <div
                  key={run._id || run.id}
                  className="bg-[#F7F8FA] p-4 rounded-xl border border-[#E2E5E9] hover:border-[#2563EB] transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold font-sans text-[#172033]">
                        {run.actionPerformed}
                      </span>
                      <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                        {run.riskLevel} Risk
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-[11px] font-sans text-[#667085]">
                      <span>Affected: <strong className="text-[#2563EB] font-semibold">{run.affectedPeople}</strong></span>
                      <span>Delay: <strong className="text-[#DC2626] font-semibold">+{run.estimatedDelay}s</strong></span>
                      <span>Optimal: <strong className="text-[#172033] font-semibold">{run.recommendedExit}</strong></span>
                    </div>
                  </div>

                  <Link
                    to="/history"
                    className="p-2 text-[#667085] hover:text-[#172033] transition-colors"
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
