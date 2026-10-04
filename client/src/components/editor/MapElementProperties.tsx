import React from 'react';
import {
  MapWall,
  MapRoom,
  MapExit,
  MapObstacle,
  MapPerson,
} from '../../simulation/types/simulationTypes';
import {
  Layers,
  Square,
  Minus,
  DoorOpen,
  LogOut,
  ShieldAlert,
  User,
  Trash2,
  Edit3,
} from 'lucide-react';

export type SelectedElement =
  | { type: 'wall'; data: MapWall }
  | { type: 'room'; data: MapRoom }
  | { type: 'door'; data: any }
  | { type: 'exit'; data: MapExit }
  | { type: 'obstacle'; data: MapObstacle }
  | { type: 'person'; data: MapPerson }
  | null;

interface MapElementPropertiesProps {
  walls: MapWall[];
  rooms: MapRoom[];
  doors: any[];
  exits: MapExit[];
  obstacles: MapObstacle[];
  people: MapPerson[];
  selectedElement: SelectedElement;
  onUpdateElement: (type: string, id: string, updatedFields: any) => void;
  onDeleteElement: (type: string, id: string) => void;
}

export const MapElementProperties: React.FC<MapElementPropertiesProps> = ({
  walls,
  rooms,
  doors,
  exits,
  obstacles,
  people,
  selectedElement,
  onUpdateElement,
  onDeleteElement,
}) => {
  return (
    <div className="bg-white border border-[#E2E5E9] rounded-2xl p-4 shadow-subtle flex flex-col space-y-4">
      {/* Element Counts Overview */}
      <div>
        <div className="flex items-center space-x-2 text-[#172033] text-xs font-semibold uppercase tracking-wider mb-2.5 pb-2 border-b border-[#E2E5E9]">
          <Layers className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>SPACE</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E5E9] flex flex-col items-center">
            <span className="text-[10px] text-[#667085] font-medium">Walls</span>
            <span className="text-base font-bold text-[#172033] font-mono">{walls.length}</span>
          </div>
          <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E5E9] flex flex-col items-center">
            <span className="text-[10px] text-[#667085] font-medium">Doors</span>
            <span className="text-base font-bold text-[#14B8A6] font-mono">{doors.length}</span>
          </div>
          <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E5E9] flex flex-col items-center">
            <span className="text-[10px] text-[#667085] font-medium">Exits</span>
            <span className="text-base font-bold text-[#16A34A] font-mono">{exits.length}</span>
          </div>
          <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E5E9] flex flex-col items-center">
            <span className="text-[10px] text-[#667085] font-medium">Obstacles</span>
            <span className="text-base font-bold text-[#F59E0B] font-mono">{obstacles.length}</span>
          </div>
          <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E5E9] flex flex-col items-center col-span-2 sm:col-span-1">
            <span className="text-[10px] text-[#667085] font-medium">People</span>
            <span className="text-base font-bold text-[#2563EB] font-mono">{people.length}</span>
          </div>
        </div>
      </div>

      {/* Selected Element Editor */}
      <div className="pt-2 border-t border-[#E2E5E9]">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider mb-2.5">
          <span className="text-[#172033] flex items-center gap-1.5">
            <Edit3 className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>ELEMENT PROPERTIES</span>
          </span>
          {selectedElement && (
            <button
              type="button"
              onClick={() => onDeleteElement(selectedElement.type, selectedElement.data.id)}
              className="text-[#DC2626] hover:text-[#B91C1C] text-[11px] font-medium flex items-center gap-1 transition-colors px-2 py-0.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA]"
            >
              <Trash2 className="w-3 h-3" />
              <span>DELETE</span>
            </button>
          )}
        </div>

        {!selectedElement ? (
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-dashed border-[#CBD5E1] text-center">
            <p className="text-xs text-[#667085]">
              Click any wall, room, door, exit, obstacle or person on the canvas to inspect or adjust properties.
            </p>
          </div>
        ) : (
          <div className="space-y-3 p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E5E9] text-xs">
            {/* Exit properties */}
            {selectedElement.type === 'exit' && (
              <>
                <div className="flex items-center gap-1.5 text-[#16A34A] font-semibold">
                  <LogOut className="w-3.5 h-3.5" />
                  <span>EXIT ELEMENT</span>
                </div>
                <div>
                  <label className="block text-[#475467] text-[10px] font-medium uppercase mb-1">
                    Exit Name (e.g. Main Exit, North Fire Exit)
                  </label>
                  <input
                    type="text"
                    value={selectedElement.data.name}
                    onChange={e =>
                      onUpdateElement('exit', selectedElement.data.id, { name: e.target.value })
                    }
                    placeholder="e.g. Main Concourse Exit"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] text-xs focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-[#475467] text-[10px] font-medium uppercase mb-1">
                    Exit Type
                  </label>
                  <select
                    value={selectedElement.data.type || 'emergency'}
                    onChange={e =>
                      onUpdateElement('exit', selectedElement.data.id, {
                        type: e.target.value as 'emergency' | 'normal',
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] text-xs focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="emergency">Emergency Exit</option>
                    <option value="normal">Normal / Standard Exit</option>
                  </select>
                </div>
                <div className="text-[10px] text-[#667085] font-mono">
                  Coordinates: X: {selectedElement.data.x.toFixed(1)}, Y:{' '}
                  {selectedElement.data.y.toFixed(1)}
                </div>
              </>
            )}

            {/* Room properties */}
            {selectedElement.type === 'room' && (
              <>
                <div className="flex items-center gap-1.5 text-[#2563EB] font-semibold">
                  <Square className="w-3.5 h-3.5" />
                  <span>ROOM ZONE</span>
                </div>
                <div>
                  <label className="block text-[#475467] text-[10px] font-medium uppercase mb-1">
                    Room Name
                  </label>
                  <input
                    type="text"
                    value={selectedElement.data.name}
                    onChange={e =>
                      onUpdateElement('room', selectedElement.data.id, { name: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] text-xs focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#475467] text-[10px] font-medium uppercase mb-1">
                      Width (m)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={selectedElement.data.width}
                      onChange={e =>
                        onUpdateElement('room', selectedElement.data.id, {
                          width: parseFloat(e.target.value) || 1,
                        })
                      }
                      className="w-full px-2 py-1 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] font-mono text-xs focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#475467] text-[10px] font-medium uppercase mb-1">
                      Height (m)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={selectedElement.data.height}
                      onChange={e =>
                        onUpdateElement('room', selectedElement.data.id, {
                          height: parseFloat(e.target.value) || 1,
                        })
                      }
                      className="w-full px-2 py-1 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] font-mono text-xs focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Obstacle properties */}
            {selectedElement.type === 'obstacle' && (
              <>
                <div className="flex items-center gap-1.5 text-[#F59E0B] font-semibold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>OBSTACLE / HAZARD</span>
                </div>
                <div>
                  <label className="block text-[#475467] text-[10px] font-medium uppercase mb-1">
                    Obstacle Name
                  </label>
                  <input
                    type="text"
                    value={selectedElement.data.name}
                    onChange={e =>
                      onUpdateElement('obstacle', selectedElement.data.id, { name: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] text-xs focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="movable-toggle"
                    checked={selectedElement.data.movable}
                    onChange={e =>
                      onUpdateElement('obstacle', selectedElement.data.id, {
                        movable: e.target.checked,
                      })
                    }
                    className="rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
                  />
                  <label htmlFor="movable-toggle" className="text-[#475467] text-xs cursor-pointer">
                    Movable in Simulation
                  </label>
                </div>
              </>
            )}

            {/* Person properties */}
            {selectedElement.type === 'person' && (
              <>
                <div className="flex items-center gap-1.5 text-[#6366F1] font-semibold">
                  <User className="w-3.5 h-3.5" />
                  <span>OCCUPANT / START POINT</span>
                </div>
                <div>
                  <label className="block text-[#475467] text-[10px] font-medium uppercase mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    value={selectedElement.data.label}
                    onChange={e =>
                      onUpdateElement('person', selectedElement.data.id, { label: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] text-xs focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div className="text-[10px] text-[#667085] font-mono">
                  Coordinates: ({selectedElement.data.x.toFixed(1)},{' '}
                  {selectedElement.data.y.toFixed(1)})
                </div>
              </>
            )}

            {/* Wall properties */}
            {selectedElement.type === 'wall' && (
              <>
                <div className="flex items-center gap-1.5 text-[#334155] font-semibold">
                  <Minus className="w-3.5 h-3.5" />
                  <span>WALL SEGMENT</span>
                </div>
                <div className="text-[11px] text-[#667085] font-mono">
                  From: ({selectedElement.data.x1.toFixed(1)}, {selectedElement.data.y1.toFixed(1)})
                  <br />
                  To: ({selectedElement.data.x2.toFixed(1)}, {selectedElement.data.y2.toFixed(1)})
                </div>
              </>
            )}

            {/* Door properties */}
            {selectedElement.type === 'door' && (
              <>
                <div className="flex items-center gap-1.5 text-[#2563EB] font-semibold">
                  <DoorOpen className="w-3.5 h-3.5" />
                  <span>DOORWAY OPENING</span>
                </div>
                <div>
                  <label className="block text-[#475467] text-[10px] font-medium uppercase mb-1">
                    Opening Width (m)
                  </label>
                  <input
                    type="number"
                    step="0.2"
                    value={selectedElement.data.width || 1.5}
                    onChange={e =>
                      onUpdateElement('door', selectedElement.data.id, {
                        width: parseFloat(e.target.value) || 1.2,
                      })
                    }
                    className="w-full px-2 py-1 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] font-mono text-xs focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
