import { createXRStore } from '@react-three/xr';

/**
 * Global WebXR Store for PREVIA XR.
 * Connects the existing Three.js / React Three Fiber scene to WebXR devices.
 * Emulation is disabled by default to prevent intrusive desktop UI overlays;
 * immersion is triggered explicitly via ENTER XR PREVIEW.
 */
export const xrStore = createXRStore({
  emulate: false,
});
