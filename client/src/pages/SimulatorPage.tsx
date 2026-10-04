import React, { useState, useEffect } from 'react';
import { SpatialScene } from '../components/3d/SpatialScene';
import { ScenarioControls } from '../components/ui/ScenarioControls';
import { ConsequencePanel } from '../components/ui/ConsequencePanel';
import { EnvironmentSelector } from '../components/ui/EnvironmentSelector';
import { SaveScenarioModal } from '../components/modals/SaveScenarioModal';
import { useSimulation } from '../contexts/SimulationContext';
import { Sparkles, RotateCcw, Loader2 } from 'lucide-react';
import { xrStore } from '../simulation/xr/xrStore';

export const SimulatorPage: React.FC = () => {
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);
  const [isXrSupported, setIsXrSupported] = useState<boolean | null>(null);
  const [xrNotice, setXrNotice] = useState<string | null>(null);

  const {
    loading,
    isSimulating,
    simulateFuture,
    resetScenario,
  } = useSimulation();

  // Check WebXR device/browser availability gracefully on mount
  useEffect(() => {
    let isMounted = true;
    if (typeof navigator !== 'undefined' && 'xr' in navigator && (navigator as any).xr?.isSessionSupported) {
      (navigator as any).xr
        .isSessionSupported('immersive-vr')
        .then((supported: boolean) => {
          if (isMounted) setIsXrSupported(supported);
        })
        .catch(() => {
          if (isMounted) setIsXrSupported(false);
        });
    } else {
      setIsXrSupported(false);
    }
    return () => {
      isMounted = false;
    };
  }, []);

  // Enter WebXR action
  const handleEnterXR = async () => {
    if (isXrSupported === false) {
      setXrNotice(
        'XR Preview requires a WebXR-compatible browser or device (Meta Quest, Apple Vision Pro, or WebXR Emulator extension).'
      );
      return;
    }

    try {
      const session = await xrStore.enterVR();
      if (!session) {
        setXrNotice('XR Preview requires a WebXR-compatible browser or device.');
      }
    } catch (err: any) {
      console.warn('[WebXR] Could not initialize VR session:', err);
      setXrNotice('XR Preview requires a WebXR-compatible browser or device.');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F7F8FA] text-[#172033]">
        <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin mb-3" />
        <span className="font-sans text-xs uppercase tracking-widest text-[#2563EB] font-bold">
          Loading 3D Environment & Pathfinding Grid...
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-68px)] overflow-hidden bg-[#F7F8FA] font-sans">
      {/* Dominant Element: Full Viewport 3D Canvas */}
      <main className="absolute inset-0 w-full h-full z-0">
        <SpatialScene />
      </main>

      {/* Top Center: Minimal Architectural Legend */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none select-none">
        <div className="flex items-center gap-3 px-3.5 py-1.5 bg-white/90 backdrop-blur-md border border-[#E2E5E9] rounded-xl text-[11px] font-sans font-medium text-[#475569] shadow-xs">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#475569]" />WALL</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs border border-dashed border-[#64748B] bg-[#E2E8F0]" />DOOR</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />EXIT</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />PERSON</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#F97316]" />OBSTACLE</div>
        </div>
      </div>

      {/* Top Left: Environment Selector */}
      <div className="absolute top-4 left-4 z-20">
        <EnvironmentSelector />
      </div>

      {/* Left: WHAT-IF Panel */}
      <ScenarioControls
        isOpen={isLeftOpen}
        onToggle={() => setIsLeftOpen(!isLeftOpen)}
      />

      {/* Right: CONSEQUENCES Panel */}
      <ConsequencePanel
        isOpen={isRightOpen}
        onToggle={() => setIsRightOpen(!isRightOpen)}
      />

      {/* Bottom: Primary Action Controls: [ Reset Baseline ] [ Simulate Future ] [ 🥽 ENTER XR PREVIEW ] */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-[#E2E5E9] p-2 rounded-2xl shadow-lg">
          {/* Reset Baseline Action */}
          <button
            type="button"
            onClick={resetScenario}
            className="px-4 py-3.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F3F5] text-[#475569] hover:text-[#0F172A] border border-[#E2E5E9] transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-wider shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
            title="Reset to baseline"
          >
            <RotateCcw className="w-4 h-4 text-[#64748B]" />
            <span className="hidden sm:inline">Reset Baseline</span>
          </button>

          {/* Simulate Future CTA */}
          <button
            type="button"
            onClick={simulateFuture}
            disabled={isSimulating}
            className={`px-8 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center space-x-2.5 transition-all shadow-md hover:shadow-lg ${
              isSimulating
                ? 'bg-[#2563EB]/80 text-white cursor-wait'
                : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white hover:-translate-y-0.5 active:translate-y-0 cursor-pointer'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Simulating...' : 'SIMULATE FUTURE →'}</span>
          </button>

          {/* WebXR Immersive Preview Action */}
          <button
            type="button"
            onClick={handleEnterXR}
            disabled={isSimulating}
            className="px-5 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all bg-[#0F172A] hover:bg-[#1E293B] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-[#334155]/40"
            title={
              isXrSupported === false
                ? 'WebXR requires a compatible VR headset or WebXR browser extension'
                : 'Enter human-scale immersive 3D WebXR preview'
            }
          >
            <span className="text-sm">🥽</span>
            <span>ENTER XR PREVIEW</span>
          </button>
        </div>
      </div>

      {/* Non-blocking WebXR Status Notification */}
      {xrNotice && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#0F172A]/95 text-white px-5 py-3 rounded-xl shadow-2xl border border-[#334155] flex items-center gap-3 backdrop-blur-md text-xs font-sans max-w-md pointer-events-auto">
          <span className="text-xl">🥽</span>
          <div className="flex-1">
            <div className="font-semibold text-white">XR Preview requires a WebXR-compatible browser or device.</div>
            <div className="text-[#94A3B8] text-[11px] mt-0.5">
              To preview on desktop, install the WebXR API Emulator extension, or launch PREVIA XR on a Meta Quest or Apple Vision Pro.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setXrNotice(null)}
            className="text-[#94A3B8] hover:text-white text-base leading-none p-1 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Save Scenario Modal if opened */}
      <SaveScenarioModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
      />
    </div>
  );
};
