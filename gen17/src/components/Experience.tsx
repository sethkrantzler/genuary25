import React, { useState, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { GUI } from 'lil-gui';
import Spiral from './Spiral';
import gsap from 'gsap';

const Experience = () => {
    const [height, setHeight] = useState(5);
    const [radius, setRadius] = useState(2);
    const [numParticles, setNumParticles] = useState(100);
    const [size, setSize] = useState(0.01);
    const [gap, setGap] = useState(0);

    const [curGap, setCurGap]=useState(0);

    useEffect(() => {
        gsap.to({ gap: 0 }, {
            gap: gap,
            duration: 3,
            ease: 'power4.inOut',
            yoyo: true,
            repeat: -1,
            onUpdate: function() {
                setCurGap(this.targets()[0].gap);
            }
        });
    }, [gap]);
    

    useEffect(() => {
        const gui = new GUI();
        gui.add({ height }, 'height', 1, 10, 0.1).onChange((value: React.SetStateAction<number>) => setHeight(value));
        gui.add({ radius }, 'radius', 1, 5, 0.1).onChange((value: React.SetStateAction<number>) => setRadius(value));
        gui.add({ numParticles }, 'numParticles', 10, 5000, 10).onChange((value: React.SetStateAction<number>) => setNumParticles(value));
        gui.add({ size }, 'size', 0.001, 1, 0.01).onChange((value: React.SetStateAction<number>) => setSize(value));
        gui.add({ gap }, 'gap', 0, 10, 0.01).onChange((value: React.SetStateAction<number>) => setGap(value));

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
            <Spiral height={height} gap={curGap} radius={radius} size={size} numParticles={numParticles}/>
        </>
    );
};

export default Experience;