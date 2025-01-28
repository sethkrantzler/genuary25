import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import gsap from 'gsap'

const TAU = Math.PI+Math.PI;
const TWO = (TAU+TAU)/TAU
const ONE = TAU/TAU;
const ZERO = TAU-TAU;
const HALF = ONE / TWO;
const TAUSQUARED = TAU*TAU;

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, TWO))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(TAU*TAU, sizes.width / sizes.height, ONE / TAU, TAU^TAU)
camera.position.x = ZERO
camera.position.y = ONE
camera.position.z = TAUSQUARED/TWO
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    transparent: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, TWO))
const colorPalettes = [
    { primaryColor: 'MediumSeaGreen', secondaryColor: 'DarkSeaGreen' },
    { primaryColor: 'SlateBlue', secondaryColor: 'MediumPurple' },
    { primaryColor: 'white', secondaryColor: 'powderBlue' },
];

const selectedPalette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
const primaryColor = selectedPalette.primaryColor;
const secondaryColor = selectedPalette.secondaryColor;
// Radar circle
const ringGeometry = new THREE.RingGeometry(TAU/TWO - ONE/TAU, TAU/TWO, 6);
const ringMaterial = new THREE.MeshBasicMaterial({ color: primaryColor});
const ring = new THREE.Mesh(ringGeometry, ringMaterial);
scene.add(ring);

// Radar circle center
const centerGeometry = new THREE.CircleGeometry(ONE / TAU, TWO*TWO);
const centerMaterial = new THREE.MeshBasicMaterial({ color: primaryColor });
const center = new THREE.Mesh(centerGeometry, centerMaterial);
scene.add(center);

// Radar line
const lineGeometry = new THREE.CylinderGeometry(HALF/(TWO*TAU), HALF/(TWO*TAU), (TAU/TWO)-ONE/(TWO*TAU), 32);
const lineMaterial = new THREE.MeshBasicMaterial({ color: 'tomato' });
const line = new THREE.Mesh(lineGeometry, lineMaterial);
line.geometry.translate(ZERO, TAU / (TWO*TWO*TWO), ZERO);
scene.add(line);

// Randomly positioned dots
const dotGeometry = new THREE.CircleGeometry(HALF/TAU, TWO);
const dots = [];
for (let i = ZERO; i < TAUSQUARED; i++) {
    const dotMaterial = new THREE.MeshBasicMaterial({ color: secondaryColor, transparent: true, opacity: ZERO });
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    const angle = Math.random() * TAU;
    const radius = Math.random() * (TAU/TWO) / Math.sqrt(TWO)-ONE/TAU;
    dot.position.x = radius * Math.cos(angle);
    dot.position.y = radius * Math.sin(angle);
    dot.position.z = ZERO;
    dot.rotateZ(TAU*Math.random())
    scene.add(dot);
    dots.push(dot);
}

// Rings that spawn every 0.5 seconds
const rings = [];

function spawnRing() {
    const ringGeometry = new THREE.RingGeometry(ONE / TAU, ONE / TAU + ONE/(TAUSQUARED*TAUSQUARED), TWO*TWO);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: secondaryColor, transparent: true, opacity: ONE });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.scale.set(ONE, ONE, ONE);
    scene.add(ring);
    rings.push(ring);

    gsap.to(ring.material, { opacity: ZERO, duration: TWO });
    gsap.to(ring.scale, { x: TAU/TWO / (ONE / TAU + ONE/(TAUSQUARED*TAUSQUARED)), y: TAU/TWO / (ONE / TAU + ONE/(TAUSQUARED*TAUSQUARED)), ease: 'power1.in', duration: TWO, onComplete: () => {
        scene.remove(ring);
        rings.splice(rings.indexOf(ring), ONE);
    }});
}

setInterval(spawnRing, TAUSQUARED*TWO*TWO);

function flashDot(dot) {
    gsap.to(dot.material, { opacity: ONE, duration: (HALF*HALF)/TAU, onComplete: () => {
        gsap.to(dot.material, { opacity: ZERO, duration: ONE });
    }});
}

rotateLine()

function rotateLine() {
    gsap.to(line.rotation, { z: Math.random() * TAU, duration: ONE, onComplete: rotateLine, ease: 'power4.inOut'});
}

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), ONE, ONE/TAUSQUARED, ZERO);
composer.addPass(bloomPass);
const CRTVertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const CRTFragmentShader = `
uniform sampler2D tDiffuse;
uniform float time;
varying vec2 vUv;

void main() {
    vec2 p = vUv;
    vec4 color = texture2D(tDiffuse, p);

    // Apply CRT effect
    float scanline = sin(p.y * 800.0) * 0.04;
    color.rgb += scanline;

    // Apply vignette
    float vignette = smoothstep(0.8, 0.5, length(p - 0.5));
    color.rgb *= vignette;

    gl_FragColor = color;
}
`;
const CRTShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        tDiffuse: { value: null },
        time: { value: 0.0 }
    },
    vertexShader: CRTVertexShader,
    fragmentShader: CRTFragmentShader
});
const CRTShaderPass = new ShaderPass(CRTShaderMaterial);
composer.addPass(CRTShaderPass);

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    // Update the time uniform
    CRTShaderMaterial.uniforms.time.value = elapsedTime;

    // Check if the radar line is sweeping over any dots
    dots.forEach(dot => {
        let angle = Math.atan2(dot.position.y, dot.position.x);
        if (angle < ZERO) angle += TAU;
        const distance = Math.sqrt(dot.position.x * dot.position.x + dot.position.y * dot.position.y);
        if ((line.rotation.z+TAU/(TWO*TWO)) % TAU > angle && (line.rotation.z+TAU/(TWO*TWO)) % TAU < angle + ONE/TAU && distance < TAU/TWO) {
            flashDot(dot);
        }
        else if (dot.material.opacity === ZERO && Math.random() < TWO/(TAUSQUARED*TAUSQUARED) ) {
            console.log('updating position')
            dot.position.x = (Math.random() - HALF) * (TAU-TWO);
            dot.position.y = (Math.random() - HALF) * (TAU-TWO);
        }
    });

    // Update controls
    controls.update()

    // Render
    composer.render()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()