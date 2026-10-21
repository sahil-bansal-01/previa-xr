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
 * Extracts 8-12 representative frames from a video file completely client-side
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
    video.src = objectUrl;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const frames: ExtractedFrame[] = [];

    video.onloadedmetadata = async () => {
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
              const step = 32; // sample every 32nd pixel for speed
              for (let p = 0; p < currentPixels.length; p += step * 4) {
                const diff =
                  Math.abs(currentPixels[p] - prevPixelData[p]) +
                  Math.abs(currentPixels[p + 1] - prevPixelData[p + 1]) +
                  Math.abs(currentPixels[p + 2] - prevPixelData[p + 2]);
                if (diff > 45) diffCount++;
              }
              const sampleSize = currentPixels.length / (step * 4);
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

        URL.revokeObjectURL(objectUrl);
        resolve({
          frames,
          duration,
          width: targetWidth,
          height: targetHeight,
        });
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    video.onerror = (e) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load video file for frame extraction.'));
    };
  });
}

function seekToTime(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      resolve();
    };
    video.addEventListener('seeked', onSeeked);
    video.currentTime = Math.min(time, video.duration - 0.1);
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
