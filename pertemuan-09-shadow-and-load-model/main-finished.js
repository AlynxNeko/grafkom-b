// Import Three.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mix } from 'three/src/nodes/TSL.js';

// Setup canvas renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Setup Scene and Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 50);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 5, 0);
controls.update();
let geometry, material, mesh, size;

mesh = new THREE.Mesh(geometry, material);
mesh.rotation.x = -Math.PI / 2;
mesh.receiveShadow = true;
mesh.castShadow = true;
scene.add(mesh);

// Ground
size = 40;
geometry = new THREE.PlaneGeometry(size, size);
material = new THREE.MeshPhongMaterial({ color: '#AEA' });
mesh = new THREE.Mesh(geometry, material);
mesh.rotation.x = -Math.PI / 2;
mesh.position.y = 0;
mesh.receiveShadow = true;
mesh.castShadow = true;
scene.add(mesh);

// Sphere
let radius = 7;
let widthSegments = 12;
let heightSegments = 8;
geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
material = new THREE.MeshPhongMaterial({ color: '#FA8', transparent: true, opacity: 0.5 });
mesh = new THREE.Mesh(geometry, material);
mesh.position.set(-radius - 1, radius + 2, 0);
scene.add(mesh);

// Box that side that face us is not rendered
size = 50;
geometry = new THREE.BoxGeometry(size, size, size);
material = new THREE.MeshPhongMaterial({ color: '#AAF', side: THREE.BackSide });;
mesh = new THREE.Mesh(geometry, material);
mesh.position.set(0, size / 3, 0);
mesh.receiveShadow = true;
scene.add(mesh);

// Box
size = 4;
geometry = new THREE.BoxGeometry(size, size, size);
material = new THREE.MeshPhongMaterial({ color: '#8AC' });
mesh = new THREE.Mesh(geometry, material);
mesh.position.set(size + 1, size / 2, 0);
scene.add(mesh);

// Lights
// Directional light
var color = 0xFF0000;
var intensity = 0.5;
var light = new THREE.DirectionalLight(color, intensity);
light.shadow.camera.near = 0.1;
light.shadow.camera.far = 10;
light.shadow.camera.right = 1;
light.shadow.camera.left = -1;
light.shadow.camera.top = 1;
light.shadow.camera.bottom = -1;
light.position.set(20, 20, 0);
light.target.position.set(0, 0, 0);
light.castShadow = true;
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
scene.add(light);
// scene.add(new THREE.CameraHelper(light.shadow.camera));

// Point light
var color = 0xFFFF00;
var intensity = 50;
var distance = 100;
var decay = 1.2;
var light = new THREE.PointLight(color, intensity, distance, decay);
light.position.set(0, 2, 0);
light.castShadow = true;
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
scene.add(light);

let mixer = null;
const loader = new GLTFLoader();
loader.load(
  'astronaut.glb',
  (gltf) => {
    const model = gltf.scene;
    model.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    scene.add(model);

    // Animation setup
    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(model);
      const action = mixer.clipAction(gltf.animations[0]);
      action.play();
    }
  },
  undefined,
  (error) => {
    console.error('Error loading model:', error);
  }
);

// Animation Loop
var time_prev = 0;
function animate(time) {
    var dt = time - time_prev;
    dt *= 0.1;

    if (mixer) mixer.update( dt/100 );
    renderer.render(scene, camera);
    time_prev = time;
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);