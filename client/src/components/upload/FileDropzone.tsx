import React, { useRef, useState } from 'react';
import { UploadCloud, Video, Image as ImageIcon, X, AlertTriangle, FileCheck } from 'lucide-react';

interface FileDropzoneProps {
  files: File[];
  onFilesSelected: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  disabled?: boolean;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  files,
  onFilesSelected,
  onRemoveFile,
  disabled,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const acceptedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

  const validateAndAddFiles = (newFiles: FileList | File[]) => {
    setErrorMessage('');
    const valid: File[] = [];
    const fileArray = Array.from(newFiles);

    // Check if user has video or images
    const hasVideo = files.some(f => f.type.startsWith('video/')) || fileArray.some(f => f.type.startsWith('video/'));
    const hasImage = files.some(f => f.type.startsWith('image/')) || fileArray.some(f => f.type.startsWith('image/'));

    if (hasVideo && hasImage) {
      setErrorMessage('Please upload either one walkthrough video OR multiple floor images (not mixed).');
      return;
    }

    for (const f of fileArray) {
      if (!acceptedTypes.includes(f.type) && !f.name.match(/\.(mp4|webm|mov|png|jpg|jpeg|webp)$/i)) {
        setErrorMessage(`Unsupported file: ${f.name}. Supported: MP4, WebM, MOV, PNG, JPG/JPEG.`);
        continue;
      }
      if (f.type.startsWith('video/') && (files.length > 0 || valid.length > 0)) {
        setErrorMessage('Only one video can be uploaded at a time.');
        continue;
      }
      valid.push(f);
    }

    if (valid.length > 0) {
      onFilesSelected(valid);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || !e.dataTransfer.files) return;
    validateAndAddFiles(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    }
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 md:p-12 text-center transition-all cursor-pointer select-none ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01]'
            : 'border-slate-700/80 hover:border-cyan-500/60 bg-slate-900/40 hover:bg-slate-900/60'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/mp4,video/webm,video/quicktime,image/png,image/jpeg,image/jpg"
          className="hidden"
          onChange={(e) => e.target.files && validateAndAddFiles(e.target.files)}
          disabled={disabled}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/10">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold font-mono text-slate-100">
              Drag & Drop Walkthrough Video or Images Here
            </h3>
            <p className="text-xs text-slate-400">
              or <span className="text-cyan-400 underline decoration-cyan-500/50 underline-offset-4 font-semibold">browse files</span> from your computer
            </p>
          </div>

          <div className="flex items-center space-x-6 text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
            <span className="flex items-center space-x-1.5">
              <Video className="w-3.5 h-3.5 text-cyan-400" />
              <span>MP4, WebM, MOV (Walkthrough Video)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-violet-400" />
              <span>PNG, JPG (Floor Photos / Plans)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/60 text-rose-300 text-xs font-mono flex items-center space-x-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Selected Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>SELECTED MEDIA ({files.length})</span>
            <button
              onClick={() => onFilesSelected([])}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
            {files.map((file, idx) => {
              const isVid = file.type.startsWith('video/');
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs font-mono text-slate-200 shadow-sm"
                >
                  <div className="flex items-center space-x-2 truncate">
                    {isVid ? (
                      <Video className="w-4 h-4 text-cyan-400 shrink-0" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-violet-400 shrink-0" />
                    )}
                    <div className="truncate">
                      <div className="truncate font-semibold text-slate-200">{file.name}</div>
                      <div className="text-[10px] text-slate-500">{formatFileSize(file.size)}</div>
                    </div>
                  </div>

                  {!disabled && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFile(idx);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors ml-2"
                      title="Remove file"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mandatory Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 text-xs flex items-start space-x-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-amber-300 font-mono">DISCLAIMER:</strong> Generated maps are approximate. Always verify walls, doors and exits before simulation in Step 2.
        </p>
      </div>
    </div>
  );
};
