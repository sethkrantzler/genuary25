import * as THREE from 'three';
import * as CANNON from 'cannon';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';

var dt = 1/60, R = 0.7;

var clothMass = 10;  // 1 kg in total
var clothSize = 2; // 1 meter
var Nx = 12;
var Ny = 12;
var mass = clothMass / Nx*Ny;

var restDistance = clothSize/Nx;

var ballSize = 0.1;

var clothFunction = plane(restDistance * Nx, restDistance * Ny);

function plane(width, height) {
    return function(u, v) {
        var x = (u-0.5) * width;
        var y = (v+0.5) * height;
        var z = 0;
        return new THREE.Vector3(x, y, z);
    };
}


var container, stats;
var camera, scene, renderer;

var clothGeometry;
var sphereMesh, sphereBody;
var tetrahedron;
var particles = [];
var world;
var composer;
var spotlight1, spotlight2, spotlight3;

initCannon();
init();
animate();

function initCannon(){
    world = new CANNON.World();
    world.broadphase = new CANNON.NaiveBroadphase();
    world.gravity.set(0,-9.82,0);
    world.solver.iterations = 20;

    // Materials
    var clothMaterial = new CANNON.Material();
    var sphereMaterial = new CANNON.Material();
    var clothSphereContactMaterial = new CANNON.ContactMaterial(  clothMaterial,
                                                                  sphereMaterial,
                                                                  0.0, // friction coefficient
                                                                  0.0  // restitution
                                                                  );
    // Adjust constraint equation parameters for ground/ground contact
    clothSphereContactMaterial.contactEquationStiffness = 1e9;
    clothSphereContactMaterial.contactEquationRelaxation = 3;

    // Add contact material to the world
    world.addContactMaterial(clothSphereContactMaterial);

    // Create sphere
    var sphereShape = new CANNON.Sphere(ballSize*1.3);
    sphereBody = new CANNON.Body({
        mass: 0
    });
    sphereBody.addShape(sphereShape);
    sphereBody.position.set(0,0,0);
    world.add(sphereBody);

    // Create cannon particles
    for ( var i = 0, il = Nx+1; i !== il; i++ ) {
        particles.push([]);
        for ( var j = 0, jl = Ny+1; j !== jl; j++ ) {
            var idx = j*(Nx+1) + i;
            var p = clothFunction(i/(Nx+1), j/(Ny+1));
            var particle = new CANNON.Body({
                mass: j==Ny ? 0 : mass
            });
            particle.addShape(new CANNON.Particle());
            particle.linearDamping = 0.5;
            particle.position.set(
                p.x,
                p.y-Ny * 0.9 * restDistance,
                p.z
            );
            particles[i].push(particle);
            world.add(particle);
            particle.velocity.set(0,0,-0.1*(Ny-j));
        }
    }
    function connect(i1,j1,i2,j2){
        world.addConstraint( new CANNON.DistanceConstraint(particles[i1][j1],particles[i2][j2],restDistance) );
    }
    for(var i=0; i<Nx+1; i++){
        for(var j=0; j<Ny+1; j++){
            if(i<Nx) connect(i,j,i+1,j);
            if(j<Ny) connect(i,j,i,j+1);
        }
    }
}

