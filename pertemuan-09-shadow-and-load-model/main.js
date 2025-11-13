// Import Three.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Setup canvas renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Setup Scene and Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 50);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 5, 0);
controls.update();

// Plane
let size = 40;
let geometry = new THREE.PlaneGeometry(size, size);
let material = new THREE.MeshPhongMaterial({
    color: 0x888888,
    side: THREE.DoubleSide,
});

let mesh = new THREE.Mesh(geometry, material);
mesh.rotation.x = -Math.PI / 2;
scene.add(mesh);

// Sphere
let radius = 7;
let widthSegments = 12;
let heightSegments = 8;
geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
material = new THREE.MeshPhongMaterial({ color: '#FA8' });
mesh = new THREE.Mesh(geometry, material);
mesh.position.set(-radius - 1, radius + 2, 0);
scene.add(mesh);

// Box that side that face us is not rendered
size = 50;
geometry = new THREE.BoxGeometry(size, size, size);
material = new THREE.MeshPhongMaterial({ color: '#AAF', side: THREE.BackSide });;
mesh = new THREE.Mesh(geometry, material);
mesh.position.set(0, size / 3, 0);
scene.add(mesh);

// Box
size = 4;
geometry = new THREE.BoxGeometry(size, size, size);
material = new THREE.MeshPhongMaterial({ color: '#8AC' });
mesh = new THREE.Mesh(geometry, material);
mesh.position.set(size + 1, size / 2, 0);
scene.add(mesh);

// Lights
// Ambient light
var color = 0xFFFFFF;
var intensity = 0.1;
var light = new THREE.AmbientLight(color, intensity);
scene.add(light);

// Directional light
var color = 0xFFFFFF;
var intensity = 1;
var light = new THREE.DirectionalLight(color, intensity);
light.position.set(0, 10, 0);
light.target.position.set(-5, 0, 0);
scene.add(light);
scene.add(light.target);

// Point light
var color = 0xFFFF00;
var intensity = 150;
var distance = 10;
var light = new THREE.PointLight(color, intensity, distance);
light.position.set(0, 1, 0);
scene.add(light);

// Spot light
var color = 0xFF0000;
var intensity = 150;
var distance = 300;
var angle = THREE.MathUtils.degToRad(35);
var light = new THREE.SpotLight(color, intensity, distance, angle);
light.position.set(-30, 20, 0);
light.target.position.set(10, 10, 0);
scene.add(light);
scene.add(light.target);

// Animation Loop
var time_prev = 0;
function animate(time) {
    var dt = time - time_prev;
    dt *= 0.1;

    renderer.render(scene, camera);
    time_prev = time;
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);