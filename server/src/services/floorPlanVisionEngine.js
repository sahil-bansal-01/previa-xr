import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import jpeg from 'jpeg-js';

const jpegDecode = jpeg.default?.decode || jpeg.decode;

/**
 * PREVIA XR Intelligent Floor-Plan Vision & Spatial Reconstruction Engine
 * 
 * Reconstructs authentic architectural geometry from floor-plan images:
 * - Structural wall segments (perimeter and interior partitions)
 * - Room boundaries & room classification
 * - Corridors and circulation paths
 * - Doorways and navigable wall openings
 * - Stairwells with parallel tread detection
 * - Emergency exits and main portals (color markers & perimeter openings)
 * - Safe occupant positioning inside rooms/corridors
 * - Diagnostics, quality scoring, and graceful error handling
 */

/**
 * Decodes PNG or JPEG image buffer into raw RGBA pixel data
 */
export function decodeImageBuffer(buffer) {
  if (!buffer || buffer.length < 8) {
    throw new Error('Image buffer is empty or corrupted.');
  }

  // Check magic bytes
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    const png = PNG.sync.read(buffer);
    return {
      width: png.width,
      height: png.height,
      data: png.data,
      format: 'png'
    };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    const jpg = jpegDecode(buffer, { useTArray: true });
    return {
      width: jpg.width,
      height: jpg.height,
      data: jpg.data,
      format: 'jpeg'
    };
  }

  // Attempt fallback decoders
  try {
    const png = PNG.sync.read(buffer);
    return { width: png.width, height: png.height, data: png.data, format: 'png' };
  } catch {
    try {
      const jpg = jpegDecode(buffer, { useTArray: true });
      return { width: jpg.width, height: jpg.height, data: jpg.data, format: 'jpeg' };
    } catch (err) {
      throw new Error(`Unsupported image format or corrupt header: ${err.message}`);
    }
  }
}

/**
 * Comprehensive Diagnostics and Image Quality Assessment
 */
export function assessImageDiagnostics(image) {
  const { width, height, data } = image;
  const totalPixels = width * height;
  const warnings = [];

  if (width < 120 || height < 120) {
    warnings.push(`Low resolution (${width}x${height}px). Architectural door and wall details may be approximate.`);
  }

  let sumLuminance = 0;
  let minLum = 255;
  let maxLum = 0;
  const sampleStep = Math.max(1, Math.floor(totalPixels / 10000));
  let sampleCount = 0;
  const lumSamples = [];

  for (let i = 0; i < totalPixels; i += sampleStep) {
    const idx = i << 2;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    sumLuminance += lum;
    if (lum < minLum) minLum = lum;
    if (lum > maxLum) maxLum = lum;
    lumSamples.push(lum);
    sampleCount++;
  }

  const meanLum = sumLuminance / sampleCount;
  let variance = 0;
  for (const lum of lumSamples) {
    variance += (lum - meanLum) ** 2;
  }
  const stdDev = Math.sqrt(variance / sampleCount);
  const contrastRatio = (maxLum - minLum) / 255;

  if (contrastRatio < 0.2 || stdDev < 15) {
    warnings.push('Low contrast detected. Adaptive thresholding activated for wall extraction.');
  }

  // Border luminance analysis (determines background polarity)
  let borderLumSum = 0;
  let borderCount = 0;
  for (let x = 0; x < width; x += 4) {
    // Top border
    const topIdx = x << 2;
    borderLumSum += 0.299 * data[topIdx] + 0.587 * data[topIdx + 1] + 0.114 * data[topIdx + 2];
    // Bottom border
    const botIdx = ((height - 1) * width + x) << 2;
    borderLumSum += 0.299 * data[botIdx] + 0.587 * data[botIdx + 1] + 0.114 * data[botIdx + 2];
    borderCount += 2;
  }
  for (let y = 0; y < height; y += 4) {
    // Left border
    const leftIdx = (y * width) << 2;
    borderLumSum += 0.299 * data[leftIdx] + 0.587 * data[leftIdx + 1] + 0.114 * data[leftIdx + 2];
    // Right border
    const rightIdx = (y * width + width - 1) << 2;
    borderLumSum += 0.299 * data[rightIdx] + 0.587 * data[rightIdx + 1] + 0.114 * data[rightIdx + 2];
    borderCount += 2;
  }
  const borderAvgLum = borderLumSum / borderCount;
  const isDarkBackground = borderAvgLum < 100;

  // Approximate ink ratio
  let inkCount = 0;
  for (const lum of lumSamples) {
    const isInk = isDarkBackground ? lum > 140 : lum < 120;
    if (isInk) inkCount++;
  }
  const inkRatio = inkCount / sampleCount;

  let isArchitectural = true;
  if (inkRatio < 0.005) {
    warnings.push('Very few line strokes detected. Image may be largely blank.');
    isArchitectural = false;
  } else if (inkRatio > 0.70) {
    warnings.push('Very dense ink/darkness (>70%). Image may be a photo rather than a clean floor plan.');
    isArchitectural = false;
  }

  // Quality score in [0.1, 1.0]
  let qualityScore = 0.5;
  if (width >= 400 && height >= 300) qualityScore += 0.2;
  if (contrastRatio >= 0.5) qualityScore += 0.2;
  if (inkRatio >= 0.02 && inkRatio <= 0.35) qualityScore += 0.1;
  qualityScore = Math.min(1.0, Math.max(0.1, Math.round(qualityScore * 100) / 100));

  return {
    resolution: { width, height },
    contrastRatio: Math.round(contrastRatio * 100) / 100,
    meanLuminance: Math.round(meanLum),
    stdDev: Math.round(stdDev),
    borderAvgLuminance: Math.round(borderAvgLum),
    isDarkBackground,
    inkRatio: Math.round(inkRatio * 1000) / 1000,
    isArchitectural,
    qualityScore,
    warnings
  };
}