function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    // scene

    scene = new THREE.Scene();

    scene.fog = new THREE.Fog( 0x000000, 500, 10000 );

    // camera

    camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 0.5, 10000 );
    camera.position.set( 0, 2, 4);
    scene.add( camera );

    // Create the cloth geometry
    clothGeometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    
    for (let i = 0; i <= Nx; i++) {
        for (let j = 0; j <= Ny; j++) {
            const u = i / Nx;
            const v = j / Ny;
            const vertex = new THREE.Vector3();
            clothFunction(u, v, vertex);
            vertices.push(vertex.x, vertex.y, vertex.z);
        }
    }
    
    for (let i = 0; i < Nx; i++) {
        for (let j = 0; j < Ny; j++) {
            const a = i * (Ny + 1) + j;
            const b = (i + 1) * (Ny + 1) + j;
            const c = (i + 1) * (Ny + 1) + (j + 1);
            const d = i * (Ny + 1) + (j + 1);
    
            // Two triangles per quad
            indices.push(a, b, d);
            indices.push(b, c, d);
        }
    }
    
    clothGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    clothGeometry.setIndex(indices);
    clothGeometry.computeVertexNormals();
    
    // Now you can use clothGeometry to create a mesh
    const clothMaterial = new THREE.MeshPhongMaterial( {
        ambient: 0x000000,
        color: 0x000000,
        specular: 0x111111,
        emissive: 0x111111,
        shininess: 5,
        side: THREE.DoubleSide
    } );
    const clothMeshLeft = new THREE.Mesh(clothGeometry, clothMaterial);
    const clothMeshRight = new THREE.Mesh(clothGeometry, clothMaterial);
    clothMeshLeft.position.set(-1, 2.5, -2);
    clothMeshRight.position.set(1, 2.5, -2);
    clothMeshLeft.scale.set(2, 4, 2);
    clothMeshRight.scale.set(2, 4, 2);
    clothMeshLeft.rotateY(Math.PI);
    scene.add(clothMeshRight, clothMeshLeft);

    // sphere
    var ballGeo = new THREE.SphereGeometry( ballSize, 20, 20 );
    var ballMaterial = new THREE.MeshPhongMaterial( { color: 0x888888, transparent: true, opacity: 0 } );

    sphereMesh = new THREE.Mesh( ballGeo, ballMaterial );
    sphereMesh.castShadow = true;
    //sphereMesh.receiveShadow = true;
    scene.add( sphereMesh );


    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( scene.fog.color );

    container.appendChild( renderer.domElement );

    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.physicallyBasedShading = true;

    renderer.shadowMapEnabled = true;

    // Set up post-processing
    composer = new EffectComposer(renderer);
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
                float threshold = float(ditherMatrix[index]) / 800.0; // Highly sensitive threshold
                
                vec3 ditheredColor = vec3(
                    color.r > threshold ? 0.2 : 0.0,
                    color.g > threshold ? 0.2 : 0.0,
                    color.b > threshold ? 0.2 : 0.0
                );
                
                gl_FragColor = vec4(ditheredColor, color.a);
            }
        `
    };
    
    // Create the shader pass
    const ditheringPass = new ShaderPass(ditheringShader);
    composer.addPass(ditheringPass);

    window.addEventListener( 'resize', onWindowResize, false );

    // Create blue cylinder
    const cylinderGeometry = new THREE.CylinderGeometry(0.75, 0.75, 2, 32);
    const cylinderMaterial = new THREE.MeshStandardMaterial({ color: '#121212', metalness: 0.2, roughness: 0.1, dithering: false });
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder.position.set(0, 0, 0);
    scene.add(cylinder);

    // Create blue tetrahedron
    const tetrahedronGeometry = new THREE.IcosahedronGeometry(0.5);
    const tetrahedronMaterial = new THREE.MeshPhongMaterial({
        color: 0x000000,
        emissive: 0x000000,
        shininess: 10,
        metalness: 0.8,
        emissiveIntensity: 0.8,
        iridescence: 1,
        iridescenceIOR: 2,
        iridescenceThicknessRange: [ 100, 800 ],
        transparent: true,
        opacity: 0.8
    });
    const tetrahedronMesh = new THREE.Mesh(tetrahedronGeometry, tetrahedronMaterial);
    scene.add(tetrahedronMesh);
    
    tetrahedron = new THREE.Mesh(tetrahedronGeometry, tetrahedronMaterial);
    tetrahedron.position.set(0, 1.5, 0);
    scene.add(tetrahedron);
    camera.lookAt( tetrahedron.position );

    spotlight1 = new THREE.SpotLight(0xffffff, 10);
    spotlight1.position.set(camera.position.x+2, camera.position.y+0.5, camera.position.z);
    spotlight1.angle = Math.PI / 4;
    spotlight1.penumbra = 0.05;
    spotlight1.target = tetrahedron;
    spotlight1.castShadow = true;
    scene.add(spotlight1);
    scene.add(spotlight1.target);

    spotlight2 = new THREE.SpotLight(0xffffff, 10);
    spotlight2.position.set(camera.position.x-2, camera.position.y+0.5, camera.position.z);
    spotlight2.angle = Math.PI / 4;
    spotlight2.penumbra = 0.05;
    spotlight2.target = tetrahedron;
    spotlight2.castShadow = true;
    scene.add(spotlight2);
    scene.add(spotlight2.target);

    spotlight3 = new THREE.SpotLight(0xffffff, 1.5);
    spotlight3.position.set(camera.position.x, camera.position.y+1, -camera.position.z+2);
    spotlight3.angle = Math.PI / 5;
    spotlight3.penumbra = 0.2;
    spotlight3.target = tetrahedron;
    spotlight3.castShadow = true;
    scene.add(spotlight3);
    scene.add(spotlight3.target);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 2, 4);
    scene.add(directionalLight);
}

//

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}
let clock = new THREE.Clock();

function animate() {
    requestAnimationFrame( animate );
    world.step(dt);
    var t = world.time;
    tetrahedron.position.y = 1.75 + Math.sin(t) * 0.05;
    tetrahedron.rotation.y += 0.005;
    spotlight1.target = tetrahedron;
    spotlight2.target = tetrahedron;
    spotlight3.position.y = 1.75 + Math.sin(t) * 0.25;
    sphereBody.position.set(R * Math.sin(t), 0, R * Math.cos(t));
    render();
}

function render() {
    const positionAttribute = clothGeometry.attributes.position;

    for (let i = 0; i <= Nx; i++) {
        for (let j = 0; j <= Ny; j++) {
            const idx = j * (Nx + 1) + i;
            const particlePosition = particles[i][j].position;
            positionAttribute.setXYZ(idx, particlePosition.x, particlePosition.y, particlePosition.z);
        }
    }

    positionAttribute.needsUpdate = true;
    clothGeometry.computeVertexNormals();
    sphereMesh.position.copy(sphereBody.position);   
    composer.render();
}