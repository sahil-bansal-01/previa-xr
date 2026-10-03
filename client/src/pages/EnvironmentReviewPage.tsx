import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { environmentService } from '../services/environmentService';
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
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Save,
  ArrowRight,
  ShieldCheck,
  Compass,
  FileCheck,
  Edit2,
  Sparkles,
} from 'lucide-react';

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

  const [activeTool, setActiveTool] = useState<EditorTool>('select');
  const [selectedElement, setSelectedElement] = useState<SelectedElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [status, setStatus] = useState<'draft' | 'confirmed'>('draft');
  const [referenceFrames, setReferenceFrames] = useState<ExtractedFrame[]>([]);

  // Fetch Environment
  const fetchEnv = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const env = await environmentService.getEnvironmentById(id);
      setEnvironment(env);
      setWalls(env.geometry?.walls || []);
      setRooms(env.geometry?.rooms || []);
      setDoors(env.geometry?.doors || []);
      setExits(env.exits || []);
      setObstacles(env.obstacles || []);
      setPeople(env.people || []);
      setStatus(env.analysisStatus === 'confirmed' ? 'confirmed' : 'draft');

      // Load reference frames from sessionStorage if available
      try {
        const storedFrames = sessionStorage.getItem(`env_frames_${id}`);
        if (storedFrames) {
          setReferenceFrames(JSON.parse(storedFrames));
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

  // Validation function
  const validateEnvironment = (): string | null => {
    if (exits.length === 0) {
      return 'Add at least one exit before continuing. Use the EXIT tool to place an exit.';
    }
    if (walls.length === 0 && rooms.length === 0) {
      return 'Add at least one wall or room perimeter to define the space boundary.';
    }
    if (people.length === 0) {
      return 'Add at least one occupant / starting position to run evacuation simulation.';
    }
    return null;
  };

  // Add handlers
  const handleAddWall = (w: MapWall) => {
    setWalls(prev => [...prev, w]);
  };

  const handleAddRoom = (r: MapRoom) => {
    setRooms(prev => [...prev, r]);
  };

  const handleAddDoor = (d: any) => {
    setDoors(prev => [...prev, d]);
  };

  const handleAddExit = (ex: MapExit) => {
    setExits(prev => [...prev, ex]);
    setValidationError(null);
  };

  const handleAddObstacle = (obs: MapObstacle) => {
    setObstacles(prev => [...prev, obs]);
  };

  const handleAddPerson = (p: MapPerson) => {
    setPeople(prev => [...prev, p]);
    setValidationError(null);
  };

  // Update handler
  const handleUpdateElement = (type: string, elemId: string, updatedFields: any) => {
    if (type === 'exit') {
      setExits(prev => prev.map(e => (e.id === elemId ? { ...e, ...updatedFields } : e)));
      if (selectedElement?.type === 'exit' && selectedElement.data.id === elemId) {
        setSelectedElement({ type: 'exit', data: { ...selectedElement.data, ...updatedFields } });
      }
    } else if (type === 'room') {
      setRooms(prev => prev.map(r => (r.id === elemId ? { ...r, ...updatedFields } : r)));
      if (selectedElement?.type === 'room' && selectedElement.data.id === elemId) {
        setSelectedElement({ type: 'room', data: { ...selectedElement.data, ...updatedFields } });
      }
    } else if (type === 'obstacle') {
      setObstacles(prev => prev.map(o => (o.id === elemId ? { ...o, ...updatedFields } : o)));
      if (selectedElement?.type === 'obstacle' && selectedElement.data.id === elemId) {
        setSelectedElement({ type: 'obstacle', data: { ...selectedElement.data, ...updatedFields } });
      }
    } else if (type === 'person') {
      setPeople(prev => prev.map(p => (p.id === elemId ? { ...p, ...updatedFields } : p)));
      if (selectedElement?.type === 'person' && selectedElement.data.id === elemId) {
        setSelectedElement({ type: 'person', data: { ...selectedElement.data, ...updatedFields } });
      }
    } else if (type === 'door') {
      setDoors(prev => prev.map(d => (d.id === elemId ? { ...d, ...updatedFields } : d)));
      if (selectedElement?.type === 'door' && selectedElement.data.id === elemId) {
        setSelectedElement({ type: 'door', data: { ...selectedElement.data, ...updatedFields } });
      }
    } else if (type === 'wall') {
      setWalls(prev => prev.map(w => (w.id === elemId ? { ...w, ...updatedFields } : w)));
      if (selectedElement?.type === 'wall' && selectedElement.data.id === elemId) {
        setSelectedElement({ type: 'wall', data: { ...selectedElement.data, ...updatedFields } });
      }
    }
  };

  // Delete handler
  const handleDeleteElement = (type: string, elemId: string) => {
    if (type === 'wall') setWalls(prev => prev.filter(w => w.id !== elemId));
    if (type === 'room') setRooms(prev => prev.filter(r => r.id !== elemId));
    if (type === 'door') setDoors(prev => prev.filter(d => d.id !== elemId));
    if (type === 'exit') setExits(prev => prev.filter(e => e.id !== elemId));
    if (type === 'obstacle') setObstacles(prev => prev.filter(o => o.id !== elemId));
    if (type === 'person') setPeople(prev => prev.filter(p => p.id !== elemId));
    setSelectedElement(null);
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
    const error = validateEnvironment();
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);

    if (!id) return;
    try {
      setSaving(true);
      // First update geometries
      await environmentService.updateEnvironment(id, {
        geometry: { walls, rooms, corridors: [], doors },
        exits,
        obstacles,
        people,
      });

      // Then confirm
      const confirmedEnv = await environmentService.confirmEnvironment(id);
      setEnvironment(confirmedEnv);
      setStatus('confirmed');

      // Update simulation context with this active environment
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
      <div className="min-h-[calc(100vh-4rem)] bg-[#07090e] flex items-center justify-center text-cyan-400 font-mono">
        <Sparkles className="w-6 h-6 animate-spin mr-3" />
        <span>Loading space configuration...</span>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#07090e] text-slate-100 flex flex-col py-6 px-4 md:px-8">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto w-full mb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs tracking-wider uppercase mb-1">
              <span>PREVIA XR</span>
              <span>&bull;</span>
              <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30">
                STEP 2 — VERIFY YOUR SPACE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold font-mono tracking-tight text-white flex items-center gap-3">
              <span>{environment?.name || 'VERIFY YOUR SPACE'}</span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold uppercase ${
                  status === 'confirmed'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {status.toUpperCase()}
              </span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Review and correct the approximate map before running a what-if simulation. Add or
              reposition walls, doors, exits, and people.
            </p>
          </div>

          {/* Quick buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving}
              className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'SAVING...' : 'SAVE DRAFT'}</span>
            </button>
          </div>
        </div>

        {/* Validation error banner */}
        {validationError && (
          <div className="mt-3 p-3.5 rounded-xl bg-red-950/50 border border-red-500/50 text-red-200 text-xs md:text-sm flex items-center gap-2.5 animate-shake">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}
      </div>

      {/* Main 2D Editor Workspace */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col space-y-4">
        {/* Toolbar */}
        <MapToolbar
          activeTool={activeTool}
          onSelectTool={tool => {
            setActiveTool(tool);
            if (tool !== 'select') setSelectedElement(null);
          }}
          onZoomIn={() => setZoom(prev => Math.min(2.5, prev + 0.15))}
          onZoomOut={() => setZoom(prev => Math.max(0.6, prev - 0.15))}
          onResetView={() => {
            setZoom(1);
            setPanOffset({ x: 0, y: 0 });
          }}
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
        <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {status === 'confirmed' ? (
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Your space is ready for simulation.</span>
              </div>
            ) : (
              <div className="text-xs text-slate-400 font-sans">
                Verify geometry, doors, and exits, then click Confirm Environment to proceed to 3D
                simulation.
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {status === 'confirmed' ? (
              <>
                <button
                  type="button"
                  onClick={() => setStatus('draft')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold uppercase transition-colors flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>EDIT MAP</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartSimulation}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-mono font-extrabold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-cyan-500/25 hover:scale-105"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>START WHAT-IF SIMULATION</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleConfirmEnvironment}
                disabled={saving}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-extrabold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-xl shadow-cyan-500/25 hover:scale-105"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>CONFIRM ENVIRONMENT</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
