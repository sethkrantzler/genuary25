import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { DoubleSide, MeshStandardMaterial, Vector3 } from 'three';

export interface TriangleProps {
    size: number;
    flip: boolean;
    position: Vector3;
    opacity: number;
}

export const Triangle: React.FC<TriangleProps> = ({ size, position, flip, opacity }) => {
    const materialRef = useRef<MeshStandardMaterial>(null!);
    const [isHovered, setHover] = useState(false);
    
    useEffect(() => {
        if (materialRef.current) {
            materialRef.current.opacity = opacity;
        }
    }, []);

    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        if (isHovered && event.key === 'f' && materialRef.current) {
            materialRef.current.opacity = materialRef.current.opacity === 1 ? 0 : 1;
        }
    }, [isHovered, materialRef?.current]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [handleKeyPress]);

    return (
        <mesh position={position} rotation={[0, 0, flip ? Math.PI : 0]} onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
            <circleGeometry args={[size, 2]} />
            <meshStandardMaterial color= {true ? "black": `#${Math.floor(Math.random()*16777215).toString(16)}`} ref={materialRef} transparent side={DoubleSide} opacity={opacity} />
        </mesh>
    );
};
