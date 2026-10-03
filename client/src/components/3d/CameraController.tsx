import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';

interface CameraControllerProps {
  viewMode: 'perspective' | 'topdown' | 'isometric';
}

export const CameraController: React.FC<CameraControllerProps> = ({ viewMode }) => {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const targetPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 18, 16));

  useEffect(() => {
    if (viewMode === 'topdown') {
      targetPos.current.set(0, 24, 0.01);
    } else if (viewMode === 'isometric') {
      targetPos.current.set(16, 16, 16);
    } else {
      targetPos.current.set(0, 18, 16);
    }
  }, [viewMode]);

  useFrame(() => {
    // Smooth camera interpolation towards target view
    camera.position.lerp(targetPos.current, 0.08);
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  });

  return null;
};
