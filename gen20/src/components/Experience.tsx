import React, { useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import { GUI } from 'lil-gui';
import Square from './Square';

const Experience: React.FC = () => {
    const [size, setSize] = useState(1000);
    const [probabilities, setProbabilities] = useState({
        up: 0.1,
        down: 0.1,
        north: 0.1,
        south: 0.1,
        east: 0.1,
        west: 0.1
    });

    const directions = [
        [0, 1, 0],  // up
        [0, -1, 0], // down
        [0, 0, 1],  // north
        [0, 0, -1], // south
        [1, 0, 0],  // east
        [-1, 0, 0]  // west
    ];

    const generateColor = useCallback((y: number) => {
        const shade = Math.max(0, 255 - y * (255 / size));
        return `rgb(${shade}, ${shade}, ${shade})`;
    }, [size]);

    const generateSquares = (size: number, probabilities: any) => {
        const squares = [];
        let currentPos = [0, 0, 0]; // start at the origin

        const totalProbability = Object.values(probabilities).reduce((a, b) => a + b, 0);

        for (let i = 0; i < size; i++) {
            const color = generateColor(currentPos[1]);
            squares.push(<Square key={i} color={color} position={[...currentPos]} />);

            // Pick a direction based on probabilities
            const randomValue = Math.random() * totalProbability;
            let cumulativeProbability = 0;
            let direction = [0, 0, 0];

            for (const [index, prob] of Object.values(probabilities).entries()) {
                cumulativeProbability += prob;
                if (randomValue < cumulativeProbability) {
                    direction = directions[index];
                    break;
                }
            }

            // Calculate the new position
            const newPos = currentPos.map((coord, index) => coord + direction[index]);

            // Check if the new position is below Y-axis 0
            if (newPos[1] >= 0) {
                currentPos = newPos;
            }
        }

        return squares;
    };

    const [squares, setSquares] = useState(generateSquares(size, probabilities));

    useEffect(() => {
        const gui = new GUI();
        gui.add({ size }, 'size', 10, 1500, 10).onChange((value: number) => {
            setSize(value);
            setSquares(generateSquares(value, probabilities));
        });
        gui.add(probabilities, 'up', 0, 1, 0.01).name('Up').onChange((value) => {
            setProbabilities((prev) => ({ ...prev, up: value }));
            setSquares(generateSquares(size, { ...probabilities, up: value }));
        });
        gui.add(probabilities, 'down', 0, 1, 0.01).name('Down').onChange((value) => {
            setProbabilities((prev) => ({ ...prev, down: value }));
            setSquares(generateSquares(size, { ...probabilities, down: value }));
        });
        gui.add(probabilities, 'north', 0, 1, 0.01).name('North').onChange((value) => {
            setProbabilities((prev) => ({ ...prev, north: value }));
            setSquares(generateSquares(size, { ...probabilities, north: value }));
        });
        gui.add(probabilities, 'south', 0, 1, 0.01).name('South').onChange((value) => {
            setProbabilities((prev) => ({ ...prev, south: value }));
            setSquares(generateSquares(size, { ...probabilities, south: value }));
        });
        gui.add(probabilities, 'east', 0, 1, 0.01).name('East').onChange((value) => {
            setProbabilities((prev) => ({ ...prev, east: value }));
            setSquares(generateSquares(size, { ...probabilities, east: value }));
        });
        gui.add(probabilities, 'west', 0, 1, 0.01).name('West').onChange((value) => {
            setProbabilities((prev) => ({ ...prev, west: value }));
            setSquares(generateSquares(size, { ...probabilities, west: value }));
        });

        const toggleGUIVisibility = (event: KeyboardEvent) => {
            if (event.key === 'h') {
                gui.domElement.style.display = gui.domElement.style.display === 'none' ? '' : 'none';
            }
        };

        window.addEventListener('keydown', toggleGUIVisibility);

        return () => {
            window.removeEventListener('keydown', toggleGUIVisibility);
            gui.destroy();
        };
    }, [size, probabilities]);

    const shrubs = Array.from({ length: 100 }, (_, i) => (
        <mesh key={i} position={[Math.random() * 50 - 25, 0.1, Math.random() * 50 - 25]} castShadow receiveShadow>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial color="green" />
        </mesh>
    ));

    return (
        <>
            <Sky
                sunPosition={[15000, 20, 15000]}
                turbidity={10}
                rayleigh={2}
                mieCoefficient={0.005}
                mieDirectionalG={0.8}
                inclination={0.49} // Sun's inclination in the sky, closer to 0.5 gives a sunset effect
                azimuth={0.25} // Sun's position around the horizon
            />
            <ambientLight intensity={0.5} />
            <fog attach="fog" args={['#ffcc99', 900, 1000]} />
            <directionalLight 
                position={[10, 10, 10]} 
                intensity={1.2} 
                castShadow 
                shadow-mapSize-width={1024} 
                shadow-mapSize-height={1024} 
                shadow-camera-far={50} 
                shadow-camera-left={-10} 
                shadow-camera-right={10} 
                shadow-camera-top={10} 
                shadow-camera-bottom={-10} 
            />
            <group rotation={[0, 0, 0]} position={[0, 0, 0]}>
                {squares}
                {shrubs}
            </group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
                <planeGeometry args={[1000, 1000]} />
                <meshBasicMaterial color="lightgreen" />
            </mesh>
            <OrbitControls />
        </>
    );
    
};

export default Experience;
