import React, { useRef, useEffect } from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';

interface CircleProps {
    position: [number, number, number];
    animationDuration: number;
    colorOffset: number
    isRing: boolean;
}

const mapPositionToColor = (position: [number, number, number], offset): string => {
    const x = (position[0] + offset) / 2; // Normalize x to [0, 1]
    const y = (position[1] + offset) / 2; // Normalize y to [0, 1]
    const z = (position[2] + offset) / 2; // Normalize z to [0, 1]

    const r = Math.min(255, Math.max(0, Math.floor(x * 255)));
    const g = Math.min(255, Math.max(0, Math.floor(y * 255)));
    const b = Math.min(255, Math.max(0, Math.floor(z * 255)));

    return `rgb(${r}, ${g}, ${b})`;
};



const Circle: React.FC<CircleProps> = ({ position, animationDuration, isRing, colorOffset}) => {
    const meshRef = useRef<Mesh>(null);

    useEffect(() => {
        if (meshRef.current) {
            gsap.to(meshRef.current.material, {
                opacity: 0,
                duration: animationDuration,
                onComplete: () => {
                    if (meshRef.current) {
                        meshRef.current.parent?.remove(meshRef.current);
                    }
                },
            });
        }
    }, [animationDuration, position]);

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.scale.x += 0.01;
            meshRef.current.scale.y += 0.01;
            meshRef.current.scale.z += 0.01;
        }
    });

    return (
        <mesh ref={meshRef} position={position}>
            <ringGeometry args={[1, 1.5, 100]} />
            {isRing ? <ringGeometry args={[1, 1.5, 100]} /> : <circleGeometry args={[1, 100]} />}
            <meshBasicMaterial color={mapPositionToColor(position, colorOffset)} transparent />
        </mesh>
    );
};

export default Circle;