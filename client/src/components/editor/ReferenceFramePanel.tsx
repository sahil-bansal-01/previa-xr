import React, { useState } from 'react';
import { ExtractedFrame } from '../../services/frameExtractor';
import { Image as ImageIcon, Maximize2, X, Eye } from 'lucide-react';

interface ReferenceFramePanelProps {
  frames: ExtractedFrame[];
}

export const ReferenceFramePanel: React.FC<ReferenceFramePanelProps> = ({ frames }) => {
  const [selectedFrame, setSelectedFrame] = useState<ExtractedFrame | null>(null);

  if (!frames || frames.length === 0) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 backdrop-blur-md shadow-lg">
        <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider mb-2">
          <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span>REFERENCE FRAMES</span>
        </div>
        <p className="text-xs text-slate-500 font-sans italic">
          No extracted frames available for this session.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 backdrop-blur-md shadow-lg flex flex-col space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
          <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span>REFERENCE FRAMES ({frames.length})</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Click to enlarge</span>
      </div>

      {/* Frame Grid */}
      <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
        {frames.map((frame, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedFrame(frame)}
            className="group relative rounded-lg overflow-hidden border border-slate-700/80 hover:border-cyan-400 transition-all cursor-pointer bg-slate-950 aspect-video"
          >
            <img
              src={frame.imageData}
              alt={`Frame ${frame.index + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Eye className="w-4 h-4 text-cyan-300" />
            </div>
            <div className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[9px] font-mono text-cyan-300">
              {frame.timestamp.toFixed(1)}s
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedFrame && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedFrame(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-slate-900 border border-cyan-500/40 rounded-2xl overflow-hidden shadow-2xl p-2"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800">
              <span className="text-xs font-mono text-cyan-300">
                FRAME #{selectedFrame.index + 1} &bull; TIMESTAMP: {selectedFrame.timestamp.toFixed(2)}s
              </span>
              <button
                type="button"
                onClick={() => setSelectedFrame(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2">
              <img
                src={selectedFrame.imageData}
                alt="Enlarged reference"
                className="w-full max-h-[70vh] object-contain rounded-lg border border-slate-800"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
