import React from 'react';
import Experience from './components/Experience';
import { Canvas } from '@react-three/fiber';
export function App() {
  return (
    <Canvas
        camera={{
            fov: 45,
            near: 0.1,
            far: 1000,
            position: [0, 1, 2],
        }}
        resize={{ scroll: false }}
    >
          <Experience />
    </Canvas>
  );
}