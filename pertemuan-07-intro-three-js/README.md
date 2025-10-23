# BAB 12 – Introduction to Three.js

---

## 🌐 Konsep Dasar Three.js

**Three.js** adalah *JavaScript 3D Library* yang dirancang agar mudah digunakan, ringan, lintas browser, serta bersifat *general purpose*.  
Three.js saat ini menggunakan **WebGL** sebagai *renderer* utama.

🔗 Dokumentasi resmi: [https://threejs.org/docs/](https://threejs.org/docs/)

---

## ⚙️ 12.1 Instalasi

### 📁 Struktur Project

```
index.html
main.js
```

### 🔧 Opsi 1: Install dengan NPM dan Build Tool

1. Install **Node.js**
2. Install **three.js** dan **Vite** melalui terminal:

```bash
# three.js 
npm install --save three 

# vite 
npm install --save-dev vite
```

3. Jalankan Vite build server:
```bash
npx vite
```

4. Buka URL yang muncul di terminal, biasanya:  
   👉 `http://localhost:5173`

---

### 🌐 Opsi 2: Import dari CDN

Tambahkan importmap di file **index.html** agar Three.js dapat diimpor langsung dari CDN.

```html
<script type="importmap">
{
    "imports": {
        "three": "https://cdn.jsdelivr.net/npm/three@<version>/build/three.module.js",
        "three/addons/": "https://cdn.jsdelivr.net/npm/three@<version>/examples/jsm/"
    }
}
</script>
```

> ⚠️ Ganti `<version>` sesuai versi NPM yang digunakan.  
> Daftar versi tersedia di: [https://www.npmjs.com/package/three](https://www.npmjs.com/package/three)

Buka file HTML di web browser untuk melihat hasilnya.

---

## 🎬 12.2 Pembuatan Scene

Dalam Three.js, terdapat tiga komponen utama untuk menampilkan objek 3D:

| Komponen | Deskripsi |
|-----------|------------|
| **Scene** | Tempat semua objek 3D, cahaya, dan kamera |
| **Camera** | Sudut pandang atau perspektif pengamat |
| **Renderer** | Komponen yang menggambar (render) objek ke layar |

### 🧩 index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ThreeJS</title>
    <style>
        body { margin: 0; }
        canvas {
            display: block;
            width: 100vw !important;
            height: 100vh !important;
        }
    </style>
    <script type="importmap">
        {
            "imports": {
                "three": "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js",
                "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/"
            }
        }
    </script>
</head>
<body>
    <script type="module" src="./main.js"></script>
</body>
</html>
```

### 💻 main.js

```javascript
import * as THREE from 'three';

// Setup canvas renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Setup Scene and Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);

// Geometry
var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Animation Loop
var time_prev = 0;
function animate(time) {
    var dt = time - time_prev;
    dt *= 0.1;

    cube.rotation.x += 0.01 * dt;
    cube.rotation.y += 0.01 * dt;

    renderer.render(scene, camera);

    time_prev = time;
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

Setelah proses setup dan definisi objek, render dilakukan dalam fungsi `animate()`.

🟢 **Output:** Kubus berwarna hijau berotasi di tengah layar.

---

## 🛰️ 12.3 Menambahkan OrbitControls (Pergerakan Kamera)

**OrbitControls** memungkinkan kamera untuk *orbit* atau bergerak mengelilingi target menggunakan mouse.  
Ini sangat berguna untuk navigasi di ruang 3D.

### 🧩 Import OrbitControls

Tambahkan pada bagian atas **main.js**:

```javascript
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
```

### 💡 Implementasi OrbitControls

Tambahkan kode berikut **setelah inisialisasi kamera dan renderer**:

```javascript
const controls = new OrbitControls(camera, renderer.domElement);

// Atur posisi kamera dan update kontrol
camera.position.set(0, 2, 5);
controls.update();
```

Kemudian **panggil `controls.update()`** di dalam fungsi `animate()` agar kontrol tetap aktif:

```javascript
function animate() {
    requestAnimationFrame(animate);

    // Diperlukan jika enableDamping atau autoRotate diaktifkan
    controls.update();

    renderer.render(scene, camera);
}
```

---

### ⚙️ Properti Penting OrbitControls

| Properti | Fungsi | Default |
|-----------|--------|----------|
| `.enableDamping` | Menambahkan efek inersia saat bergerak | `false` |
| `.dampingFactor` | Kecepatan perlambatan kamera | `0.05` |
| `.autoRotate` | Kamera berputar otomatis mengelilingi target | `false` |
| `.maxDistance` | Jarak maksimum zoom keluar | `Infinity` |
| `.minDistance` | Jarak minimum zoom masuk | `0` |
| `.enablePan` | Aktif/nonaktifkan pergeseran kamera | `true` |
| `.enableZoom` | Aktif/nonaktifkan zoom kamera | `true` |

Contoh aktivasi damping dan rotasi otomatis:

```javascript
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 2.0;
```

---

### 🔗 Referensi Resmi

📚 **OrbitControls Docs:**  
[https://threejs.org/docs/#examples/en/controls/OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls)

📊 **Contoh Implementasi:**  
[https://threejs.org/examples/#misc_controls_orbit](https://threejs.org/examples/#misc_controls_orbit)

---

## ✅ Ringkasan

| Komponen | Fungsi |
|-----------|--------|
| **Scene** | Wadah semua objek 3D |
| **Camera** | Menentukan pandangan pengguna |
| **Renderer** | Menggambar hasil ke layar |
| **OrbitControls** | Menggerakkan kamera menggunakan mouse |

---

💡 **Tips:**  
Gunakan kombinasi `enableDamping` dan `autoRotate` untuk navigasi kamera yang lebih halus dan sinematik.

