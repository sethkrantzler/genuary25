import React, { useRef, useEffect } from 'react';
import { Color, Mesh, MeshBasicMaterial, SphereGeometry, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';

interface SpiralProps {
    height: number;
    radius: number;
    numParticles: number;
    size: number;
    gap: number;
}

const Spiral: React.FC<SpiralProps> = ({ height, radius, numParticles, size, gap }) => {
    const particlesRef = useRef<Mesh[]>([]);
    const geometryRef = useRef<SphereGeometry>(new SphereGeometry(size, 16, 16));

    useEffect(() => {
        geometryRef.current = new SphereGeometry(size, 16, 16);
    }, [size])

    useEffect(() => {
        particlesRef.current = [];
        const particles = particlesRef.current;

        for (let i = 0; i < numParticles; i++) {
            const angle = gap * i * (4 * 2) / numParticles;
            const y = (i / numParticles) * height;
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);

            const color = new Color(`hsl(${(y / height) * 270}, 100%, 50%)`);
            const particle = new Mesh(
                geometryRef.current,
                new MeshBasicMaterial({ color: color })
            );
            particle.position.set(x, y, z);
            particles.push(particle);
        }
    }, [height, radius, numParticles, size, gap]);

    return (
        <group position={[0, -height / 2, 0]}>
            {particlesRef.current.map((particle, index) => (
                <primitive key={index} object={particle} />
            ))}
        </group>
    );
};

export default Spiral;