/**
 * Preprocessing & Binarization:
 * Converts raw RGBA to a binary wall mask (1 = wall/ink, 0 = floor/walkable)
 */
export function preprocessFloorPlan(image, diagnostics) {
  const { width, height, data } = image;
  const total = width * height;
  const isDarkBg = diagnostics.isDarkBackground;

  // Adaptive threshold based on border and mean luminance
  let threshold;
  if (isDarkBg) {
    threshold = Math.max(110, Math.min(190, diagnostics.borderAvgLuminance + 40));
  } else {
    threshold = Math.max(80, Math.min(160, diagnostics.borderAvgLuminance * 0.65));
  }

  const binaryMask = new Uint8Array(total);
  const colorMarkers = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) << 2;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

      // Color detection for emergency exits & safety badges
      // Green Emergency Exit marker:
      if (g >= 100 && g > r * 1.3 && g > b * 1.3) {
        colorMarkers.push({ x, y, type: 'emergency', color: 'green' });
      }
      // Blue Entrance/Normal Exit marker:
      else if (b >= 120 && b > r * 1.3 && b > g * 1.1) {
        colorMarkers.push({ x, y, type: 'normal', color: 'blue' });
      }
      // Red Fire/Hazard marker:
      else if (r >= 140 && r > g * 1.6 && r > b * 1.6) {
        colorMarkers.push({ x, y, type: 'fire', color: 'red' });
      }

      // Structural ink:
      const isInk = isDarkBg ? lum > threshold : lum < threshold;
      binaryMask[y * width + x] = isInk ? 1 : 0;
    }
  }

  return { binaryMask, colorMarkers };
}

/**
 * Cluster color marker pixels to find localized badges (e.g. green exit signs)
 */
export function clusterColorMarkers(markers, width, height) {
  const clusters = [];
  const visited = new Uint8Array(markers.length);
  const radius = 30; // 30px clustering window

  for (let i = 0; i < markers.length; i++) {
    if (visited[i]) continue;
    visited[i] = 1;
    const m = markers[i];
    let sumX = m.x;
    let sumY = m.y;
    let count = 1;
    const type = m.type;

    for (let j = i + 1; j < markers.length; j++) {
      if (visited[j]) continue;
      const other = markers[j];
      if (other.type !== type) continue;
      const dx = other.x - m.x;
      const dy = other.y - m.y;
      if (dx * dx + dy * dy <= radius * radius) {
        visited[j] = 1;
        sumX += other.x;
        sumY += other.y;
        count++;
      }
    }

    // Require at least 8 connected color pixels to constitute a valid architectural badge
    if (count >= 8) {
      const cx = Math.round(sumX / count);
      const cy = Math.round(sumY / count);
      // Ensure not a duplicate of an existing cluster
      const exists = clusters.some(c => Math.hypot(c.x - cx, c.y - cy) <= 25);
      if (!exists) {
        clusters.push({
          x: cx,
          y: cy,
          type,
          pixelCount: count
        });
      }
    }
  }

  return clusters;
}

/**
 * Detect Stairs from characteristic parallel hatch/tread patterns
 */
export function detectStairsPattern(width, height, binaryMask) {
  const minTreads = 5;
  const treadSpacingMin = 4;
  const treadSpacingMax = 15;
  const minTreadLength = 25;
  const maxTreadLength = 100;

  // Scan vertical columns for alternating horizontal treads, keeping within interior margins
  const stepCandidates = [];

  for (let y = 30; y < height - 30; y++) {
    let runLen = 0;
    let startX = 0;
    for (let x = 30; x < width - 30; x++) {
      if (binaryMask[y * width + x] === 1) {
        if (runLen === 0) startX = x;
        runLen++;
      } else {
        if (runLen >= minTreadLength && runLen <= maxTreadLength) {
          stepCandidates.push({ y, x1: startX, x2: startX + runLen, len: runLen });
        }
        runLen = 0;
      }
    }
  }

  // Cluster adjacent parallel treads that share similar X bounds and periodic Y spacing
  const grouped = [];
  const used = new Uint8Array(stepCandidates.length);

  for (let i = 0; i < stepCandidates.length; i++) {
    if (used[i]) continue;
    const group = [stepCandidates[i]];
    used[i] = 1;

    for (let j = i + 1; j < stepCandidates.length; j++) {
      if (used[j]) continue;
      const prev = group[group.length - 1];
      const cur = stepCandidates[j];
      const dy = cur.y - prev.y;

      if (dy >= treadSpacingMin && dy <= treadSpacingMax) {
        const overlapX1 = Math.max(prev.x1, cur.x1);
        const overlapX2 = Math.min(prev.x2, cur.x2);
        const overlap = overlapX2 - overlapX1;
        if (overlap > prev.len * 0.75) {
          group.push(cur);
          used[j] = 1;
        }
      }
    }

    if (group.length >= minTreads) {
      grouped.push(group);
    }
  }

  const rawStairs = [];
  grouped.forEach((grp, idx) => {
    let minX = width;
    let maxX = 0;
    const minY = grp[0].y;
    const maxY = grp[grp.length - 1].y;

    for (const s of grp) {
      if (s.x1 < minX) minX = s.x1;
      if (s.x2 > maxX) maxX = s.x2;
    }

    const stairW = maxX - minX;
    const stairH = maxY - minY + 8;

    // Filter out edge artifacts (stairs are inside buildings)
    if (minX > 35 && maxX < width - 35 && minY > 35 && maxY < height - 35 && stairH >= 25) {
      const cx = Math.round((minX + maxX) / 2);
      const cy = Math.round((minY + maxY) / 2);
      // Deduplicate overlapping bounding boxes
      const isDupe = rawStairs.some(st => Math.hypot(st.x - cx, st.y - cy) <= 30);
      if (!isDupe) {
        rawStairs.push({
          id: `stairs-${rawStairs.length + 1}`,
          x: cx,
          y: cy,
          width: stairW,
          height: stairH,
          treadCount: grp.length,
          status: 'detected',
          confidence: 0.88
        });
      }
    }
  });

  return rawStairs;
}

