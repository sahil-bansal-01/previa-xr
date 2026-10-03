import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { simulationService } from '../services/simulationService';
import { useSimulation } from '../contexts/SimulationContext';
import { SimulationRun } from '../simulation/types/simulationTypes';
import {
  History,
  Clock,
  Users,
  Activity,
  Navigation,
  ArrowRight,
  Eye,
  X,
  Play,
  FileText,
  AlertTriangle,
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [runs, setRuns] = useState<SimulationRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRun, setSelectedRun] = useState<SimulationRun | null>(null);

  const navigate = useNavigate();
  const { blockExitA, simulateFuture } = useSimulation();

  useEffect(() => {
    const fetchRuns = async () => {
      try {
        setLoading(true);
        const res = await simulationService.getSimulations();
        setRuns(res.data || []);
      } catch (err) {
        console.error('Failed to load simulations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRuns();
  }, []);

  const handleReplayInSimulator = () => {
    blockExitA();
    navigate('/simulator');
    setTimeout(() => {
      simulateFuture();
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#07090e] p-6 md:p-10 max-w-7xl mx-auto flex flex-col space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
            Simulation Archive
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold font-mono text-slate-100 mt-1">
            SIMULATION HISTORY
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review past decision executions, consequence logs, and rerouting outcomes saved to the database.
          </p>
        </div>

        <button
          onClick={handleReplayInSimulator}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition-all shadow-md shadow-cyan-500/20"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>REPLAY IN 3D SIMULATOR</span>
        </button>
      </div>

      {/* History Table or Empty State */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-mono text-xs">
          Loading simulation logs...
        </div>
      ) : runs.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/30 rounded-2xl border border-slate-800 text-slate-400 font-mono text-xs space-y-3">
          <p>No recorded simulation runs found in database.</p>
          <button
            onClick={handleReplayInSimulator}
            className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold"
          >
            Run Your First Simulation
          </button>
        </div>
      ) : (
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-950/80 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Scenario & Action</th>
                  <th className="p-4">Blocked Exits</th>
                  <th className="p-4">Affected People</th>
                  <th className="p-4">Congestion</th>
                  <th className="p-4">Delay (*Simulated)</th>
                  <th className="p-4">Recommended Exit</th>
                  <th className="p-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {runs.map(run => {
                  const runId = run._id || run.id || '';
                  const time = run.simulationTimestamp
                    ? new Date(run.simulationTimestamp).toLocaleString()
                    : 'Recent';

                  return (
                    <tr
                      key={runId}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedRun(run)}
                    >
                      <td className="p-4 text-slate-400 whitespace-nowrap">{time}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-200">{run.actionPerformed}</div>
                        <div className="text-[10px] text-slate-500">{run.scenarioTitle}</div>
                      </td>
                      <td className="p-4">
                        <span className="text-amber-400 font-semibold">
                          {run.blockedExits?.join(', ') || 'None'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-cyan-300 font-bold">
                          {run.affectedPeople} Occupants
                        </span>
                      </td>
                      <td className="p-4 text-slate-300">{run.congestionLevel}</td>
                      <td className="p-4">
                        <span className="text-amber-300 font-bold">+{run.estimatedDelay}s</span>
                      </td>
                      <td className="p-4 text-emerald-400 font-semibold">{run.recommendedExit}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedRun(run);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-cyan-400" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold font-mono uppercase text-slate-100">
                  Simulation Run Telemetry
                </h3>
              </div>
              <button
                onClick={() => setSelectedRun(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Action Performed</span>
                <span className="text-sm font-bold text-slate-100">{selectedRun.actionPerformed}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Spatial Complex</span>
                <span className="text-slate-300">{selectedRun.scenarioTitle}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Affected People</span>
                  <span className="text-xl font-bold text-cyan-300">{selectedRun.affectedPeople}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Estimated Delay</span>
                  <span className="text-xl font-bold text-amber-300">+{selectedRun.estimatedDelay}s</span>
                  <span className="text-[8px] text-cyan-400 uppercase block">* Simulated Estimate</span>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Congestion Severity:</span>
                  <span className="text-slate-200">{selectedRun.congestionLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Recommended Alternative:</span>
                  <span className="text-emerald-400 font-bold">{selectedRun.recommendedExit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Blocked Exits:</span>
                  <span className="text-rose-400">{selectedRun.blockedExits?.join(', ') || 'None'}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedRun(null)}
                className="px-4 py-2 bg-slate-800 text-xs font-mono text-slate-300 rounded-lg hover:bg-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedRun(null);
                  handleReplayInSimulator();
                }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs uppercase rounded-lg flex items-center space-x-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Replay in Simulator</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
