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
    <div className="min-h-screen bg-[#F7F8FA] p-6 md:p-10 max-w-7xl mx-auto flex flex-col space-y-8 text-[#172033]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E5E9] pb-6">
        <div>
          <span className="text-xs font-sans uppercase tracking-widest text-[#2563EB] font-bold">
            Simulation Archive
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold font-sans text-[#172033] mt-1">
            SIMULATION HISTORY
          </h1>
          <p className="text-xs text-[#667085] mt-1 font-sans">
            Review past decision executions, consequence logs, and rerouting outcomes saved to the database.
          </p>
        </div>

        <button
          onClick={handleReplayInSimulator}
          className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-sans font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition-all shadow-md hover:shadow-lg"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>REPLAY IN 3D SIMULATOR</span>
        </button>
      </div>

      {/* History Table or Empty State */}
      {loading ? (
        <div className="p-12 text-center text-[#667085] font-sans text-xs">
          Loading simulation logs...
        </div>
      ) : runs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E2E5E9] text-[#667085] font-sans text-xs space-y-3 shadow-sm">
          <p>No recorded simulation runs found in database.</p>
          <button
            onClick={handleReplayInSimulator}
            className="px-4 py-2 rounded-xl bg-[#2563EB] text-white font-bold shadow-xs hover:bg-[#1D4ED8]"
          >
            Run Your First Simulation
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2E5E9] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead className="bg-[#F7F8FA] text-[#667085] text-[11px] uppercase tracking-wider border-b border-[#E2E5E9] font-bold">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">Environment</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Affected</th>
                  <th className="p-4">Congestion</th>
                  <th className="p-4">Delay</th>
                  <th className="p-4">Result Exit</th>
                  <th className="p-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E5E9]">
                {runs.map(run => {
                  const runId = run._id || run.id || '';
                  const time = run.simulationTimestamp
                    ? new Date(run.simulationTimestamp).toLocaleDateString()
                    : 'Recent';

                  const congestionBadge =
                    run.congestionLevel?.toLowerCase().includes('high')
                      ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]'
                      : run.congestionLevel?.toLowerCase().includes('medium') || run.congestionLevel?.toLowerCase().includes('moderate')
                      ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]'
                      : 'bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]';

                  return (
                    <tr
                      key={runId}
                      className="hover:bg-[#F8FAFC] transition-colors group cursor-pointer"
                      onClick={() => setSelectedRun(run)}
                    >
                      <td className="p-4 text-[#667085] whitespace-nowrap">{time}</td>
                      <td className="p-4 font-semibold text-[#172033]">{run.scenarioTitle || 'Campus Complex'}</td>
                      <td className="p-4 font-bold text-[#172033]">{run.actionPerformed}</td>
                      <td className="p-4 font-semibold text-[#2563EB]">
                        {run.affectedPeople} Occupants
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${congestionBadge}`}>
                          {run.congestionLevel}
                        </span>
                      </td>
                      <td className="p-4 text-[#DC2626] font-bold">
                        +{run.estimatedDelay}s
                      </td>
                      <td className="p-4 text-[#16A34A] font-semibold">{run.recommendedExit}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedRun(run);
                          }}
                          className="p-1.5 rounded-lg bg-[#F1F3F5] hover:bg-[#E2E5E9] text-[#172033] transition-colors shadow-xs"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-[#2563EB]" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172033]/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-[#E2E5E9] rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E2E5E9] pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#2563EB]" />
                <h3 className="text-sm font-bold font-sans uppercase text-[#172033]">
                  Simulation Run Telemetry
                </h3>
              </div>
              <button
                onClick={() => setSelectedRun(null)}
                className="text-[#667085] hover:text-[#172033] p-1 rounded-lg hover:bg-[#F1F3F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div>
                <span className="text-[10px] text-[#667085] uppercase font-bold block">Action Performed</span>
                <span className="text-sm font-bold text-[#172033]">{selectedRun.actionPerformed}</span>
              </div>

              <div>
                <span className="text-[10px] text-[#667085] uppercase font-bold block">Spatial Complex</span>
                <span className="text-[#667085]">{selectedRun.scenarioTitle}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-[#F7F8FA] p-3.5 rounded-xl border border-[#E2E5E9]">
                  <span className="text-[10px] text-[#667085] uppercase font-bold block">Affected People</span>
                  <span className="text-xl font-bold text-[#2563EB]">{selectedRun.affectedPeople}</span>
                </div>
                <div className="bg-[#F7F8FA] p-3.5 rounded-xl border border-[#E2E5E9]">
                  <span className="text-[10px] text-[#667085] uppercase font-bold block">Estimated Delay</span>
                  <span className="text-xl font-bold text-[#DC2626]">+{selectedRun.estimatedDelay}s</span>
                  <span className="text-[9px] text-[#667085] uppercase font-semibold block mt-0.5">* Simulated Estimate</span>
                </div>
              </div>

              <div className="bg-[#F7F8FA] p-3.5 rounded-xl border border-[#E2E5E9] space-y-1.5 font-sans">
                <div className="flex justify-between">
                  <span className="text-[#667085]">Congestion Severity:</span>
                  <span className="text-[#172033] font-semibold">{selectedRun.congestionLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085]">Recommended Alternative:</span>
                  <span className="text-[#16A34A] font-bold">{selectedRun.recommendedExit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085]">Blocked Exits:</span>
                  <span className="text-[#DC2626] font-semibold">{selectedRun.blockedExits?.join(', ') || 'None'}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-3 border-t border-[#E2E5E9]">
              <button
                onClick={() => setSelectedRun(null)}
                className="px-4 py-2 bg-white border border-[#E2E5E9] text-xs font-sans font-semibold text-[#172033] rounded-xl hover:bg-[#F1F3F5] shadow-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedRun(null);
                  handleReplayInSimulator();
                }}
                className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold font-sans text-xs uppercase rounded-xl flex items-center space-x-1.5 shadow-md hover:shadow-lg"
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