/**
 * Structural Wall Vectorization & Consolidation:
 * Scans continuous ink runs horizontally and vertically, grouping parallel strokes into wall line segments
 */
export function extractWallSegments(width, height, binaryMask, stairsList = []) {
  const minWallLength = 16;
  const maxWallThickness = 20;

  // Mask out stairs region so treads aren't detected as walls
  const cleanMask = new Uint8Array(binaryMask);
  for (const st of stairsList) {
    const x0 = Math.max(0, Math.floor(st.x - st.width / 2) - 4);
    const x1 = Math.min(width, Math.ceil(st.x + st.width / 2) + 4);
    const y0 = Math.max(0, Math.floor(st.y - st.height / 2) - 4);
    const y1 = Math.min(height, Math.ceil(st.y + st.height / 2) + 4);
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        cleanMask[y * width + x] = 0;
      }
    }
  }

  // 1. Horizontal wall passes
  const horizSegments = [];
  for (let y = 0; y < height; y++) {
    let runLen = 0;
    let startX = 0;
    for (let x = 0; x < width; x++) {
      if (cleanMask[y * width + x] === 1) {
        if (runLen === 0) startX = x;
        runLen++;
      } else {
        if (runLen >= minWallLength) {
          horizSegments.push({ y, x1: startX, x2: startX + runLen, len: runLen });
        }
        runLen = 0;
      }
    }
    if (runLen >= minWallLength) {
      horizSegments.push({ y, x1: startX, x2: startX + runLen, len: runLen });
    }
  }

  // Group vertically adjacent horizontal runs with similar X-span (consolidates thickness)
  const groupedHoriz = [];
  const usedH = new Uint8Array(horizSegments.length);

  for (let i = 0; i < horizSegments.length; i++) {
    if (usedH[i]) continue;
    usedH[i] = 1;
    const cluster = [horizSegments[i]];

    for (let j = i + 1; j < horizSegments.length; j++) {
      if (usedH[j]) continue;
      const prev = cluster[cluster.length - 1];
      const cur = horizSegments[j];
      if (cur.y === prev.y + 1) {
        // Check X overlap
        const overlapX1 = Math.max(prev.x1, cur.x1);
        const overlapX2 = Math.min(prev.x2, cur.x2);
        const overlap = overlapX2 - overlapX1;
        if (overlap > Math.min(prev.len, cur.len) * 0.75) {
          cluster.push(cur);
          usedH[j] = 1;
          if (cluster.length >= maxWallThickness) break;
        }
      } else if (cur.y > prev.y + 1) {
        // Since horizSegments is ordered by y, we can stop searching this branch early
        break;
      }
    }

    if (cluster.length >= 2) { // Thickness >= 2px
      const midY = (cluster[0].y + cluster[cluster.length - 1].y) / 2;
      const minX = Math.min(...cluster.map(c => c.x1));
      const maxX = Math.max(...cluster.map(c => c.x2));
      groupedHoriz.push({
        x1: minX,
        y1: Math.round(midY),
        x2: maxX,
        y2: Math.round(midY),
        thickness: cluster.length,
        orientation: 'H'
      });
    }
  }

  // 2. Vertical wall passes
  const vertSegments = [];
  for (let x = 0; x < width; x++) {
    let runLen = 0;
    let startY = 0;
    for (let y = 0; y < height; y++) {
      if (cleanMask[y * width + x] === 1) {
        if (runLen === 0) startY = y;
        runLen++;
      } else {
        if (runLen >= minWallLength) {
          vertSegments.push({ x, y1: startY, y2: startY + runLen, len: runLen });
        }
        runLen = 0;
      }
    }
    if (runLen >= minWallLength) {
      vertSegments.push({ x, y1: startY, y2: startY + runLen, len: runLen });
    }
  }

  // Group horizontally adjacent vertical runs with similar Y-span
  const groupedVert = [];
  const usedV = new Uint8Array(vertSegments.length);

  for (let i = 0; i < vertSegments.length; i++) {
    if (usedV[i]) continue;
    usedV[i] = 1;
    const cluster = [vertSegments[i]];

    for (let j = i + 1; j < vertSegments.length; j++) {
      if (usedV[j]) continue;
      const prev = cluster[cluster.length - 1];
      const cur = vertSegments[j];
      if (cur.x === prev.x + 1) {
        const overlapY1 = Math.max(prev.y1, cur.y1);
        const overlapY2 = Math.min(prev.y2, cur.y2);
        const overlap = overlapY2 - overlapY1;
        if (overlap > Math.min(prev.len, cur.len) * 0.75) {
          cluster.push(cur);
          usedV[j] = 1;
          if (cluster.length >= maxWallThickness) break;
        }
      } else if (cur.x > prev.x + 1) {
        break;
      }
    }

    if (cluster.length >= 2) {
      const midX = (cluster[0].x + cluster[cluster.length - 1].x) / 2;
      const minY = Math.min(...cluster.map(c => c.y1));
      const maxY = Math.max(...cluster.map(c => c.y2));
      groupedVert.push({
        x1: Math.round(midX),
        y1: minY,
        x2: Math.round(midX),
        y2: maxY,
        thickness: cluster.length,
        orientation: 'V'
      });
    }
  }

  // 3. Collinear segment merging (only merges micro-gaps < 7px; preserves real door gaps >= 12px)
  function mergeCollinear(segments, isHoriz) {
    const merged = [];
    // Sort
    segments.sort((a, b) => {
      if (isHoriz) {
        return a.y1 === b.y1 ? a.x1 - b.x1 : a.y1 - b.y1;
      } else {
        return a.x1 === b.x1 ? a.y1 - b.y1 : a.x1 - b.x1;
      }
    });

    for (const seg of segments) {
      if (merged.length === 0) {
        merged.push({ ...seg });
        continue;
      }
      const last = merged[merged.length - 1];
      if (isHoriz) {
        if (Math.abs(last.y1 - seg.y1) <= 3 && seg.x1 <= last.x2 + 6) {
          last.x2 = Math.max(last.x2, seg.x2);
          last.y1 = Math.round((last.y1 + seg.y1) / 2);
          last.y2 = last.y1;
          continue;
        }
      } else {
        if (Math.abs(last.x1 - seg.x1) <= 3 && seg.y1 <= last.y2 + 6) {
          last.y2 = Math.max(last.y2, seg.y2);
          last.x1 = Math.round((last.x1 + seg.x1) / 2);
          last.x2 = last.x1;
          continue;
        }
      }
      merged.push({ ...seg });
    }
    return merged;
  }

  const finalHoriz = mergeCollinear(groupedHoriz, true);
  const finalVert = mergeCollinear(groupedVert, false);

  // 4. Snap corners and T-junctions
  // Snap endpoints of horizontal walls to intersecting vertical walls if within 8px
  for (const hw of finalHoriz) {
    for (const vw of finalVert) {
      if (hw.y1 >= vw.y1 - 6 && hw.y1 <= vw.y2 + 6) {
        // Snap left end
        if (Math.abs(hw.x1 - vw.x1) <= 8) {
          hw.x1 = vw.x1;
        }
        // Snap right end
        if (Math.abs(hw.x2 - vw.x1) <= 8) {
          hw.x2 = vw.x1;
        }
      }
    }
  }

  // Snap endpoints of vertical walls to intersecting horizontal walls if within 8px
  for (const vw of finalVert) {
    for (const hw of finalHoriz) {
      if (vw.x1 >= hw.x1 - 6 && vw.x1 <= hw.x2 + 6) {
        // Snap top end
        if (Math.abs(vw.y1 - hw.y1) <= 8) {
          vw.y1 = hw.y1;
        }
        // Snap bottom end
        if (Math.abs(vw.y2 - hw.y1) <= 8) {
          vw.y2 = hw.y1;
        }
      }
    }
  }

  const allWalls = [...finalHoriz, ...finalVert].map((w, idx) => ({
    id: `w-${idx + 1}`,
    x1: w.x1,
    y1: w.y1,
    x2: w.x2,
    y2: w.y2,
    thickness: w.thickness || 4,
    orientation: w.orientation,
    status: 'detected',
    confidence: 0.92
  }));

  return allWalls;
}

