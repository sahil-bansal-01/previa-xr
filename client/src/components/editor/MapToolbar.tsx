import React from 'react';
import {
  MousePointer,
  Square,
  DoorOpen,
  LogOut,
  ShieldAlert,
  User,
  Trash2,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Minus,
  Undo2,
  Redo2,
} from 'lucide-react';

export type EditorTool =
  | 'select'
  | 'wall'
  | 'room'
  | 'door'
  | 'exit'
  | 'obstacle'
  | 'person'
  | 'erase'
  | 'pan';

interface MapToolbarProps {
  activeTool: EditorTool;
  onSelectTool: (tool: EditorTool) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const MapToolbar: React.FC<MapToolbarProps> = ({
  activeTool,
  onSelectTool,
  onZoomIn,
  onZoomOut,
  onResetView,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}) => {
  const tools: { id: EditorTool; label: string; icon: React.ReactNode; shortcut: string }[] = [
    { id: 'select', label: 'Select', icon: <MousePointer className="w-3.5 h-3.5" />, shortcut: 'V' },
    { id: 'wall', label: 'Wall', icon: <Minus className="w-3.5 h-3.5 stroke-[3]" />, shortcut: 'W' },
    { id: 'room', label: 'Room', icon: <Square className="w-3.5 h-3.5" />, shortcut: 'R' },
    { id: 'door', label: 'Door', icon: <DoorOpen className="w-3.5 h-3.5" />, shortcut: 'D' },
    { id: 'exit', label: 'Exit', icon: <LogOut className="w-3.5 h-3.5" />, shortcut: 'E' },
    { id: 'obstacle', label: 'Obstacle', icon: <ShieldAlert className="w-3.5 h-3.5" />, shortcut: 'O' },
    { id: 'person', label: 'Person', icon: <User className="w-3.5 h-3.5" />, shortcut: 'P' },
    { id: 'erase', label: 'Erase', icon: <Trash2 className="w-3.5 h-3.5" />, shortcut: 'X' },
    { id: 'pan', label: 'Pan', icon: <Move className="w-3.5 h-3.5" />, shortcut: 'H' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 bg-white border border-[#E2E5E9] rounded-xl shadow-subtle">
      {/* Primary Tool buttons */}
      <div className="flex flex-wrap items-center gap-1">
        {tools.map(tool => {
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => onSelectTool(tool.id)}
              title={`${tool.label} (${tool.shortcut})`}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] font-semibold shadow-xs'
                  : 'text-[#667085] hover:text-[#172033] hover:bg-[#F1F3F5] border border-transparent'
              }`}
            >
              <span className={isActive ? 'text-[#2563EB]' : 'text-[#667085]'}>{tool.icon}</span>
              <span className="hidden sm:inline">{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* History and View Controls */}
      <div className="flex items-center gap-1 pl-2 border-l border-[#E2E5E9]">
        {onUndo && (
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className={`p-1.5 rounded-lg transition-colors ${
              canUndo
                ? 'text-[#667085] hover:text-[#172033] hover:bg-[#F1F3F5]'
                : 'text-[#CBD5E1] cursor-not-allowed'
            }`}
          >
            <Undo2 className="w-4 h-4" />
          </button>
        )}
        {onRedo && (
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className={`p-1.5 rounded-lg transition-colors ${
              canRedo
                ? 'text-[#667085] hover:text-[#172033] hover:bg-[#F1F3F5]'
                : 'text-[#CBD5E1] cursor-not-allowed'
            }`}
          >
            <Redo2 className="w-4 h-4" />
          </button>
        )}

        <div className="w-[1px] h-4 bg-[#E2E5E9] mx-1" />

        <button
          type="button"
          onClick={onZoomIn}
          title="Zoom In (+)"
          className="p-1.5 rounded-lg text-[#667085] hover:text-[#172033] hover:bg-[#F1F3F5] transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onZoomOut}
          title="Zoom Out (-)"
          className="p-1.5 rounded-lg text-[#667085] hover:text-[#172033] hover:bg-[#F1F3F5] transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onResetView}
          title="Reset Zoom & Pan"
          className="p-1.5 rounded-lg text-[#667085] hover:text-[#172033] hover:bg-[#F1F3F5] transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
