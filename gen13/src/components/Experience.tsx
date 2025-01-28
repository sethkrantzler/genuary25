import React, { useEffect, useState } from "react";
import { Grid } from "./Grid";
import GUI from "lil-gui";

export default function Experience() {
    const [gridSize, setGridSize] = useState(10);
    const [triangleSize, setTriangleSize] = useState(0.1);
    const [scalingFactorX, setScalingFactorX] = useState(Math.sqrt(3));
    const [scalingFactorY, setScalingFactorY] = useState(Math.sqrt(3));
    const [startingOpacity, setStartingOpacity] = useState(1);

    useEffect(() => {
        const gui = new GUI();
        gui.add({ gridSize }, 'gridSize', 1, 40, 1).onChange((value: React.SetStateAction<number>) => setGridSize(value));
        gui.add({ triangleSize }, 'triangleSize', 0.01, 1).onChange((value: React.SetStateAction<number>) => setTriangleSize(value));
        gui.add({ scalingFactorX }, 'scalingFactorX', 0, 5).onChange((value: React.SetStateAction<number>) => setScalingFactorX(value));
        gui.add({ scalingFactorY }, 'scalingFactorY', 0, 5).onChange((value: React.SetStateAction<number>) => setScalingFactorY(value));
        gui.add({ startingOpacity }, 'startingOpacity', 0, 1).onChange((value: React.SetStateAction<number>) => setStartingOpacity(value));
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
            <Grid 
                gridSize={gridSize} 
                triangleSize={triangleSize} 
                scalingFactorX={scalingFactorX} 
                scalingFactorY={scalingFactorY} 
                startingOpacity={startingOpacity} 
            />
        </>
    );
}
