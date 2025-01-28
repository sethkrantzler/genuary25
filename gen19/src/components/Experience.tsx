import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { GUI } from 'lil-gui';
import Square from './Square';

const Experience: React.FC = () => {
    const size = 16;
    const squares = [];
    for (let x = 0; x < size; x++) {
        for (let z = 0; z < size; z++) {
            const color = (x + z) % 2 === 0 ? 'black' : 'white';
            const position = [x - size / 2 + 0.5, 0, z - size / 2 + 0.5];
            squares.push(<Square key={`${x}-${z}`} color={color} position={position} />);
        }
    }

    useEffect(() => {
        const gui = new GUI();

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
    }, []);

    return (
        <>
            <group rotation={[Math.PI/2, Math.PI/2,0]} position={[0, 0, 0]}>
                {squares}
            </group>
            <OrbitControls />
        </>
    );
};

export default Experience;
