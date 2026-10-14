import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Sky } from 'three/addons/objects/Sky.js';
import GUI from 'lil-gui';
import gsap from 'gsap';
import fragmentShader from './shader/fragment.glsl'
import vertexShader from './shader/vertex.glsl'
import { starbucksLocs } from '../starbucks';
import { chipotleLocs } from '../chipotle';



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
camera.position.set(0, 0, 10);
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.shadowMap.enabled = true;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(3000).map(() => (Math.random() - 0.5) * 100);
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMesh = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xffffff, size: 0.2*Math.random()}));
scene.add(starMesh);

// Generate random points
const starbucksPoints = starbucksLocs.length;
const starbucksArray = new Float32Array(starbucksPoints * 4); // Each point has 4 components (R, G, B, A)

const minLat = 18.910000;
const maxLat = 71.538800;
const minLng = -172.420000;
const maxLng = -66.934570;

starbucksLocs.forEach((loc, i) => {
    // Normalize latitude
    starbucksArray[i * 4] = (loc.position.lat - minLat) / (maxLat - minLat);

    // Normalize longitude
    starbucksArray[i * 4 + 1] = (loc.position.lng - minLng) / (maxLng - minLng);

    // Set B and A channels to 1.0
    starbucksArray[i * 4 + 2] = 1.0;
    starbucksArray[i * 4 + 3] = 1.0;
});

const starbucksTexture = new THREE.DataTexture(starbucksArray, starbucksPoints, 1, THREE.RGBAFormat, THREE.FloatType);
starbucksTexture.needsUpdate = true;


const chipotlePoints = chipotleLocs.length;
const chipotleArray = new Float32Array(chipotlePoints * 4); // Each point has 4 components (R, G, B, A)

chipotleLocs.forEach((loc, i) => {
    // Normalize latitude
    chipotleArray[i * 4] = (loc.position.lat - minLat) / (maxLat - minLat);

    // Normalize longitude
    chipotleArray[i * 4 + 1] = (loc.position.lng - minLng) / (maxLng - minLng);

    // Set B and A channels to 1.0
    chipotleArray[i * 4 + 2] = 1.0;
    chipotleArray[i * 4 + 3] = 1.0;
});

const chipotleTexture = new THREE.DataTexture(chipotleArray, chipotlePoints, 1, THREE.RGBAFormat, THREE.FloatType);
chipotleTexture.needsUpdate = true;


// Shader
const geometry = new THREE.SphereGeometry(1, 64, 64)
const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
        uTime: { value: 0.0 },
        uStarbucksPointsTexture: {value: starbucksTexture},
        uNumStarbucks: { value: starbucksPoints},
        uChipotlePointsTexture: {value: chipotleTexture},
        uNumChipotle: {value: chipotlePoints}
    }
});


const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
mesh.rotation.x -= 0.2

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
    mesh.rotation.y += 0.01;
    starMesh.rotation.y-= 0.0003
    window.requestAnimationFrame(tick);
};

tick();