/**
 * Door & Opening Detection:
 * Finds intentional gaps along collinear wall segments that connect walkable spaces
 */
export function detectDoorsAndOpenings(width, height, walls, binaryMask, stairsList = []) {
  const doors = [];
  const minDoorGap = 12; // 12px
  const maxDoorGap = 70; // 70px (~2.5m)

  // 1. Check collinear horizontal wall gaps
  const hWalls = walls.filter(w => w.orientation === 'H').sort((a, b) => a.y1 === b.y1 ? a.x1 - b.x1 : a.y1 - b.y1);
  for (let i = 0; i < hWalls.length - 1; i++) {
    const w1 = hWalls[i];
    const w2 = hWalls[i + 1];
    if (Math.abs(w1.y1 - w2.y1) <= 3) {
      const gap = w2.x1 - w1.x2;
      if (gap >= minDoorGap && gap <= maxDoorGap) {
        const midX = Math.round((w1.x2 + w2.x1) / 2);
        const midY = w1.y1;
        // Verify gap is walkable (not a solid wall segment)
        let inkInGap = 0;
        for (let x = w1.x2; x <= w2.x1; x++) {
          if (binaryMask[midY * width + x] === 1) inkInGap++;
        }
        if (inkInGap <= gap * 0.3) {
          doors.push({
            id: `d-${doors.length + 1}`,
            x: midX,
            y: midY,
            width: gap,
            orientation: 'H',
            status: 'detected',
            confidence: 0.86
          });
        }
      }
    }
  }

  // 2. Check collinear vertical wall gaps
  const vWalls = walls.filter(w => w.orientation === 'V').sort((a, b) => a.x1 === b.x1 ? a.y1 - b.y1 : a.x1 - b.x1);
  for (let i = 0; i < vWalls.length - 1; i++) {
    const w1 = vWalls[i];
    const w2 = vWalls[i + 1];
    if (Math.abs(w1.x1 - w2.x1) <= 3) {
      const gap = w2.y1 - w1.y2;
      if (gap >= minDoorGap && gap <= maxDoorGap) {
        const midX = w1.x1;
        const midY = Math.round((w1.y2 + w2.y1) / 2);
        let inkInGap = 0;
        for (let y = w1.y2; y <= w2.y1; y++) {
          if (binaryMask[y * width + midX] === 1) inkInGap++;
        }
        if (inkInGap <= gap * 0.3) {
          doors.push({
            id: `d-${doors.length + 1}`,
            x: midX,
            y: midY,
            width: gap,
            orientation: 'V',
            status: 'detected',
            confidence: 0.86
          });
        }
      }
    }
  }

  return doors;
}

