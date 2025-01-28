import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Sky } from 'three/addons/objects/Sky.js';
import GUI from 'lil-gui';
import gsap from 'gsap';
import fragmentShader from './shader/fragment.glsl'
import vertexShader from './shader/vertex.glsl'



/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();


// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 0, 1);
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.shadowMap.enabled = true;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Monument
const geometry = new THREE.PlaneGeometry(1, 1, 128, 128)
const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
        uTime: { value: 0.0 },
    }
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Resize event
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Animation loop
const clock = new THREE.Clock();
const tick = () => {
    clock.getElapsedTime();
    controls.update();
    renderer.render(scene, camera);
    material.uniforms.uTime.value = clock.elapsedTime / 1.0;
    console.log(clock.elapsedTime / 1.0);
    window.requestAnimationFrame(tick);
};

tick();