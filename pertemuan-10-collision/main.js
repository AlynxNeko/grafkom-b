import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- Renderer ---
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// --- Scene ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

// --- Camera ---
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 5, 25);
camera.lookAt(0, 0, 0);

// --- Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;

// --- Light ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 7.5);
dirLight.castShadow = true;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 50;
dirLight.shadow.camera.right = 50;
dirLight.shadow.camera.left = -50;
dirLight.shadow.camera.top = 50;
dirLight.shadow.camera.bottom = -50;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
scene.add(dirLight);

// --- Objects ---
// Ground
let size = 40;
let geometry = new THREE.PlaneGeometry(size, size);
let material = new THREE.MeshPhongMaterial({ color: '#AEA' });
let mesh = new THREE.Mesh(geometry, material);
mesh.rotation.x = -Math.PI / 2;
mesh.position.y = 0;
mesh.receiveShadow = true;
scene.add(mesh);

// Player Box
size = 4;
geometry = new THREE.BoxGeometry(size, size, size);
material = new THREE.MeshPhongMaterial({ color: '#8AC', transparent: true, opacity: 1 });
const player = new THREE.Mesh(geometry, material);
player.position.set(0, size / 2, 0);
player.castShadow = true;
scene.add(player);


// obstacle Cube
let cubes = [];
for (let i = 0; i < 5; i++) {
    let cubeGeo = new THREE.BoxGeometry(3, 3, 3);
    let cubeMat = new THREE.MeshPhongMaterial({ color: '#8AC' });
    let cube = new THREE.Mesh(cubeGeo, cubeMat);
    const min = -15, max = 15;
    const safeRadius = 6;
    let randomx, randomz;
    do {
      randomx = Math.random() * (max - min) + min;
      randomz = Math.random() * (max - min) + min;
    } while (Math.hypot(randomx, randomz) < safeRadius);
    cube.position.set(randomx, 1.5, randomz);
    cube.castShadow = true;
    scene.add(cube);
    cubes.push(cube);
}

// obstacle Sphere
let spheres = [];
for (let i = 0; i < 5; i++) {
    let sphereGeo = new THREE.SphereGeometry(1.5, 12, 8);
    let sphereMat = new THREE.MeshPhongMaterial({ color: 'rgba(247, 249, 144, 1)' });
    let sphere = new THREE.Mesh(sphereGeo, sphereMat);
    const min = -15, max = 15;
    const safeRadius = 6;
    let randomx, randomz;
    do {
      randomx = Math.random() * (max - min) + min;
      randomz = Math.random() * (max - min) + min;
    } while (Math.hypot(randomx, randomz) < safeRadius);
    sphere.position.set(randomx, 1.5, randomz);
    sphere.castShadow = true;
    scene.add(sphere);
    spheres.push(sphere);
}
// --- Animation Loop ---
var time_prev = 0;
function animate(time) {
    var dt = time-time_prev;
    dt *= 0.1; 
    time_prev = time;

    controls.update();
    renderer.render(scene, camera);

    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);