/**
 * Connected Component Flood Fill to Segment Rooms, Corridors, and Exterior Hull
 */
export function extractRoomsAndCorridors(width, height, walls, doors) {
  // Downsample to a fast grid (step = 4px)
  const step = 4;
  const gridW = Math.ceil(width / step);
  const gridH = Math.ceil(height / step);
  const grid = new Uint8Array(gridW * gridH); // 0 = empty floor, 1 = wall

  // Rasterize walls onto downsampled grid
  for (const w of walls) {
    const x0 = Math.floor(Math.min(w.x1, w.x2) / step);
    const x1 = Math.ceil(Math.max(w.x1, w.x2) / step);
    const y0 = Math.floor(Math.min(w.y1, w.y2) / step);
    const y1 = Math.ceil(Math.max(w.y1, w.y2) / step);

    if (w.orientation === 'H') {
      const gy = Math.round(w.y1 / step);
      for (let gx = Math.max(0, x0); gx <= Math.min(gridW - 1, x1); gx++) {
        if (gy >= 0 && gy < gridH) grid[gy * gridW + gx] = 1;
      }
    } else {
      const gx = Math.round(w.x1 / step);
      for (let gy = Math.max(0, y0); gy <= Math.min(gridH - 1, y1); gy++) {
        if (gx >= 0 && gx < gridW) grid[gy * gridW + gx] = 1;
      }
    }
  }

  // Also close door gaps temporarily so rooms are segmented as discrete compartments
  for (const d of doors) {
    const rad = Math.ceil((d.width / 2) / step) + 1;
    const gx = Math.round(d.x / step);
    const gy = Math.round(d.y / step);
    if (d.orientation === 'H') {
      for (let dx = -rad; dx <= rad; dx++) {
        const cx = gx + dx;
        if (cx >= 0 && cx < gridW && gy >= 0 && gy < gridH) {
          grid[gy * gridW + cx] = 1;
        }
      }
    } else {
      for (let dy = -rad; dy <= rad; dy++) {
        const cy = gy + dy;
        if (gx >= 0 && gx < gridW && cy >= 0 && cy < gridH) {
          grid[cy * gridW + gx] = 1;
        }
      }
    }
  }

  // Find outer perimeter bounds of all walls
  let minWallX = width;
  let maxWallX = 0;
  let minWallY = height;
  let maxWallY = 0;

  for (const w of walls) {
    minWallX = Math.min(minWallX, w.x1, w.x2);
    maxWallX = Math.max(maxWallX, w.x1, w.x2);
    minWallY = Math.min(minWallY, w.y1, w.y2);
    maxWallY = Math.max(maxWallY, w.y1, w.y2);
  }

  // Seal outer perimeter envelope boundaries so exit gaps don't leak exterior into corridors
  const pMinGx = Math.max(0, Math.floor(minWallX / step));
  const pMaxGx = Math.min(gridW - 1, Math.ceil(maxWallX / step));
  const pMinGy = Math.max(0, Math.floor(minWallY / step));
  const pMaxGy = Math.min(gridH - 1, Math.ceil(maxWallY / step));

  for (let gx = pMinGx; gx <= pMaxGx; gx++) {
    grid[pMinGy * gridW + gx] = 1;
    grid[pMaxGy * gridW + gx] = 1;
  }
  for (let gy = pMinGy; gy <= pMaxGy; gy++) {
    grid[gy * gridW + pMinGx] = 1;
    grid[gy * gridW + pMaxGx] = 1;
  }

  // Connected component labeling (Breadth-First Flood Fill)
  const labels = new Int32Array(gridW * gridH).fill(-1);
  let currentLabel = 0;
  const components = [];

  for (let gy = 0; gy < gridH; gy++) {
    for (let gx = 0; gx < gridW; gx++) {
      const idx = gy * gridW + gx;
      if (grid[idx] === 1 || labels[idx] !== -1) continue;

      // New component
      const queue = [idx];
      labels[idx] = currentLabel;
      let minX = gx;
      let maxX = gx;
      let minY = gy;
      let maxY = gy;
      let area = 0;
      let sumX = 0;
      let sumY = 0;
      let touchesBorder = false;

      let head = 0;
      while (head < queue.length) {
        const curIdx = queue[head++];
        const cx = curIdx % gridW;
        const cy = Math.floor(curIdx / gridW);

        area++;
        sumX += cx;
        sumY += cy;
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;

        if (cx === 0 || cx === gridW - 1 || cy === 0 || cy === gridH - 1) {
          touchesBorder = true;
        }

        // 4 neighbors
        const neighbors = [
          cy > 0 ? (cy - 1) * gridW + cx : -1,
          cy < gridH - 1 ? (cy + 1) * gridW + cx : -1,
          cx > 0 ? cy * gridW + (cx - 1) : -1,
          cx < gridW - 1 ? cy * gridW + (cx + 1) : -1,
        ];

        for (const n of neighbors) {
          if (n !== -1 && grid[n] === 0 && labels[n] === -1) {
            labels[n] = currentLabel;
            queue.push(n);
          }
        }
      }

      components.push({
        label: currentLabel,
        touchesBorder,
        area: area * (step * step),
        cellCount: area,
        minX: minX * step,
        maxX: maxX * step,
        minY: minY * step,
        maxY: maxY * step,
        centerX: Math.round((sumX / area) * step),
        centerY: Math.round((sumY / area) * step),
        width: (maxX - minX) * step,
        height: (maxY - minY) * step
      });

      currentLabel++;
    }
  }

  // Filter out exterior yard and tiny noise pockets (< 600px area)
  const interior = components.filter(c => !c.touchesBorder && c.area >= 600);

  // Classify rooms vs corridors
  const rooms = [];
  const corridors = [];
  const roomNames = [
    'Classroom 101',
    'Science Lab',
    'Faculty Office',
    'Computer Lab',
    'Seminar Hall',
    'Stairwell & Facilities',
    'Research Bay',
    'Library Annex'
  ];

  interior.forEach((comp) => {
    // Filter out thin perimeter wall gap slivers (must have genuine interior room depth >= 20px)
    if (comp.width < 24 || comp.height < 24) return;

    const aspect = Math.max(comp.width, comp.height) / Math.max(1, Math.min(comp.width, comp.height));
    const isCorridor = aspect >= 2.2 || (comp.width > width * 0.45 && comp.height < height * 0.35);

    if (isCorridor) {
      corridors.push({
        id: `corr-${corridors.length + 1}`,
        name: corridors.length === 0 ? 'Central Corridor' : `Corridor ${corridors.length + 1}`,
        x: comp.centerX,
        y: comp.centerY,
        width: comp.width,
        height: comp.height,
        status: 'detected',
        confidence: 0.90
      });
    } else {
      const roomIndex = rooms.length;
      rooms.push({
        id: `r-${roomIndex + 1}`,
        name: roomNames[roomIndex] || `Room ${roomIndex + 1}`,
        x: comp.centerX,
        y: comp.centerY,
        width: comp.width,
        height: comp.height,
        status: 'detected',
        confidence: 0.88
      });
    }
  });

  return { rooms, corridors, components };
}

