import * as THREE from 'three'
import gsap from 'gsap'
import CustomEase from 'gsap/CustomEase'
import GUI from 'lil-gui'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
camera.position.set(0, 999, 0)
camera.rotation.x = -Math.PI/2
scene.add(camera)



/**
 * Resize event
 */
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


/**
 * GUI
 */
const gui = new GUI()
const params = {
    gapSize: 1,
    layers: 100,
    maxX: 100,
    maxZ: 100,
    circle: true,
    innerCircle: 0.5,
    outerCircle: 100,
    particleSize: 0.01
}
const debounceGenerateMillion = debounce(generateMillion, 3000)

function debounce(func, wait) {
    let timeout
    return function(...args) {
        clearTimeout(timeout)
        timeout = setTimeout(() => func.apply(this, args), wait)
    }
}

gui.add(params, 'gapSize', 0, 10, 1).onChange(debounceGenerateMillion)
gui.add(params, 'layers', 1, 100, 1).onChange(debounceGenerateMillion)
gui.add(params, 'maxX', 1, 100, 1).onChange(debounceGenerateMillion)
gui.add(params, 'maxZ', 1, 100, 1).onChange(debounceGenerateMillion)
gui.add(params, 'circle').onChange(debounceGenerateMillion)
gui.add(params, 'innerCircle', 0, 100, 1).onChange(debounceGenerateMillion)
gui.add(params, 'outerCircle', 1, 100, 1).onChange(debounceGenerateMillion)
gui.add(params, 'particleSize', 0, 0.5, 0.0001).onChange(debounceGenerateMillion)

let millionObject

function generateMillion() {
    if (millionObject) {
        scene.remove(millionObject)
    }

    const particles = new Float32Array(1000000 * 3)
    for (let i = 0; i < 1000000; i++) {
        let x,z;
        if (params.circle) {
            const angle = Math.random() * Math.PI * 2;
            const radius = params.innerCircle + Math.random() * (params.outerCircle - params.innerCircle);
            x = Math.cos(angle) * radius;
            z = Math.sin(angle) * radius;
        } else {
            x = (Math.random() * 2 - 1) * params.maxX;
            z = (Math.random() * 2 - 1) * params.maxZ;
        }
        const y = Math.floor(i / (1000000 / params.layers)) * params.gapSize
        particles[i * 3] = x
        particles[i * 3 + 1] = y
        particles[i * 3 + 2] = z
    }

    const colors = new Float32Array(1000000 * 3)
     // Adjust colors so they are never white
     for (let i = 0; i < 1000000; i++) {
        colors[i * 3] = Math.random() * 0.9 // Red
        colors[i * 3 + 1] = Math.random() * 0.9 // Green
        colors[i * 3 + 2] = Math.random() * 0.9 // Blue
    }

    // Make colors additive
    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particles, 3))

    const particleMaterial = new THREE.PointsMaterial({ vertexColors: true, size: params.particleSize })
    particleMaterial.blending = THREE.AdditiveBlending
    millionObject = new THREE.Points(particleGeometry, particleMaterial)
    scene.add(millionObject)
}

// Initial call to generate the particles
generateMillion()

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


/**
 * Animate
 */
const tick = () => {
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

    const timeline = gsap.timeline({ repeat: -1})

    timeline.to(camera.position, {
        y: -1,
        duration: 5,
        ease: 'expo.out',
    })
    timeline.to(camera.position, {
        y: 999,
        duration: 5,
        ease: CustomEase.create("custom", "M0,0 C0.42,0 0.467,0.125 0.5,0.182 0.55,0.268 0.566,0.826 0.765,0.929 0.782,0.938 0.812,0.964 0.83,0.972 0.847,0.981 0.885,0.991 0.905,0.995 0.927,0.999 1,1 1,1 "),
        onComplete: () => {
            if (millionObject) {
                if (params.particleSize === 0.01) {
                    params.particleSize = 0.15
                } else if (params.particleSize === 0.15) {
                    params.particleSize = 0.5
                } else if (params.particleSize === 0.5) {
                    params.particleSize = 0.01
                }
                millionObject.material.size = params.particleSize
            }
        }
        })
    

    window.addEventListener('keydown', (event) => {
        if (event.key === 'h') {
            gui._hidden ? gui.show() : gui.hide()
        }
    })

tick()