import React, { useState } from 'react';
import { ExtractedFrame } from '../../services/frameExtractor';
import { Image as ImageIcon, X, Eye } from 'lucide-react';

interface ReferenceFramePanelProps {
  frames: ExtractedFrame[];
}

export const ReferenceFramePanel: React.FC<ReferenceFramePanelProps> = ({ frames }) => {
  const [selectedFrame, setSelectedFrame] = useState<ExtractedFrame | null>(null);

  if (!frames || frames.length === 0) {
    return (
      <div className="bg-white border border-[#E2E5E9] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center space-x-2 text-[#2563EB] font-sans text-xs font-bold uppercase tracking-wider mb-2">
          <ImageIcon className="w-4 h-4 text-[#2563EB]" />
          <span>REFERENCE FRAMES</span>
        </div>
        <p className="text-xs text-[#667085] font-sans italic">
          No extracted frames available for this session.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E2E5E9] rounded-2xl p-4 shadow-sm flex flex-col space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#E2E5E9]">
        <div className="flex items-center space-x-2 text-[#2563EB] font-sans text-xs font-bold uppercase tracking-wider">
          <ImageIcon className="w-4 h-4 text-[#2563EB]" />
          <span>REFERENCE FRAMES ({frames.length})</span>
        </div>
        <span className="text-[11px] text-[#667085] font-sans">Click to inspect</span>
      </div>

      {/* Frame Grid */}
      <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
        {frames.map((frame, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedFrame(frame)}
            className="group relative rounded-xl overflow-hidden border border-[#E2E5E9] hover:border-[#2563EB] transition-all cursor-pointer bg-[#F1F3F5] aspect-video hover:shadow-md"
          >
            <img
              src={frame.imageData}
              alt={`Frame ${frame.index + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-[#172033]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <div className="absolute bottom-1 right-1 bg-[#172033]/80 px-1.5 py-0.5 rounded text-[10px] font-sans font-medium text-white">
              {frame.timestamp.toFixed(1)}s
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedFrame && (
        <div
          className="fixed inset-0 z-50 bg-[#172033]/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedFrame(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-white border border-[#E2E5E9] rounded-2xl overflow-hidden shadow-2xl p-3"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#E2E5E9]">
              <span className="text-xs font-sans font-semibold text-[#172033]">
                FRAME #{selectedFrame.index + 1} &bull; TIMESTAMP: {selectedFrame.timestamp.toFixed(2)}s
              </span>
              <button
                type="button"
                onClick={() => setSelectedFrame(null)}
                className="text-[#667085] hover:text-[#172033] p-1.5 rounded-lg hover:bg-[#F1F3F5] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2">
              <img
                src={selectedFrame.imageData}
                alt="Enlarged reference"
                className="w-full max-h-[70vh] object-contain rounded-xl border border-[#E2E5E9]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
