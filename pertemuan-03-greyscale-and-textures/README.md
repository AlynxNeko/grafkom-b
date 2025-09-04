# BAB 4. Greyscale

**Greyscale** pada grafika komputer berarti setiap piksel memiliki nilai **R**, **G**, dan **B** yang sama (R = G = B), sehingga warna yang terlihat adalah **tingkat kecerahan** semata. Nilai R=G=G yang **tinggi** → mendekati **putih**; nilai yang **rendah** → mendekati **hitam**.  
Pada bab ini, kita menambahkan **opsi greyscale** ke program berbasis **warna per-vertex** (color) melalui perubahan **shader fragment** dan pengkabelan uniform di JavaScript.  
Dokumen ini **hanya panduan langkah** (tidak mengubah berkas Anda), mengikuti urutan: **Before (color)** → **Greyscale** → **Texture**.

---

## 4.1. Tujuan
- Menyediakan **mix** antara warna asli dan greyscale menggunakan **uniform** `greyScality` (rentang 0..1).  
  `0` = tampilkan **warna asli**, `1` = tampilkan **greyscale** penuh.

---

## 4.2. Modifikasi Shader Fragment (Tambah Greyscale)
**Ubah isi shader fragment** dari yang semula langsung memplot `vColor` menjadi menghitung nilai greyscale dan melakukan *mix*:

```glsl
precision mediump float;
varying vec3 vColor;
uniform float greyScality;

void main(void) {
    float greyScaleValue = (vColor.r + vColor.b + vColor.g) / 3.0;
    vec3 greyScaleColor = vec3(greyScaleValue, greyScaleValue, greyScaleValue);
    vec3 color = mix(vColor, greyScaleColor, greyScality);
    gl_FragColor = vec4(color, 1.0);
}
```

**Catatan**  
- Gunakan nama uniform **persis** `greyScality` (sesuai shader).  
- `mix(a, b, t)` akan mencampur warna asli (`a`) dengan greyscale (`b`) sebesar `t`.

---

## 4.3. Link Uniform `greyScality` di JavaScript
Setelah **link program shader**, **ambil lokasi uniform** dan **simpan** ke variabel:

```javascript
var _greyscality = GL.getUniformLocation(SHADER_PROGRAM, "greyScality");
```

> Letakkan setelah Anda memanggil `GL.linkProgram(SHADER_PROGRAM);` dan sebelum proses render berlangsung.

---

## 4.4. Set Nilai `greyScality` Sebelum Render
Tepat sebelum menggambar (satu kali atau setiap frame sesuai kebutuhan), **set nilai** uniform:

```javascript
GL.uniform1f(_greyscality, 1.0); // 0.0 = warna asli, 1.0 = greyscale penuh
GL.drawElements(GL.TRIANGLES, cube_faces.length, GL.UNSIGNED_SHORT, 0);
```

**Tips uji**  
- Ubah `1.0` → `0.5` untuk melihat campuran warna & greyscale.  
- Jika tidak ada perubahan di layar, pastikan **penamaan uniform** dan **pemanggilan `GL.useProgram(SHADER_PROGRAM)`** sudah benar.

---

## 4.5. Dampak Terhadap Data & Atribut
- **Tidak perlu** mengubah **data vertex** (tetap `(x,y,z,r,g,b)`).  
- **Tidak perlu** mengubah **atribut** (`position` dan `color`) di **vertex shader**.  
- Perubahan **hanya** di **fragment shader** + **link & set uniform** di JavaScript.

---

## 4.6. Output yang Diharapkan
- Saat `greyScality = 1.0`, kubus akan tampil **abu-abu** sepenuhnya.  
- Saat `greyScality = 0.0`, kubus kembali menampilkan **warna per-vertex** seperti semula.



# BAB 5. Texture

**Tekstur** adalah gambar 2D (PNG/JPG) yang dipetakan ke permukaan objek 3D. Proses pemetaan memerlukan **koordinat UV** pada setiap vertex.  
Pada bab ini, kita **mengganti pipeline warna per-vertex** menjadi **texture mapping**: shader memakai **UV** dan **sampler2D**, data vertex menyertakan **(u, v)**, dan JavaScript memuat serta *bind* tekstur.

---

## 5.1. Prasyarat
- Siapkan berkas gambar, misalnya **`texture.png`**, diletakkan **sefolder** dengan `main.js` (atau sesuaikan path).

---

## 5.2. Ubah Shader: Color → UV & Sampler

### 5.2.1. Vertex Shader
Ganti **atribut** dan **varying** dari `color` → `uv`, teruskan ke fragment:
```glsl
attribute vec3 position;
uniform mat4 Pmatrix, Vmatrix, Mmatrix;
attribute vec2 uv;
varying vec2 vUV;

void main(void) {
    gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.);
    vUV = uv;
}
```

### 5.2.2. Fragment Shader
Ganti output warna menjadi **lookup** dari tekstur:
```glsl
precision mediump float;
uniform sampler2D sampler;
varying vec2 vUV;

void main(void) {
    gl_FragColor = texture2D(sampler, vUV);
}
```

---

## 5.3. Link Variabel Shader di JavaScript
Ambil lokasi **atribut `uv`** dan **uniform `sampler`**, lalu *enable* dan set **texture unit**:

```javascript
var _uv = GL.getAttribLocation(SHADER_PROGRAM, "uv");
GL.enableVertexAttribArray(_uv);

var _sampler = GL.getUniformLocation(SHADER_PROGRAM, "sampler");

GL.useProgram(SHADER_PROGRAM);
GL.uniform1i(_sampler, 0); // sampler → TEXTURE0
```

> Pastikan `GL.useProgram(SHADER_PROGRAM);` dipanggil sebelum `uniform1i`.

---

