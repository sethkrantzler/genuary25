import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'
import { GUI } from 'lil-gui'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js'

/**
 * Base
 */
const params = {
    gridSize: 14,
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
    rotate: false,
    rotateEase: 'elastic(1, 0.75).out'
};

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x738bce)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/**
 * Camera
 */
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

// Light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(-1, 1, 1);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Shadow settings
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 500;
directionalLight.shadow.camera.left = -5;
directionalLight.shadow.camera.right = 5;
directionalLight.shadow.camera.top = 5;
directionalLight.shadow.camera.bottom = -5;
// Hemisphere Light
const hemisphereLight = new THREE.HemisphereLight(0xF7D842, 0xD40920, 0.3);
scene.add(hemisphereLight);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Composer
 */
const composer = new EffectComposer(renderer)
const renderPass = new RenderPass(scene, camera)
composer.addPass(renderPass)

/**
 * Fabric Shader
 */
const FabricShader = {
    uniforms: {
        'tDiffuse': { value: null },
        'fabricThreadCount': { value: 1393.0 },
        'fabricOpacity': { value: 1 }
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
        uniform float fabricThreadCount;
        uniform float fabricOpacity;
        varying vec2 vUv;

        void main() {
            vec2 uv = vUv * fabricThreadCount;
            vec2 grid = fract(uv) - 0.5;
            float dist = length(grid);
            float circle = smoothstep(0.4, 0.45, dist);
            vec4 color = texture2D(tDiffuse, vUv);
            color.rgb = mix(color.rgb, vec3(0.0), circle * fabricOpacity);
            gl_FragColor = color;
        }
    `
};

let fabricPass = new ShaderPass(FabricShader);
composer.addPass(fabricPass);

/**
 * Abstract Grid Shader
 */
const AbstractGridShader = {
    uniforms: {
        'tDiffuse': { value: null },
        'colorFrequency': { value: 0 },
        'gridDistortion': { value: 0.04 },
        'gridThickness': { value: 0.05 },
        'gridSize': { value: 10.0 },
        'colors': { value: [new THREE.Color(0xff0000), new THREE.Color(0x00ff00), new THREE.Color(0x0000ff), new THREE.Color(0xffff00)] },
        'backgroundColor': { value: new THREE.Color(0x738bce) }
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
        uniform float colorFrequency;
        uniform float gridDistortion;
        uniform float gridThickness;
        uniform float gridSize;
        uniform vec3 colors[4];
        uniform vec3 backgroundColor;
        varying vec2 vUv;

        float random(vec2 co) {
            return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
            vec2 uv = vUv;
            uv += gridDistortion * (random(uv) - 0.5);
            vec2 grid = fract(uv * gridSize) - 0.5;
            float dist = length(grid);
            float line = smoothstep(gridThickness, gridThickness + 0.01, dist);

            vec4 color = texture2D(tDiffuse, vUv);
            if (distance(color.rgb, backgroundColor) < 0.01) {
                if (random(uv) < colorFrequency) {
                    int index = int(random(uv) * 4.0);
                    color.rgb = mix(color.rgb, colors[index], 1.0 - line);
                } else {
                    color.rgb = mix(color.rgb, vec3(1.0), 1.0 - line);
                }
            }

            gl_FragColor = color;
        }
    `
};

let abstractGridPass = new ShaderPass(AbstractGridShader);
composer.addPass(abstractGridPass);

const ShapeGenerator = {
    uniforms: {
        'uResolution': { value: new THREE.Vector2() },
        'uTime': { value: 0.0 },
        'uColors': { value: [new THREE.Color(0xD40920), new THREE.Color(0x1356A2), new THREE.Color(0xF7D842)] },
        'uStep': { value: 50.0 }, // Adjust this value to change grid size
        'uWhite': { value: new THREE.Color(0xF2F5F1) }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec2 uResolution;
        uniform float uTime;
        uniform vec3 uColors[3];
        uniform float uStep;
        uniform vec3 uWhite;
        varying vec2 vUv;

        float random(vec2 co) {
            return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
            vec2 uv = vUv * uResolution;
            vec2 gridUv = floor(uv / uStep);

            // Determine color index based on grid position and time
            int colorIndex = int(mod(gridUv.x + gridUv.y + floor(uTime), 3.0));

            // Mix in white based on random factor
            float mixValue = random(gridUv + floor(uTime));
            vec3 color = mix(uColors[colorIndex], uWhite, mixValue);

            gl_FragColor = vec4(color, 1.0);
        }
    `
};


let shapePass = new ShaderPass(ShapeGenerator);
//composer.addPass(shapePass);

function updateShaders() {
    composer.passes = []; // Clear all passes

    // Add passes in the specified order
    composer.addPass(renderPass);
    //composer.addPass(new ShaderPass(UnrealBloomPass));
    shapePass = new ShaderPass(ShapeGenerator);
    //composer.addPass(shapePass);
    abstractGridPass = new ShaderPass(AbstractGridShader);
    composer.addPass(abstractGridPass);
    fabricPass = new ShaderPass(FabricShader);
    composer.addPass(fabricPass);
}

/**
 * Object
 */

/**
 * Grid and Towers
 */

const colors = [0x00ffff, 0xff00ff, 0xffff00]; // Cyan, Magenta, Yellow
// black material
const blackMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, wireframe: params.wireFrame });


function rotateObject(object) {
    if (!params.rotate) return
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
    const halfGridSize = params.gridSize / 2;
    const doubleGridSize = params.gridSize * 2;

    const hexRadius = 2 * params.gridSize;
    const hexHeight = Math.sqrt(3) * hexRadius / 2;

    for (let q = -1; q <= 1; q++) {
        for (let r = -1; r <= 1; r++) {
            const xOffset = q * hexRadius * 1.5;
            const zOffset = r * hexHeight + (q % 2) * hexHeight / 2;
            for (let i = 0; i < params.gridSize; i++) {
                for (let j = 0; j < params.gridSize; j++) {
                    makeTower(i * 2 + xOffset, j * 2 + zOffset);
                }
            }
        }
    }
    // for (let i = 0; i < 40; i++) {
    //     for (let j = 0; j < 20; j++) {
    //         makeTower(i * params.gap * 20, j * params.gap * 20);
    //     }
    // }

    /**
     * Platform
     */
    if (params.addPlatform) {
        const platformGeometry = new THREE.PlaneGeometry(6 * params.gridSize, 6 * params.gridSize);
        const platformMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.name = 'platform';
        platform.rotation.x = -Math.PI / 2;
        platform.receiveShadow = true;
        platform.position.set(3 * params.gridSize - 1, -params.gap, 3 * params.gridSize - 1);
        scene.add(platform);
    }
}

generateGrid();

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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    composer.setSize(sizes.width, sizes.height);
})

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * GUI
 */
const gui = new GUI();
gui.add(params, 'gridSize', 1, 100, 1).onChange(generateGrid);
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
gui.add(params, 'rotate').onChange(generateGrid);
gui.add(params, 'animationDuration', 0.1, 5, 0.1).onChange(generateGrid);
gui.add(FabricShader.uniforms.fabricThreadCount, 'value', 0, 2000, 1).name('Fabric Thread Count').onChange(() => {
    updateShaders();
});
gui.add(AbstractGridShader.uniforms.colorFrequency, 'value', 0, 1, 0.01).name('Color Frequency').onChange(() => {
    updateShaders();
});
gui.add(AbstractGridShader.uniforms.gridDistortion, 'value', 0, 1, 0.01).name('Grid Distortion').onChange(() => {
    updateShaders();
});
gui.add(AbstractGridShader.uniforms.gridThickness, 'value', 0, 0.1, 0.01).name('Grid Thickness').onChange(() => {
    updateShaders();
});
gui.add(AbstractGridShader.uniforms.gridSize, 'value', 1, 20, 1).name('Grid Size').onChange(() => {
    updateShaders();
});
gui.add(ShapeGenerator.uniforms.uTime, 'value', 0, 100, 0.01).name('Shape Time').onChange(() => {
    updateShaders();
});
gui.add(ShapeGenerator.uniforms.uStep, 'value', 0, window.innerWidth, 1).name('Shape Step').onChange(() => {
    updateShaders();
});

window.addEventListener('keydown', (event) => {
    if (event.key === 'h') {
        gui.domElement.style.display = gui.domElement.style.display === 'none' ? '' : 'none';
    }
});

/**
 * Animate
 */
const clock = new THREE.Clock()
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    composer.render()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()


