# BAB 2. 3D Object

Objek 3D adalah representasi suatu bentuk di ruang tiga dimensi yang
memiliki panjang (**X**), lebar (**Y**), dan kedalaman (**Z**). Dalam
komputer grafis, objek 3D biasanya dibangun dari sekumpulan **vertex**
yang dihubungkan menjadi **edge** dan **face**, sehingga membentuk
**mesh** atau permukaan objek. Dalam WebGL atau grafik komputer, semua
objek 3D pada akhirnya diproyeksikan ke tampilan **2D** di layar melalui
proses **rendering**.

------------------------------------------------------------------------

## 2.1. Transformation

Dalam grafika komputer, **transformasi** adalah proses mengubah posisi,
orientasi, atau ukuran suatu objek pada ruang 2D maupun 3D. Transformasi
umumnya dilakukan melalui tiga operasi utama:

-   **Translasi** → Memindahkan objek dari satu posisi ke posisi lain.
-   **Rotasi** → Memutar objek terhadap titik atau sumbu tertentu.
-   **Skala** → Mengubah ukuran objek secara proporsional atau tidak.

Semua operasi ini direpresentasikan menggunakan **matriks
transformasi**, yang memungkinkan kombinasi transformasi secara efisien.

------------------------------------------------------------------------

## 2.2. Membuat libs.js

Buat file `libs.js` untuk menyimpan fungsi-fungsi transformasi:

``` javascript
var LIBS = {
    degToRad: function (angle) {
        return (angle * Math.PI / 180);
    },

    get_projection: function (angle, a, zMin, zMax) {
        var tan = Math.tan(LIBS.degToRad(0.5 * angle)),
            A = -(zMax + zMin) / (zMax - zMin),
            B = (-2 * zMax * zMin) / (zMax - zMin);

        return [
            0.5 / tan, 0, 0, 0,
            0, 0.5 * a / tan, 0, 0,
            0, 0, A, -1,
            0, 0, B, 0
        ];
    },

    get_I4: function () {
        return [1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1];
    },

    set_I4: function (m) {
        m[0] = 1, m[1] = 0, m[2] = 0, m[3] = 0,
        m[4] = 0, m[5] = 1, m[6] = 0, m[7] = 0,
        m[8] = 0, m[9] = 0, m[10] = 1, m[11] = 0,
        m[12] = 0, m[13] = 0, m[14] = 0, m[15] = 1;
    },

    rotateX: function (m, angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        var mv1 = m[1], mv5 = m[5], mv9 = m[9];
        m[1] = m[1] * c - m[2] * s;
        m[5] = m[5] * c - m[6] * s;
        m[9] = m[9] * c - m[10] * s;

        m[2] = m[2] * c + mv1 * s;
        m[6] = m[6] * c + mv5 * s;
        m[10] = m[10] * c + mv9 * s;
    },

    rotateY: function (m, angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        var mv0 = m[0], mv4 = m[4], mv8 = m[8];
        m[0] = c * m[0] + s * m[2];
        m[4] = c * m[4] + s * m[6];
        m[8] = c * m[8] + s * m[10];

        m[2] = c * m[2] - s * mv0;
        m[6] = c * m[6] - s * mv4;
        m[10] = c * m[10] - s * mv8;
    },

    rotateZ: function (m, angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        var mv0 = m[0], mv4 = m[4], mv8 = m[8];
        m[0] = c * m[0] - s * m[1];
        m[4] = c * m[4] - s * m[5];
        m[8] = c * m[8] - s * m[9];

        m[1] = c * m[1] + s * mv0;
        m[5] = c * m[5] + s * mv4;
        m[9] = c * m[9] + s * mv8;
    },

    translateZ: function (m, t) { m[14] += t; },
    translateX: function (m, t) { m[12] += t; },
    translateY: function (m, t) { m[13] += t; },

    set_position: function (m, x, y, z) {
        m[12] = x; m[13] = y; m[14] = z;
    }
};
```

Tambahkan `libs.js` pada **index.html**:

``` html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <script src="libs.js"></script>
    <script src="main.js"></script>
</head>
<body style="margin: 0">
    <canvas id="mycanvas" style="display: block; width: 100%; height: 100%; background-color: black;"></canvas>
</body>
</html>
```

