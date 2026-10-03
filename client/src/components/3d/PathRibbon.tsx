import React, { useMemo } from 'react';
import * as THREE from 'three';

interface PathRibbonProps {
  waypoints: [number, number, number][];
  color: string;
  isRerouted?: boolean;
}

export const PathRibbon: React.FC<PathRibbonProps> = ({ waypoints, color, isRerouted }) => {
  const lineGeometry = useMemo(() => {
    if (!waypoints || waypoints.length < 2) return null;
    const points = waypoints.map(p => new THREE.Vector3(p[0], 0.025, p[2]));
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [waypoints]);

  if (!lineGeometry) return null;

  return (
    <group>
      {/* Dynamic Path Waypoint Line */}
      <primitive object={new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({
        color: new THREE.Color(color),
        linewidth: 2,
        transparent: true,
        opacity: isRerouted ? 0.9 : 0.6,
      }))} />

      {/* Waypoint Floor Dots */}
      {waypoints.map((pt, idx) => (
        <mesh key={idx} position={[pt[0], 0.03, pt[2]]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.08, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
};
