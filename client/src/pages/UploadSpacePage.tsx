import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileDropzone } from '../components/upload/FileDropzone';
import { AnalysisProgress, AnalysisStage } from '../components/upload/AnalysisProgress';
import { FrameThumbnails } from '../components/upload/FrameThumbnails';
import { extractVideoFrames, extractImageThumbnails, ExtractedFrame } from '../services/frameExtractor';
import { environmentService } from '../services/environmentService';
import { useAuth } from '../contexts/AuthContext';
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
  Compass,
} from 'lucide-react';

export const UploadSpacePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, demoLogin } = useAuth();

  const [files, setFiles] = useState<File[]>([]);
  const [environmentName, setEnvironmentName] = useState<string>('My Space');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<AnalysisStage>('upload');
  const [extractedFrames, setExtractedFrames] = useState<ExtractedFrame[]>([]);
  const [noticeMessage, setNoticeMessage] = useState<string>('');
  const [createdEnvId, setCreatedEnvId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isVideo = files.length > 0 && files[0].type.startsWith('video/');

  const handleFilesSelected = (newFiles: File[]) => {
    setErrorMsg(null);
    setFiles(newFiles);
    if (newFiles.length > 0) {
      const raw = newFiles[0].name.split('.')[0];
      if (/^(whatsapp[_\-\s]|img[_-]\d{6}|vid[_-]\d{6})/i.test(raw) || raw.length > 35) {
        setEnvironmentName('Custom Space');
      } else {
        const baseName = raw.replace(/[-_]/g, ' ').trim();
        setEnvironmentName(baseName.charAt(0).toUpperCase() + baseName.slice(1));
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleStartAnalysis = async () => {
    if (files.length === 0) {
      setErrorMsg('Please select at least one walkthrough video or floor images.');
      return;
    }

    try {
      setIsAnalyzing(true);
      setErrorMsg(null);

      // Auto login in demo mode if unauthenticated
      if (!isAuthenticated) {
        try {
          await demoLogin();
        } catch {
          // Continue regardless
        }
      }

      // Step 1: Create unique environment and store original video/images
      setCurrentStep('upload');
      const sourceType = isVideo ? 'video' : 'images';
      const createdEnv = await environmentService.createEnvironment({
        name: environmentName.trim() || 'My Space',
        sourceType,
      });
      const envId = createdEnv._id;
      setCreatedEnvId(envId);

      // Store original files under server/uploads/<environmentId>/original/
      await environmentService.uploadFiles(files, envId, 'original');

      // Step 2: Extract representative frames (beginning, several middle, end)
      setCurrentStep('extracting');
      let frames: ExtractedFrame[] = [];

      if (isVideo) {
        const extraction = await extractVideoFrames(files[0], 10);
        frames = extraction.frames;
      } else {
        frames = await extractImageThumbnails(files);
      }

      setExtractedFrames(frames);

      // Store extracted frames under server/uploads/<environmentId>/frames/
      if (frames.length > 0) {
        try {
          const frameBlobs = frames
            .filter(f => Boolean(f.imageData))
            .map(f => {
              const parts = f.imageData.split(',');
              const mimeMatch = parts[0].match(/:(.*?);/);
              const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
              const binary = atob(parts[1]);
              const array = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) {
                array[i] = binary.charCodeAt(i);
              }
              return new Blob([array], { type: mime });
            });
          await environmentService.uploadFiles(frameBlobs, envId, 'frame');
        } catch (frameUploadErr) {
          console.warn('Frame storage notice:', frameUploadErr);
        }
      }

      // Step 3: Analyze spatial content and generate candidate geometry for this specific environment
      setCurrentStep('preparing');
      const analyzedEnv = await environmentService.analyzeEnvironment(envId);
      const notice =
        analyzedEnv.metadata?.analysisNotice ||
        'Candidate map generated. Please verify the space before simulation.';
      setNoticeMessage(notice);

      // Store frames in sessionStorage for reference panel in 2D editor
      try {
        sessionStorage.setItem(`env_frames_${envId}`, JSON.stringify(frames.slice(0, 10)));
      } catch (storageErr) {
        console.warn('SessionStorage quota exceeded for frames:', storageErr);
      }

      setCurrentStep('ready');
    } catch (err: any) {
      console.error('Error during analysis:', err);
      setErrorMsg(err.message || 'Failed to process environment upload. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const handleContinueToReview = () => {
    if (createdEnvId) {
      navigate(`/environment/${createdEnvId}/review`);
    }
  };

  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#F7F8FA] text-[#172033] spatial-grid-bg relative py-10 px-4 md:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Top Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-[#2563EB] text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#EFF6FF] border border-[#BFDBFE]">
              STEP 1
            </span>
            <span>Spatial Reconstruction Workflow</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#172033] flex items-center gap-3">
            <UploadCloud className="w-8 h-8 text-[#2563EB]" />
            <span>UPLOAD YOUR SPACE</span>
          </h1>

          <p className="text-[#667085] text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
            Upload a walkthrough video or floor images to create an approximate spatial model. PREVIA will reconstruct candidate walls, doors, and exits for verification.
          </p>

          {/* Important Disclaimer */}
          <div className="mt-4 p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#D97706] flex-shrink-0 mt-0.5" />
            <p className="text-xs md:text-sm text-[#92400E] leading-relaxed">
              <strong>Important Disclaimer:</strong> Generated maps are approximate. Always verify walls, doors, and exits before simulation in Step 2.
            </p>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="rounded-2xl bg-white border border-[#E2E5E9] p-6 md:p-8 shadow-elevated relative">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-sm flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-[#DC2626] flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!isAnalyzing ? (
            /* Upload Phase */
            <div className="space-y-6">
              {/* Space Name Input */}
              <div>
                <label className="block text-xs uppercase text-[#475467] mb-1.5 font-semibold tracking-wider">
                  Environment Name
                </label>
                <input
                  type="text"
                  value={environmentName}
                  onChange={e => setEnvironmentName(e.target.value)}
                  placeholder="e.g., North Research Wing, 2nd Floor Office"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-[#172033] placeholder-[#98A2B3] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 text-sm transition-all"
                />
              </div>

              {/* Dropzone */}
              <div>
                <label className="block text-xs uppercase text-[#475467] mb-1.5 font-semibold tracking-wider">
                  Select Walkthrough Video or Floor Images
                </label>
                <FileDropzone
                  files={files}
                  onFilesSelected={handleFilesSelected}
                  onRemoveFile={handleRemoveFile}
                  disabled={isAnalyzing}
                />
              </div>

              {/* Actions */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E2E5E9]">
                <button
                  type="button"
                  onClick={() => navigate('/simulator')}
                  className="text-xs font-medium text-[#667085] hover:text-[#2563EB] transition-colors flex items-center gap-1.5 order-2 sm:order-1"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Prefer default? Try Demo Campus Complex instead</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartAnalysis}
                  disabled={files.length === 0}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm tracking-normal flex items-center justify-center space-x-2 transition-all shadow-xs hover:shadow-md order-1 sm:order-2"
                >
                  <span>ANALYZE SPACE</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Analysis Progress Phase */
            <div className="space-y-6">
              {/* 4-Stage Progress Stepper */}
              <AnalysisProgress
                currentStage={currentStep}
                progressPercent={
                  currentStep === 'ready'
                    ? 100
                    : currentStep === 'preparing'
                    ? 75
                    : currentStep === 'extracting'
                    ? 45
                    : 15
                }
              />

              {/* Extracted Frame Thumbnails */}
              {extractedFrames.length > 0 && (
                <div className="pt-2">
                  <FrameThumbnails frames={extractedFrames} />
                </div>
              )}

              {/* Simple Status Message */}
              <div className="p-3.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-start gap-3">
                <Info className="w-4 h-4 text-[#2563EB] flex-shrink-0 mt-0.5" />
                <div className="text-xs text-[#1E40AF]">
                  {currentStep === 'ready'
                    ? (noticeMessage || 'Approximate map generated. Please verify before simulation.')
                    : 'Analyzing walkthrough footage and extracting spatial boundaries...'}
                </div>
              </div>

              {/* Ready State CTA */}
              {currentStep === 'ready' && (
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E2E5E9]">
                  <div className="flex items-center gap-2 text-[#16A34A] text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approximate map generated. Please verify before simulation.</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleContinueToReview}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm tracking-normal flex items-center justify-center space-x-2 transition-all shadow-sm hover:shadow-md"
                  >
                    <span>CONTINUE TO VERIFY</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
