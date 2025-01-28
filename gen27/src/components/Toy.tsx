import React, { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Vector2, Raycaster, Group, DoubleSide, Mesh, Clock, Vector3 } from 'three';

export interface ToyProps {
    model: JSX.Element;
}
const Toy: React.FC<ToyProps> = ({ model }) => {
    const { camera } = useThree();
    const [visibility, setVisibility] = React.useState(false);
    const groupRef = useRef(new Group());
    const toyRef = useRef(new Mesh());
    const planeRef = useRef(new Mesh());
    const raycasterRef = useRef(new Raycaster());
    const velocityRef = useRef({ x: 0, y: 0 });
    const clockRef = useRef(new Clock());
    const easing = 0.05;

    const convertPositionToWorldSpace = (event: { touches: { clientY: number; clientX: number}[]; clientX: number; clientY: number; }) => {
        const mouse = new Vector2();
        if (event.touches) {
            mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
        } else {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        }

        const raycaster = raycasterRef.current;
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObject(planeRef.current, true);
        if (intersects.length > 0) {
            const intersect = intersects[0];
            return intersect.point;
        }

        return null;
    };

    useEffect(() => {
        let lastMousePosition = new Vector3();

        const handleMove = (event: any) => {
            const worldPosition = convertPositionToWorldSpace(event);
            if (worldPosition) {
                if (lastMousePosition.length() > 0) {
                    const direction = new Vector3();
                    direction.subVectors(worldPosition, lastMousePosition).normalize();
                    const angle = Math.atan2(direction.x, direction.z);
                    groupRef.current.rotation.y = angle + Math.PI;
                    velocityRef.current.x = (worldPosition.x - lastMousePosition.x) * easing;
                    velocityRef.current.y = (worldPosition.z - lastMousePosition.y) * easing;
                }
                groupRef.current.position.set(worldPosition.x, worldPosition.y, worldPosition.z);
                lastMousePosition.copy(worldPosition);
            }
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('touchmove', handleMove);

        window.addEventListener('mouseup', ()=> setVisibility(false));
        window.addEventListener('touchend', () => setVisibility(false));
        window.addEventListener('mousedown', ()=> setVisibility(true));
        window.addEventListener('touchstart', () => setVisibility(true));

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleMove);
        };
    }, [camera]);

    useEffect(() => {
        const animate = () => {
            requestAnimationFrame(animate);

            const delta = clockRef.current.getDelta();

            if (toyRef.current) {
                // Update rotation with easing
                toyRef.current.rotation.x += velocityRef.current.x * delta;
                toyRef.current.rotation.z += velocityRef.current.y * delta;

                // Gradually decrease velocity
                velocityRef.current.x *= 1 - easing * delta * 10;
                velocityRef.current.y *= 1 - easing * delta * 10;
            }
        };

        animate();
    }, []);

    return (
        <>
            <group ref={groupRef} position={[0, 0, 0]}>
                {/* <mesh ref={toyRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 1]}>
                    <cylinderGeometry args={[0.4, 0.02, 2, 10, 10]} />
                    <meshBasicMaterial color="red" />
                </mesh> */}
                {visibility && model}
            </group>
            <mesh ref={planeRef} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
                <planeGeometry args={[300, 300, 4, 4]} />
                <meshBasicMaterial color="blue" opacity={0} side={DoubleSide} transparent />
            </mesh>
        </>
    );
};

export default Toy;
