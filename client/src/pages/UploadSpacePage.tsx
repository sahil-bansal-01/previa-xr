import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileDropzone } from '../components/upload/FileDropzone';
import { AnalysisProgress, AnalysisStage } from '../components/upload/AnalysisProgress';
import { FrameThumbnails } from '../components/upload/FrameThumbnails';
import { extractVideoFrames, extractImageThumbnails, ExtractedFrame } from '../services/frameExtractor';
import { defaultSpatialProvider } from '../services/spatialAnalysisProvider';
import { environmentService } from '../services/environmentService';
import { useAuth } from '../contexts/AuthContext';
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Info,
  ShieldCheck,
  Video,
  Image as ImageIcon,
  Compass,
} from 'lucide-react';

export const UploadSpacePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, demoLogin } = useAuth();

  const [files, setFiles] = useState<File[]>([]);
  const [environmentName, setEnvironmentName] = useState<string>('My Space Floorplan');
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
      const baseName = newFiles[0].name.split('.')[0].replace(/[-_]/g, ' ');
      setEnvironmentName(baseName.charAt(0).toUpperCase() + baseName.slice(1));
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

      // Step 1: Upload received
      setCurrentStep('upload');
      await new Promise(r => setTimeout(r, 600));

      // Step 2: Extracting frames
      setCurrentStep('extracting');
      let frames: ExtractedFrame[] = [];

      if (isVideo) {
        const extraction = await extractVideoFrames(files[0], 10);
        frames = extraction.frames;
      } else {
        frames = await extractImageThumbnails(files);
      }

      setExtractedFrames(frames);
      await new Promise(r => setTimeout(r, 500));

      // Step 3: Preparing spatial map via SpatialAnalysisProvider
      setCurrentStep('preparing');
      const candidateGeometry = await defaultSpatialProvider.analyzeFrames(frames);
      setNoticeMessage(candidateGeometry.notice);

      // Step 4: Create Environment in backend
      const sourceType = isVideo ? 'video' : 'images';
      const createdEnv = await environmentService.createEnvironment({
        name: environmentName.trim() || 'My Spatial Environment',
        sourceType,
        sourceFiles: files.map(f => ({
          filename: f.name,
          originalName: f.name,
          mimetype: f.type,
          size: f.size,
          path: f.name,
        })),
        geometry: {
          walls: candidateGeometry.walls,
          rooms: candidateGeometry.rooms,
          corridors: [],
          doors: candidateGeometry.doors,
        },
        exits: candidateGeometry.exits,
        obstacles: candidateGeometry.obstacles,
        people: candidateGeometry.people,
        metadata: {
          buildingName: environmentName,
          totalAreaSqM: 180,
          extractedFramesCount: frames.length,
          confidenceScore: candidateGeometry.isAiGenerated ? 0.88 : 0.65,
        },
      });

      setCreatedEnvId(createdEnv._id);

      // Store frames in sessionStorage for reference panel
      try {
        sessionStorage.setItem(`env_frames_${createdEnv._id}`, JSON.stringify(frames.slice(0, 10)));
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
    <div className="min-h-[calc(100vh-4rem)] bg-[#07090e] text-slate-100 cyber-grid-bg relative py-10 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Top Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs tracking-wider uppercase mb-2">
            <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30">
              STEP 1 OF 3
            </span>
            <span>SPATIAL RECONSTRUCTION WORKFLOW</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold font-mono tracking-tight text-white flex items-center gap-3">
            <UploadCloud className="w-8 h-8 text-cyan-400" />
            <span>UPLOAD YOUR SPACE</span>
          </h1>

          <p className="text-slate-300 text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
            Upload a short walkthrough video or floor images of your space. PREVIA will create an
            approximate spatial map that you can verify and correct before simulation.
          </p>

          {/* Mandatory Disclaimer */}
          <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 backdrop-blur-sm">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs md:text-sm text-amber-200/90 leading-relaxed font-sans">
              <strong>Important Disclaimer:</strong> Generated maps are approximate. Always verify
              walls, doors, and exits before simulation. PREVIA lets you define and verify your
              environment before testing what-if consequences.
            </p>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 md:p-8 backdrop-blur-md shadow-2xl relative">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-sm flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!isAnalyzing ? (
            /* Upload Phase */
            <div className="space-y-6">
              {/* Space Name Input */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5 font-semibold">
                  Environment Name
                </label>
                <input
                  type="text"
                  value={environmentName}
                  onChange={e => setEnvironmentName(e.target.value)}
                  placeholder="e.g., North Research Wing, 2nd Floor Office"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-sans text-sm transition-all"
                />
              </div>

              {/* Dropzone */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5 font-semibold">
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
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => navigate('/simulator')}
                  className="text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5 order-2 sm:order-1"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Prefer default? Try Demo Campus Environment instead</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartAnalysis}
                  disabled={files.length === 0}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-mono font-extrabold text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-xl shadow-cyan-500/20 order-1 sm:order-2"
                >
                  <span>ANALYZE SPACE</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Analysis Progress Phase */
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl font-bold font-mono text-cyan-300 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400 animate-spin" />
                  <span>STEP 1 — ANALYZING YOUR SPACE</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Parsing {isVideo ? 'walkthrough video' : 'floor image frames'} and synthesizing
                  approximate spatial boundary.
                </p>
              </div>

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

              {/* Notice / Fallback Message */}
              {noticeMessage && (
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-cyan-500/30 flex items-start gap-3">
                  <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs font-mono text-slate-300">
                    <span className="text-cyan-400 font-semibold">ANALYSIS STATUS: </span>
                    {noticeMessage}
                  </div>
                </div>
              )}

              {/* Ready State CTA */}
              {currentStep === 'ready' && (
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800 animate-fade-in">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Spatial geometry prepared. Ready for human verification.</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleContinueToReview}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-mono font-extrabold text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-xl shadow-cyan-500/25 hover:scale-[1.02]"
                  >
                    <span>VERIFY & EDIT MAP</span>
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
