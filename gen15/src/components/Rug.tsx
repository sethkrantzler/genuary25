import { ShaderMaterial } from 'three/src/materials/ShaderMaterial.js';
import { useRef, useState, useEffect } from 'react';
import { GUI } from 'lil-gui';
import React from 'react';

export interface RugProps {
    size: number;
    position: number[]
}

export const Rug: React.FC<RugProps> = ({ size, position }) => {
    const materialRef = useRef<ShaderMaterial>(null!);
    const [isHovered, setHover] = useState(false);
    const [params, setParams] = useState({
        scale: 0.1,
        frequency: 0.003,
        amplitude: 5.941,
        speed: 1.0
    });

    const customShader = {
        uniforms: {
            time: { value: 1.0 },
            scale: { value: params.scale },
            frequency: { value: params.frequency },
            amplitude: { value: params.amplitude },
            speed: { value: params.speed }
        },
        vertexShader: `
            void main() {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform float scale;
            uniform float frequency;
            uniform float amplitude;
            uniform float speed;

            // Simplex noise function
            vec3 permute(vec3 x) {
                return mod(((x*34.0)+1.0)*x, 289.0);
            }

            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                vec2 i  = floor(v + dot(v, C.yy) );
                vec2 x0 = v -   i + dot(i, C.xx);

                vec2 i1;
                i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);

                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;

                i = mod(i, 289.0);
                vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                    + i.x + vec3(0.0, i1.x, 1.0 ));

                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                m = m*m ;
                m = m*m ;

                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;

                m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

                vec3 g;
                g.x  = a0.x  * x0.x  + h.x  * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }

            void main() {
                vec2 uv = gl_FragCoord.xy / scale;
                float pattern = snoise(uv * frequency + time * speed) * amplitude;

                // Warm orange color palette
                vec3 color1 = vec3(0.8, 0.4, 0.1);
                vec3 color2 = vec3(0.9, 0.6, 0.2);
                vec3 color3 = vec3(0.7, 0.3, 0.1);
                vec3 color4 = vec3(0.6, 0.2, 0.1);

                vec3 color = mix(color1, color2, pattern);
                color = mix(color, color3, pattern * 0.5);
                color = mix(color, color4, pattern * 0.25);

                gl_FragColor = vec4(color, 1.0);
            }
        `
    };

    useEffect(() => {
        const gui = new GUI();
        gui.add(params, 'scale', 0, 2000.0, 0.001).onChange((value: number) => setParams(prev => ({ ...prev, scale: value })));
        gui.add(params, 'frequency', 0, 1000.0, 0.001).onChange((value: number) => setParams(prev => ({ ...prev, frequency: value })));
        gui.add(params, 'amplitude', 0.1, 10.0).onChange((value: number) => setParams(prev => ({ ...prev, amplitude: value })));
        gui.add(params, 'speed', 0.1, 1000.0).onChange((value: number) => setParams(prev => ({ ...prev, speed: value })));

        const toggleGUIVisibility = (event: KeyboardEvent) => {
            if (event.key === 'f') {
                gui.domElement.style.display = gui.domElement.style.display === 'none' ? '' : 'none';
            }
        };

        window.addEventListener('keydown', toggleGUIVisibility);

        return () => {
            window.removeEventListener('keydown', toggleGUIVisibility);
            gui.destroy();
        };
    }, []);
    

    useEffect(() => {
        if (materialRef.current) {
            materialRef.current.uniforms.scale.value = params.scale;
            materialRef.current.uniforms.frequency.value = params.frequency;
            materialRef.current.uniforms.amplitude.value = params.amplitude;
            materialRef.current.uniforms.speed.value = params.speed;
        }
    }, [params]);

    return (
        <mesh position={position} rotation={[-Math.PI / 2, 0, 0 ]}>
            <planeGeometry args={[size * 0.8, size]} />
            <shaderMaterial ref={materialRef} args={[customShader]} />
        </mesh>
    );
};