------------------------------------------------------------------------

## 2.3. Membuat Cube

Pada `main.js`, definisikan vertex dan face untuk kubus, lalu lakukan
inisialisasi:

``` javascript
var cube_vertex = [
    -1, -1, -1, 0, 0, 0,
     1, -1, -1, 1, 0, 0,
     1,  1, -1, 1, 1, 0,
    -1,  1, -1, 0, 1, 0,
    -1, -1,  1, 0, 0, 1,
     1, -1,  1, 1, 0, 1,
     1,  1,  1, 1, 1, 1,
    -1,  1,  1, 0, 1, 1
];

var cube_faces = [
    0, 1, 2, 0, 2, 3,
    4, 5, 6, 4, 6, 7,
    0, 3, 7, 0, 4, 7,
    1, 2, 6, 1, 5, 6,
    2, 3, 6, 3, 7, 6,
    0, 1, 5, 0, 4, 5
];
```

Lakukan inisialisasi buffer:

``` javascript
var CUBE_VERTEX = GL.createBuffer();
GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);
GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(cube_vertex), GL.STATIC_DRAW);

var CUBE_FACES = GL.createBuffer();
GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(cube_faces), GL.STATIC_DRAW);
```

------------------------------------------------------------------------

## 2.4. Modifikasi Shader

Untuk menggambar 3D object, shader perlu menggunakan **projection
matrix**, **view matrix**, dan **model matrix**:

### Vertex Shader

``` glsl
attribute vec3 position;
uniform mat4 Pmatrix, Vmatrix, Mmatrix;
attribute vec3 color;
varying vec3 vColor;

void main(void) {
    gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.);
    vColor = color;
}
```

### Fragment Shader

``` glsl
precision mediump float;
varying vec3 vColor;

void main(void) {
    gl_FragColor = vec4(vColor, 1.);
}
```

------------------------------------------------------------------------
## 2.x. Inisialisasi Uniform Matrix dan Matriks Transformasi

Sebelum menggunakan matriks **projection**, **view**, dan **model** di WebGL, Anda perlu mendapatkan lokasi uniform pada shader program dan menginisialisasi matriks-matriks tersebut. Tambahkan kode berikut setelah inisialisasi shader di `main.js`:

```javascript
// Ambil lokasi uniform matrix dari shader
var _Pmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
var _Vmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
var _Mmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix");

// Inisialisasi matriks transformasi
var PROJMATRIX = LIBS.get_projection(40, CANVAS.width / CANVAS.height, 1, 100);
var MOVEMATRIX = LIBS.get_I4();
var VIEWMATRIX = LIBS.get_I4();

// Geser kamera ke belakang agar objek terlihat
LIBS.translateZ(VIEWMATRIX, -6);
```

Penggunaan matriks-matriks ini saat rendering:

```javascript
GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX);
```

Kode di atas memastikan matriks **projection**, **view**, dan **model** dikirim ke shader sebelum menggambar objek 3D.


## 2.5. Animasi Cube

Tambahkan animasi rotasi pada fungsi `animate`:
Sebelum menggambar dan melakukan animasi, tambahkan setup dan parameter waktu pada fungsi `animate`:

```javascript
/*========================= DRAWING ========================= */
GL.enable(GL.DEPTH_TEST);
GL.depthFunc(GL.LEQUAL);
GL.clearColor(0.0, 0.0, 0.0, 1.0);
GL.clearDepth(1.0);

var time_prev = 0;
var animate = function (time) {
    GL.viewport(0, 0, CANVAS.width, CANVAS.height);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    var dt = time - time_prev;
    time_prev = time;

    LIBS.rotateZ(MOVEMATRIX, dt * 0.001);
    LIBS.rotateY(MOVEMATRIX, dt * 0.001);
    LIBS.rotateX(MOVEMATRIX, dt * 0.001);

    GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
    GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
    GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX);

    GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);
    GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
    GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 4 * 3);
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
    GL.drawElements(GL.TRIANGLES, cube_faces.length, GL.UNSIGNED_SHORT, 0);
    
    GL.flush();
    requestAnimationFrame(animate);
};
animate(0);
```

