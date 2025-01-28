import { Html, PresentationControls, useGLTF } from '@react-three/drei';
import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { gsap } from 'gsap';


export const VideoMachine: React.FC<{src: string}> = ({ src }) =>
{
    const [currentSrc, setSrc] = useState(src);
    const arcadeMachine = useGLTF(
        './arcadeMachine/arcadeMachine.gltf'
    )

    useEffect(() => {
        setSrc(src);
    }, [src]);

    const { camera } = useThree();

    const zoomIn = () => {
        gsap.to(camera.position, { z: -5, duration: 1 });
    };

    const zoomOut = () => {
        gsap.to(camera.position, { z: -16, duration: 1 });
    };

    return (
        <>
            <PresentationControls polar={[-0.1, 0.1]}>
                <primitive object={arcadeMachine.scene} position={[0, -6, 0]} rotation-y={Math.PI/2}>
                    <Html 
                        wrapperClass='machine' 
                        transform
                        occlude="blending"
                        position={[-0.08, 8.2, -0.045]}
                        rotation={[-0.145, Math.PI/2, 0]}
                        distanceFactor={1}
                        rotation-order={'YXZ'}
                    >
                        <iframe 
                            onMouseEnter={zoomIn}
                            onMouseLeave={zoomOut}
                            src={currentSrc}
                            allow="autoplay; encrypted-media"
                        />
                    </Html>
                </primitive>
            </PresentationControls>
        </>
    );
        
}