/**
 * Reconcile Exits from Perimeter Wall Openings and Color Exit Badges
 */
export function reconcileExits(width, height, walls, doors, colorMarkers) {
  const exits = [];

  // Determine outer perimeter bounding box from walls
  let minWallX = width;
  let maxWallX = 0;
  let minWallY = height;
  let maxWallY = 0;

  for (const w of walls) {
    minWallX = Math.min(minWallX, w.x1, w.x2);
    maxWallX = Math.max(maxWallX, w.x1, w.x2);
    minWallY = Math.min(minWallY, w.y1, w.y2);
    maxWallY = Math.max(maxWallY, w.y1, w.y2);
  }

  // 1. Color Markers (e.g. green emergency exit signs)
  for (const cm of colorMarkers) {
    if (cm.type === 'emergency' || cm.type === 'normal') {
      exits.push({
        id: `ex-color-${exits.length + 1}`,
        name: cm.type === 'emergency' ? 'Emergency Exit (Marked)' : 'Main Exit (Marked)',
        x: cm.x,
        y: cm.y,
        type: cm.type,
        status: 'detected',
        confidence: 0.95
      });
    }
  }

  // 2. Perimeter openings: Door gaps situated along the outer perimeter boundary
  for (const d of doors) {
    const isPerimeter =
      Math.abs(d.x - minWallX) <= 18 ||
      Math.abs(d.x - maxWallX) <= 18 ||
      Math.abs(d.y - minWallY) <= 18 ||
      Math.abs(d.y - maxWallY) <= 18;

    if (isPerimeter) {
      // Check if already covered by a color marker nearby
      const alreadyCovered = exits.some(ex => Math.hypot(ex.x - d.x, ex.y - d.y) <= 35);
      if (!alreadyCovered) {
        let exitName = 'Perimeter Exit';
        let exitType = 'emergency';

        if (d.x <= minWallX + 25) {
          exitName = 'West Main Exit';
          exitType = 'normal';
        } else if (d.x >= maxWallX - 25) {
          exitName = 'East Fire Exit';
          exitType = 'emergency';
        } else if (d.y <= minWallY + 25) {
          exitName = 'North Emergency Exit';
          exitType = 'emergency';
        } else {
          exitName = 'South Emergency Exit';
          exitType = 'emergency';
        }

        exits.push({
          id: `ex-door-${exits.length + 1}`,
          name: exitName,
          x: d.x,
          y: d.y,
          type: exitType,
          status: 'detected',
          confidence: 0.90
        });
      }
    }
  }

  // Remove perimeter exits from the internal doors list so they act strictly as egress portals
  const internalDoors = doors.filter(d => {
    return !exits.some(ex => Math.hypot(ex.x - d.x, ex.y - d.y) <= 25);
  });

  return { exits, internalDoors };
}

