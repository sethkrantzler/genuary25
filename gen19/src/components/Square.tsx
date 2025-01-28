import React, { useRef } from 'react';
import { Mesh, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';

interface SquareProps {
    color: string;
    position: Vector3;
}

const Square: React.FC<SquareProps> = ({ color, position }) => {
    const mesh = useRef<Mesh>(null);
    const offset = color === 'black' ? 0 : Math.PI;
    const amplitude = Math.sqrt((position[0] * position[0]) + (position[2] * position[2]));

    const fps = 24;
    const frameInterval = 1 / fps;
    let lastFrameTime = 0;

    useFrame(({ clock }) => {
        const elapsedTime = clock.getElapsedTime();

        if (elapsedTime - lastFrameTime >= frameInterval) {
            lastFrameTime = elapsedTime;

            if (mesh.current) {
                mesh.current.position.y = Math.sin(elapsedTime + offset) * amplitude;
                mesh.current.rotation.y = Math.sin(elapsedTime + offset) * amplitude;
            }
        }
    });

    return (
        <mesh ref={mesh} position={position}>
            <boxGeometry />
            <meshBasicMaterial color={color} />
        </mesh>
    );
};

export default Square;
