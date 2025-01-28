import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Sky } from 'three/addons/objects/Sky.js';
import GUI from 'lil-gui';
import gsap from 'gsap';

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Fog
scene.fog = new THREE.Fog(0x000000, 10, 20);

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 2, 5);
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Ground
const groundGeometry = new THREE.SphereGeometry(50, 32, 32);
const groundMaterial = new THREE.MeshBasicMaterial({ color: '#013220' });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.position.set(0, -50, 0);
scene.add(ground);

// Sky
const sky = new Sky();
sky.scale.setScalar(450000);
scene.add(sky);

const skyUniforms = sky.material.uniforms;
skyUniforms['turbidity'].value = 10;
skyUniforms['rayleigh'].value = 2;
skyUniforms['mieCoefficient'].value = 0.005;
skyUniforms['mieDirectionalG'].value = 0.8;

const sun = new THREE.Vector3();
const phi = THREE.MathUtils.degToRad(90 - 10);
const theta = THREE.MathUtils.degToRad(180);
sun.setFromSphericalCoords(1, phi, theta);
sky.material.uniforms['sunPosition'].value.copy(sun);

// Parameters for tree generation
const params = {
    rootColor: '#8B4513',
    rootMaterial: new THREE.MeshBasicMaterial({ color: '#8B4513' }),
    rootGeometry: new THREE.SphereGeometry(0.1, 8, 8),

    branchColor: '#8B4513',
    branchMaterial: new THREE.MeshBasicMaterial({ color: '#8B4513' }),
    branchGeometry: new THREE.CylinderGeometry(0.1, 0.1, 1, 8),
    branchCount: 5,
    branchCountVariance: 1,
    branchLength: 2,
    branchLengthVariance: 0.5,
    branchAngle: 0.55,
    branchAngleVariance: 0.26,
    branchLevels: 4,
    branchLevelsVariance: 2,
    branchMinAngle: Math.PI / 6,

    leafCount: 5,
    leafAngle: Math.PI / 6,
    leafMaterial: new THREE.MeshBasicMaterial({ color: '#fd96ef' }),
    leafColor: '#fd96ef'
};

// GUI for tweaking parameters
const gui = new GUI();
gui.hide();
gui.addColor(params, 'rootColor').onChange(value => params.rootMaterial.color.set(value));
gui.add(params, 'branchCount', 1, 10, 1).onChange(generateTree);
gui.add(params, 'branchCountVariance', 0, 5, 1).onChange(generateTree);
gui.add(params, 'branchLength', 0.5, 5, 0.1).onChange(generateTree);
gui.add(params, 'branchLengthVariance', 0, 2, 0.1).onChange(generateTree);
gui.add(params, 'branchAngle', 0, Math.PI, 0.01).onChange(generateTree);
gui.add(params, 'branchAngleVariance', 0, Math.PI / 2, 0.01).onChange(generateTree);
gui.add(params, 'branchLevels', 1, 5, 1).onChange(generateTree);
gui.add(params, 'branchLevelsVariance', 0, 3, 1).onChange(generateTree);
gui.add(params, 'branchMinAngle', 0, Math.PI / 2, 0.01).onChange(generateTree);
gui.addColor(params, 'leafColor').onChange(value => params.leafMaterial.color.set(value));
gui.add(params, 'leafCount', 1, 10, 1).onChange(generateTree);
gui.add(params, 'leafAngle', 0, Math.PI, 0.01).onChange(generateTree);

// Function to create a tree
let treeGroup;

function makeTree(x, z) {
    if (treeGroup) {
        treeGroup.traverse(child => {
            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => material.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
        scene.remove(treeGroup);
    }

    treeGroup = new THREE.Group();
    scene.add(treeGroup);

    const root = new THREE.Mesh(params.rootGeometry, params.rootMaterial);
    root.position.set(x, 0, z);
    treeGroup.add(root);

    function createBranches(parent, level) {
        if (level > params.branchLevels) return;

        const branchCount = params.branchCount + Math.floor(Math.random() * params.branchCountVariance);
        for (let i = 0; i < branchCount; i++) {
            const branchLength = params.branchLength + (Math.random() - 0.5) * params.branchLengthVariance;
            const bottomRadius = level === 1 ? 0.35 : 0.1; // Tapered first branch
            const topRadius = level === 1 ? 0.21 : 0.1;
            const branchGeometry = new THREE.CylinderGeometry(topRadius, bottomRadius, branchLength, 8);
            const branch = new THREE.Mesh(branchGeometry, params.branchMaterial);
            const branchAngle = params.branchAngle + (Math.random() - 0.5) * params.branchAngleVariance;

            branch.position.set(0, 0, 0);
            branch.rotation.set(branchAngle, (Math.random() - 0.5) * Math.PI * 2, 0);
            branch.geometry.translate(0, branchLength / 2, 0); // Move the geometry so the bottom is at the origin
            parent.add(branch);

            const newRoot = new THREE.Mesh(params.rootGeometry, params.rootMaterial);
            newRoot.position.set(0, branchLength, 0);
            branch.add(newRoot);

            const terminateEarly = level + Math.floor(Math.random() * params.branchLevelsVariance);
            if (terminateEarly >= params.branchLevels) {
                for (let j = 0; j < params.leafCount; j++) {
                    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), params.leafMaterial);
                    const leafAngle = params.leafAngle + (Math.random() - 0.5) * params.leafAngle;
                    leaf.position.set(
                        Math.sin(leafAngle) * 0.5,
                        0.1,
                        Math.cos(leafAngle) * 0.5
                    );
                    newRoot.add(leaf);
                }
            } else {
                createBranches(newRoot, level + 1);
            }
        }
    }

    createBranches(root, 1);
}

// Generate initial tree
function generateTree() {
    makeTree(0, 0);
}

generateTree();

// Add a person sitting next to the tree
function addPerson() {
    const personGroup = new THREE.Group();

    // Head
    const headGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const headMaterial = new THREE.MeshBasicMaterial({ color: '#ffcc99' });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 1.2, 0);
    personGroup.add(head);

    // Torso
    const torsoGeometry = new THREE.BoxGeometry(0.4, 0.6, 0.2);
    const torsoMaterial = new THREE.MeshBasicMaterial({ color: '#0000ff' });
    const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
    torso.position.set(0, 0.8, 0);
    personGroup.add(torso);

    // Left Arm
    const leftArmGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8);
    const leftArmMaterial = new THREE.MeshBasicMaterial({ color: '#ffcc99' });
    const leftArm = new THREE.Mesh(leftArmGeometry, leftArmMaterial);
    leftArm.position.set(-0.25, 1.1, 0);
    leftArm.rotation.z = Math.PI / 4;
    leftArm.geometry.translate(0, -0.3, 0); // Move the geometry so the top is at the origin
    personGroup.add(leftArm);

    // Right Arm
    const rightArmGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8);
    const rightArmMaterial = new THREE.MeshBasicMaterial({ color: '#ffcc99' });
    const rightArm = new THREE.Mesh(rightArmGeometry, rightArmMaterial);
    rightArm.position.set(0.25, 1.1, 0);
    rightArm.rotation.z = -Math.PI / 4;
    rightArm.geometry.translate(0, -0.3, 0); // Move the geometry so the top is at the origin
    personGroup.add(rightArm);

    // Position the person next to the tree
    personGroup.position.set(1, -0.6, 0);
    scene.add(personGroup);
}

addPerson();

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
const tick = () => {
    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();