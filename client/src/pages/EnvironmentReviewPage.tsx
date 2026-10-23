import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { environmentService } from '../services/environmentService';
import { API_SERVER_URL } from '../services/api';
import {
  Environment,
  MapWall,
  MapRoom,
  MapExit,
  MapObstacle,
  MapPerson,
} from '../simulation/types/simulationTypes';
import { ExtractedFrame } from '../services/frameExtractor';
import { MapToolbar, EditorTool } from '../components/editor/MapToolbar';
import { MapEditor } from '../components/editor/MapEditor';
import { MapElementProperties, SelectedElement } from '../components/editor/MapElementProperties';
import { ReferenceFramePanel } from '../components/editor/ReferenceFramePanel';
import { useSimulation } from '../contexts/SimulationContext';
import {
  validateFloorPlanGeometry,
} from '../simulation/engine/geometryUtils';
import { environmentToNavigationGraph } from '../simulation/engine/environmentAdapter';
import {
  CheckCircle2,
  AlertTriangle,
  Play,
  Save,
  ShieldCheck,
  Edit2,
  Sparkles,
  Info,
} from 'lucide-react';

interface FloorPlanSnapshot {
  walls: MapWall[];
  rooms: MapRoom[];
  doors: any[];
  exits: MapExit[];
  obstacles: MapObstacle[];
  people: MapPerson[];
}

