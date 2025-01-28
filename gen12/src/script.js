import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color('blue')

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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// buffer scene stuff
const size = 512;
const bufferScene = new THREE.Scene();
const bufferCamera = new THREE.PerspectiveCamera(75, size / size, 0.1, 1000);
bufferCamera.position.z = 5;
const bufferRenderTarget = new THREE.WebGLRenderTarget(size, size);

/**
 * Object
 */
const geometry = new THREE.TorusKnotGeometry()
const material = new THREE.MeshNormalMaterial()
const mesh = new THREE.Mesh(geometry, material)
bufferScene.add(mesh)

function updateObject(mesh) {
    const randomEase = gsap.utils.random([
        "power1.inOut",
        "power2.inOut",
        "power3.inOut",
        "power4.inOut",
        "elastic(1, 0.75).inOut",
    ]);

    const randomDuration = gsap.utils.random(1.5, 4);
    const randomPosition = {
        x: gsap.utils.random(-2, 2),
        y: gsap.utils.random(-2, 2),
        z: gsap.utils.random(-2, 2)
    };
    const randomRotation = {
        x: gsap.utils.random(-Math.PI, Math.PI),
        y: gsap.utils.random(-Math.PI, Math.PI)
    };

    const timeline = gsap.timeline({
        onComplete: () => updateObject(mesh)
    });

    timeline.to(mesh.position, {
        duration: randomDuration,
        x: randomPosition.x,
        y: randomPosition.y,
        z: randomPosition.z,
        ease: randomEase
    });

    timeline.to(mesh.rotation, {
        duration: randomDuration,
        x: randomRotation.x,
        y: randomRotation.y,
        ease: randomEase
    });
}

updateObject(mesh)

const params = {
    shapeCount: 12
};

for (let i = 0; i < params.shapeCount; i++) {
    const geometry = i % 2 === 0 ? new THREE.SphereGeometry(0.5, 4, 4) : new THREE.IcosahedronGeometry(0.5);
    const material = new THREE.MeshBasicMaterial({ 
        color: new THREE.Color(Math.random(), Math.random(), Math.random()),
        wireframe: Math.random() > 0.2
    });
    const shape = new THREE.Mesh(geometry, material);

    shape.position.set(
        gsap.utils.random(-5, 5),
        gsap.utils.random(-5, 5),
        gsap.utils.random(-5, 5)
    );

    bufferScene.add(shape);
    updateObject(shape);
}

function getTri (index) {
    const triHolder = new THREE.Object3D();
    const triGeo = new THREE.CircleGeometry(1, 3);
    const hue = index % 2 === 0 ? 0.33 : 0.66;
    const triMat = new THREE.MeshBasicMaterial({
      map: bufferRenderTarget.texture,
      // color: new THREE.Color().setHSL(hue, 1, 0.5),
      side: THREE.DoubleSide
    });
    const tri = new THREE.Mesh(triGeo, triMat);
    tri.rotation.x = Math.PI * (index % 2);
    tri.position.x = -1;
    triHolder.add(tri);
    triHolder.rotation.z = Math.PI / 3 * index;
    return triHolder;
  }
  
  function getHex (index, radius, offset) {
    const triHolder = new THREE.Object3D();
    for (let i = 0; i < 6; i += 1) {
      triHolder.add(getTri(i));
    }
    const angle = Math.PI / 3 * index + offset;
    if (index !== -1) {
      triHolder.position.x = Math.cos(angle) * radius;
      triHolder.position.y = Math.sin(angle) * radius;
    }
    return triHolder;
  }
  
  for (let i = -1; i < 6; i += 1) {
    scene.add(getHex(i, 3,0));
    scene.add(getHex(i, 5.15, Math.PI/2));
    scene.add(getHex(i, 6, 0));
  }

// debug view
const debugGeo = new THREE.PlaneGeometry(3, 3, 3);
const debugMat = new THREE.MeshBasicMaterial({
  map: bufferRenderTarget.texture,
});
const debugPlane = new THREE.Mesh(debugGeo, debugMat);
debugPlane.visible = false;
scene.add(debugPlane);

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    renderer.setRenderTarget(bufferRenderTarget);
    renderer.render(bufferScene, bufferCamera);
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

function handleKeyUp (evt) {
    if (evt.key === " ") {
      debugPlane.visible = !debugPlane.visible;
    }
    if (evt.key === "h") {
        //gui.hide()
    }
  }
  
window.addEventListener("keyup", handleKeyUp);