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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172033]/60 backdrop-blur-sm p-4">
      <div className="bg-white border border-[#E2E5E9] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-[#E2E5E9]">
          <div className="flex items-center space-x-2">
            <Save className="w-4 h-4 text-[#2563EB]" />
            <h3 className="text-sm font-bold text-[#172033] font-sans uppercase tracking-wide">
              Save Spatial Scenario
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#667085] hover:text-[#172033] p-1.5 rounded-lg hover:bg-[#F1F3F5] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-sans font-semibold uppercase text-[#667085] mb-1">
              Scenario Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-white border border-[#E2E5E9] focus:border-[#2563EB] rounded-xl px-3 py-2 text-sm text-[#172033] focus:outline-none transition-colors shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-sans font-semibold uppercase text-[#667085] mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-white border border-[#E2E5E9] focus:border-[#2563EB] rounded-xl px-3 py-2 text-sm text-[#172033] focus:outline-none transition-colors resize-none shadow-xs"
            />
          </div>

          <div className="bg-[#F7F8FA] p-3 rounded-xl border border-[#E2E5E9] text-xs text-[#667085] space-y-1.5 font-sans">
            <div className="flex justify-between">
              <span>Environment Type:</span>
              <strong className="text-[#172033]">Campus Facility</strong>
            </div>
            <div className="flex justify-between">
              <span>Exit Portals:</span>
              <strong className="text-[#172033]">{exits.length} Zones</strong>
            </div>
            <div className="flex justify-between">
              <span>Occupants:</span>
              <strong className="text-[#172033]">{agents.length} Agents</strong>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-[#E2E5E9]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-[#F1F3F5] text-xs font-semibold text-[#172033] border border-[#E2E5E9] transition-colors shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs font-sans uppercase tracking-wider flex items-center space-x-1.5 transition-colors shadow-md hover:shadow-lg"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-white" />
                  <span>{loading ? 'Saving...' : 'Save Scenario'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
