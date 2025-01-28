import React, { useState, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { GUI } from 'lil-gui';
import Snow from './Snow';
import { OrbitControls } from '@react-three/drei';
import { Vector2, Vector3 } from 'three';

const generateRandomWind = () => {
    const magnitude = Math.random() * 3; // Adjust as needed
    const direction = new Vector2(Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
    const origin = new Vector3((Math.random() - 0.5) * 7.5, 0, (Math.random() - 0.5) * 7.5); // Adjust as needed
    const blowRate = Math.random()+0.2;
    const startTime = new Date();

    return {
        magnitude,
        direction,
        origin,
        blowRate,
        startTime,
    };
};

const Experience = () => {
    const [numParticles, setNumParticles] = useState(1000);
    const [wind, setWind] = useState(generateRandomWind());

    useEffect(() => {
        const gui = new GUI();
        gui.add({ numParticles }, 'numParticles', 10, 5000, 10).onChange((value: React.SetStateAction<number>) => setNumParticles(value));

        const generateNewWind = () => {
            setWind(generateRandomWind());
        };

        // Function to handle keydown event to generate new wind
        const handleKeydown = (event: KeyboardEvent) => {
            if (event.key === 'w') {
                generateNewWind();
            }
        };

        window.addEventListener('keydown', handleKeydown);

        const toggleGUIVisibility = (event: KeyboardEvent) => {
            if (event.key === 'h') {
                gui.domElement.style.display = gui.domElement.style.display === 'none' ? '' : 'none';
            }
        };

        window.addEventListener('keydown', toggleGUIVisibility);

        return () => {
            window.removeEventListener('keydown', handleKeydown);
            window.removeEventListener('keydown', toggleGUIVisibility);
            gui.destroy();
        };
    }, []);

    return (
        <>
            <Snow numParticles={numParticles} area={5} wind={wind} />
            <OrbitControls />
        </>
    );
};

export default Experience;
