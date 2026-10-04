import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PathRibbonProps {
  waypoints: [number, number, number][];
  baselineWaypoints?: [number, number, number][];
  color?: string;
  isRerouted?: boolean;
  isUnreachable?: boolean;
  agentIndex?: number;
}

/**
 * Architectural Path Ribbon:
 * - Thick, smooth ribbon mesh elevated 0.055 units above the floor to eliminate z-fighting
 * - Subtle directional flow animation
 * - Direct connection from person through corridor into exit entry
 */
export const PathRibbon: React.FC<PathRibbonProps> = ({
  waypoints,
  baselineWaypoints,
  color = '#2563EB',
  isRerouted = false,
  isUnreachable = false,
  agentIndex = 0,
}) => {
  // Slight lateral offset so co-traveling routes in the same corridor stay distinct
  const lateralOffset = ((agentIndex % 4) - 1.5) * 0.1;
  const pulseGroupRef = useRef<THREE.Group>(null);

  // Elevation between 0.05 and 0.065 to prevent any z-fighting with floor or room bounds
  const elevation = 0.055 + (agentIndex % 3) * 0.003;

  // Active / Future Route Ribbon Mesh Geometry
  const ribbonGeometry = useMemo(() => {
    if (!waypoints || waypoints.length < 2) return null;

    const halfWidth = 0.075; // Total ribbon width = 0.15m
    const vertices: number[] = [];
    const indices: number[] = [];

    // Offset waypoints laterally
    const pts = waypoints.map(p => ({
      x: p[0] + lateralOffset,
      z: p[2] + lateralOffset,
    }));

    for (let i = 0; i < pts.length; i++) {
      let nx = 0, nz = 0;
      if (i === 0) {
        const dx = pts[1].x - pts[0].x;
        const dz = pts[1].z - pts[0].z;
        const len = Math.hypot(dx, dz) || 1;
        nx = -dz / len;
        nz = dx / len;
      } else if (i === pts.length - 1) {
        const dx = pts[i].x - pts[i - 1].x;
        const dz = pts[i].z - pts[i - 1].z;
        const len = Math.hypot(dx, dz) || 1;
        nx = -dz / len;
        nz = dx / len;
      } else {
        const dx1 = pts[i].x - pts[i - 1].x;
        const dz1 = pts[i].z - pts[i - 1].z;
        const len1 = Math.hypot(dx1, dz1) || 1;
        const dx2 = pts[i + 1].x - pts[i].x;
        const dz2 = pts[i + 1].z - pts[i].z;
        const len2 = Math.hypot(dx2, dz2) || 1;
        const avgDx = dx1 / len1 + dx2 / len2;
        const avgDz = dz1 / len1 + dz2 / len2;
        const len = Math.hypot(avgDx, avgDz) || 1;
        nx = -avgDz / len;
        nz = avgDx / len;
      }

      // Left vertex
      vertices.push(pts[i].x + nx * halfWidth, elevation, pts[i].z + nz * halfWidth);
      // Right vertex
      vertices.push(pts[i].x - nx * halfWidth, elevation, pts[i].z - nz * halfWidth);

      if (i < pts.length - 1) {
        const base = i * 2;
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [waypoints, lateralOffset, elevation]);

  // Baseline Route Line Geometry (dim gray reference when rerouted)
  const baselineLineGeo = useMemo(() => {
    if (!isRerouted || !baselineWaypoints || baselineWaypoints.length < 2) return null;
    const pts = baselineWaypoints.map(
      p => new THREE.Vector3(p[0] + lateralOffset, elevation - 0.01, p[2] + lateralOffset)
    );
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [isRerouted, baselineWaypoints, lateralOffset, elevation]);

  // Animated flow dots along the route
  useFrame(({ clock }) => {
    if (pulseGroupRef.current && waypoints && waypoints.length >= 2) {
      const t = clock.getElapsedTime() * 1.2;
      const children = pulseGroupRef.current.children;
      const totalSegs = waypoints.length - 1;

      for (let k = 0; k < children.length; k++) {
        const dot = children[k];
        const progress = ((t * 0.4 + (k / children.length)) % 1);
        const segIdx = Math.min(totalSegs - 1, Math.floor(progress * totalSegs));
        const segT = (progress * totalSegs) - segIdx;
        const p1 = waypoints[segIdx];
        const p2 = waypoints[segIdx + 1];
        if (p1 && p2) {
          dot.position.x = p1[0] + (p2[0] - p1[0]) * segT + lateralOffset;
          dot.position.y = elevation + 0.006;
          dot.position.z = p1[2] + (p2[2] - p1[2]) * segT + lateralOffset;
        }
      }
    }
  });

  const activeColor = isUnreachable ? '#DC2626' : isRerouted ? '#F59E0B' : color;

  return (
    <group>
      {/* Dim Baseline Route Reference (Section 52: Baseline vs After Action) */}
      {baselineLineGeo && (
        <primitive
          object={
            new THREE.Line(
              baselineLineGeo,
              new THREE.LineBasicMaterial({
                color: new THREE.Color('#94A3B8'),
                transparent: true,
                opacity: 0.35,
              })
            )
          }
        />
      )}

      {/* Main Solid Architectural Ribbon (Section 36) */}
      {ribbonGeometry && (
        <mesh geometry={ribbonGeometry}>
          <meshBasicMaterial
            color={activeColor}
            transparent
            opacity={isRerouted ? 0.9 : 0.72}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Subtle Directional Flow Pulses along route (Section 38) */}
      {!isUnreachable && waypoints && waypoints.length >= 2 && (
        <group ref={pulseGroupRef}>
          {[0, 1, 2].map(dotIdx => (
            <mesh key={`dot-${dotIdx}`} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.045, 12]} />
              <meshBasicMaterial
                color="#FFFFFF"
                transparent
                opacity={0.8}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Waypoint Connection Discs */}
      {waypoints &&
        waypoints.map((pt, idx) => (
          <mesh
            key={`wp-${idx}`}
            position={[pt[0] + lateralOffset, elevation + 0.002, pt[2] + lateralOffset]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <circleGeometry args={[idx === waypoints.length - 1 ? 0.08 : 0.05, 12]} />
            <meshBasicMaterial
              color={idx === waypoints.length - 1 ? '#16A34A' : activeColor}
              transparent
              opacity={0.85}
              depthWrite={false}
            />
          </mesh>
        ))}
    </group>
  );
};