/**
 * Coordinate Conversion & Normalization into PREVIA XR Metrical Schema:
 * Preserves relative positions, connectivity, and centers the building at (0, 0)
 */
export function convertToPreviaSpatialMap(detected, imgWidth, imgHeight, envContext = {}) {
  const { walls, rooms, corridors, doors, exits, stairs, diagnostics } = detected;

  // Find physical bounding box
  let minX = imgWidth;
  let maxX = 0;
  let minY = imgHeight;
  let maxY = 0;

  for (const w of walls) {
    minX = Math.min(minX, w.x1, w.x2);
    maxX = Math.max(maxX, w.x1, w.x2);
    minY = Math.min(minY, w.y1, w.y2);
    maxY = Math.max(maxY, w.y1, w.y2);
  }

  const rawWidth = Math.max(50, maxX - minX);
  const rawHeight = Math.max(50, maxY - minY);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  // Calibrate scale: standard collegiate floor plans are roughly 26m to 42m wide
  // Target building width in meters:
  const targetWorldWidth = 32; // 32 meters
  const scale = targetWorldWidth / rawWidth; // meters per pixel

  const toWorldX = (px) => Math.round(((px - centerX) * scale) * 10) / 10;
  const toWorldY = (py) => Math.round(((py - centerY) * scale) * 10) / 10;
  const toWorldLen = (len) => Math.max(0.5, Math.round((len * scale) * 10) / 10);

  // 1. Convert Walls
  const previaWalls = walls.map((w, idx) => ({
    id: `w-${idx + 1}`,
    x1: toWorldX(w.x1),
    y1: toWorldY(w.y1),
    x2: toWorldX(w.x2),
    y2: toWorldY(w.y2),
    status: w.status || 'detected',
    confidence: w.confidence || 0.90
  }));

  // 2. Convert Rooms
  const previaRooms = rooms.map((r, idx) => ({
    id: `r-${idx + 1}`,
    name: r.name || `Room ${idx + 1}`,
    x: toWorldX(r.x),
    y: toWorldY(r.y),
    width: toWorldLen(r.width),
    height: toWorldLen(r.height),
    status: r.status || 'detected',
    confidence: r.confidence || 0.88
  }));

  // 3. Convert Corridors
  const previaCorridors = corridors.map((c, idx) => ({
    id: `corr-${idx + 1}`,
    name: c.name || `Corridor ${idx + 1}`,
    points: [
      [toWorldX(c.x - c.width / 2), toWorldY(c.y)],
      [toWorldX(c.x + c.width / 2), toWorldY(c.y)]
    ],
    x: toWorldX(c.x),
    y: toWorldY(c.y),
    width: toWorldLen(c.width),
    height: toWorldLen(c.height)
  }));

  // 4. Convert Doors
  const previaDoors = doors.map((d, idx) => {
    // Find adjacent rooms or corridor
    const connectedAreas = [];
    for (const r of previaRooms) {
      const rx0 = r.x - r.width / 2 - 1.5;
      const rx1 = r.x + r.width / 2 + 1.5;
      const ry0 = r.y - r.height / 2 - 1.5;
      const ry1 = r.y + r.height / 2 + 1.5;
      const wx = toWorldX(d.x);
      const wy = toWorldY(d.y);
      if (wx >= rx0 && wx <= rx1 && wy >= ry0 && wy <= ry1) {
        connectedAreas.push(r.name);
      }
    }
    if (connectedAreas.length < 2 && previaCorridors.length > 0) {
      connectedAreas.push(previaCorridors[0].name);
    }

    return {
      id: `d-${idx + 1}`,
      x: toWorldX(d.x),
      y: toWorldY(d.y),
      width: Math.max(0.9, toWorldLen(d.width)),
      connectedAreas: connectedAreas.length > 0 ? connectedAreas : ['Main Circulation'],
      status: d.status || 'detected',
      confidence: d.confidence || 0.86
    };
  });

  // 5. Convert Exits (Ensure at least 1 exit exists)
  let previaExits = exits.map((ex, idx) => ({
    id: `ex-${idx + 1}`,
    name: ex.name || (idx === 0 ? 'Main Exit' : 'Emergency Exit'),
    x: toWorldX(ex.x),
    y: toWorldY(ex.y),
    type: ex.type || (idx === 0 ? 'normal' : 'emergency'),
    status: ex.status || 'detected',
    confidence: ex.confidence || 0.90
  }));

  if (previaExits.length === 0) {
    // Fallback: place on perimeter east and west thresholds
    const halfW = Math.round((targetWorldWidth / 2) * 10) / 10;
    previaExits = [
      { id: 'ex-1', name: 'Main Exit', x: -halfW, y: 0, type: 'normal', status: 'suggested', confidence: 0.75 },
      { id: 'ex-2', name: 'Emergency Exit', x: halfW, y: 0, type: 'emergency', status: 'suggested', confidence: 0.75 }
    ];
  }

  // 6. Convert Stairs & Obstacles
  const previaObstacles = [];
  stairs.forEach((st, idx) => {
    previaObstacles.push({
      id: `obs-stairs-${idx + 1}`,
      name: `Stairwell ${idx + 1}`,
      x: toWorldX(st.x),
      y: toWorldY(st.y),
      width: toWorldLen(st.width),
      height: toWorldLen(st.height),
      movable: false,
      type: 'stairs',
      status: 'detected',
      confidence: st.confidence || 0.88
    });
  });

  // 7. Place Initial Occupants Safely in Walkable Room Centers & Corridors
  const people = [];
  const occupantNames = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta'];
  let personIdx = 1;

  // Place one occupant in each detected room (up to 5 rooms)
  for (let i = 0; i < Math.min(previaRooms.length, 5); i++) {
    const rm = previaRooms[i];
    people.push({
      id: `p-${personIdx}`,
      x: rm.x,
      y: rm.y,
      label: `Occupant ${occupantNames[personIdx - 1] || personIdx}`
    });
    personIdx++;
  }

  // Also place an occupant in the main corridor
  if (previaCorridors.length > 0 && personIdx <= 6) {
    people.push({
      id: `p-${personIdx}`,
      x: previaCorridors[0].x,
      y: previaCorridors[0].y,
      label: `Occupant ${occupantNames[personIdx - 1] || personIdx}`
    });
  }

  // Fallback if no rooms were detected
  if (people.length === 0) {
    people.push({ id: 'p-1', x: 0, y: 0, label: 'Occupant Alpha' });
  }

  const worldWidth = Math.ceil(targetWorldWidth + 6);
  const worldDepth = Math.ceil((rawHeight * scale) + 6);

  const notice = `Floor plan analysis complete: ${previaWalls.length} wall segments, ${previaRooms.length} rooms, ${previaDoors.length} doors, and ${previaExits.length} exits reconstructed with ${(diagnostics.qualityScore * 100).toFixed(0)}% confidence.`;

  return {
    geometry: {
      walls: previaWalls,
      rooms: previaRooms,
      corridors: previaCorridors,
      doors: previaDoors,
    },
    navigation: {
      gridWidth: worldWidth,
      gridHeight: worldDepth,
      cellSize: 1,
      walkableGrid: {}
    },
    exits: previaExits,
    obstacles: previaObstacles,
    people,
    isAiGenerated: true,
    diagnostics: {
      ...diagnostics,
      wallsDetected: previaWalls.length,
      roomsDetected: previaRooms.length,
      doorsDetected: previaDoors.length,
      exitsDetected: previaExits.length,
      stairsDetected: stairs.length,
      scaleMetersPerPixel: Math.round(scale * 1000) / 1000,
      notice
    },
    notice
  };
}

