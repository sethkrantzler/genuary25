import React, { useRef, useEffect, forwardRef } from 'react';
import { Mesh, Vector3, SphereGeometry, MeshBasicMaterial, Color } from 'three';
import { useFrame } from '@react-three/fiber';

interface SphereProps {
    position: Vector3;
    velocity: React.MutableRefObject<Vector3>;
}

const geometry = new SphereGeometry(0.1, 16, 16);

const Sphere = forwardRef<Mesh, SphereProps>(({ position, velocity }, ref) => {
    const mesh = useRef<Mesh>(null);
    const material = useRef(new MeshBasicMaterial());

    const getRandomRainbowColor = () => {
        const hue = Math.random(); // Random hue between 0 and 1
        return new Color().setHSL(hue, 1.0, 0.5); // Full saturation, medium lightness
    };
    
    useEffect(() => {
        material.current.color = getRandomRainbowColor();
    }, [velocity.current]);

    useFrame(() => {
        position.x += velocity.current.x;
        position.y += velocity.current.y;
        position.z += velocity.current.z;
        if (mesh.current) {
            mesh.current.position.set(position.x, position.y, position.z);
        }
    });

    return (
        <mesh ref={ref} position={position} geometry={geometry} material={material.current} />
    );
});

export default Sphere;
