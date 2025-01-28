import { Canvas } from '@react-three/fiber';
import Experience from './components/Experience';
export function App() {
  return (
    <Canvas
      camera={ {
        fov: 45,
        near: 0.1,
        far: 1000,
        position: [ 0, 0, 15 ],
      }}
      style={{ background: 'tan' }}>
      <Experience />
    </Canvas>
  );
}