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
camera.position.set(0, 1, 0);
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
const geometry = new THREE.PlaneGeometry(1, 1, 10, 10)
const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
        iTime: { value: 0.0 },
    },
    side: THREE.DoubleSide,
    transparent: true
});

const size = 1; // size of each cube
const gap = 0.01; // gap between cubes
const count = 10; // number of cubes along each dimension
const yMin = -count*gap*0.5;
const yMax = yMin+count*gap*0.5;
const planes = [];

for (let i = 0; i < count; i++) {
    const mesh = new THREE.Mesh(geometry, new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            iTime: { value: 0.0 },
        },
        side: THREE.DoubleSide,
        transparent: true
    }));
    mesh.position.y=yMin+gap*i;
    mesh.rotation.x = Math.PI/2;
    scene.add(mesh);
    planes.push(mesh);
}


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
    planes.forEach((child, i) => {
        child.rotation.z -= 0.01*child.position.y;
        child.material.uniforms.iTime.value += 0.001*(i+1)*Math.sin(clock.getElapsedTime());
    });
    window.requestAnimationFrame(tick);
};

tick();