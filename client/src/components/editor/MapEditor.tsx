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

  // Validation notification state
  const [validationMsg, setValidationMsg] = useState<string | null>(null);

  // Show transient validation toast
  const showValidation = (msg: string) => {
    setValidationMsg(msg);
    setTimeout(() => {
      setValidationMsg(prev => (prev === msg ? null : prev));
    }, 2800);
  };

  // Geometry vertex snapping helper (snaps to nearby wall vertices within 0.8m)
  const snapToNearbyVertex = (worldX: number, worldY: number, threshold = 0.8) => {
    let bestX = worldX;
    let bestY = worldY;
    let minDist = threshold;

    walls.forEach(w => {
      const d1 = Math.hypot(w.x1 - worldX, w.y1 - worldY);
      if (d1 < minDist) {
        minDist = d1;
        bestX = w.x1;
        bestY = w.y1;
      }
      const d2 = Math.hypot(w.x2 - worldX, w.y2 - worldY);
      if (d2 < minDist) {
        minDist = d2;
        bestX = w.x2;
        bestY = w.y2;
      }
    });

    return { x: bestX, y: bestY, isSnapped: minDist < threshold };
  };

  // Find closest wall to snap doors or exits
  const findClosestWall = (worldX: number, worldY: number) => {
    let closestWall: MapWall | null = null;
    let minDist = Infinity;
    let snapPos = { x: worldX, y: worldY };

    walls.forEach(w => {
      const dx = w.x2 - w.x1;
      const dy = w.y2 - w.y1;
      const lenSq = dx * dx + dy * dy;
      if (lenSq === 0) return;

      const t = Math.max(0, Math.min(1, ((worldX - w.x1) * dx + (worldY - w.y1) * dy) / lenSq));
      const projX = w.x1 + t * dx;
      const projY = w.y1 + t * dy;
      const dist = Math.hypot(worldX - projX, worldY - projY);

      if (dist < minDist) {
        minDist = dist;
        closestWall = w;
        snapPos = { x: snap(projX), y: snap(projY) };
      }
    });

    return { wall: closestWall, dist: minDist, snapPos };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (activeTool === 'pan' || e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }

    const rawWorld = screenToWorld(e.clientX, e.clientY);
    const snappedVertex = snapToNearbyVertex(rawWorld.x, rawWorld.y);
    const world = snappedVertex.isSnapped ? { x: snappedVertex.x, y: snappedVertex.y } : rawWorld;

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
      // Require/encourage placement on a wall
      const wallCheck = findClosestWall(world.x, world.y);
      if (wallCheck.dist > 2.0) {
        showValidation('Doors must be placed on a wall to create an opening.');
        return;
      }
      onAddDoor({
        id: `d-${Date.now()}`,
        x: wallCheck.snapPos.x,
        y: wallCheck.snapPos.y,
        width: 1.5,
      });
    } else if (activeTool === 'exit') {
      // Snap exit to wall opening or outer perimeter
      const wallCheck = findClosestWall(world.x, world.y);
      const exitPos = wallCheck.dist < 2.5 ? wallCheck.snapPos : world;

      const exitCount = exits.length + 1;
      onAddExit({
        id: `ex-${Date.now()}`,
        name: exitCount === 1 ? 'Main Exit' : exitCount === 2 ? 'Secondary Exit' : `Exit ${exitCount}`,
        x: exitPos.x,
        y: exitPos.y,
        type: exitCount === 1 ? 'emergency' : 'normal',
      });
    } else if (activeTool === 'obstacle') {
      // Prevent accidental placement directly inside walls
      const wallCheck = findClosestWall(world.x, world.y);
      if (wallCheck.dist < 0.4) {
        showValidation('Obstacles cannot be placed directly inside a wall.');
        return;
      }

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
      // Snap to walkable area; prevent placement inside walls
      const wallCheck = findClosestWall(world.x, world.y);
      if (wallCheck.dist < 0.35) {
        showValidation('People cannot be placed inside walls. Snapped to walkable area.');
        return;
      }

      onAddPerson({
        id: `p-${Date.now()}`,
        x: world.x,
        y: world.y,
        label: `P${people.length + 1}`,
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
        stroke={isAxis ? '#94A3B8' : x % 2 === 0 ? '#E2E8F0' : '#F1F5F9'}
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
        stroke={isAxis ? '#94A3B8' : y % 2 === 0 ? '#E2E8F0' : '#F1F5F9'}
        strokeWidth={isAxis ? 1.5 : 1}
        strokeDasharray={isAxis ? undefined : y % 2 === 0 ? undefined : '2,2'}
      />
    );
  }

  return (
    <div className="relative w-full h-[540px] bg-white rounded-2xl overflow-hidden border border-[#E2E5E9] shadow-subtle select-none">
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
        {/* Clean white blueprint base */}
        <rect x="0" y="0" width={viewWidth} height={viewHeight} fill="#FFFFFF" />

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
                  fill="rgba(37, 99, 235, 0.04)"
                  stroke={isSelected ? '#2563EB' : '#94A3B8'}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  strokeDasharray="4,4"
                  rx={4}
                  className="transition-colors hover:fill-blue-500/10 cursor-pointer"
                />
                <text
                  x={topLeft.x + 8}
                  y={topLeft.y + 16}
                  fill="#475467"
                  fontSize="11"
                  fontFamily="sans-serif"
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
                {/* Architectural Wall Line */}
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={isSelected ? '#2563EB' : '#334155'}
                  strokeWidth={isSelected ? 5.5 : 4}
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
              <g key={door.id} onClick={e => handleElementClick(e, 'door', door)} className="cursor-pointer">
                {/* Wall opening gap */}
                <line
                  x1={pos.x - w / 2}
                  y1={pos.y}
                  x2={pos.x + w / 2}
                  y2={pos.y}
                  stroke="#FFFFFF"
                  strokeWidth={8}
                />
                {/* Architectural Door Swing Arc */}
                <path
                  d={`M ${pos.x - w / 2} ${pos.y} A ${w * 0.85} ${w * 0.85} 0 0 1 ${pos.x - w / 2 + w * 0.6} ${pos.y - w * 0.6}`}
                  fill="none"
                  stroke={isSelected ? '#2563EB' : '#94A3B8'}
                  strokeWidth={1.5}
                  strokeDasharray="3,2"
                />
                {/* Door Leaf */}
                <line
                  x1={pos.x - w / 2}
                  y1={pos.y}
                  x2={pos.x - w / 2 + w * 0.6}
                  y2={pos.y - w * 0.6}
                  stroke={isSelected ? '#2563EB' : '#334155'}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
                {/* Hinge point */}
                <circle cx={pos.x - w / 2} cy={pos.y} r={3} fill={isSelected ? '#2563EB' : '#2563EB'} />
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
                  fill="rgba(245, 158, 11, 0.15)"
                  stroke={isSelected ? '#D97706' : '#F59E0B'}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  rx={3}
                  className="cursor-pointer hover:fill-amber-500/25 transition-colors"
                />
                <text
                  x={pos.x}
                  y={pos.y + 3}
                  textAnchor="middle"
                  fill="#92400E"
                  fontSize="9.5"
                  fontFamily="sans-serif"
                  fontWeight="600"
                  pointerEvents="none"
                >
                  {obs.name}
                </text>
              </g>
            );
          })}
        </g>

        {/* Exits with Smart Non-Clipping Labeling */}
        <g id="exits">
          {exits.map(exit => {
            const pos = worldToSvg(exit.x, exit.y);
            const isSelected = selectedElement?.data.id === exit.id;
            const isEmergency = exit.type === 'emergency';
            const color = isEmergency ? '#16A34A' : '#0D9488';

            // Smart label positioning: prevent clipping near viewport borders
            const labelY = pos.y < 45 ? pos.y + 24 : pos.y - 18;
            const textAnchor = pos.x > viewWidth - 90 ? 'end' : pos.x < 90 ? 'start' : 'middle';
            const labelX = pos.x > viewWidth - 90 ? pos.x - 14 : pos.x < 90 ? pos.x + 14 : pos.x;

            return (
              <g key={exit.id} onClick={e => handleElementClick(e, 'exit', exit)}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={12}
                  fill={`${color}15`}
                  stroke={isSelected ? '#15803D' : color}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  className="cursor-pointer hover:scale-110 transition-transform"
                />
                <circle cx={pos.x} cy={pos.y} r={4.5} fill={color} />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor={textAnchor}
                  fill={color}
                  fontSize="10.5"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {exit.name.toUpperCase()}
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
                  r={6.5}
                  fill="#2563EB"
                  stroke={isSelected ? '#1D4ED8' : '#93C5FD'}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  className="cursor-pointer hover:scale-125 transition-transform shadow-xs"
                />
                <circle cx={pos.x} cy={pos.y} r={2} fill="#FFFFFF" />
                <text
                  x={pos.x}
                  y={pos.y + 14}
                  textAnchor="middle"
                  fill="#475467"
                  fontSize="9"
                  fontFamily="sans-serif"
                  fontWeight="600"
                  pointerEvents="none"
                >
                  {person.label || 'P'}
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
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    strokeDasharray="4,4"
                  />
                  <circle cx={p1.x} cy={p1.y} r={4.5} fill="#2563EB" />
                  <circle cx={p2.x} cy={p2.y} r={4.5} fill="#2563EB" />
                  <text
                    x={(p1.x + p2.x) / 2 + 10}
                    y={(p1.y + p2.y) / 2 - 10}
                    fill="#2563EB"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="600"
                  >
                    {dist.toFixed(1)}m
                  </text>
                </>
              );
            })()}
          </g>
        )}
      </svg>

      {/* Small Compact Legend (WALL | DOOR | EXIT | PERSON | OBSTACLE) */}
      <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-white/95 border border-[#E2E5E9] shadow-xs flex items-center space-x-3 text-[10px] font-sans font-semibold text-[#475467] pointer-events-none select-none">
        <div className="flex items-center space-x-1.5">
          <span className="w-3.5 h-1 bg-[#334155] rounded-xs inline-block" />
          <span>WALL</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3.5 h-1 border-t-2 border-dashed border-[#94A3B8] inline-block" />
          <span>DOOR</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] inline-block" />
          <span>EXIT</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] inline-block" />
          <span>PERSON</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-xs bg-[#F59E0B] inline-block" />
          <span>OBSTACLE</span>
        </div>
      </div>

      {/* Validation Notice Overlay */}
      {validationMsg && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-lg bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] font-sans text-xs font-semibold shadow-md flex items-center space-x-2 animate-fade-in pointer-events-none">
          <span>⚠️</span>
          <span>{validationMsg}</span>
        </div>
      )}

      {/* Coordinate & Tool Status Badge */}
      <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-white/95 border border-[#E2E5E9] shadow-xs flex items-center space-x-3 text-[11px] font-sans text-[#667085]">
        <div>
          Tool: <span className="text-[#2563EB] uppercase font-semibold">{activeTool}</span>
        </div>
        <div className="text-[#E2E5E9]">|</div>
        <div>
          Cursor: X: <span className="text-[#172033] font-medium">{cursorPos.x.toFixed(1)}m</span>, Y:{' '}
          <span className="text-[#172033] font-medium">{cursorPos.y.toFixed(1)}m</span>
        </div>
        <div className="text-[#E2E5E9]">|</div>
        <div>
          Zoom: <span className="text-[#172033] font-medium">{Math.round(zoom * 100)}%</span>
        </div>
      </div>
    </div>
  );
};
