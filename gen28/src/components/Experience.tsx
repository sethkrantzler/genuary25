import { useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, shaderMaterial, Sky, useAnimations, useGLTF } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import React from 'react';
import { DoubleSide, Group, Mesh, ShaderMaterial } from 'three';
import gsap from 'gsap';
import cloudFragment from '../shaders/cloudFragment.glsl';
import cloudVertex from '../shaders/cloudVertex.glsl';

const Watch = () => {
    const needleRef = React.useRef(new Group());
    const rotationScale = Math.PI/30;
    useFrame(({ clock }, delta) => {
        needleRef.current.rotation.z += -rotationScale * delta;
    });

    useEffect(() => {
        const handleScroll = (event: Event) => {
            if (event instanceof WheelEvent) {
                needleRef.current.rotation.z -= event.deltaY* 0.005;                
            } else if (event instanceof TouchEvent) {
                const touch = event.touches[0];
                needleRef.current.rotation.z += touch.clientY * 0.005;                
            }
        };

        window.addEventListener('wheel', handleScroll);
        window.addEventListener('touchmove', handleScroll);

        return () => {
            window.removeEventListener('wheel', handleScroll);
            window.removeEventListener('touchmove', handleScroll);
        };
    }, []);

    return (
        <group position={[0, 0.2,-2]} rotation={[-Math.PI/6, 0, 0]}>
            <mesh rotation={[Math.PI/2, Math.PI/2, 0]}>
                <cylinderGeometry args={[1, 1, 0.1, 10]} />
                <meshStandardMaterial color="white" />
            </mesh>
            <mesh>
                <ringGeometry args={[1, 1.1, 10]} />
                <meshStandardMaterial color="gold" />
            </mesh>
            <mesh position={[0, 0, 0.13]} rotation={[0, 0, 0]}>
                <circleGeometry args={[0.1, 10]} />
                <meshStandardMaterial color="grey" />
            </mesh>
            <group ref={needleRef}>
                <mesh position={[0, 0.4, 0.1]} /* Position adjusted to move the rotation center to the end of the cylinder */ >
                    <cylinderGeometry args={[0.01, 0.03, 0.8, 32]} />
                    <meshStandardMaterial color="red" />
                </mesh>
            </group>
        </group>
    );
};

const Clouds = ({ }: { }) => {
    const shaderRef = React.useRef( new ShaderMaterial());
    useFrame(({ clock }, delta) => {
        shaderRef.current.uniforms.uTime.value += 0.05*delta;
    });

    useEffect(() => {
        const handleScroll = (event: Event) => {
            if (event instanceof WheelEvent) {
                shaderRef.current.uniforms.uTime.value += event.deltaY* 0.005;                
            } else if (event instanceof TouchEvent) {
                const touch = event.touches[0];
                shaderRef.current.uniforms.uTime.value += touch.clientY * 0.005;                
            }
        };

        window.addEventListener('wheel', handleScroll);
        window.addEventListener('touchmove', handleScroll);

        return () => {
            window.removeEventListener('wheel', handleScroll);
            window.removeEventListener('touchmove', handleScroll);
        };
    }, []);
        
    return (
        <mesh position={[0, 5, -200]} rotation={[Math.PI/3, 0, 0 ]}>
            <planeGeometry args={[500, 225, 2, 2]} />
            <shaderMaterial ref={shaderRef} side={DoubleSide} fragmentShader={cloudFragment} vertexShader={cloudVertex} uniforms={{uTime: {value: 0}}}/>
        </mesh>
    );
}
const Experience = () => {
    //scrollAmount is the amount of scrolling that has been done
    const { scene, camera} = useThree();

    useEffect(() => {
        camera.rotation.set(0,0,0);
    }, [camera]);

    return (
        <>
            <ambientLight intensity={1}/>
            <Sky/>
            <Clouds/>
            <Watch/>
            <mesh position ={[0, -2, 0]} rotation={[Math.PI/2, 0, 0]}>
                <planeGeometry args={[100, 100, 16, 16]} />
                <meshBasicMaterial color="darkgreen" side={DoubleSide} />
            </mesh>
        </>
    );
};

export default Experience;
