import React, { useRef, useState } from 'react';
import { UploadCloud, Video, Image as ImageIcon, X, AlertTriangle } from 'lucide-react';

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

  const acceptedTypes = [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
  ];

  const validateAndAddFiles = (newFiles: FileList | File[]) => {
    setErrorMessage('');
    const valid: File[] = [];
    const fileArray = Array.from(newFiles);

    const hasVideo =
      files.some(f => f.type.startsWith('video/')) || fileArray.some(f => f.type.startsWith('video/'));
    const hasImage =
      files.some(f => f.type.startsWith('image/')) || fileArray.some(f => f.type.startsWith('image/'));

    if (hasVideo && hasImage) {
      setErrorMessage('Please upload either one walkthrough video OR multiple floor images.');
      return;
    }

    for (const f of fileArray) {
      if (!acceptedTypes.includes(f.type) && !f.name.match(/\.(mp4|webm|mov|png|jpg|jpeg|webp)$/i)) {
        setErrorMessage(`Unsupported file: ${f.name}. Supported formats: MP4, WebM, MOV, PNG, JPG/JPEG.`);
        continue;
      }
      if (f.size > 100 * 1024 * 1024) {
        setErrorMessage(`"${f.name}" exceeds the 100 MB limit (${formatFileSize(f.size)}). Please choose a smaller file.`);
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
        className={`relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all cursor-pointer select-none bg-white ${
          isDragging
            ? 'border-[#2563EB] bg-[#EFF6FF]'
            : 'border-[#CBD5E1] hover:border-[#2563EB] hover:bg-[#F8FAFC]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/mp4,video/webm,video/quicktime,image/png,image/jpeg,image/jpg"
          className="hidden"
          onChange={e => e.target.files && validateAndAddFiles(e.target.files)}
          disabled={disabled}
        />

        <div className="flex flex-col items-center justify-center space-y-3.5">
          <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] shadow-xs">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[#172033]">
              Upload walkthrough video or floor images
            </h3>
            <p className="text-xs text-[#667085]">
              Drag & drop files here, or{' '}
              <span className="text-[#2563EB] font-medium underline underline-offset-2">
                browse from computer
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#667085] pt-2 border-t border-[#E2E5E9]">
            <span className="flex items-center space-x-1.5">
              <Video className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>MP4, WebM, MOV (Video)</span>
            </span>
            <span className="text-[#CBD5E1]">&bull;</span>
            <span className="flex items-center space-x-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#14B8A6]" />
              <span>PNG, JPG (Floor Images)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Selected Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#667085]">
            <span className="font-medium text-[#172033]">SELECTED MEDIA ({files.length})</span>
            <button
              onClick={() => onFilesSelected([])}
              className="text-[#667085] hover:text-[#DC2626] transition-colors"
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
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E2E5E9] text-xs text-[#172033] shadow-xs"
                >
                  <div className="flex items-center space-x-2 truncate">
                    {isVid ? (
                      <Video className="w-4 h-4 text-[#2563EB] shrink-0" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-[#14B8A6] shrink-0" />
                    )}
                    <div className="truncate">
                      <div className="truncate font-medium text-[#172033]">{file.name}</div>
                      <div className="text-[10px] text-[#667085]">{formatFileSize(file.size)}</div>
                    </div>
                  </div>

                  {!disabled && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onRemoveFile(idx);
                      }}
                      className="p-1 rounded-lg text-[#98A2B3] hover:text-[#DC2626] hover:bg-[#F1F3F5] transition-colors ml-2"
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
      <div className="p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-xs flex items-start space-x-2.5">
        <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Important Disclaimer:</strong> Generated maps are approximate. Always verify walls, doors, and exits before simulation in Step 2.
        </p>
      </div>
    </div>
  );
};
