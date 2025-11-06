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
camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

// Geometry with 4 height segments
var geometry = new THREE.BoxGeometry(1, 1, 1, 1, 4, 1);
var materials = [
    new THREE.MeshBasicMaterial({ color: 0xff0000 }), // right
    new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // left
    new THREE.MeshBasicMaterial({ color: 0x0000ff }), // top
    new THREE.MeshBasicMaterial({ color: 0xffff00 }), // bottom
    new THREE.MeshBasicMaterial({ color: 0xff00ff }), // front
    new THREE.MeshBasicMaterial({ color: 0x00ffff })  // back
];
var cube = new THREE.Mesh(geometry, materials);
scene.add(cube);

var axes = new THREE.AxesHelper(3);
scene.add(axes);

var minigrid = new THREE.GridHelper(10, 100, 0xff0000, 0x00ffff);
minigrid.linewidth = 0.2;
scene.add(minigrid);

var grid = new THREE.GridHelper(10, 10, 0x00ff00, 0xffffff);
scene.add(grid);

// Animation Loop
var time_prev = 0;
function animate(time) {
    var dt = time - time_prev;
    dt *= 0.1;

    cube.rotation.x += 0.001 * dt;
    cube.rotation.y += 0.001 * dt;
    controls.update();

    renderer.render(scene, camera);
    time_prev = time;
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);