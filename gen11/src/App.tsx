import { Canvas } from '@react-three/fiber';
import Experience from './components/Experience';
export function App() {
  return (
    <Canvas
    camera={ {
        fov: 45,
        near: 0.1,
        far: 200,
        position: [ 0, 3, -16 ],
    } }>
      <ambientLight />
      <Experience />
    </Canvas>
  );
}