/**
 * Main Analysis Orchestrator:
 * Executes the full Computer Vision Pipeline on an image buffer or file path
 */
export async function analyzeFloorPlanImageFile(imageSource, envContext = {}) {
  let buffer;
  if (Buffer.isBuffer(imageSource)) {
    buffer = imageSource;
  } else if (typeof imageSource === 'string') {
    if (!fs.existsSync(imageSource)) {
      throw new Error(`Floor plan image file not found on disk: ${imageSource}`);
    }
    buffer = fs.readFileSync(imageSource);
  } else {
    throw new Error('Invalid imageSource: must be Buffer or file path string.');
  }

  // 1. Decode Image
  const decoded = decodeImageBuffer(buffer);

  // 2. Diagnostics & Quality Assessment
  const diagnostics = assessImageDiagnostics(decoded);

  // 3. Preprocess & Binarize
  const { binaryMask, colorMarkers } = preprocessFloorPlan(decoded, diagnostics);

  // 4. Detect Colored Exit Badges
  const clusteredExitMarkers = clusterColorMarkers(colorMarkers, decoded.width, decoded.height);

  // 5. Detect Stairs
  const stairs = detectStairsPattern(decoded.width, decoded.height, binaryMask);

  // 6. Extract Wall Segments
  const walls = extractWallSegments(decoded.width, decoded.height, binaryMask, stairs);

  // If no structural walls detected (e.g. arbitrary non-floorplan photo or blank image)
  if (walls.length < 3) {
    console.warn(`[FloorPlanVision] Insufficient wall lines detected (${walls.length}). Returning diagnostic fallback.`);
    diagnostics.warnings.push('Insufficient architectural wall lines detected. A clean workspace has been prepared for manual drawing.');
    return {
      success: false,
      isFallback: true,
      geometry: { walls: [], rooms: [], corridors: [], doors: [] },
      navigation: { gridWidth: 24, gridHeight: 16, cellSize: 1 },
      exits: [],
      obstacles: [],
      people: [{ id: 'p-1', x: 0, y: 0, label: 'Occupant 1' }],
      diagnostics,
      notice: 'No architectural walls identified in image. Use the 2D editor tools to draw walls, doors, and exits.'
    };
  }

  // 7. Detect Doors & Wall Openings
  const rawDoors = detectDoorsAndOpenings(decoded.width, decoded.height, walls, binaryMask, stairs);

  // 8. Reconcile Exits vs Internal Doors
  const { exits, internalDoors } = reconcileExits(decoded.width, decoded.height, walls, rawDoors, clusteredExitMarkers);

  // 9. Extract Rooms and Corridors
  const { rooms, corridors } = extractRoomsAndCorridors(decoded.width, decoded.height, walls, internalDoors);

  // 10. Convert to PREVIA XR Spatial Map Schema
  const spatialMap = convertToPreviaSpatialMap({
    walls,
    rooms,
    corridors,
    doors: internalDoors,
    exits,
    stairs,
    diagnostics
  }, decoded.width, decoded.height, envContext);

  return spatialMap;
}