## 5.4. Ubah Data Geometri: Tambahkan UV per Vertex
Ubah format **vertex** menjadi `(x, y, z, u, v)` untuk **6 face** (24 vertex) agar setiap sisi dapat dipetakan dengan rapi:

```javascript
var cube_vertex = [
    // belakang
    -1,-1,-1,    1,0,
    1,-1,-1,    0,0,
    1, 1,-1,    0,1,
    -1, 1,-1,    1,1,

    // depan
    -1,-1, 1,    0,0,
    1,-1, 1,    1,0,
    1, 1, 1,    1,1,
    -1, 1, 1,    0,1,

    // kiri
    -1,-1,-1,    0,0,
    -1, 1,-1,    0,1,
    -1, 1, 1,    1,1,
    -1,-1, 1,    1,0,

    // kanan
    1,-1,-1,    1,0,
    1, 1,-1,    1,1,
    1, 1, 1,    0,1,
    1,-1, 1,    0,0,

    // bawah
    -1,-1,-1,    0,0,
    -1,-1, 1,    0,1,
    1,-1, 1,    1,1,
    1,-1,-1,    1,0,

    // atas
    -1, 1,-1,    0,1,
    -1, 1, 1,    0,0,
    1, 1, 1,    1,0,
    1, 1,-1,    1,1
];
```

**Faces** (disesuaikan untuk data 24 vertex di atas):
```javascript
var cube_faces = [
    0, 1, 2,   0, 2, 3,
    4, 5, 6,   4, 6, 7,
    8, 9,10,   8,10,11,
   12,13,14,  12,14,15,
   16,17,18,  16,18,19,
   20,21,22,  20,22,23
];
```

---

## 5.5. Atur Pointer Atribut: `position` & `uv`
Karena sekarang tiap vertex berisi **5 float** (3 posisi + 2 UV), set **stride** dan **offset** sebagai berikut:

```javascript
GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 2), 0);
GL.vertexAttribPointer(_uv,       2, GL.FLOAT, false, 4 * (3 + 2), 4 * 3);
```

> Pastikan **buffer** `CUBE_VERTEX` sudah **bind** sebelum pemanggilan `vertexAttribPointer`.

---

## 5.6. Fungsi Memuat Tekstur
Tambahkan fungsi **pemuat tekstur** berikut (mendukung **flip Y** dan filter linear):

```javascript
/*========================= TEXTURES =========================*/
var load_texture = function (image_URL) {
    var texture = GL.createTexture();
    var image = new Image();

    image.src = image_URL;
    image.onload = function () {
        GL.bindTexture(GL.TEXTURE_2D, texture);
        GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
        GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
        GL.bindTexture(GL.TEXTURE_2D, null);
    };

    return texture;
};

var cube_texture = load_texture("skybox.png");
```

---

## 5.7. Pilih & Bind Tekstur Saat Render
Sebelum menggambar **setiap frame** (atau sebelum draw saat state berubah), aktifkan **texture unit** dan **bind** tekstur:

```javascript
GL.activeTexture(GL.TEXTURE0);
GL.bindTexture(GL.TEXTURE_2D, cube_texture);
GL.drawElements(GL.TRIANGLES, cube_faces.length, GL.UNSIGNED_SHORT, 0);
```

---

## 5.8. Membersihkan Binding `color` (Opsional – Jika Sudah Pindah ke Tekstur)
Jika Anda **sepenuhnya** beralih ke **tekstur**:  
- Hapus deklarasi dan penggunaan **atribut** `color`.  
- Pastikan **vertex data** dan **pointer atribut** hanya untuk `position` dan `uv`.

> Langkah ini mencegah kebingungan state dan memperjelas pipeline baru (tekstur).

---

## 5.9. Output yang Diharapkan
- Kubus kini menampilkan **gambar tekstur** yang dipetakan sesuai **koordinat UV**.  
- Interaksi (drag/FRICTION/WASD) tetap bekerja seperti sebelumnya, karena berada di luar perubahan shader & data vertex.

---

## 5.10. Troubleshooting Singkat
- **Tekstur tidak terlihat**: cek path `texture.png`, pastikan `GL.uniform1i(_sampler, 0)` dipanggil setelah `GL.useProgram`.  
- **Gambar terbalik vertikal**: `GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);` sudah diaktifkan.  
- **Warna aneh**: pastikan format vertex `(x,y,z,u,v)` dan **stride/offset** sudah tepat.  
- **WebGL error untuk mipmap**: kita **tidak** menggunakan mipmap di sini; gunakan **CLAMP_TO_EDGE** dan **LINEAR** seperti kode di atas (aman untuk ukuran gambar non-power-of-two).

---

## 5.11. Ringkas: Urutan Langkah (Checklist)
1. **Shader**: ganti `color` → `uv` dan pakai `sampler2D` pada fragment.  
2. **JS**: dapatkan lokasi `_uv` & `_sampler`, `enableVertexAttribArray(_uv)`, `uniform1i(_sampler, 0)`.  
3. **Data**: ubah `cube_vertex` menjadi `(x,y,z,u,v)` sebanyak **24 vertex** + sesuaikan `cube_faces`.  
4. **Pointer**: set `vertexAttribPointer` untuk `_position` dan `_uv` dengan stride/offset yang benar.  
5. **Texture**: buat `load_texture()`, panggil `load_texture("texture.png")`.  
6. **Render**: `activeTexture(TEXTURE0)`, `bindTexture(TEXTURE_2D, cube_texture)`, lalu `drawElements`.  

> Setelah langkah 1–6, pipeline **tekstur** sudah aktif dan menggantikan pipeline **warna per-vertex**.

---

**Selesai.**  
Dokumen ini memandu perubahan bertahap dari **color → greyscale → texture** tanpa mengubah berkas Anda secara langsung.
