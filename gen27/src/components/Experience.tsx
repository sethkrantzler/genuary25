import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useAnimations, useGLTF } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import Toy from './Toy';
const FishModel = () => {
    const { scene, animations } = useGLTF('./guppy_fish/scene.gltf'); // replace with the path to your GLTF model
    const { actions } = useAnimations(animations, scene);

    useEffect(() => {
        if (actions) {
            // Play all animations
            Object.values(actions).forEach((action) => action?.play());
        }
    }, [actions]);

    return (
        <EffectComposer>
            <primitive object={scene} scale={[0.4, 0.4, 0.4]} rotation={[0, 0, 0]}/>
            <Bloom intensity={3.5} luminanceThreshold={0.3} luminanceSmoothing={0.5} height={300} />
        </EffectComposer>
    );
};


const Experience = () => {
    const [selectedModel, setSelectedModel] = useState<JSX.Element>(getModel('laser'));
    const [showHint, setShowHint] = useState(true);
    const modelOptions = ['laser', 'fish'];


    function getModel(model: string) {
        switch (model) {
            case 'laser':
                return (
                    <>
                     <EffectComposer>
                        <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
                            <sphereGeometry args={[0.1, 32]} />
                            <meshStandardMaterial color="red" />
                        </mesh>
                        <Bloom intensity={10.5} luminanceThreshold={0.0} luminanceSmoothing={0.5} height={300} />
                    </EffectComposer>
                    </>
                    
                );
            case 'fish':
                return <FishModel />;
            default:
                return <mesh />;
        }
    }

    useEffect(() => {
        window.addEventListener('mousedown', () => setShowHint(false));
        window.addEventListener('touchstart', () => setShowHint(false));
    }, []);

    return (
        <>
            <div 
                style={{ 
                    position: 'absolute', 
                    zIndex: 10, 
                    top: '5%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)', 
                    display: 'flex', 
                    flexDirection: 'row', 
                    gap: '16px',
                    alignItems: 'center'
                }}
                >
                {modelOptions.map((model, index) => (
                    <button 
                    key={index} 
                    style={{
                        background: 'white', 
                        fontFamily: 'sans-serif',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        border: '1px solid #ccc',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s',
                        userSelect: 'none'
                    }} 
                    onClick={() => setSelectedModel(getModel(model))}
                    onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f0f0f0'}
                    onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'white'}
                    >
                    {model}
                    </button>
                ))}
            </div>
            {showHint && <div 
                style={{ 
                    position: 'absolute', 
                    zIndex: 10, 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)', 
                    fontFamily: 'sans-serif',
                    fontSize: '8vw',
                    color: 'white'
                }}
                >
                Touch to Play
                
            </div>}
            <Canvas
                camera={{
                    fov: 45,
                    near: 0.1,
                    far: 200,
                    position: [10, 10, 10],
                }}
                style={{ background: 'black' }}
            >
                <ambientLight intensity={3.0} />
                <Toy model={selectedModel} />

            </Canvas>
        </>
    );
};

export default Experience;
