import { useEffect, useRef, useState } from 'react';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, shaderMaterial, Sky, useAnimations, useGLTF } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import React from 'react';
import { Color, DoubleSide, Group, Mesh, ShaderMaterial, Vector2 } from 'three';
import gsap from 'gsap';
import cloudFragment from '../shaders/cloudFragment.glsl';
import cloudVertex from '../shaders/cloudVertex.glsl';

const Watch = () => {
    const needleRef = React.useRef(new Group());
    const rotationScale = Math.PI/30;
    const touchStart = React.useRef(0);

    useFrame(({ clock }, delta) => {
        needleRef.current.rotation.z += -rotationScale * delta;
    });

    useEffect(() => {
        const handleScroll = (event: Event) => {
            if (event instanceof WheelEvent) {
                needleRef.current.rotation.z -= event.deltaY* 0.005;                
            } else if (event instanceof TouchEvent) {
                const touch = event.touches[0];
                needleRef.current.rotation.z += (touchStart.current - touch.clientY) * 0.001;                
            } else if (event instanceof MouseEvent && touchStart.current != 0){
                needleRef.current.rotation.z -= (event.clientY - touchStart.current) * 0.00025;                
            }
        };

        const handleTouchStart = (event) => {
            if (event instanceof MouseEvent) {
                touchStart.current = event.clientY;                
            } else if (event instanceof TouchEvent) {
                touchStart.current = event.touches[0].clientY;
            }
        }

        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('mousedown', handleTouchStart)
        window.addEventListener('wheel', handleScroll);
        window.addEventListener('touchmove', handleScroll);
        window.addEventListener('mousemove', handleScroll);
        window.addEventListener('mouseup', () => touchStart.current = 0)

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
                <meshStandardMaterial color="gold" roughness={0.8} metalness={0.9}/>
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
            <mesh position={[0, -0.025, 0.13]} rotation={[0, 0, 0]}>
                <circleGeometry args={[0.98, 10]} />
                <meshPhysicalMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.25}
                    roughness={0}
                    metalness={0.5}
                    reflectivity={1}
                    clearcoat={1}
                    sheen={1.0}
                    clearcoatRoughness={0}
                    emissive={new Color('#00ffff')}
                    emissiveIntensity={1}
                />
            </mesh>
        </group>
    );
};

const Clouds = ({ }: { }) => {
    const shaderRef = React.useRef( new ShaderMaterial());
    const touchStart = React.useRef(0);
    useFrame(({ clock }, delta) => {
        shaderRef.current.uniforms.uTime.value += 0.3*delta;
    });

    useEffect(() => {
        const handleScroll = (event: Event) => {
            if (event instanceof WheelEvent) {
                shaderRef.current.uniforms.uTime.value += event.deltaY* 0.005;                
            } else if (event instanceof TouchEvent) {
                const touch = event.touches[0];
                shaderRef.current.uniforms.uTime.value += (touchStart.current - touch.clientY) * 0.0005;                
            } else if (event instanceof MouseEvent && touchStart.current != 0){
                shaderRef.current.uniforms.uTime.value -= (touchStart.current - event.clientY) * 0.001;                
            }
        };

        const handleTouchStart = (event) => {
            if (event instanceof MouseEvent) {
                touchStart.current = event.clientY;                
            } else if (event instanceof TouchEvent) {
                touchStart.current = event.touches[0].clientY;
            }
        }

        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('mousedown', handleTouchStart)
        window.addEventListener('wheel', handleScroll);
        window.addEventListener('touchmove', handleScroll);
        window.addEventListener('mousemove', handleScroll);
        window.addEventListener('mouseup', () => touchStart.current = 0)

        return () => {
            window.removeEventListener('wheel', handleScroll);
            window.removeEventListener('touchmove', handleScroll);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('mousedown', handleTouchStart);
        };
    }, []);
        
    return (
        <mesh position={[0, 5, -200]} rotation={[Math.PI/3, 0, 0 ]}>
            <planeGeometry args={[500, 225, 2, 2]} />
            <shaderMaterial ref={shaderRef} side={DoubleSide} fragmentShader={cloudFragment} vertexShader={cloudVertex} uniforms={{uTime: {value: 0}}}/>
        </mesh>
    );
}

// Custom ShaderMaterial with FBM
const TerrainShaderMaterial = shaderMaterial(
    {
      uTime: 0,
      uResolution: new Vector2(),
    },
    // Vertex Shader
    `
 varying vec2 vUv;

float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = rand(i);
    float b = rand(i + vec2(1.0, 0.0));
    float c = rand(i + vec2(0.0, 1.0));
    float d = rand(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
    float total = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 6; i++) {
        total += noise(p) * amplitude;
        p *= 2.0;
        amplitude *= 0.5;
    }
    return total;
}

void main() {
    vUv = uv;

    // Modify the vertex position with FBM
    vec3 pos = position;
    float height = fbm(pos.xz * 0.1) * 7.0;
    pos.y += height;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`,
    // Fragment Shader
    `
    varying vec2 vUv;
    uniform float uTime;
    uniform vec2 uResolution;
    
    float rand(vec2 co) {
        return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }
  
    float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = rand(i);
        float b = rand(i + vec2(1.0, 0.0));
        float c = rand(i + vec2(0.0, 1.0));
        float d = rand(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }
  
    float fbm(vec2 p) {
        float total = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 6; i++) {
            total += noise(p) * amplitude;
            p *= 2.0;
            amplitude *= 0.5;
        }
        return total;
    }
    
    void main() {
      vec2 st = vUv * uResolution.xy / min(uResolution.x, uResolution.y);
      float height = fbm(st * 10.0);
      vec3 color = vec3(height * 0.25, height * 0.25 + 0.35, 0.0); // Darker greenish color      
      gl_FragColor = vec4(color, 1.0);
    }
    `
  );
  
  extend({ TerrainShaderMaterial });
  
  function Terrain() {
    const ref = useRef();
  
    useFrame((state) => {
      if (ref.current) {
        ref.current.uniforms.uTime.value = state.clock.getElapsedTime();
        ref.current.uniforms.uResolution.value = new Vector2(
          state.size.width,
          state.size.height
        );
      }
    });
  
    return (
      <mesh position={[0, -2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100, 128, 128]} />
        <terrainShaderMaterial ref={ref} side={DoubleSide} />
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
            <ambientLight intensity={0.5}/>
            <directionalLight intensity={1.5} position={[0,10,10]}/>
            <Sky/>
            <Clouds/>
            <Watch/>
            <Terrain/>
        </>
    );
};

export default Experience;
