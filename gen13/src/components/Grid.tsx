import React, { useRef, useEffect } from 'react';
import { Group, Box3, Vector3 } from 'three';
import { Triangle } from './Triangle';

export interface GridProps {
    gridSize: number;
    scalingFactorX: number;
    scalingFactorY: number;
    triangleSize: number;
    startingOpacity: number;
}

export const Grid: React.FC<GridProps> = ({ gridSize, triangleSize ,scalingFactorX, scalingFactorY, startingOpacity}) => {
    const groupRef = useRef<Group>(null);

    useEffect(() => {
        if (groupRef.current) {
            const box = new Box3().setFromObject(groupRef.current);
            const center = box.getCenter(new Vector3());
            groupRef.current.position.sub(center);  // Center the group
        }
    }, [gridSize, triangleSize, scalingFactorX, scalingFactorY, startingOpacity]);

    const triangles = [];
    useEffect(() => {
        triangles.length = 0; // Clear the triangles array
    }, [gridSize, triangleSize, scalingFactorX, scalingFactorY, startingOpacity]);


    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const x = i * triangleSize * scalingFactorX;
            const y = j * triangleSize * scalingFactorY;
            const flip = (i + j) % 2 === 1;
            const adjustedX = flip ? x + triangleSize / Math.sqrt(3) : x;
            triangles.push(
                <Triangle key={`${i}-${j}`} size={triangleSize} position={new Vector3(adjustedX, y, 0)} flip={flip} opacity={startingOpacity}/>
            );
        }
    }

    return (
        <group ref={groupRef}>
            {triangles}
        </group>
    );
};
