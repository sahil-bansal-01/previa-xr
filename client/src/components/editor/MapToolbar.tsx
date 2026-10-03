import React from 'react';
import {
  MousePointer,
  Square,
  Maximize2,
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
  onClearAll?: () => void;
}

export const MapToolbar: React.FC<MapToolbarProps> = ({
  activeTool,
  onSelectTool,
  onZoomIn,
  onZoomOut,
  onResetView,
}) => {
  const tools: { id: EditorTool; label: string; icon: React.ReactNode; shortcut: string }[] = [
    { id: 'select', label: 'SELECT', icon: <MousePointer className="w-4 h-4" />, shortcut: 'V' },
    { id: 'wall', label: 'WALL', icon: <Minus className="w-4 h-4 stroke-[3]" />, shortcut: 'W' },
    { id: 'room', label: 'ROOM', icon: <Square className="w-4 h-4" />, shortcut: 'R' },
    { id: 'door', label: 'DOOR', icon: <DoorOpen className="w-4 h-4" />, shortcut: 'D' },
    { id: 'exit', label: 'EXIT', icon: <LogOut className="w-4 h-4" />, shortcut: 'E' },
    { id: 'obstacle', label: 'OBSTACLE', icon: <ShieldAlert className="w-4 h-4" />, shortcut: 'O' },
    { id: 'person', label: 'PERSON', icon: <User className="w-4 h-4" />, shortcut: 'P' },
    { id: 'erase', label: 'ERASE', icon: <Trash2 className="w-4 h-4" />, shortcut: 'X' },
    { id: 'pan', label: 'PAN', icon: <Move className="w-4 h-4" />, shortcut: 'H' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-900/90 border border-slate-800 rounded-xl backdrop-blur-md shadow-lg">
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
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent'
              }`}
            >
              {tool.icon}
              <span className="hidden sm:inline">{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* View controls */}
      <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
        <button
          type="button"
          onClick={onZoomIn}
          title="Zoom In (+)"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onZoomOut}
          title="Zoom Out (-)"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onResetView}
          title="Reset Zoom & Pan"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
