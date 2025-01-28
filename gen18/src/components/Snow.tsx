import React, { useRef, useEffect, useState } from 'react';
import { BufferGeometry, Float32BufferAttribute, Points, PointsMaterial, Color, Vector2, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';

interface Wind {
    magnitude: number;
    direction: Vector2;
    origin: Vector3;
    blowRate: number; // a number from 0 to 1 to determine how hard the wind blows at its original magnitude
    startTime: Date;
}

interface SnowProps {
    numParticles: number;
    area: number;
    wind: Wind;
}

const Snow: React.FC<SnowProps> = ({ numParticles, area, wind }) => {
    const particlesRef = useRef<Points>(null);
    const positions = useRef<Float32Array>(new Float32Array(numParticles * 3));
    const velocities = useRef<Float32Array>(new Float32Array(numParticles));
    const [curWind, setWind] = useState(wind);

    useEffect(() => {
        setWind(wind);
    },[wind])

    useEffect(() => {
        positions.current = new Float32Array(numParticles * 3);
        velocities.current = new Float32Array(numParticles);

        for (let i = 0; i < numParticles; i++) {
            positions.current[i * 3] = (Math.random() - 0.5) * area;
            positions.current[i * 3 + 1] = area + (Math.random() - 0.5)*0.01;
            positions.current[i * 3 + 2] = (Math.random() - 0.5) * area;
            velocities.current[i] = Math.random() * 0.005 + 0.01; // Give each particle a random velocity
        }

        if (particlesRef.current) {
            particlesRef.current.geometry.setAttribute('position', new Float32BufferAttribute(positions.current, 3));
        }
    }, [numParticles, area]);

    useFrame(() => {
        const currentTime = new Date();
        const elapsedTime = (currentTime.getTime() - curWind.startTime.getTime()) / 1000;

        for (let i = 0; i < numParticles; i++) {
            // Calculate the distance from the origin
            const dx = positions.current[i * 3] - wind.origin.x;
            const dz = positions.current[i * 3 + 2] - wind.origin.z;
            const distanceSquared = dx * dx + dz * dz;

            // Calculate the wind effect
            const windEffect = wind.magnitude * wind.blowRate * Math.exp(-distanceSquared) * Math.exp(-elapsedTime);
            const windDirection = new Vector2(wind.direction.x, wind.direction.y).normalize();

            // Update positions based on wind effect and velocities
            positions.current[i * 3] += windEffect * windDirection.x;
            positions.current[i * 3 + 1] -= velocities.current[i]; // Move particles down
            positions.current[i * 3 + 2] += windEffect * windDirection.y;

            // Reset particles if they fall below a certain height
            if (positions.current[i * 3 + 1] < 0) {
                positions.current[i * 3 + 1] = area + (Math.random() - 0.5)*0.01;; // Reset particles to top
                positions.current[i * 3] = (Math.random() - 0.5) * area; // Randomize x position
                positions.current[i * 3 + 2] = (Math.random() - 0.5) * area; // Randomize z position
            }
        }

        if (particlesRef.current) {
            particlesRef.current.geometry.setAttribute('position', new Float32BufferAttribute(positions.current, 3));
            particlesRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <points ref={particlesRef} position={[0, -area/2, 0]}>
            <bufferGeometry />
            <pointsMaterial color={new Color('white')} size={0.04} />
        </points>
    );
};

export default Snow;
