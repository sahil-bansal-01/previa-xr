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
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 backdrop-blur-md shadow-lg flex flex-col space-y-4">
      {/* Element Counts Overview */}
      <div>
        <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider mb-2.5 pb-2 border-b border-slate-800">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>SPACE ELEMENTS</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400">Walls</span>
            <span className="text-base font-bold font-mono text-white">{walls.length}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400">Rooms</span>
            <span className="text-base font-bold font-mono text-cyan-300">{rooms.length}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400">Doors</span>
            <span className="text-base font-bold font-mono text-blue-300">{doors.length}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400">Exits</span>
            <span className="text-base font-bold font-mono text-emerald-400">{exits.length}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400">Obstacles</span>
            <span className="text-base font-bold font-mono text-amber-400">{obstacles.length}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400">People</span>
            <span className="text-base font-bold font-mono text-purple-300">{people.length}</span>
          </div>
        </div>
      </div>

      {/* Selected Element Editor */}
      <div className="pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider mb-2.5">
          <span className="text-slate-300 flex items-center gap-1.5">
            <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>ELEMENT PROPERTIES</span>
          </span>
          {selectedElement && (
            <button
              type="button"
              onClick={() => onDeleteElement(selectedElement.type, selectedElement.data.id)}
              className="text-red-400 hover:text-red-300 text-[11px] font-mono flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded bg-red-950/40 border border-red-500/20"
            >
              <Trash2 className="w-3 h-3" />
              <span>DELETE</span>
            </button>
          )}
        </div>

        {!selectedElement ? (
          <div className="p-4 rounded-lg bg-slate-950/40 border border-dashed border-slate-800 text-center">
            <p className="text-xs text-slate-400 font-sans">
              Click an element on the canvas to inspect or adjust its properties.
            </p>
          </div>
        ) : (
          <div className="space-y-3 p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
            {/* Exit properties */}
            {selectedElement.type === 'exit' && (
              <>
                <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-semibold">
                  <LogOut className="w-3.5 h-3.5" />
                  <span>EXIT ELEMENT</span>
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1">
                    Exit Name (e.g. Main Exit, North Fire Exit)
                  </label>
                  <input
                    type="text"
                    value={selectedElement.data.name}
                    onChange={e =>
                      onUpdateElement('exit', selectedElement.data.id, { name: e.target.value })
                    }
                    placeholder="e.g. Main Concourse Exit"
                    className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-100 font-sans text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1">
                    Exit Type
                  </label>
                  <select
                    value={selectedElement.data.type || 'emergency'}
                    onChange={e =>
                      onUpdateElement('exit', selectedElement.data.id, {
                        type: e.target.value as 'emergency' | 'normal',
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-100 font-sans text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="emergency">Emergency Exit</option>
                    <option value="normal">Normal / Standard Exit</option>
                  </select>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Coordinates: X: {selectedElement.data.x.toFixed(1)}, Y:{' '}
                  {selectedElement.data.y.toFixed(1)}
                </div>
              </>
            )}

            {/* Room properties */}
            {selectedElement.type === 'room' && (
              <>
                <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-semibold">
                  <Square className="w-3.5 h-3.5" />
                  <span>ROOM ZONE</span>
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1">
                    Room Name
                  </label>
                  <input
                    type="text"
                    value={selectedElement.data.name}
                    onChange={e =>
                      onUpdateElement('room', selectedElement.data.id, { name: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-100 font-sans text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1">
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
                      className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1">
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
                      className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Obstacle properties */}
            {selectedElement.type === 'obstacle' && (
              <>
                <div className="flex items-center gap-1.5 text-amber-400 font-mono font-semibold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>OBSTACLE / HAZARD</span>
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1">
                    Obstacle Name
                  </label>
                  <input
                    type="text"
                    value={selectedElement.data.name}
                    onChange={e =>
                      onUpdateElement('obstacle', selectedElement.data.id, { name: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-100 font-sans text-xs focus:outline-none focus:border-cyan-500"
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
                    className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500"
                  />
                  <label htmlFor="movable-toggle" className="text-slate-300 font-sans text-xs cursor-pointer">
                    Movable / Repositionable in Simulation
                  </label>
                </div>
              </>
            )}

            {/* Person properties */}
            {selectedElement.type === 'person' && (
              <>
                <div className="flex items-center gap-1.5 text-purple-400 font-mono font-semibold">
                  <User className="w-3.5 h-3.5" />
                  <span>OCCUPANT / START POINT</span>
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    value={selectedElement.data.label}
                    onChange={e =>
                      onUpdateElement('person', selectedElement.data.id, { label: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-100 font-sans text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Starting Position: ({selectedElement.data.x.toFixed(1)},{' '}
                  {selectedElement.data.y.toFixed(1)})
                </div>
              </>
            )}

            {/* Wall properties */}
            {selectedElement.type === 'wall' && (
              <>
                <div className="flex items-center gap-1.5 text-slate-300 font-mono font-semibold">
                  <Minus className="w-3.5 h-3.5" />
                  <span>WALL SEGMENT</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  From: ({selectedElement.data.x1.toFixed(1)}, {selectedElement.data.y1.toFixed(1)})
                  <br />
                  To: ({selectedElement.data.x2.toFixed(1)}, {selectedElement.data.y2.toFixed(1)})
                </div>
              </>
            )}

            {/* Door properties */}
            {selectedElement.type === 'door' && (
              <>
                <div className="flex items-center gap-1.5 text-blue-400 font-mono font-semibold">
                  <DoorOpen className="w-3.5 h-3.5" />
                  <span>DOORWAY OPENING</span>
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1">
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
                    className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
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