[cube_spinning](assets/image_cube.png)


# BAB 3: Event pada WebGL

## 3.1 Mouse Event
Bab ini akan membahas bagaimana cara menggerakkan objek menggunakan **mouse**. Kita akan menambahkan event listener untuk menangkap interaksi mouse dan memutar objek berdasarkan pergerakan pengguna.

### Perubahan Utama
- Hapus animasi rotasi otomatis di fungsi `animate` pada BAB sebelumnya.
- Tambahkan variabel **THETA** dan **PHI** untuk menyimpan sudut rotasi.
- Tambahkan fungsi `mouseDown`, `mouseUp`, `mouseMove`, dan event listener-nya.

```javascript
var THETA = 0, PHI = 0;
var drag = false;
var x_prev, y_prev;

var mouseDown = function (e) {
    drag = true;
    x_prev = e.pageX, y_prev = e.pageY;
    e.preventDefault();
    return false;
};

var mouseUp = function (e) {
    drag = false;
};

var mouseMove = function (e) {
    if (!drag) return false;
    var dX = (e.pageX - x_prev) * 2 * Math.PI / CANVAS.width;
    var dY = (e.pageY - y_prev) * 2 * Math.PI / CANVAS.height;
    THETA += dX;
    PHI += dY;
    x_prev = e.pageX, y_prev = e.pageY;
    e.preventDefault();
};

CANVAS.addEventListener("mousedown", mouseDown, false);
CANVAS.addEventListener("mouseup", mouseUp, false);
CANVAS.addEventListener("mouseout", mouseUp, false);
CANVAS.addEventListener("mousemove", mouseMove, false);
```

Lalu di dalam `animate`, ubah rotasi objek menjadi berbasis variabel `THETA` dan `PHI`:

```javascript
LIBS.set_I4(MOVEMATRIX);
LIBS.rotateY(MOVEMATRIX, THETA);
LIBS.rotateX(MOVEMATRIX, PHI);
```

---

## 3.2 Friction
Agar pergerakan lebih **smooth**, kita menambahkan efek **friction**. Friction membuat rotasi melambat secara alami setelah mouse dilepaskan.

### Langkah-langkah
1. Pindahkan deklarasi `dX` dan `dY` ke luar `mouseMove`.
2. Tambahkan variabel **FRICTION**.
3. Modifikasi `mouseMove` untuk menyimpan `dX` dan `dY`.
4. Tambahkan efek friction pada `animate`.

```javascript
var FRICTION = 0.05;
var dX = 0, dY = 0;

var mouseMove = function (e) {
    if (!drag) return false;
    dX = (e.pageX - x_prev) * 2 * Math.PI / CANVAS.width;
    dY = (e.pageY - y_prev) * 2 * Math.PI / CANVAS.height;
    THETA += dX;
    PHI += dY;
    x_prev = e.pageX, y_prev = e.pageY;
    e.preventDefault();
};

// Tambahkan friction pada animate
if (!drag) {
    dX *= (1 - FRICTION);
    dY *= (1 - FRICTION);
    THETA += dX;
    PHI += dY;
}
```

---

## 3.3 Keyboard Input
Untuk menambahkan kontrol dengan keyboard, kita menggunakan tombol **WASD** untuk memutar objek.

### Langkah-langkah
- Tambahkan variabel **SPEED**.
- Buat fungsi `keyDown` untuk menangani input tombol.
- Daftarkan event listener `keydown`.

```javascript
var SPEED = 0.05;

var keyDown = function (e) {
    if (e.key === 'w') {
        dY -= SPEED;
    }
    else if (e.key === 'a') {
        dX -= SPEED;
    }
    else if (e.key === 's') {
        dY += SPEED;
    }
    else if (e.key === 'd') {
        dX += SPEED;
    }
};

window.addEventListener("keydown", keyDown, false);
```

---

## Tugas BAB 3
1. Modifikasi program agar objek bisa **diperbesar dan diperkecil** menggunakan **scroll mouse**.
2. Tambahkan tombol keyboard **Q** dan **E** untuk melakukan **zoom in** dan **zoom out**.
3. Ubah warna objek saat mouse diklik.
