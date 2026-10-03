import React, { useState } from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import { scenarioService } from '../../services/scenarioService';
import { X, Save, Check } from 'lucide-react';

interface SaveScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SaveScenarioModal: React.FC<SaveScenarioModalProps> = ({ isOpen, onClose }) => {
  const { scenario, walls, exits, rooms, obstacle, agents } = useSimulation();
  const [title, setTitle] = useState(scenario ? `${scenario.title} (Custom)` : 'Custom Emergency Spatial Scenario');
  const [description, setDescription] = useState(
    'Spatial scenario with obstacle blocking emergency exit routes.'
  );
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await scenarioService.createScenario({
        title,
        description,
        environmentType: 'Indoor Emergency / Campus Facility',
        environmentState: {
          gridWidth: 24,
          gridHeight: 16,
          cellSize: 1,
          walls,
          rooms,
          exits,
          initialObstacles: [obstacle],
          initialAgents: agents.map(a => ({
            id: a.id,
            name: a.name,
            startPos: a.startPos,
            currentExit: a.targetExit,
            speed: a.speed,
            status: a.status,
          })),
        },
        actions: [
          {
            type: 'PLACE_OBSTACLE',
            target: obstacle.isBlockingExitA ? 'Emergency Exit A' : 'Neutral Position',
            position: obstacle.position,
          },
        ],
      });

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error saving scenario:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Save className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wide">
              Save Spatial Scenario
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
              Scenario Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none transition-colors resize-none"
            />
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 text-xs text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Environment Type:</span>
              <strong className="text-slate-200">Campus Facility</strong>
            </div>
            <div className="flex justify-between">
              <span>Exit Portals:</span>
              <strong className="text-slate-200">{exits.length} Zones</strong>
            </div>
            <div className="flex justify-between">
              <span>Occupants:</span>
              <strong className="text-slate-200">{agents.length} Agents</strong>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider flex items-center space-x-1.5 transition-colors shadow-md shadow-cyan-500/20"
            >
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-slate-950" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-slate-950" />
                  <span>{loading ? 'Saving...' : 'Save to MongoDB'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
