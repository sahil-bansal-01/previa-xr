import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { scenarioService } from '../services/scenarioService';
import { useSimulation } from '../contexts/SimulationContext';
import { Scenario } from '../simulation/types/simulationTypes';
import {
  Layers,
  Plus,
  Play,
  Copy,
  Trash2,
  RotateCcw,
  Edit2,
  Check,
  X,
  AlertCircle,
  Building,
} from 'lucide-react';

export const ScenariosPage: React.FC = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const navigate = useNavigate();
  const { loadScenarioById } = useSimulation();

  const fetchScenarios = async () => {
    try {
      setLoading(true);
      const res = await scenarioService.getScenarios();
      setScenarios(res.data || []);
    } catch (err) {
      console.error('Failed to load scenarios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  const handleDuplicate = async (id: string) => {
    try {
      await scenarioService.duplicateScenario(id);
      await fetchScenarios();
    } catch (err) {
      console.error('Duplicate failed:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this scenario?')) return;
    try {
      await scenarioService.deleteScenario(id);
      await fetchScenarios();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleReset = async (id: string) => {
    try {
      await scenarioService.resetScenario(id);
      await fetchScenarios();
    } catch (err) {
      console.error('Reset failed:', err);
    }
  };

  const handleStartRename = (scen: Scenario) => {
    setEditingId(scen._id || scen.id || '');
    setEditTitle(scen.title);
  };

  const handleSaveRename = async (id: string) => {
    try {
      await scenarioService.updateScenario(id, { title: editTitle });
      setEditingId(null);
      await fetchScenarios();
    } catch (err) {
      console.error('Rename failed:', err);
    }
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    try {
      await scenarioService.createScenario({
        title: newTitle,
        description: newDesc,
        environmentType: 'Indoor Emergency / Campus Facility',
      });
      setNewModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      await fetchScenarios();
    } catch (err) {
      console.error('Create scenario failed:', err);
    }
  };

  const handleLoadIntoSimulator = async (id: string) => {
    await loadScenarioById(id);
    navigate('/simulator');
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] p-6 md:p-10 max-w-7xl mx-auto flex flex-col space-y-8 text-[#172033]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E5E9] pb-6">
        <div>
          <span className="text-xs font-sans uppercase tracking-widest text-[#2563EB] font-bold">
            Scenario Management
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold font-sans text-[#172033] mt-1">
            Spatial Simulation Scenarios
          </h1>
          <p className="text-xs text-[#667085] mt-1 font-sans">
            Persisted 3D indoor configurations with pre-configured obstacle placements and occupants.
          </p>
        </div>

        <button
          onClick={() => setNewModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-sans font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>CREATE NEW SCENARIO</span>
        </button>
      </div>

      {/* Scenarios Grid */}
      {loading ? (
        <div className="p-12 text-center text-[#667085] font-sans text-xs">
          Loading persisted scenarios from MongoDB...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map(scen => {
            const scenId = scen._id || scen.id || '';
            const isEditing = editingId === scenId;

            return (
              <div
                key={scenId}
                className="bg-white rounded-2xl border border-[#E2E5E9] hover:border-[#2563EB] transition-all p-6 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-sans font-semibold px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] flex items-center space-x-1">
                      <Building className="w-3 h-3 text-[#2563EB]" />
                      <span>{scen.environmentType || 'Campus Facility'}</span>
                    </span>
                    <span className="text-[11px] font-sans text-[#667085]">
                      {scen.createdAt ? new Date(scen.createdAt).toLocaleDateString() : 'Active'}
                    </span>
                  </div>

                  {/* Title or inline edit */}
                  {isEditing ? (
                    <div className="flex items-center space-x-1.5 my-1">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="flex-1 bg-white border border-[#2563EB] rounded-lg px-2.5 py-1 text-xs text-[#172033] font-sans focus:outline-none shadow-xs"
                      />
                      <button
                        onClick={() => handleSaveRename(scenId)}
                        className="p-1.5 bg-[#2563EB] rounded-lg text-white hover:bg-[#1D4ED8]"
                        title="Save"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 bg-white border border-[#E2E5E9] rounded-lg text-[#667085] hover:bg-[#F1F3F5]"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <h3 className="text-base font-bold text-[#172033] font-sans">
                        {scen.title}
                      </h3>
                      <button
                        onClick={() => handleStartRename(scen)}
                        className="text-[#667085] hover:text-[#172033] p-1 transition-colors"
                        title="Rename Scenario"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <p className="text-xs text-[#667085] mt-2 line-clamp-3 leading-relaxed font-sans">
                    {scen.description || 'Pre-configured indoor layout with occupants and emergency exits.'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-[#E2E5E9] flex items-center justify-between text-[11px] font-sans text-[#667085]">
                    <span>Occupants: <strong className="text-[#172033]">10</strong></span>
                    <span>Exits: <strong className="text-[#16A34A]">3 Portals</strong></span>
                    <span>Grid: <strong className="text-[#172033]">24x16</strong></span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="space-y-2 pt-2 border-t border-[#E2E5E9]">
                  <button
                    onClick={() => handleLoadIntoSimulator(scenId)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs font-sans uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all shadow-sm hover:shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>LOAD INTO 3D SIMULATOR &rarr;</span>
                  </button>

                  <div className="grid grid-cols-3 gap-2 text-xs font-sans">
                    <button
                      onClick={() => handleDuplicate(scenId)}
                      className="py-1.5 px-2 bg-white hover:bg-[#F1F3F5] text-[#172033] border border-[#E2E5E9] rounded-lg flex items-center justify-center space-x-1 transition-colors shadow-xs"
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3 text-[#2563EB]" />
                      <span>Clone</span>
                    </button>
                    <button
                      onClick={() => handleReset(scenId)}
                      className="py-1.5 px-2 bg-white hover:bg-[#F1F3F5] text-[#172033] border border-[#E2E5E9] rounded-lg flex items-center justify-center space-x-1 transition-colors shadow-xs"
                      title="Reset to default environment"
                    >
                      <RotateCcw className="w-3 h-3 text-[#F59E0B]" />
                      <span>Reset</span>
                    </button>
                    <button
                      onClick={() => handleDelete(scenId)}
                      className="py-1.5 px-2 bg-white hover:bg-[#FEF2F2] text-[#DC2626] border border-[#E2E5E9] hover:border-[#FCA5A5] rounded-lg flex items-center justify-center space-x-1 transition-colors shadow-xs"
                      title="Delete Scenario"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create New Scenario Modal */}
      {newModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172033]/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-[#E2E5E9] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2E5E9] pb-3">
              <h3 className="text-sm font-bold font-sans uppercase text-[#172033]">
                Create New Spatial Scenario
              </h3>
              <button
                onClick={() => setNewModalOpen(false)}
                className="text-[#667085] hover:text-[#172033] p-1 rounded-lg hover:bg-[#F1F3F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNew} className="space-y-4">
              <div>
                <label className="block text-xs font-sans font-semibold uppercase text-[#667085] mb-1">
                  Scenario Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Wing Corridor Blockage"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-white border border-[#E2E5E9] focus:border-[#2563EB] rounded-xl px-3 py-2 text-sm text-[#172033] focus:outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold uppercase text-[#667085] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the spatial testing parameters..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full bg-white border border-[#E2E5E9] focus:border-[#2563EB] rounded-xl px-3 py-2 text-sm text-[#172033] focus:outline-none resize-none shadow-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#E2E5E9]">
                <button
                  type="button"
                  onClick={() => setNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-[#F1F3F5] text-xs font-semibold text-[#172033] border border-[#E2E5E9] shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs font-sans uppercase shadow-md hover:shadow-lg"
                >
                  Create &amp; Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
