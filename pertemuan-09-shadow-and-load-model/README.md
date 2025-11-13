# BAB 17. Shadow

ThreeJS secara default menggunakan **shadow maps**. Shadow map bekerja dengan menghitung setiap pancaran cahaya terhadap seluruh object yang diset untuk menerima bayangan yang kemudian dirender pada setiap point of view dari masing-masing cahaya.

Untuk menyalakan shadow map dapat dilakukan pada renderer.
```js
renderer.shadowMap.enabled = true;
```

Kemudian, tentukan object yang akan menerima bayangan.
```js
mesh.receiveShadow = true;
```

Lalu, tentukan pula object yang akan menghasilkan bayangan.
```js
mesh.castShadow = true;
```

Selanjutnya tentukan sumber cahaya yang akan menghasilkan bayangan.
```js
light.castShadow = true;
```

Terdapat **3 jenis cahaya** yang dapat menghasilkan shadow map yaitu:
- DirectionalLight
- PointLight
- SpotLight


## 17.1. DirectionalLight’s Shadow

Berdasarkan gambar diatas, ada beberapa bagian bayangan yang tidak muncul pada hasil render. Hal ini dikarenakan shadow map dirender berdasarkan sudut pandang cahaya.

Untuk melakukan proses debug pada sudut pandang cahaya dalam memproses bayangan, kita dapat menggunakan **CameraHelper**.
```js
scene.add(new THREE.CameraHelper(light.shadow.camera));
```

Proses perhitungan bayangan pada DirectionalLight menggunakan **OrthographicCamera** yang didefinisikan dengan left, right, top, bottom, near, far, dan zoom.
```js
light.shadow.camera.near = 0.1;
light.shadow.camera.far = 50;
light.shadow.camera.right = 15;
light.shadow.camera.left = -15;
light.shadow.camera.top = 15;
light.shadow.camera.bottom = -15;
```

Salah satu kendala dalam penggunaan shadowMap adalah pengaturan resolusi yang perlu disesuaikan. ShadowMap bekerja dengan membuat texture yang dikenakan pada object yang telah diset untuk menerima bayangan. Untuk mengatur resolusi dari shadowMap texture:
```js
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
```

Secara default, ukuran texture dari shadowMap adalah **512x512**.

**Output:**


## 17.2. SpotLight’s Shadow

SpotLight memanfaatkan **PerspectiveCamera** untuk menghitung bayangan yang dihasilkan. Setting dari Fov dan sudut kamera akan langsung mengikuti cahaya yang digunakan, hal ini sedikit berbeda dengan DirectionalLight yang perlu disetup secara manual.
```js
var helper = new THREE.CameraHelper(light.shadow.camera);
renderer.render(scene, camera);
helper.update();
```

Lakukan render sekali lalu panggil fungsi update pada helper.

**Output:**


## 17.3. PointLight’s Shadow

Dikarenakan PointLight memancarkan cahaya keseluruh arah, maka setup yang akan memengaruhi perhitungan shadowMap hanya **near** dan **far** dari ShadowCamera. Perhitungan dilakukan dengan membentuk sebuah kubus yang berada disekitar cahaya dan menghitung pada setiap sisinya.

```js
scene.add(new THREE.PointLightHelper(light));
```

Hal ini menunjukkan bahwa proses perhitungan PointLight dilakukan sebanyak **6x** untuk setiap sisi.

**Output:**


## 17.4. Transparency

Untuk mengubah transparansi dari suatu objek di THREE JS, tambahkan kode berikut pada material mesh.
```js
var material = new THREE.MeshPhongMaterial({ color: 0xFFFF00, transparent: true, opacity: 0.5 });
```

**Output:**


---

# BAB 18. Load Custom Model

Untuk melakukan proses penggunaan custom model, ThreeJS membuat **addons module** berupa loader. Loader ini digunakan untuk mengambil file model 3D eksternal dan menampilkannya ke dalam scene.

List dari loader dapat diakses pada dokumentasi Three.js.

## 18.1. GLTF Loader (Rekomendasi)

Format **glTF (.glb / .gltf)** adalah format modern yang direkomendasikan untuk digunakan di Three.js. Format ini ringan, cepat dimuat, dan mendukung berbagai fitur seperti:

- Meshes, materials, textures  
- Skeletons & animations  
- Morph targets  
- Lights dan cameras  

```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('path/to/model.glb', function (gltf) {
    scene.add(gltf.scene);
}, undefined, function (error) {
    console.error(error);
});
```

**Output:**


## 18.2. OBJ & MTL Loader

File **OBJ** hanya menyimpan data geometri, tanpa material. Oleh karena itu, biasanya disertai dengan file **MTL** (Material Template Library).

```js
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

const mtlLoader = new MTLLoader();
mtlLoader.load('model.mtl', function (materials) {
    materials.preload();

    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load('model.obj', function (object) {
        scene.add(object);
    });
});
```

Catatan: File OBJ tidak mengandung animasi dan dianggap sebagai 1 mesh statis.

**Output:**


## 18.3. FBX Loader

Format **FBX** mendukung animasi dan hierarki kompleks. Loader-nya dapat digunakan seperti berikut:

```js
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

const loader = new FBXLoader();
loader.load('path/to/model.fbx', function (object) {
    object.traverse(function (child) {
        if (child.isMesh) {
            child.castShadow = true;
        }
    });
    scene.add(object);
});
```

Untuk menjalankan animasi di dalam file FBX, gunakan **AnimationMixer**:
```js
const mixer = new THREE.AnimationMixer(object);
const action = mixer.clipAction(object.animations[0]);
action.play();
```

Selalu pastikan bahwa mixer telah terinisialisasi sebelum dijalankan.

**Output:**


## 18.4. Troubleshooting

Jika model tidak muncul atau tampil aneh, lakukan langkah-langkah berikut:

1. Periksa console JavaScript untuk pesan error.  
2. Coba tampilkan model di viewer lain seperti **three.js viewer** atau **babylon.js viewer**.  
3. Coba ubah skala model (misal dikalikan 1000).  
4. Pastikan ada sumber cahaya pada scene.  
5. Periksa path texture (gunakan relative path seperti `images/texture.jpg`).

Jika tetap tidak berfungsi, tanyakan di forum Three.js dengan menyertakan contoh file atau demo sederhana.

**Output:**


---

**Referensi:**
- [Three.js Manual - Loading 3D Models](https://threejs.org/manual/#en/loading-3d-models)
- [Three.js Documentation](https://threejs.org/docs/#manual/en/introduction/Loading-3D-models)
