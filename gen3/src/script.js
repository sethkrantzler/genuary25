import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
let tubesGenerated = 0;
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 5;
const cameraGroup = new THREE.Group();
cameraGroup.add(camera);
scene.add(cameraGroup);
const renderer = new THREE.WebGLRenderer({canvas: canvas, devicePixelRatio: Math.min(window.devicePixelRatio, 2)});
renderer.setSize(window.innerWidth, window.innerHeight);
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.4, 0.1, 0);
composer.addPass(bloomPass);
const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(3000).map(() => (Math.random() - 0.5) * 100);
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
scene.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xffffff, size: 0.2*Math.random()})));
const tick = () => {
    if (scene.children.length < 43) createMovingTube();
    cameraGroup.rotateY(0.001);
    composer.render();
    window.requestAnimationFrame(tick)
};
function createMovingTube() {
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2, 8), new THREE.MeshBasicMaterial({ color: tubesGenerated % 42 == 0 ? new THREE.Color(1, 1, 1) : new THREE.Color().setHSL((tubesGenerated / 42) * (270/360), 1, 0.5)}));
    tube.position.set(Math.random() * 2.25 - 1, -6.5, Math.random() * 2.25 - 1);
    scene.add(tube);
    tubesGenerated++;
    const speed = Math.random() * 0.01 + 0.03;
    const animateTube = () => { 
        tube.position.y += speed;
        return tube.position.y >= 6.5 ? scene.remove(tube) : requestAnimationFrame(animateTube);
    };
    animateTube();
};
tick();