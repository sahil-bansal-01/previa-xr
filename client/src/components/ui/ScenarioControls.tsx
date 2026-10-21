import React, { useState } from 'react';
import { useSimulation } from '../../contexts/SimulationContext';
import {
  AlertOctagon,
  Move,
  ShieldAlert,
  Sparkles,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  CheckCircle2,
} from 'lucide-react';

interface ScenarioControlsProps {
  onOpenSaveModal?: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

type WhatIfActionType = 'block_exit' | 'block_corridor' | 'add_obstacle';

export const ScenarioControls: React.FC<ScenarioControlsProps> = ({
  isOpen,
  onToggle,
}) => {
  const {
    activeEnvironment,
    exits,
    obstacle,
    blockExitA,
    blockExitById,
    blockCorridor,
    clearObstacle,
    simulateFuture,
    resetScenario,
    isSimulating,
  } = useSimulation();

  const [selectedAction, setSelectedAction] = useState<WhatIfActionType>('block_exit');
  const [selectedExitId, setSelectedExitId] = useState<string>(
    exits.length > 0 ? exits[0].id : 'exit-main'
  );

  React.useEffect(() => {
    if (exits.length > 0 && !exits.some(e => e.id === selectedExitId)) {
      setSelectedExitId(exits[0].id);
    }
  }, [exits, selectedExitId]);

  const handleSelectAction = (action: WhatIfActionType) => {
    setSelectedAction(action);
    if (action === 'block_exit') {
      const target = exits.find(e => e.id === selectedExitId) || exits[0];
      if (target && (target.id === 'exit-main' || target.id === 'exit-a')) {
        blockExitA();
      } else if (target) {
        blockExitById(target.id);
      } else {
        blockExitA();
      }
    } else if (action === 'block_corridor') {
      blockCorridor();
    } else if (action === 'add_obstacle') {
      blockCorridor();
    }
  };

  const handleSelectExitTarget = (exitId: string) => {
    setSelectedExitId(exitId);
    if (exitId === 'exit-main' || exitId === 'exit-a') {
      blockExitA();
    } else {
      blockExitById(exitId);
    }
  };

  const isBlocked = obstacle.isBlockingExitA || obstacle.targetBlock !== 'none';

  if (!isOpen) {
    return (
      <div className="absolute top-16 left-4 z-20">
        <button
          onClick={onToggle}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white border border-[#E2E5E9] text-[#172033] hover:text-[#2563EB] font-sans text-xs font-bold shadow-sm transition-all"
          title="Open WHAT-IF panel"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>WHAT-IF</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#667085]" />
        </button>
      </div>
    );
  }

  return (
    <aside className="absolute top-16 left-4 z-20 w-80 bg-white border border-[#E2E5E9] rounded-2xl shadow-lg overflow-hidden font-sans">
      {/* Header */}
      <div className="p-3.5 border-b border-[#E2E5E9] flex items-center justify-between bg-white">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold text-xs">
            1
          </div>
          <div>
            <h2 className="text-xs font-bold text-[#172033] tracking-wide uppercase">
              WHAT-IF
            </h2>
            <span className="text-[10px] text-[#667085]">
              What do you want to change?
            </span>
          </div>
        </div>

        <button
          onClick={onToggle}
          className="p-1 rounded-lg text-[#667085] hover:text-[#172033] hover:bg-[#F1F3F5] transition-colors"
          title="Collapse Panel"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3.5 space-y-3 text-xs">
        {/* EXACTLY 3 ACTIONS */}
        <div className="space-y-1.5">
          {/* Action 1: Block Exit */}
          <button
            type="button"
            onClick={() => handleSelectAction('block_exit')}
            className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
              selectedAction === 'block_exit' && isBlocked
                ? 'bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626] font-semibold'
                : 'bg-white border-[#E2E5E9] hover:bg-[#F8FAFC] text-[#172033]'
            }`}
          >
            <div className="flex items-center space-x-2">
              <AlertOctagon
                className={`w-4 h-4 ${
                  selectedAction === 'block_exit' && isBlocked
                    ? 'text-[#DC2626]'
                    : 'text-[#667085]'
                }`}
              />
              <span className="text-xs font-medium">Block Exit</span>
            </div>
            {selectedAction === 'block_exit' && isBlocked && (
              <span className="text-[10px] bg-[#DC2626] text-white px-1.5 py-0.5 rounded font-bold">
                ACTIVE
              </span>
            )}
          </button>

          {/* Action 2: Block Corridor */}
          <button
            type="button"
            onClick={() => handleSelectAction('block_corridor')}
            className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
              selectedAction === 'block_corridor' && isBlocked
                ? 'bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626] font-semibold'
                : 'bg-white border-[#E2E5E9] hover:bg-[#F8FAFC] text-[#172033]'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Move
                className={`w-4 h-4 ${
                  selectedAction === 'block_corridor' && isBlocked
                    ? 'text-[#DC2626]'
                    : 'text-[#667085]'
                }`}
              />
              <span className="text-xs font-medium">Block Corridor</span>
            </div>
            {selectedAction === 'block_corridor' && isBlocked && (
              <span className="text-[10px] bg-[#DC2626] text-white px-1.5 py-0.5 rounded font-bold">
                ACTIVE
              </span>
            )}
          </button>

          {/* Action 3: Add Obstacle */}
          <button
            type="button"
            onClick={() => handleSelectAction('add_obstacle')}
            className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
              selectedAction === 'add_obstacle' && isBlocked
                ? 'bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626] font-semibold'
                : 'bg-white border-[#E2E5E9] hover:bg-[#F8FAFC] text-[#172033]'
            }`}
          >
            <div className="flex items-center space-x-2">
              <ShieldAlert
                className={`w-4 h-4 ${
                  selectedAction === 'add_obstacle' && isBlocked
                    ? 'text-[#DC2626]'
                    : 'text-[#667085]'
                }`}
              />
              <span className="text-xs font-medium">Add Obstacle</span>
            </div>
            {selectedAction === 'add_obstacle' && isBlocked && (
              <span className="text-[10px] bg-[#DC2626] text-white px-1.5 py-0.5 rounded font-bold">
                ACTIVE
              </span>
            )}
          </button>
        </div>

        {/* SELECT TARGET (if Block Exit selected) - Clean uppercase meaningful names (Section 30) */}
        {selectedAction === 'block_exit' && exits.length > 0 && (
          <div className="pt-2 border-t border-[#E2E5E9] space-y-1.5">
            <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block">
              SELECT TARGET
            </span>
            <select
              value={selectedExitId}
              onChange={e => handleSelectExitTarget(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[#172033] text-xs font-semibold focus:outline-none focus:border-[#2563EB]"
            >
              {exits.map(ex => {
                const labelText = (ex.label || ex.name || 'EXIT').toUpperCase();
                return (
                  <option key={ex.id} value={ex.id}>
                    {labelText}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* Reset to Baseline */}
        <div className="pt-2 border-t border-[#E2E5E9]">
          <button
            type="button"
            onClick={() => {
              clearObstacle();
              resetScenario();
            }}
            className="w-full py-2 px-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F3F5] text-[#475467] hover:text-[#172033] border border-[#CBD5E1] text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Baseline</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
