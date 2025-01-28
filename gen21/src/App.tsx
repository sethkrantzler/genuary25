import { Canvas } from '@react-three/fiber';
import Experience from './components/Experience';
export function App() {
  return (
    <Canvas
      camera={ {
        fov: 75,
        near: 0.1,
        far: 1000,
        position: [ 3, 2, 5],
      }}
      style={{ background: 'black' }}>
      <Experience />
    </Canvas>
  );
}