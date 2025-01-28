import React, { useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { GUI } from 'lil-gui';
import { useGLTF } from '@react-three/drei';
import { OrbitControls } from '@react-three/drei';
import Circle from './Circle';
import { Vector3 } from 'three';

const Experience = () => {
    const [circles, setCircles] = useState<{ position: [number, number, number]; id: number }[]>([]);
    const [circleId, setCircleId] = useState(0);
    const [colorOffset, setColorOffset] = useState(0.5);
    const [animationDuration, setAnimationDuration] = useState(2);
    const [isRing, setIsRing] = useState(false)
    const { camera, scene } = useThree();

    const handleClick = (event: MouseEvent) => {
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        const vector = new Vector3(x, y, 0.5).unproject(camera);
        const dir = vector.sub(camera.position).normalize();
        const distance = -camera.position.z / dir.z;
        const pos = camera.position.clone().add(dir.multiplyScalar(distance));
        setCircles([...circles, { position: [pos.x, pos.y, pos.z], id: circleId }]);
        setCircleId(circleId + 1);
    };

    useEffect(() => {
        window.addEventListener('click', handleClick);
        return () => {
            window.removeEventListener('click', handleClick);
        };
    }, [circles, circleId]);

    useEffect(() => {
        const gui = new GUI();
        gui.add({ animationDuration }, 'animationDuration', 1, 5, 0.1).onChange((value: React.SetStateAction<number>) => setAnimationDuration(value));
        gui.add({ colorOffset }, 'colorOffset', -1, 1, 0.01).onChange((value: React.SetStateAction<number>) => setColorOffset(value));
        gui.add({isRing}, 'isRing').onChange((value: React.SetStateAction<boolean>) => setIsRing(value));
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
            {circles.map(circle => (
                <Circle key={circle.id} position={circle.position} animationDuration={animationDuration} isRing={isRing} colorOffset={colorOffset} />
            ))}
        </>
    );
};

export default Experience;