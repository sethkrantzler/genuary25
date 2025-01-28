import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import GUI from 'lil-gui';

/**
 * Base
 */
const params = {
    gridSize: 8,
    gap: 1,
    delayMax: 3,
    wireFrame: false,
    randomColors: false,
    randomColorColumns: false,
    columnGradient: false,
    cubesOnly: true,
    outlineEdges: false,
    rotateEdges: false,
    addPlatform: false,
    addDithering: false,
    singleAxis: true,
    animationDuration: 1,
    rotateEase: 'elastic(1, 0.75).out'
};

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // White background

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

/**
 * Camera
 */
const aspectRatio = sizes.width / sizes.height;
const frustumSize = 35;
const camera = new THREE.OrthographicCamera(
    frustumSize * aspectRatio / -2,
    frustumSize * aspectRatio / 2,
    frustumSize / 2,
    frustumSize / -2,
    0.1,
    200
);
camera.position.set(100, 100, 100);
camera.lookAt(new THREE.Vector3(0, 0, 0));

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

// black material
const blackMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, wireframe: params.wireFrame });

// Set up post-processing
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Custom dithering shader
const ditheringShader = {
    uniforms: {
        'tDiffuse': { value: null },
        'resolution': { value: new THREE.Vector2() }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 resolution;
        varying vec2 vUv;

        const int ditherMatrix[16] = int[16](
            0, 8, 2, 10,
            12, 4, 14, 6,
            3, 11, 1, 9,
            15, 7, 13, 5
        );

        void main() {
            vec4 color = texture2D(tDiffuse, vUv);
            int x = int(mod(gl_FragCoord.x, 4.0));
            int y = int(mod(gl_FragCoord.y, 4.0));
            int index = y * 4 + x;
            float threshold = float(ditherMatrix[index]) / 25.0; // Highly sensitive threshold
            
            vec3 ditheredColor = vec3(
                color.r > threshold ? 1.0 : 0.0,
                color.g > threshold ? 1.0 : 0.0,
                color.b > threshold ? 1.0 : 0.0
            );
            
            gl_FragColor = vec4(ditheredColor, color.a);
        }
    `
};

// Create the shader pass
const ditheringPass = new ShaderPass(ditheringShader);

/**
 * Controls
 */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;


/**
 * Grid and Towers
 */

const colors = [0x00ffff, 0xff00ff, 0xffff00]; // Cyan, Magenta, Yellow

function rotateObject(object) {
    const angle = Math.sign(Math.random() - 0.5) * Math.PI / 2;
    const delay = Math.random() * params.delayMax;
    const axis = Math.random();

    gsap.to(object.rotation, {
        duration: params.animationDuration,
        delay: delay,
        x: axis < 0.33 && !params.singleAxis ? object.rotation.x+angle : object.rotation.x,
        y: axis >= 0.33 && axis < 0.67 && !params.singleAxis ? object.rotation.y+angle : object.rotation.y,
        z: axis >= 0.67 ? object.rotation.z+angle : object.rotation.z,
        ease: params.rotateEase,
        onComplete: () => rotateObject(object)
    });
}

function generateRandomColor()
{
    var randomColor = '#'+Math.floor((Math.random()*16777215+Math.random()*16777215)%16777215).toString(16);
    if(randomColor.length != 7){ // In any case, the color code is invalid
        randomColor = generateRandomColor();
    }
    return randomColor;
    // The random color will be freshly served
}

function makeTower(x, z) {
    const towerGroup = new THREE.Group();
    towerGroup.name = 'towerGroup';
    const geometries = [
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
        new THREE.ConeGeometry(Math.sqrt(2)/2, 1, 4)
    ];
    const materials = colors.map(color => new THREE.MeshStandardMaterial({ color, wireframe: params.wireFrame, transparent: true }));
    const randomColorColumnMaterial = new THREE.MeshStandardMaterial({ color: generateRandomColor(), wireframe: params.wireFrame, transparent: true });
    for (let i = 0; i < params.gridSize; i++) {
        const geometry = params.cubesOnly ? geometries[0] : geometries[Math.floor(Math.random() * geometries.length)];
        const isEdge = ((x == 0 || x == 2*(params.gridSize - 1)) && (z == 0 || z == 2*(params.gridSize - 1))) || (i == params.gridSize - 1 && (x == 0 || x == 2*(params.gridSize - 1) || z == 0 || z == 2*(params.gridSize - 1)) || (i == 0 && (x == 0 || x == 2*(params.gridSize - 1) || z == 0 || z == 2*(params.gridSize - 1))));
        let material;
        if (params.outlineEdges && isEdge) {
            material = blackMaterial;
        } else if (params.randomColors) {
            material = new THREE.MeshStandardMaterial({ color: generateRandomColor(), wireframe: params.wireFrame, transparent: true });
        } else if (params.randomColorColumns) {
            material = randomColorColumnMaterial;
        }
        else {
            material = materials[Math.floor(Math.random() * materials.length)];
        }
        if (params.columnGradient) {
            material = material.clone();
            material.opacity = 1 - i / params.gridSize;
        }

        const mesh = new THREE.Mesh(geometry, material);
        if (geometry.type === 'ConeGeometry') {
            mesh.rotateY(Math.PI/4);
        }
        mesh.position.y = i * (1 + params.gap); // Add gap between objects
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        towerGroup.add(mesh);
        if (!params.rotateEdges && isEdge) {
            continue;
        } else {
            rotateObject(mesh);
        }
    }
    towerGroup.position.set(x, 0, z);
    scene.add(towerGroup);
}

function generateGrid() {
    blackMaterial.wireframe = params.wireFrame;
    while (scene.children.length > 0) {
        const child = scene.children[0];
    
        // Dispose of the geometries of the child and its children
        if (child.geometry) {
            child.geometry.dispose();
        }
        child.children.forEach(subChild => {
            if (subChild.geometry) {
                subChild.geometry.dispose();
            }
        });
    
        // Remove the child from the scene
        scene.remove(child);
    }
    
    /**
     * Light
     */
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x000, 1);
    hemisphereLight.position.set(0, 1, 0);
    scene.add(hemisphereLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(0, params.gridSize+2, params.gridSize+2);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    for (let i = 0; i < params.gridSize; i++) {
        for (let j = 0; j < params.gridSize; j++) {
            makeTower(i * 2, j * 2);
        }
    }
    /**
     * Platform
     */
    if (params.addPlatform) {
        const platformGeometry = new THREE.PlaneGeometry(2*params.gridSize, 2*params.gridSize);
        const platformMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.name = 'platform';
        platform.rotation.x = -Math.PI / 2;
        platform.receiveShadow = true;
        platform.position.set(params.gridSize - 1, -params.gap, params.gridSize - 1);
        scene.add(platform);
    }
    if (params.addDithering) {
        composer.addPass(ditheringPass);
    }
    else {
        composer.passes = composer.passes.filter(pass => pass !== ditheringPass);
    }
}

generateGrid();

/**
 * GUI
 */

// Define the debounce function
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Create the debounced version of generateGrid
const debouncedGenerateGrid = debounce(generateGrid, 2000);

// Create the GUI and add the control with the debounced function

const gui = new GUI();
gui.add(params, 'gridSize', 1, 10, 1).onChange(generateGrid);
gui.add(params, 'gap', 0, 1, 0.01).onChange(generateGrid);
gui.add(params, 'delayMax', 0, 5, 0.1);
gui.add(params, 'outlineEdges').onChange(generateGrid);
gui.add(params, 'randomColors').onChange(generateGrid);
gui.add(params, 'randomColorColumns').onChange(generateGrid);
gui.add(params, 'columnGradient').onChange(generateGrid);
gui.add(params, 'wireFrame').onChange(generateGrid);
gui.add(params, 'cubesOnly').onChange(generateGrid);
gui.add(params, 'rotateEdges').onChange(generateGrid);
gui.add(params, 'addPlatform').onChange(generateGrid);
gui.add(params, 'addDithering').onChange(generateGrid);
gui.add(params, 'singleAxis').onChange(generateGrid);
gui.add(params, 'animationDuration', 0.1, 5, 0.1).onChange(generateGrid);
gui.add(params, 'rotateEase').onChange(debouncedGenerateGrid);

// Add hotkey to hide/show the GUI
window.addEventListener('keydown', (event) => {
    if (event.key === 'h') {
        gui.domElement.style.display = gui.domElement.style.display === 'none' ? '' : 'none';
    }
});

/**
 * Resize event
 */
window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.left = frustumSize * aspectRatio / -2;
    camera.right = frustumSize * aspectRatio / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Animation loop
 */
const animate = () => {
    controls.update();
    composer.render();
    requestAnimationFrame(animate);
};

animate();