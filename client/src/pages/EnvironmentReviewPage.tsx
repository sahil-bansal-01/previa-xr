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
      <div className="min-h-[calc(100vh-4.5rem)] bg-[#F7F8FA] flex items-center justify-center text-[#2563EB] font-sans font-medium">
        <Sparkles className="w-6 h-6 animate-spin mr-3 text-[#2563EB]" />
        <span>Loading space configuration...</span>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-[#F7F8FA] text-[#172033] flex flex-col py-6 px-4 md:px-8">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto w-full mb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E2E5E9]">
          <div>
            <div className="flex items-center space-x-2 text-[#2563EB] font-sans text-xs tracking-wider uppercase mb-1.5 font-bold">
              <span>PREVIA XR</span>
              <span>&bull;</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB]">
                STEP 2 &mdash; VERIFY YOUR SPACE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold font-sans tracking-tight text-[#172033] flex items-center gap-3">
              <span>
                {environment?.name && !/whatsapp|vid[_\-]|img[_\-]|mov|mp4|webm|\d{6}/i.test(environment.name)
                  ? environment.name
                  : 'My Space'}
              </span>
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
              Review and correct the approximate 2D spatial model. Add or reposition walls, doors, exits, obstacles, and people.
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

        {/* Validation error banner */}
        {validationError && (
          <div className="mt-3 p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-xs md:text-sm flex items-center gap-2.5 shadow-sm">
            <AlertTriangle className="w-4 h-4 text-[#DC2626] flex-shrink-0" />
            <span className="font-sans font-medium">{validationError}</span>
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
        <div className="mt-4 p-4 rounded-2xl bg-white border border-[#E2E5E9] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {status === 'confirmed' ? (
              <div className="flex items-center gap-2 text-[#16A34A] text-sm font-sans font-semibold">
                <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
                <span>✓ SPACE VERIFIED &mdash; Your environment is ready for simulation.</span>
              </div>
            ) : (
              <div className="text-xs text-[#667085] font-sans">
                Verify geometry, doors, and exits, then click <strong className="text-[#172033]">Confirm Environment</strong> to proceed to 3D simulation.
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
                disabled={saving}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md hover:shadow-lg"
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
