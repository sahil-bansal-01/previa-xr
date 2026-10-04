import React from 'react';
import { ExtractedFrame } from '../../services/frameExtractor';
import { Film } from 'lucide-react';

interface FrameThumbnailsProps {
  frames: ExtractedFrame[];
}

export const FrameThumbnails: React.FC<FrameThumbnailsProps> = ({ frames }) => {
  if (!frames || frames.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 text-xs text-[#172033] font-semibold">
        <Film className="w-4 h-4 text-[#2563EB]" />
        <span>REPRESENTATIVE SPATIAL FRAMES ({frames.length})</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
        {frames.map((frame, idx) => (
          <div
            key={idx}
            className="group relative rounded-xl overflow-hidden border border-[#E2E5E9] bg-white aspect-video shadow-xs hover:shadow-elevated hover:border-[#2563EB] transition-all cursor-pointer"
          >
            <img
              src={frame.imageData}
              alt={`Frame ${idx + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            {frame.timestamp > 0 && (
              <div className="absolute bottom-1 right-1 bg-white/95 text-[#172033] px-1.5 py-0.5 rounded text-[10px] font-medium shadow-xs border border-[#E2E5E9]">
                {frame.timestamp}s
              </div>
            )}
            <div className="absolute top-1 left-1 bg-white/95 text-[#667085] px-1.5 py-0.5 rounded text-[9px] font-semibold border border-[#E2E5E9]">
              #{idx + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
