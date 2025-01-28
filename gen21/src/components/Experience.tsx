import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3, Mesh, BoxGeometry, Color } from 'three';
import { GUI } from 'lil-gui';
import Sphere, { SphereHandle } from './Sphere';

const Experience: React.FC = () => {
    const sphereRefs = useRef<{ mesh: React.RefObject<Mesh>, velocity: React.MutableRefObject<Vector3>, sphereHandle: React.RefObject<SphereHandle> }[]>([]);
    const [size, setSize] = useState(10);
    const [boxSize, setBoxSize] = useState([2, 2, 2]);
    const [spheres, setSpheres] = useState<JSX.Element[]>([]);

    useEffect(() => {
        const newSpheres = generateSpheres(size, boxSize);
        setSpheres(newSpheres);
    }, [size, boxSize]);

    useEffect(() => {
        const gui = new GUI();
        gui.add({ size }, 'size', 1, 100, 1).onChange(value => setSize(value));
        gui.add({ boxSizeX: boxSize[0] }, 'boxSizeX', 1, 10).onChange(value => setBoxSize([value, boxSize[1], boxSize[2]]));
        gui.add({ boxSizeY: boxSize[1] }, 'boxSizeY', 1, 10).onChange(value => setBoxSize([boxSize[0], value, boxSize[1]]));
        gui.add({ boxSizeZ: boxSize[2] }, 'boxSizeZ', 1, 10).onChange(value => setBoxSize([boxSize[0], boxSize[1], value]));

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
    }, [boxSize]);

    function generateSpheres(size: number, boxSize: number[]): JSX.Element[] {
        const spheresArray: JSX.Element[] = [];
        sphereRefs.current = [];  // Reset the sphereRefs array
        const [boxWidth, boxHeight, boxDepth] = boxSize;
        for (let i = 0; i < size; i++) {
            const position = new Vector3(
                Math.random() * boxWidth - boxWidth / 2,
                Math.random() * boxHeight - boxHeight / 2,
                Math.random() * boxDepth - boxDepth / 2
            );
            const velocity = new Vector3(
                Math.random() * 0.1 - 0.05,
                Math.random() * 0.1 - 0.05,
                Math.random() * 0.1 - 0.05
            );
            const velocityRef = { current: velocity };
            const meshRef = React.createRef<Mesh>();
            const sphereHandleRef = React.createRef<SphereHandle>();
            sphereRefs.current.push({ mesh: meshRef, velocity: velocityRef, sphereHandle: sphereHandleRef });
            spheresArray.push(<Sphere key={i} position={position} velocity={velocityRef} ref={meshRef} />);
        }
        return spheresArray;
    }

    useFrame(() => {
        sphereRefs.current.forEach(({ mesh, velocity }, index) => {
            const position = mesh.current?.position;

            if (position) {
                // Reflect off walls
                if (position.x >= 1 || position.x <= -1) velocity.current.x *= -1;
                if (position.y >= 1 || position.y <= -1) velocity.current.y *= -1;
                if (position.z >= 1 || position.z <= -1) velocity.current.z *= -1;

                // Reflect off other spheres
                sphereRefs.current.forEach((other, otherIndex) => {
                    if (index !== otherIndex && other.mesh.current) {
                        const distance = position.distanceTo(other.mesh.current.position);
                        if (distance <= 0.2) {
                            const tempVelocity = velocity.current.clone();
                            velocity.current.copy(other.velocity.current);
                            other.velocity.current.copy(tempVelocity);

                            // Determine faster and slower object
                            const thisSpeed = velocity.current.length();
                            const otherSpeed = other.velocity.current.length();
                            
                            if (thisSpeed > otherSpeed) {
                                other.mesh.current.material.color = mesh.current!.material.color;
                            } else {
                                mesh.current!.material.color = other.mesh.current.material.color;
                            }
                        }
                    }
                });


                position.add(velocity.current);
            }
        });
    });

    return (
        <>
            <OrbitControls />
            {spheres}
            <mesh>
                <boxGeometry args={boxSize} />
                <meshBasicMaterial color="lightgreen" opacity={0} transparent />
                <lineSegments>
                    <edgesGeometry attach="geometry" args={[new BoxGeometry(...boxSize)]} />
                    <lineBasicMaterial attach="material" color="lightgreen" />
                </lineSegments>
            </mesh>
        </>
    );
};

export default Experience;