export const EnvironmentReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loadEnvironment } = useSimulation();

  const [environment, setEnvironment] = useState<Environment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Editor states
  const [walls, setWalls] = useState<MapWall[]>([]);
  const [rooms, setRooms] = useState<MapRoom[]>([]);
  const [doors, setDoors] = useState<any[]>([]);
  const [exits, setExits] = useState<MapExit[]>([]);
  const [obstacles, setObstacles] = useState<MapObstacle[]>([]);
  const [people, setPeople] = useState<MapPerson[]>([]);

  // History stack for Undo / Redo
  const [history, setHistory] = useState<FloorPlanSnapshot[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const [activeTool, setActiveTool] = useState<EditorTool>('select');
  const [selectedElement, setSelectedElement] = useState<SelectedElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [status, setStatus] = useState<'draft' | 'confirmed'>('draft');
  const [referenceFrames, setReferenceFrames] = useState<ExtractedFrame[]>([]);

  // Push new snapshot to history
  const pushHistory = useCallback((snapshot: FloorPlanSnapshot) => {
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, snapshot].slice(-25); // cap at 25 steps
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  // Fetch Environment
  const fetchEnv = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const env = await environmentService.getEnvironmentById(id);
      setEnvironment(env);
      const initialWalls = env.geometry?.walls || [];
      const initialRooms = env.geometry?.rooms || [];
      const initialDoors = env.geometry?.doors || [];
      const initialExits = env.exits || [];
      const initialObstacles = env.obstacles || [];
      const initialPeople = env.people || [];

      setWalls(initialWalls);
      setRooms(initialRooms);
      setDoors(initialDoors);
      setExits(initialExits);
      setObstacles(initialObstacles);
      setPeople(initialPeople);
      setStatus(env.analysisStatus === 'confirmed' ? 'confirmed' : 'draft');

      const initialSnapshot: FloorPlanSnapshot = {
        walls: initialWalls,
        rooms: initialRooms,
        doors: initialDoors,
        exits: initialExits,
        obstacles: initialObstacles,
        people: initialPeople,
      };
      setHistory([initialSnapshot]);
      setHistoryIndex(0);

      // Load reference frames from sessionStorage or backend metadata if available
      try {
        const storedFrames = sessionStorage.getItem(`env_frames_${id}`);
        if (storedFrames) {
          setReferenceFrames(JSON.parse(storedFrames));
        } else if (env.metadata?.extractedFrames) {
          setReferenceFrames(
            env.metadata.extractedFrames.map((f: any, idx: number) => ({
              index: f.index ?? idx,
              timestamp: f.timestamp ?? 0,
              imageData: f.url || (f.path ? `${API_SERVER_URL}${f.path}` : f.imageData || ''),
            }))
          );
        }
      } catch (e) {
        console.warn('Unable to load stored frames:', e);
      }
    } catch (err: any) {
      console.error('Failed to load environment:', err);
      setErrorMsg(err.message || 'Failed to load environment.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEnv();
  }, [fetchEnv]);

  // Undo / Redo handlers
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    const targetIdx = historyIndex - 1;
    const snap = history[targetIdx];
    if (snap) {
      setWalls(snap.walls);
      setRooms(snap.rooms);
      setDoors(snap.doors);
      setExits(snap.exits);
      setObstacles(snap.obstacles);
      setPeople(snap.people);
      setHistoryIndex(targetIdx);
      setSelectedElement(null);
    }
  }, [canUndo, historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (!canRedo) return;
    const targetIdx = historyIndex + 1;
    const snap = history[targetIdx];
    if (snap) {
      setWalls(snap.walls);
      setRooms(snap.rooms);
      setDoors(snap.doors);
      setExits(snap.exits);
      setObstacles(snap.obstacles);
      setPeople(snap.people);
      setHistoryIndex(targetIdx);
      setSelectedElement(null);
    }
  }, [canRedo, historyIndex, history]);

  // Keyboard shortcut listener for Ctrl+Z / Ctrl+Y
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Live structural & pathfinding geometry validation
  const validationReport = useMemo(() => {
    const report = validateFloorPlanGeometry(walls, rooms, doors, exits, obstacles, people);

    // Live reachability check using A* PathfindingEngine
    if (people.length > 0 && exits.length > 0) {
      try {
        const dummyEnv: Environment = {
          name: environment?.name || 'Test',
          sourceType: 'demo',
          sourceFiles: [],
          analysisStatus: 'analyzed',
          geometry: { walls, rooms, corridors: [], doors },
          navigation: { gridWidth: 24, gridHeight: 16, cellSize: 1 },
          exits,
          obstacles,
          people,
        };

        const converted = environmentToNavigationGraph(dummyEnv);
        people.forEach((p) => {
          let canReachAnyExit = false;
          converted.exits.forEach((ex) => {
            const res = converted.pathfinder.findPathToExit(p.x, p.y, ex);
            if (res.reachable && res.path.length > 0) {
              canReachAnyExit = true;
            }
          });

          if (!canReachAnyExit) {
            report.warnings.push(
              `Occupant "${p.label || 'P'}" cannot reach any exit. Ensure doorways connect their area to an exit corridor.`
            );
          }
        });
      } catch (e) {
        // Silently skip if graph is being edited
      }
    }

    return report;
  }, [walls, rooms, doors, exits, obstacles, people, environment?.name]);

  // Add handlers
  const handleAddWall = (w: MapWall) => {
    const newWalls = [...walls, w];
    setWalls(newWalls);
    pushHistory({ walls: newWalls, rooms, doors, exits, obstacles, people });
  };

  const handleAddRoom = (r: MapRoom) => {
    const newRooms = [...rooms, r];
    setRooms(newRooms);
    pushHistory({ walls, rooms: newRooms, doors, exits, obstacles, people });
  };

  const handleAddDoor = (d: any) => {
    const newDoors = [...doors, d];
    setDoors(newDoors);
    pushHistory({ walls, rooms, doors: newDoors, exits, obstacles, people });
  };

  const handleAddExit = (ex: MapExit) => {
    const newExits = [...exits, ex];
    setExits(newExits);
    setValidationError(null);
    pushHistory({ walls, rooms, doors, exits: newExits, obstacles, people });
  };

  const handleAddObstacle = (obs: MapObstacle) => {
    const newObs = [...obstacles, obs];
    setObstacles(newObs);
    pushHistory({ walls, rooms, doors, exits, obstacles: newObs, people });
  };

  const handleAddPerson = (p: MapPerson) => {
    const newPeople = [...people, p];
    setPeople(newPeople);
    setValidationError(null);
    pushHistory({ walls, rooms, doors, exits, obstacles, people: newPeople });
  };

  // Update handler
  const handleUpdateElement = (type: string, elemId: string, updatedFields: any) => {
    if (type === 'exit') {
      const newExits = exits.map((e) => (e.id === elemId ? { ...e, ...updatedFields } : e));
      setExits(newExits);
      if (selectedElement?.type === 'exit' && selectedElement.data.id === elemId) {
        setSelectedElement({ type: 'exit', data: { ...selectedElement.data, ...updatedFields } });
      }
    } else if (type === 'room') {
      const newRooms = rooms.map((r) => (r.id === elemId ? { ...r, ...updatedFields } : r));
      setRooms(newRooms);
      if (selectedElement?.type === 'room' && selectedElement.data.id === elemId) {
        setSelectedElement({ type: 'room', data: { ...selectedElement.data, ...updatedFields } });
      }
    } else if (type === 'obstacle') {
      const newObs = obstacles.map((o) => (o.id === elemId ? { ...o, ...updatedFields } : o));
      setObstacles(newObs);
      if (selectedElement?.type === 'obstacle' && selectedElement.data.id === elemId) {
        setSelectedElement({ type: 'obstacle', data: { ...selectedElement.data, ...updatedFields } });
      }
    } else if (type === 'person') {
      const newPeople = people.map((p) => (p.id === elemId ? { ...p, ...updatedFields } : p));
      setPeople(newPeople);
      if (selectedElement?.type === 'person' && selectedElement.data.id === elemId) {
        setSelectedElement({ type: 'person', data: { ...selectedElement.data, ...updatedFields } });
      }
    } else if (type === 'door') {
      const newDoors = doors.map((d) => (d.id === elemId ? { ...d, ...updatedFields } : d));
      setDoors(newDoors);
      if (selectedElement?.type === 'door' && selectedElement.data.id === elemId) {
        setSelectedElement({ type: 'door', data: { ...selectedElement.data, ...updatedFields } });
      }
    } else if (type === 'wall') {
      const newWalls = walls.map((w) => (w.id === elemId ? { ...w, ...updatedFields } : w));
      setWalls(newWalls);
      if (selectedElement?.type === 'wall' && selectedElement.data.id === elemId) {
        setSelectedElement({ type: 'wall', data: { ...selectedElement.data, ...updatedFields } });
      }
    }
  };

  // Delete handler
  const handleDeleteElement = (type: string, elemId: string) => {
    let nw = walls;
    let nr = rooms;
    let nd = doors;
    let ne = exits;
    let no = obstacles;
    let np = people;

    if (type === 'wall') nw = walls.filter((w) => w.id !== elemId);
    if (type === 'room') nr = rooms.filter((r) => r.id !== elemId);
    if (type === 'door') nd = doors.filter((d) => d.id !== elemId);
    if (type === 'exit') ne = exits.filter((e) => e.id !== elemId);
    if (type === 'obstacle') no = obstacles.filter((o) => o.id !== elemId);
    if (type === 'person') np = people.filter((p) => p.id !== elemId);

    setWalls(nw);
    setRooms(nr);
    setDoors(nd);
    setExits(ne);
    setObstacles(no);
    setPeople(np);
    setSelectedElement(null);
    pushHistory({ walls: nw, rooms: nr, doors: nd, exits: ne, obstacles: no, people: np });
  };

  // Save draft
  const handleSaveDraft = async () => {
    if (!id) return;
    try {
      setSaving(true);
      await environmentService.updateEnvironment(id, {
        geometry: { walls, rooms, corridors: [], doors },
        exits,
        obstacles,
        people,
      });
    } catch (e: any) {
      console.error('Failed to save draft:', e);
      setErrorMsg('Failed to save draft map changes.');
    } finally {
      setSaving(false);
    }
  };

  // Confirm environment
  const handleConfirmEnvironment = async () => {
    if (!validationReport.isValid) {
      setValidationError(validationReport.errors[0] || 'Please fix geometry errors before confirming.');
      return;
    }
    setValidationError(null);

    if (!id) return;
    try {
      setSaving(true);
      await environmentService.updateEnvironment(id, {
        geometry: { walls, rooms, corridors: [], doors },
        exits,
        obstacles,
        people,
      });

      const confirmedEnv = await environmentService.confirmEnvironment(id);
      setEnvironment(confirmedEnv);
      setStatus('confirmed');

      loadEnvironment(confirmedEnv);
    } catch (e: any) {
      console.error('Error confirming environment:', e);
      setValidationError(e.message || 'Validation failed. Check your map elements.');
    } finally {
      setSaving(false);
    }
  };

  const handleStartSimulation = () => {
    if (environment) {
      loadEnvironment(environment);
      navigate('/simulator');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4.5rem)] bg-[#F7F8FA] flex items-center justify-center text-[#2563EB] font-sans font-medium">
        <Sparkles className="w-6 h-6 animate-spin mr-3 text-[#2563EB]" />
        <span>Loading space configuration...</span>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-[#F7F8FA] text-[#172033] flex flex-col py-6 px-4 md:px-8">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto w-full mb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#E2E5E9]">
          <div>
            <div className="flex items-center space-x-2 text-[#2563EB] font-sans text-xs tracking-wider uppercase mb-1 font-bold">
              <span>PREVIA XR</span>
              <span>&bull;</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB]">
                STEP 2 &mdash; VERIFY YOUR SPACE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold font-sans tracking-tight text-[#172033] flex items-center gap-3">
              <span>{environment?.name?.trim() || 'Custom Space'}</span>
              <span
                className={`text-xs px-3 py-1 rounded-full font-sans font-semibold uppercase tracking-wide ${
                  status === 'confirmed'
                    ? 'bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]'
                    : 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]'
                }`}
              >
                {status === 'confirmed' ? '✓ VERIFIED' : 'DRAFT'}
              </span>
            </h1>
            <p className="text-xs md:text-sm text-[#667085] mt-1 font-sans">
              Review and correct 2D geometry, doors, and exits. Real wall openings and collision-aware paths are validated live.
            </p>
          </div>

          {/* Quick buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-white hover:bg-[#F1F3F5] border border-[#E2E5E9] text-xs font-sans font-semibold text-[#172033] flex items-center gap-2 transition-all shadow-sm"
            >
              <Save className="w-4 h-4 text-[#667085]" />
              <span>{saving ? 'SAVING...' : 'SAVE DRAFT'}</span>
            </button>
          </div>
        </div>

        {/* Floor-Plan Vision Reconstruction Diagnostics */}
        {environment?.metadata?.diagnostics && (
          <div className="mt-3 p-3.5 rounded-2xl bg-white border border-[#E2E5E9] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-sans">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-[#2563EB]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#172033]">
                    Floor-Plan Image Reconstruction
                  </span>
                  {environment.metadata.diagnostics.qualityScore && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]">
                      {Math.round(environment.metadata.diagnostics.qualityScore * 100)}% Confidence
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#667085] mt-0.5">
                  {environment.metadata.diagnostics.notice || environment.metadata.analysisNotice || 'Actual structural walls, room boundaries, doors, and exits reconstructed from uploaded image.'}
                </p>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-1.5 self-stretch md:self-auto justify-start md:justify-end">
              <span className="px-2 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E5E9] text-[11px] font-semibold text-[#334155]">
                {walls.length} Walls
              </span>
              <span className="px-2 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E5E9] text-[11px] font-semibold text-[#334155]">
                {rooms.length} Rooms
              </span>
              <span className="px-2 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E5E9] text-[11px] font-semibold text-[#334155]">
                {doors.length} Doors
              </span>
              <span className="px-2 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E5E9] text-[11px] font-semibold text-[#16A34A]">
                {exits.length} Exits
              </span>
              {environment.metadata.diagnostics.stairsDetected > 0 && (
                <span className="px-2 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E5E9] text-[11px] font-semibold text-[#D97706]">
                  {environment.metadata.diagnostics.stairsDetected} Stairs
                </span>
              )}
            </div>
          </div>
        )}

        {/* Quality & Validation Banner */}
        <div className="mt-3">
          {validationReport.errors.length > 0 ? (
            <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-xs flex items-center gap-2.5 shadow-xs">
              <AlertTriangle className="w-4 h-4 text-[#DC2626] flex-shrink-0" />
              <div className="flex-1 font-sans">
                <strong className="font-semibold">Action required before confirmation:</strong>{' '}
                {validationReport.errors.join(' ')}
              </div>
            </div>
          ) : validationReport.warnings.length > 0 ? (
            <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-xs flex items-center gap-2.5 shadow-xs">
              <Info className="w-4 h-4 text-[#D97706] flex-shrink-0" />
              <div className="flex-1 font-sans">
                <strong className="font-semibold">Geometry Quality Check:</strong>{' '}
                {validationReport.warnings.slice(0, 2).join(' ')}
                {validationReport.warnings.length > 2 && ` (+${validationReport.warnings.length - 2} more)`}
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] text-xs flex items-center gap-2 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
              <span className="font-sans font-medium">
                Geometry quality verified: Perimeter closed, real doorway openings active, and pathfinding routes clear.
              </span>
            </div>
          )}
        </div>

        {validationError && (
          <div className="mt-2 p-3 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}
      </div>

      {/* Main 2D Editor Workspace */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col space-y-4">
        {/* Toolbar with Undo / Redo */}
        <MapToolbar
          activeTool={activeTool}
          onSelectTool={(tool) => {
            setActiveTool(tool);
            if (tool !== 'select') setSelectedElement(null);
          }}
          onZoomIn={() => setZoom((prev) => Math.min(2.5, prev + 0.15))}
          onZoomOut={() => setZoom((prev) => Math.max(0.6, prev - 0.15))}
          onResetView={() => {
            setZoom(1);
            setPanOffset({ x: 0, y: 0 });
          }}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />

        {/* Main Split: Left 2D Editor / Right Properties & Reference */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1">
          {/* Left: 2D Canvas (3 cols) */}
          <div className="lg:col-span-3 flex flex-col">
            <MapEditor
              walls={walls}
              rooms={rooms}
              doors={doors}
              exits={exits}
              obstacles={obstacles}
              people={people}
              activeTool={activeTool}
              selectedElement={selectedElement}
              onSelectElement={setSelectedElement}
              onAddWall={handleAddWall}
              onAddRoom={handleAddRoom}
              onAddDoor={handleAddDoor}
              onAddExit={handleAddExit}
              onAddObstacle={handleAddObstacle}
              onAddPerson={handleAddPerson}
              onUpdateElement={handleUpdateElement}
              onDeleteElement={handleDeleteElement}
              zoom={zoom}
              panOffset={panOffset}
              onPanChange={setPanOffset}
            />
          </div>

          {/* Right: Properties & Reference Frames (1 col) */}
          <div className="lg:col-span-1 flex flex-col space-y-4">
            <MapElementProperties
              walls={walls}
              rooms={rooms}
              doors={doors}
              exits={exits}
              obstacles={obstacles}
              people={people}
              selectedElement={selectedElement}
              onUpdateElement={handleUpdateElement}
              onDeleteElement={handleDeleteElement}
            />

            <ReferenceFramePanel frames={referenceFrames} />
          </div>
        </div>

        {/* Bottom Bar: Action & Confirmation */}
        <div className="mt-4 p-4 rounded-2xl bg-white border border-[#E2E5E9] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {status === 'confirmed' ? (
              <div className="flex items-center gap-2 text-[#16A34A] text-sm font-sans font-semibold">
                <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
                <span>✓ SPACE VERIFIED &mdash; Your environment is ready for simulation.</span>
              </div>
            ) : (
              <div className="text-xs text-[#667085] font-sans">
                Review and adjust spatial geometry, then click <strong className="text-[#172033]">Confirm Space</strong> to unlock 3D evacuation simulation.
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {status === 'confirmed' ? (
              <>
                <button
                  type="button"
                  onClick={() => setStatus('draft')}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#F1F3F5] text-[#172033] border border-[#E2E5E9] font-sans text-xs font-bold uppercase transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#667085]" />
                  <span>EDIT MAP</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartSimulation}
                  className="px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md hover:shadow-lg"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>START WHAT-IF SIMULATION</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleConfirmEnvironment}
                disabled={saving || !validationReport.isValid}
                className={`w-full sm:w-auto px-7 py-3 rounded-xl text-white font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md ${
                  validationReport.isValid
                    ? 'bg-[#2563EB] hover:bg-[#1D4ED8] hover:shadow-lg cursor-pointer'
                    : 'bg-[#94A3B8] cursor-not-allowed opacity-80'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>CONFIRM SPACE</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
