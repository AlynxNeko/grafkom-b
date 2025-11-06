# 🧭 BAB 15 – Camera in Three.js

In this chapter, we will explore **camera systems** in Three.js — including perspective and orthographic cameras — and learn how to interact with them using **OrbitControls** and **GUI Helpers**.

📘 **Official Docs:** [https://threejs.org/docs/](https://threejs.org/docs/)

---

## 🎥 15.1. Perspective Camera

The most commonly used camera in Three.js is the `PerspectiveCamera`, which provides a realistic sense of **depth** — objects farther away appear smaller.

A Perspective Camera is defined by four parameters: **FoV**, **aspect**, **near**, and **far**.

```js
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 50);
camera.lookAt(0, 0, 0);
```

### 🧱 Setup Geometry

```js
// Geometry
let size = 40;
let geometry = new THREE.PlaneGeometry(size, size);
let material = new THREE.MeshBasicMaterial({
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
material = new THREE.MeshBasicMaterial({ color: '#FA8' });
mesh = new THREE.Mesh(geometry, material);
mesh.position.set(-radius - 1, radius + 2, 0);
scene.add(mesh);

// Box
size = 4;
geometry = new THREE.BoxGeometry(size, size, size);
material = new THREE.MeshBasicMaterial({ color: '#8AC' });
mesh = new THREE.Mesh(geometry, material);
mesh.position.set(size + 1, size / 2, 0);
scene.add(mesh);
```

🟢 **Output:** Scene with flat ground, a sphere, and a cube under perspective view.

---

## 🛰️ 15.2. Orbit Controls

To allow camera movement and user interaction, we use **OrbitControls**.

```js
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 5, 0);
controls.update();
```

🟢 **Output:** The user can now **rotate**, **pan**, and **zoom** the camera interactively.

---

## ⚙️ 15.3. GUI Helper

We can use the `lil-gui` library to **adjust camera parameters** (FOV, near, far) in real time.

```js
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

class MinMaxGUIHelper {
    constructor(obj, minProp, maxProp, minDif) {
        this.obj = obj;
        this.minProp = minProp;
        this.maxProp = maxProp;
        this.minDif = minDif;
    }
    get min() { return this.obj[this.minProp]; }
    set min(v) {
        this.obj[this.minProp] = v;
        this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
    }
    get max() { return this.obj[this.maxProp]; }
    set max(v) {
        this.obj[this.maxProp] = v;
        this.min = this.min;
    }
}

function updateCamera() {
    camera.updateProjectionMatrix();
}

const gui = new GUI();
gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
gui.add(minMaxGUIHelper, 'max', 0.1, 1000, 0.1).name('far').onChange(updateCamera);
```

🟢 **Output:** Adjust camera parameters interactively using the GUI.

---

## 💡 Full Program Example

```js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

// Helper class
class MinMaxGUIHelper {
    constructor(obj, minProp, maxProp, minDif) {
        this.obj = obj;
        this.minProp = minProp;
        this.maxProp = maxProp;
        this.minDif = minDif;
    }
    get min() { return this.obj[this.minProp]; }
    set min(v) {
        this.obj[this.minProp] = v;
        this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
    }
    get max() { return this.obj[this.maxProp]; }
    set max(v) {
        this.obj[this.maxProp] = v;
        this.min = this.min;
    }
}

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Scene & Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 100);
camera.lookAt(0, 0, 0);

// GUI
function updateCamera() { camera.updateProjectionMatrix(); }
const gui = new GUI();
gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
gui.add(minMaxGUIHelper, 'max', 0.1, 1000, 0.1).name('far').onChange(updateCamera);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 5, 0);
controls.update();

// Geometry
let size = 40;
let geometry = new THREE.PlaneGeometry(size, size);
let material = new THREE.MeshBasicMaterial({ color: 0x888888, side: THREE.DoubleSide });
let mesh = new THREE.Mesh(geometry, material);
mesh.rotation.x = -Math.PI / 2;
scene.add(mesh);

let radius = 7;
let widthSegments = 12;
let heightSegments = 8;
geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
material = new THREE.MeshBasicMaterial({ color: '#FA8' });
mesh = new THREE.Mesh(geometry, material);
mesh.position.set(-radius - 1, radius + 2, 0);
scene.add(mesh);

size = 4;
geometry = new THREE.BoxGeometry(size, size, size);
material = new THREE.MeshBasicMaterial({ color: '#8AC' });
mesh = new THREE.Mesh(geometry, material);
mesh.position.set(size + 1, size / 2, 0);
scene.add(mesh);

// Animation Loop
let time_prev = 0;
function animate(time) {
    let dt = time - time_prev;
    dt *= 0.1;

    renderer.render(scene, camera);
    time_prev = time;
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

🟢 **Output:** Interactive 3D scene with camera controls and real-time GUI adjustments.

---

## 🧮 15.4. Orthographic Camera

Unlike the PerspectiveCamera, the `OrthographicCamera` does not apply perspective projection.  
This means objects remain the **same size** regardless of distance from the camera.

Orthographic cameras are often used in **3D modeling** or **game editors** for precise alignment.

```js
const camSize = 50;
const camera = new THREE.OrthographicCamera(-camSize, camSize, camSize, -camSize, 0.1, 1000);
```

🟢 **Output:** Flat projection view with no perspective distortion.

---

# 💡 BAB 16 – Lighting in Three.js

Lighting gives life to the scene.  
Replace all `THREE.MeshBasicMaterial` with `THREE.MeshPhongMaterial` to see lighting effects.

## 🌈 16.1. Ambient Light

```js
var color = 0xFFFFFF;
var intensity = 0.1;
var light = new THREE.AmbientLight(color, intensity);
scene.add(light);
```

> Provides indirect lighting across all objects equally.

## ☀️ 16.2. Hemisphere Light

```js
var skyColor = 0xB1E1FF;  // light blue
var groundColor = 0xB97A20;  // brownish orange
var intensity = 0.5;
var light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
scene.add(light);
```

> Simulates natural ambient lighting from the sky and ground.

## 💨 16.3. Directional Light

```js
var color = 0xFFFFFF;
var intensity = 1;
var light = new THREE.DirectionalLight(color, intensity);
light.position.set(0, 10, 0);
light.target.position.set(-5, 0, 0);
scene.add(light);
scene.add(light.target);
```

> Simulates sunlight from a specific direction.

## 💡 16.4. Point Light

```js
var color = 0xFFFF00;
var intensity = 150;
var distance = 10;
var light = new THREE.PointLight(color, intensity, distance);
light.position.set(0, 0, 0);
scene.add(light);
```

> Emits light from a single point — intensity decreases with distance.

## 🔦 16.5. Spot Light

```js
var color = 0xFF0000;
var intensity = 150;
var distance = 300;
var angle = THREE.MathUtils.degToRad(35);
var light = new THREE.SpotLight(color, intensity, distance, angle);
light.position.set(-20, -20, 0);
light.target.position.set(10, 10, 0);
scene.add(light);
scene.add(light.target);
```

> Emits light in a cone shape, useful for spotlight or flashlight effects.

---

📚 **Summary:**  
- `PerspectiveCamera` gives depth perception.  
- `OrbitControls` enables interactive movement.  
- `GUI` allows dynamic parameter control.  
- `OrthographicCamera` provides flat projection.  
- `Light` types simulate various real-world illumination effects.
