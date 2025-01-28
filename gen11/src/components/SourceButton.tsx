import React, { useRef } from 'react';
import { Mesh, Vector3 } from 'three';
import { gsap } from 'gsap';
import { Html } from '@react-three/drei';

export interface SourceButtonProps {
    onButtonClicked: () => void;
    name: string;
    position: Vector3;
}

export const SourceButton: React.FC<SourceButtonProps> = ({ onButtonClicked, name, position }) => {
    const cylinderRef = useRef<Mesh>(null);
    const colorRef = useRef<string>(`hsl(${Math.random() * 360}, 100%, 50%)`);
    const color = colorRef.current;

    const handleClick = () => {
        onButtonClicked();
        if (cylinderRef.current) {
            gsap.to(cylinderRef.current.position, {
                y: 0.2,
                duration: 0.1,
                yoyo: true,
                repeat: 1,
            });
        }
    };

    return (
        <group position={position} rotation-x={Math.PI/2}>
            <mesh ref={cylinderRef} position={[0, 0, 0.1]}  onClick={handleClick}> 
                <cylinderGeometry args={[0.5, 0.5, 0.2, 32]} />
                <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0, 0, 0]}>
                <circleGeometry args={[0.8, 32]} />
                <meshStandardMaterial color="black" />
            </mesh>
            <Html position={[-5, 0, 0.1]} rotation={[-Math.PI/2, Math.PI, 0]} transform>
                <div style={{ textAlign: 'left'}}>
                    <h1 style={{color: 'white', fontFamily: 'sans-serif', whiteSpace: 'nowrap' }}>{name}</h1>
                </div>
            </Html>
        </group>
        
    );
};