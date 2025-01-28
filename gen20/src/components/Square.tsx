import React, { useRef } from 'react';
import { Mesh, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';

interface SquareProps {
    position: Vector3;
}

const Square: React.FC<SquareProps> = ({ position }) => {
    const mesh = useRef<Mesh>(null);
    const colors = ['grey', 'tan', 'lightgrey'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    return (
        <mesh ref={mesh} position={position} castShadow receiveShadow>
            <boxGeometry />
            <meshStandardMaterial color={color} metalness={0.2} roughness={0.4} />
        </mesh>
    );
};

export default Square;
