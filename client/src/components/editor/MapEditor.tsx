import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MapWall,
  MapRoom,
  MapExit,
  MapObstacle,
  MapPerson,
} from '../../simulation/types/simulationTypes';
import { EditorTool } from './MapToolbar';
import { SelectedElement } from './MapElementProperties';

interface MapEditorProps {
  walls: MapWall[];
  rooms: MapRoom[];
  doors: any[];
  exits: MapExit[];
  obstacles: MapObstacle[];
  people: MapPerson[];
  activeTool: EditorTool;
  selectedElement: SelectedElement;
  onSelectElement: (element: SelectedElement) => void;
  onAddWall: (wall: MapWall) => void;
  onAddRoom: (room: MapRoom) => void;
  onAddDoor: (door: any) => void;
  onAddExit: (exit: MapExit) => void;
  onAddObstacle: (obstacle: MapObstacle) => void;
  onAddPerson: (person: MapPerson) => void;
  onUpdateElement: (type: string, id: string, updatedFields: any) => void;
  onDeleteElement: (type: string, id: string) => void;
  zoom: number;
  panOffset: { x: number; y: number };
  onPanChange: (offset: { x: number; y: number }) => void;
}

export const MapEditor: React.FC<MapEditorProps> = ({
  walls,
  rooms,
  doors,
  exits,
  obstacles,
  people,
  activeTool,
  selectedElement,
  onSelectElement,
  onAddWall,
  onAddRoom,
  onAddDoor,
  onAddExit,
  onAddObstacle,
  onAddPerson,
  onUpdateElement,
  onDeleteElement,
  zoom,
  panOffset,
  onPanChange,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Drawing state
  const [wallStart, setWallStart] = useState<{ x: number; y: number } | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggedElement, setDraggedElement] = useState<{
    type: string;
    id: string;
    startX: number;
    startY: number;
    initialElemPos: { x: number; y: number; x2?: number; y2?: number };
  } | null>(null);

  // SVG viewport dimensions
  const viewWidth = 900;
  const viewHeight = 600;
  const scale = 30; // 30 pixels per meter

  // Snap to 0.5m grid
  const snap = (val: number, step = 0.5) => Math.round(val / step) * step;

  // Convert screen coordinates to world coordinates (meters)
  const screenToWorld = useCallback(
    (screenX: number, screenY: number) => {
      if (!svgRef.current) return { x: 0, y: 0 };
      const rect = svgRef.current.getBoundingClientRect();
      const relX = screenX - rect.left;
      const relY = screenY - rect.top;

      const centeredX = (relX - viewWidth / 2 - panOffset.x) / (scale * zoom);
      const centeredY = (relY - viewHeight / 2 - panOffset.y) / (scale * zoom);

      return {
        x: snap(centeredX),
        y: snap(centeredY),
      };
    },
    [panOffset, zoom]
  );

  // Convert world coordinates to SVG canvas coordinates
  const worldToSvg = (worldX: number, worldY: number) => {
    return {
      x: viewWidth / 2 + worldX * scale * zoom + panOffset.x,
      y: viewHeight / 2 + worldY * scale * zoom + panOffset.y,
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (activeTool === 'pan' || e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }

    const world = screenToWorld(e.clientX, e.clientY);

    if (activeTool === 'wall') {
      if (!wallStart) {
        setWallStart(world);
      } else {
        // Complete wall
        if (wallStart.x !== world.x || wallStart.y !== world.y) {
          onAddWall({
            id: `w-${Date.now()}`,
            x1: wallStart.x,
            y1: wallStart.y,
            x2: world.x,
            y2: world.y,
          });
        }
        setWallStart(null);
      }
    } else if (activeTool === 'room') {
      onAddRoom({
        id: `r-${Date.now()}`,
        name: `Room ${rooms.length + 1}`,
        x: world.x - 3,
        y: world.y - 2.5,
        width: 6,
        height: 5,
      });
    } else if (activeTool === 'door') {
      onAddDoor({
        id: `d-${Date.now()}`,
        x: world.x,
        y: world.y,
        width: 1.5,
      });
    } else if (activeTool === 'exit') {
      const exitCount = exits.length + 1;
      onAddExit({
        id: `ex-${Date.now()}`,
        name: exitCount === 1 ? 'Main Exit' : exitCount === 2 ? 'Emergency Exit' : `Exit ${exitCount}`,
        x: world.x,
        y: world.y,
        type: exitCount === 1 ? 'emergency' : 'normal',
      });
    } else if (activeTool === 'obstacle') {
      onAddObstacle({
        id: `obs-${Date.now()}`,
        name: `Obstacle ${obstacles.length + 1}`,
        x: world.x,
        y: world.y,
        width: 1.6,
        height: 1.2,
        movable: true,
      });
    } else if (activeTool === 'person') {
      onAddPerson({
        id: `p-${Date.now()}`,
        x: world.x,
        y: world.y,
        label: `Person ${people.length + 1}`,
      });
    } else if (activeTool === 'select') {
      // If clicked empty space, deselect
      onSelectElement(null);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const world = screenToWorld(e.clientX, e.clientY);
    setCursorPos(world);

    if (isPanning) {
      onPanChange({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (draggedElement) {
      const dx = world.x - draggedElement.startX;
      const dy = world.y - draggedElement.startY;
      const initial = draggedElement.initialElemPos;

      if (draggedElement.type === 'wall' && initial.x2 !== undefined && initial.y2 !== undefined) {
        onUpdateElement('wall', draggedElement.id, {
          x1: snap(initial.x + dx),
          y1: snap(initial.y + dy),
          x2: snap(initial.x2 + dx),
          y2: snap(initial.y2 + dy),
        });
      } else {
        onUpdateElement(draggedElement.type, draggedElement.id, {
          x: snap(initial.x + dx),
          y: snap(initial.y + dy),
        });
      }
    }
  };

  const handlePointerUp = () => {
    setIsPanning(false);
    setDraggedElement(null);
  };

  const handleElementClick = (
    e: React.MouseEvent,
    type: 'wall' | 'room' | 'door' | 'exit' | 'obstacle' | 'person',
    data: any
  ) => {
    e.stopPropagation();
    if (activeTool === 'erase') {
      onDeleteElement(type, data.id);
      if (selectedElement?.data.id === data.id) {
        onSelectElement(null);
      }
    } else if (activeTool === 'select') {
      onSelectElement({ type, data } as SelectedElement);
      // Start drag
      const world = screenToWorld(e.clientX, e.clientY);
      setDraggedElement({
        type,
        id: data.id,
        startX: world.x,
        startY: world.y,
        initialElemPos: {
          x: data.x ?? data.x1 ?? 0,
          y: data.y ?? data.y1 ?? 0,
          x2: data.x2,
          y2: data.y2,
        },
      });
    }
  };

  // Generate grid lines
  const gridLines = [];
  const minX = -14;
  const maxX = 14;
  const minY = -10;
  const maxY = 10;

  for (let x = minX; x <= maxX; x += 1) {
    const p1 = worldToSvg(x, minY);
    const p2 = worldToSvg(x, maxY);
    const isAxis = x === 0;
    gridLines.push(
      <line
        key={`vx-${x}`}
        x1={p1.x}
        y1={p1.y}
        x2={p2.x}
        y2={p2.y}
        stroke={isAxis ? '#0ea5e9' : x % 2 === 0 ? '#1e293b' : '#0f172a'}
        strokeWidth={isAxis ? 1.5 : 1}
        strokeDasharray={isAxis ? undefined : x % 2 === 0 ? undefined : '2,2'}
      />
    );
  }

  for (let y = minY; y <= maxY; y += 1) {
    const p1 = worldToSvg(minX, y);
    const p2 = worldToSvg(maxX, y);
    const isAxis = y === 0;
    gridLines.push(
      <line
        key={`hy-${y}`}
        x1={p1.x}
        y1={p1.y}
        x2={p2.x}
        y2={p2.y}
        stroke={isAxis ? '#0ea5e9' : y % 2 === 0 ? '#1e293b' : '#0f172a'}
        strokeWidth={isAxis ? 1.5 : 1}
        strokeDasharray={isAxis ? undefined : y % 2 === 0 ? undefined : '2,2'}
      />
    );
  }

  return (
    <div className="relative w-full h-[540px] bg-[#070b12] rounded-xl overflow-hidden border border-slate-800 shadow-2xl select-none">
      <svg
        ref={svgRef}
        className={`w-full h-full ${
          activeTool === 'pan' || isPanning
            ? 'cursor-grab active:cursor-grabbing'
            : activeTool === 'erase'
            ? 'cursor-crosshair'
            : 'cursor-crosshair'
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <defs>
          <radialGradient id="gridGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#082f49" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#070b12" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient center background glow */}
        <rect x="0" y="0" width={viewWidth} height={viewHeight} fill="url(#gridGlow)" />

        {/* Coordinate Grid */}
        <g id="grid">{gridLines}</g>

        {/* Room zones */}
        <g id="rooms">
          {rooms.map(room => {
            const topLeft = worldToSvg(room.x, room.y);
            const isSelected = selectedElement?.data.id === room.id;
            const w = room.width * scale * zoom;
            const h = room.height * scale * zoom;

            return (
              <g key={room.id} onClick={e => handleElementClick(e, 'room', room)}>
                <rect
                  x={topLeft.x}
                  y={topLeft.y}
                  width={w}
                  height={h}
                  fill="rgba(14, 165, 233, 0.08)"
                  stroke={isSelected ? '#38bdf8' : '#0284c7'}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  strokeDasharray="4,4"
                  rx={4}
                  className="transition-colors hover:fill-cyan-500/20 cursor-pointer"
                />
                <text
                  x={topLeft.x + 8}
                  y={topLeft.y + 16}
                  fill="#7dd3fc"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="600"
                  pointerEvents="none"
                >
                  {room.name}
                </text>
              </g>
            );
          })}
        </g>

        {/* Walls */}
        <g id="walls">
          {walls.map(wall => {
            const p1 = worldToSvg(wall.x1, wall.y1);
            const p2 = worldToSvg(wall.x2, wall.y2);
            const isSelected = selectedElement?.data.id === wall.id;

            return (
              <g key={wall.id} onClick={e => handleElementClick(e, 'wall', wall)}>
                {/* Thick hit area */}
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="transparent"
                  strokeWidth={16}
                  className="cursor-pointer"
                />
                {/* Visible Wall Line */}
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={isSelected ? '#38bdf8' : '#cbd5e1'}
                  strokeWidth={isSelected ? 6 : 4}
                  strokeLinecap="round"
                  className="transition-all"
                />
              </g>
            );
          })}
        </g>

        {/* Doors */}
        <g id="doors">
          {doors.map(door => {
            const pos = worldToSvg(door.x, door.y);
            const isSelected = selectedElement?.data.id === door.id;
            const w = (door.width || 1.5) * scale * zoom;

            return (
              <g key={door.id} onClick={e => handleElementClick(e, 'door', door)}>
                <line
                  x1={pos.x - w / 2}
                  y1={pos.y}
                  x2={pos.x + w / 2}
                  y2={pos.y}
                  stroke={isSelected ? '#60a5fa' : '#3b82f6'}
                  strokeWidth={5}
                  strokeDasharray="4,3"
                  className="cursor-pointer"
                />
                <circle cx={pos.x} cy={pos.y} r={4} fill="#60a5fa" />
              </g>
            );
          })}
        </g>

        {/* Obstacles */}
        <g id="obstacles">
          {obstacles.map(obs => {
            const pos = worldToSvg(obs.x, obs.y);
            const isSelected = selectedElement?.data.id === obs.id;
            const w = (obs.width || 1.6) * scale * zoom;
            const h = (obs.height || 1.2) * scale * zoom;

            return (
              <g key={obs.id} onClick={e => handleElementClick(e, 'obstacle', obs)}>
                <rect
                  x={pos.x - w / 2}
                  y={pos.y - h / 2}
                  width={w}
                  height={h}
                  fill="rgba(245, 158, 11, 0.25)"
                  stroke={isSelected ? '#fbbf24' : '#d97706'}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  rx={2}
                  className="cursor-pointer hover:fill-amber-500/40 transition-colors"
                />
                <text
                  x={pos.x}
                  y={pos.y + 3}
                  textAnchor="middle"
                  fill="#fef08a"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {obs.name}
                </text>
              </g>
            );
          })}
        </g>

        {/* Exits */}
        <g id="exits">
          {exits.map(exit => {
            const pos = worldToSvg(exit.x, exit.y);
            const isSelected = selectedElement?.data.id === exit.id;
            const isEmergency = exit.type === 'emergency';
            const color = isEmergency ? '#10b981' : '#06b6d4';

            return (
              <g key={exit.id} onClick={e => handleElementClick(e, 'exit', exit)}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={14}
                  fill={`${color}22`}
                  stroke={isSelected ? '#34d399' : color}
                  strokeWidth={isSelected ? 3 : 2}
                  className="cursor-pointer hover:scale-110 transition-transform"
                />
                <circle cx={pos.x} cy={pos.y} r={6} fill={color} />
                <text
                  x={pos.x}
                  y={pos.y - 18}
                  textAnchor="middle"
                  fill={color}
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {exit.name}
                </text>
              </g>
            );
          })}
        </g>

        {/* People */}
        <g id="people">
          {people.map(person => {
            const pos = worldToSvg(person.x, person.y);
            const isSelected = selectedElement?.data.id === person.id;

            return (
              <g key={person.id} onClick={e => handleElementClick(e, 'person', person)}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={8}
                  fill="#c084fc"
                  stroke={isSelected ? '#f3e8ff' : '#9333ea'}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  className="cursor-pointer hover:scale-125 transition-transform"
                />
                <circle cx={pos.x} cy={pos.y} r={3} fill="#ffffff" />
                <text
                  x={pos.x}
                  y={pos.y + 16}
                  textAnchor="middle"
                  fill="#e9d5ff"
                  fontSize="9"
                  fontFamily="monospace"
                  pointerEvents="none"
                >
                  {person.label || 'Person'}
                </text>
              </g>
            );
          })}
        </g>

        {/* Live Drawing Previews */}
        {activeTool === 'wall' && wallStart && (
          <g>
            {(() => {
              const p1 = worldToSvg(wallStart.x, wallStart.y);
              const p2 = worldToSvg(cursorPos.x, cursorPos.y);
              const dist = Math.hypot(cursorPos.x - wallStart.x, cursorPos.y - wallStart.y);
              return (
                <>
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke="#22d3ee"
                    strokeWidth={3}
                    strokeDasharray="4,4"
                  />
                  <circle cx={p1.x} cy={p1.y} r={5} fill="#22d3ee" />
                  <circle cx={p2.x} cy={p2.y} r={5} fill="#22d3ee" />
                  <text
                    x={(p1.x + p2.x) / 2 + 10}
                    y={(p1.y + p2.y) / 2 - 10}
                    fill="#a5f3fc"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {dist.toFixed(1)}m
                  </text>
                </>
              );
            })()}
          </g>
        )}
      </svg>

      {/* Coordinate & Tool Status Badge */}
      <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800/80 backdrop-blur-md flex items-center space-x-3 text-[11px] font-mono text-slate-400">
        <div>
          TOOL: <span className="text-cyan-400 uppercase font-bold">{activeTool}</span>
        </div>
        <div className="text-slate-600">|</div>
        <div>
          CURSOR: X: <span className="text-slate-200">{cursorPos.x.toFixed(1)}m</span>, Y:{' '}
          <span className="text-slate-200">{cursorPos.y.toFixed(1)}m</span>
        </div>
        <div className="text-slate-600">|</div>
        <div>
          ZOOM: <span className="text-slate-200">{Math.round(zoom * 100)}%</span>
        </div>
      </div>
    </div>
  );
};
