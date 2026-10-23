export interface ExtractedFrame {
  index: number;
  timestamp: number;
  imageData: string; // base64 data URL
}

export interface FrameExtractionResult {
  frames: ExtractedFrame[];
  duration: number;
  width: number;
  height: number;
}

/**
 * Extracts representative frames from a video file completely client-side
 * using HTMLVideoElement and Canvas, with zero ffmpeg dependency.
 */
export async function extractVideoFrames(
  file: File,
  frameCount = 10,
  onProgress?: (progress: number) => void
): Promise<FrameExtractionResult> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const objectUrl = URL.createObjectURL(file);
    let isCleanedUp = false;

    const cleanup = () => {
      if (isCleanedUp) return;
      isCleanedUp = true;
      try {
        video.pause();
        video.removeAttribute('src');
        video.load();
      } catch {
        // ignore
      }
      try {
        URL.revokeObjectURL(objectUrl);
      } catch {
        // ignore
      }
    };

    video.src = objectUrl;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const frames: ExtractedFrame[] = [];

    // Timeout safety for metadata load
    const metadataTimeout = setTimeout(() => {
      cleanup();
      reject(new Error('Video metadata load timed out. Your browser may not support this video format or codec.'));
    }, 12000);

    video.onloadedmetadata = async () => {
      clearTimeout(metadataTimeout);
      const duration = video.duration || 1;
      const targetWidth = Math.min(video.videoWidth || 640, 640);
      const scale = targetWidth / (video.videoWidth || 1);
      const targetHeight = Math.round((video.videoHeight || 360) * scale);

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Select frame timestamps between 5% and 95% of duration
      const timestamps: number[] = [];
      const step = (duration * 0.9) / Math.max(1, frameCount - 1);
      for (let i = 0; i < frameCount; i++) {
        timestamps.push(duration * 0.05 + i * step);
      }

      try {
        let prevPixelData: Uint8ClampedArray | null = null;

        for (let i = 0; i < timestamps.length; i++) {
          const t = timestamps[i];
          await seekToTime(video, t);

          if (ctx) {
            ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

            // Compute frame sample difference to filter redundant frames
            const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
            const currentPixels = imgData.data;

            let isRedundant = false;
            if (prevPixelData && frames.length >= 3 && i < timestamps.length - 1) {
              let diffCount = 0;
              const sampleStep = 32; // sample every 32nd pixel for speed
              for (let p = 0; p < currentPixels.length; p += sampleStep * 4) {
                const diff =
                  Math.abs(currentPixels[p] - prevPixelData[p]) +
                  Math.abs(currentPixels[p + 1] - prevPixelData[p + 1]) +
                  Math.abs(currentPixels[p + 2] - prevPixelData[p + 2]);
                if (diff > 45) diffCount++;
              }
              const sampleSize = currentPixels.length / (sampleStep * 4);
              if (diffCount / sampleSize < 0.03) {
                // Less than 3% significant pixel change — redundant static frame
                isRedundant = true;
              }
            }

            if (!isRedundant || frames.length < 3) {
              const imageData = canvas.toDataURL('image/jpeg', 0.75);
              frames.push({
                index: frames.length,
                timestamp: Math.round(t * 10) / 10,
                imageData,
              });
              prevPixelData = currentPixels;
            }
          }

          if (onProgress) {
            onProgress(Math.round(((i + 1) / timestamps.length) * 100));
          }
        }

        cleanup();
        resolve({
          frames,
          duration,
          width: targetWidth,
          height: targetHeight,
        });
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    video.onerror = () => {
      clearTimeout(metadataTimeout);
      cleanup();
      reject(new Error('Failed to load video file. Please ensure the video format is supported (MP4/WebM/MOV).'));
    };

    try {
      video.load();
    } catch {
      // ignore
    }
  });
}

function seekToTime(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;

    const cleanup = () => {
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
    };

    let timer: any = null;

    const onSeeked = () => {
      if (!settled) {
        settled = true;
        if (timer) clearTimeout(timer);
        cleanup();
        resolve();
      }
    };

    const onError = () => {
      if (!settled) {
        settled = true;
        if (timer) clearTimeout(timer);
        cleanup();
        resolve();
      }
    };

    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onError);

    // Safety timeout in case seeked doesn't fire
    timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        cleanup();
        resolve();
      }
    }, 2000);

    const safeDuration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 10;
    const safeTime = Math.max(0, Math.min(time, safeDuration - 0.1));

    if (Math.abs(video.currentTime - safeTime) < 0.05) {
      settled = true;
      if (timer) clearTimeout(timer);
      cleanup();
      resolve();
      return;
    }

    video.currentTime = safeTime;
  });
}

/**
 * Converts uploaded image files into preview thumbnails
 */
export async function extractImageThumbnails(files: File[]): Promise<ExtractedFrame[]> {
  const promises = files.map((file, index) => {
    return new Promise<ExtractedFrame>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          index,
          timestamp: 0,
          imageData: reader.result as string,
        });
      };
      reader.onerror = () => {
        resolve({
          index,
          timestamp: 0,
          imageData: '',
        });
      };
      reader.readAsDataURL(file);
    });
  });

  return Promise.all(promises);
}
