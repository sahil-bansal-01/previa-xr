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
    <div className="min-h-screen bg-[#07090e] p-6 md:p-10 max-w-7xl mx-auto flex flex-col space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
            Scenario Management
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold font-mono text-slate-100 mt-1">
            Spatial Simulation Scenarios
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Persisted 3D indoor configurations with pre-configured obstacle placements and occupants.
          </p>
        </div>

        <button
          onClick={() => setNewModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition-all shadow-md shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>CREATE NEW SCENARIO</span>
        </button>
      </div>

      {/* Scenarios Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-mono text-xs">
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
                className="bg-slate-900/60 rounded-2xl border border-slate-800/90 hover:border-slate-700 transition-all p-5 flex flex-col justify-between space-y-4 shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 flex items-center space-x-1">
                      <Building className="w-3 h-3 text-cyan-400" />
                      <span>{scen.environmentType || 'Campus Facility'}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
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
                        className="flex-1 bg-slate-950 border border-cyan-500 rounded px-2 py-1 text-xs text-slate-100 font-mono focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveRename(scenId)}
                        className="p-1 bg-cyan-600 rounded text-slate-950 hover:bg-cyan-500"
                        title="Save"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 bg-slate-800 rounded text-slate-300 hover:bg-slate-700"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <h3 className="text-base font-bold text-slate-100 font-mono">
                        {scen.title}
                      </h3>
                      <button
                        onClick={() => handleStartRename(scen)}
                        className="text-slate-500 hover:text-slate-300 p-1 transition-colors"
                        title="Rename Scenario"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {scen.description || 'Pre-configured indoor layout with occupants and emergency exits.'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Occupants: <strong className="text-slate-200">10</strong></span>
                    <span>Exits: <strong className="text-emerald-400">3 Portals</strong></span>
                    <span>Grid: <strong className="text-slate-200">24x16</strong></span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => handleLoadIntoSimulator(scenId)}
                    className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-cyan-500/10"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>LOAD INTO 3D SIMULATOR</span>
                  </button>

                  <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
                    <button
                      onClick={() => handleDuplicate(scenId)}
                      className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center justify-center space-x-1 transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3 text-cyan-400" />
                      <span>Clone</span>
                    </button>
                    <button
                      onClick={() => handleReset(scenId)}
                      className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center justify-center space-x-1 transition-colors"
                      title="Reset to default environment"
                    >
                      <RotateCcw className="w-3 h-3 text-amber-400" />
                      <span>Reset</span>
                    </button>
                    <button
                      onClick={() => handleDelete(scenId)}
                      className="py-1.5 px-2 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 rounded flex items-center justify-center space-x-1 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold font-mono uppercase text-slate-100">
                Create New Spatial Scenario
              </h3>
              <button
                onClick={() => setNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNew} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                  Scenario Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Wing Corridor Blockage"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the spatial testing parameters..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setNewModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-mono uppercase"
                >
                  Create & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
