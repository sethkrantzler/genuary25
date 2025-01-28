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

// Fog
scene.fog = new THREE.Fog('white', 10, 100);

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

// Camera
const camera = new THREE.PerspectiveCamera(15, sizes.width / sizes.height, 0.1, 100);
camera.position.set(36, 0.7, 0);
camera.rotateX(Math.PI / 2);
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.shadowMap.enabled = true;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(300, 50, 50);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;  // Default is 512
directionalLight.shadow.mapSize.height = 1024; // Default is 512
directionalLight.shadow.camera.near = 0.5;    // Default is 0.5
directionalLight.shadow.camera.far = 500;     // Default is 500
scene.add(directionalLight);

// Ground
const groundGeometry = new THREE.PlaneGeometry(100, 100, 100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({ color: '#013220', side: THREE.DoubleSide });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.receiveShadow = true;
ground.position.set(0, -0.3, 0);
ground.rotateX(-Math.PI / 2);
scene.add(ground);

// Monument
const geometry = new THREE.CylinderGeometry(1, 1, 4, 128, 128)
const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
        uTime: {value: 0.0},
        shadowMap: { value: null },
        shadowMatrix: { value: directionalLight.shadow.camera.projectionMatrix * directionalLight.shadow.camera.matrixWorldInverse }
    }
  });

const monument = new THREE.Mesh(geometry, material);
monument.position.x = -20;
monument.position.y += 1.7;
monument.castShadow;
monument.receiveShadow;
scene.add(monument);

// fountain things
const fountainGeometry = new THREE.BoxGeometry(1, 0.5, 30);
const fountainMaterial = new THREE.MeshStandardMaterial('lightgrey');
const fountain1 = new THREE.Mesh(fountainGeometry, fountainMaterial);
const fountain2 = new THREE.Mesh(fountainGeometry, fountainMaterial);
const wide = 4;
const fountains = new THREE.Group();
fountains.add(fountain1, fountain2);
fountain1.position.x = -wide;
fountain2.position.x = wide;
fountain1.castShadow = true;
fountain2.castShadow = true;
fountain1.receiveShadow = true;
fountain2.receiveShadow = true;
fountains.rotation.y += Math.PI/2;
scene.add(fountains);


// Sky
const sky = new Sky();
sky.scale.setScalar(45000000);
scene.add(sky);

const skyUniforms = sky.material.uniforms;
skyUniforms['turbidity'].value = 10;
skyUniforms['rayleigh'].value = 2;
skyUniforms['mieCoefficient'].value = 0.005;
skyUniforms['mieDirectionalG'].value = 0.8;

const sun = new THREE.Vector3();

// Position the sun for a sunset effect
const phi = THREE.MathUtils.degToRad(90 - 5); // 5 degrees above the horizon
const theta = THREE.MathUtils.degToRad(180);  // Facing west (sunset)

sun.setFromSphericalCoords(1, phi, theta);
sky.material.uniforms['sunPosition'].value.copy(sun);

// Parameters for tree generation
const params = {
    rootColor: '#8B4513',
    rootMaterial: new THREE.MeshBasicMaterial({ color: '#8B4513' }),
    rootGeometry: new THREE.SphereGeometry(0.1, 8, 8),

    branchColor: '#8B4513',
    branchMaterial: new THREE.MeshBasicMaterial({ color: '#8B4513' }),
    branchGeometry: new THREE.CylinderGeometry(0.01, 0.01, 1, 8),
    branchCount: 3,
    branchCountVariance: 1,
    branchLength: 2,
    branchLengthVariance: 0.5,
    branchAngle: 0.0,
    branchAngleVariance: 0.9,
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

let treeGroup;

// Define constant geometries and materials
const rootGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.75, 8);
const branchGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.5, 8);
const leafGeometry = new THREE.SphereGeometry(0.05, 8, 8);

const rootMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });  // Brown
const branchMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });  // Brown
const leafMaterial = new THREE.MeshStandardMaterial({ color: params.leafColor });

function generateTree() {
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

    const rows = 3;
    const columns = 2;
    const spacingY = 5; // Adjust the spacing between trees as needed
    const spacingX = 12;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            const x = (i - (rows - 1) / 2) * spacingX;
            const z = (j - (columns - 1) / 2) * spacingY;
            makeTree(x, z);
        }
    }
}

function makeTree(x, z) {
    const root = new THREE.Mesh(rootGeometry, rootMaterial);
    root.position.set(x, 0, z);
    root.castShadow = true;
    treeGroup.add(root);

    function createBranches(parent, level) {
        if (level > params.branchLevels) return;

        const branchCount = params.branchCount + Math.floor(Math.random() * params.branchCountVariance);
        for (let i = 0; i < branchCount; i++) {
            const branch = new THREE.Mesh(branchGeometry, params.branchMaterial);
            const branchAngle = params.branchAngle + (Math.random() - 0.5) * params.branchAngleVariance;
            branch.position.set(0, 0, 0);
            branch.rotation.set(branchAngle, (Math.random() - 0.5) * Math.PI * 2, 0);
            branch.geometry.translate(0, 0.5 / 2, 0); // Move the geometry so the bottom is at the origin
            parent.add(branch);
            branch.castShadow = true;

            const newRoot = new THREE.Mesh(rootGeometry, rootMaterial);
            newRoot.position.set(0, 0.5, 0);
            newRoot.castShadow = true;
            branch.add(newRoot);

            const terminateEarly = level + Math.floor(Math.random() * params.branchLevelsVariance);
            if (terminateEarly >= params.branchLevels) {
                for (let j = 0; j < params.leafCount; j++) {
                    const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
                    const leafAngle = params.leafAngle + (Math.random() - 0.5) * params.leafAngle;
                    leaf.position.set(
                        Math.sin(leafAngle) * 0.2,
                        0.4,
                        Math.cos(leafAngle) * 0.2
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

generateTree();


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

    material.uniforms.shadowMap.value = directionalLight.shadow.map.texture;
    material.uniforms.shadowMatrix.value = directionalLight.shadow.camera.projectionMatrix * directionalLight.shadow.camera.matrixWorldInverse;
    window.requestAnimationFrame(tick);
};

tick();