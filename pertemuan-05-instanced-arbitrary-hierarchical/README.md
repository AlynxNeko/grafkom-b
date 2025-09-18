# BAB 8–10: Instanced Drawing, Arbitrary Rotation & Hierarchical Object (OOP WebGL)

---

## Ringkasan Singkat

- **Bab 8 (Instanced Drawing)**: menampilkan cara menggambar beberapa objek identik (hemat memori) dengan menggunakan ulang VBO/EBO dan matriks transformasi terpisah untuk tiap instance.  
- **Bab 9 (Arbitrary Rotation)**: rotasi terhadap titik/pusat arbitrary dan terhadap sumbu arbitrary (line through two points) dengan memanipulasi matriks transformasi.  
- **Bab 10 (Hierarchical Object + OOP)**: membangun objek berbentuk class (ES6) dengan `setup()` dan `render()` serta mendukung struktur hirarki (parent-child), Mpos, Mmove, dan Mworld.

---

## Prasyarat

1. WebGL context (`GL`) dan shader program (`SHADER_PROGRAM`) siap.  
2. LIBS util tersedia dengan fungsi-fungsi:
   - `get_I4()`, `set_I4(mat)`, `translateX/Y/Z(mat, v)`  
   - `rotateX/Y/Z(mat, angle)`, `scaleX/Y/Z(mat, s)`  
   - `multiply(m1, m2)`  
3. Uniform/atribut shader: `_Pmatrix`, `_Vmatrix`, `_Mmatrix`, `_position`, `_color`, dll.  
4. Gunakan `type="module"` pada `<script>` untuk ES6 modules:

```html
<script type="module" src="main.js"></script>
```

---

## Struktur File (Contoh)

```
/project
  libs.js
  MyObject.js
  main.js
  index.html
```

---

# BAB 8 — Instanced Drawing (Multiple Object)

### Apa Itu

Instanced drawing = menggambar banyak objek identik dengan **satu set vertex/faces** tapi dengan **transformasi berbeda**.  
Menghemat memori karena VBO/EBO tidak digandakan.

### Tujuan

Membuat 2 (atau lebih) kubus identik dengan posisi berbeda menggunakan kembali VBO/EBO yang sama.  
Masing-masing instance memiliki `MOVEMATRIX` sendiri.

### Langkah-Langkah

1. **Buat dua matrix model untuk instance**:

```javascript
var MOVEMATRIX  = LIBS.get_I4();
var MOVEMATRIX2 = LIBS.get_I4();
```

2. **Sediakan VBO/EBO untuk objek (sekali saja)**.  

3. **Di fungsi animate**: set transform untuk tiap instance sebelum menggambar:

```javascript
// Instance 1
LIBS.set_I4(MOVEMATRIX);
LIBS.translateX(MOVEMATRIX, -2);
LIBS.rotateY(MOVEMATRIX, THETA);
LIBS.rotateX(MOVEMATRIX, PHI);

GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX);
GL.drawElements(GL.TRIANGLES, cube_faces.length, GL.UNSIGNED_SHORT, 0);

// Instance 2 (reuse VBO/EBO)
LIBS.set_I4(MOVEMATRIX2);
LIBS.translateX(MOVEMATRIX2, 2);
LIBS.rotateY(MOVEMATRIX2, THETA);
LIBS.rotateX(MOVEMATRIX2, PHI);

GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX2);
GL.drawElements(GL.TRIANGLES, cube_faces.length, GL.UNSIGNED_SHORT, 0);
```

4. **Output**: dua kubus identik, posisi berbeda. VBO/EBO hanya dibuat sekali.

---

# BAB 9 — Arbitrary Rotation

### Apa Itu

Rotasi terhadap titik atau sumbu yang **tidak berada di origin**.  
Dilakukan dengan kombinasi translasi dan rotasi.

---

## 9.1 Implementasi Fungsi Perkalian Matriks (`libs.js`)

```javascript
multiply: function (m1, m2) {
    var rm = this.get_I4();
    var N = 4;
    for (var i = 0; i < N; i++) {
        for (var j = 0; j < N; j++) {
            rm[i * N + j] = 0;
            for (var k = 0; k < N; k++) {
                rm[i * N + j] += m1[i * N + k] * m2[k * N + j];
            }
        }
    }
    return rm;
}
```

---

## 9.2 Arbitrary Point (Rotasi Terhadap Titik P)

Langkah umum:  
1. Translasi objek supaya pusat rotasi P berpindah ke origin: `T(-P)`  
2. Rotasi di origin  
3. Translasi balik `T(+P)`  

Contoh (rotasi terhadap sumbu Y dengan pusat P(2,0,0)):

```javascript
LIBS.set_I4(MOVEMATRIX);
var temp = LIBS.get_I4();

// Translasi -P (-2,0,0)
LIBS.translateX(temp, -2);
MOVEMATRIX = LIBS.multiply(MOVEMATRIX, temp);

// Rotasi Y
temp = LIBS.get_I4();
LIBS.rotateY(temp, time * 0.001);
MOVEMATRIX = LIBS.multiply(MOVEMATRIX, temp);

// Translasi +P (2,0,0)
temp = LIBS.get_I4();
LIBS.translateX(temp, 2);
MOVEMATRIX = LIBS.multiply(MOVEMATRIX, temp);

GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX);
GL.drawElements(...);
```

---

## 9.3 Arbitrary Axis (Rotasi Terhadap Sumbu P1 → P2)

Langkah umum:  
1. Translasi sehingga P1 ke origin  
2. Rotasi untuk menyelaraskan sumbu (P1→P2) dengan sumbu Z  
3. Rotasi sesuai keinginan terhadap Z  
4. Balikkan rotasi sebelumnya  
5. Translasi balik  

Visualisasi langkah:
[3D rotation about an Arbitrary axis](https://www.youtube.com/watch?v=75o5pmeXUMo)

Contoh (sumbu lewat P1(0,-3,0) dan P2(3,0,0)):

```javascript
LIBS.set_I4(MOVEMATRIX);
var temp = LIBS.get_I4();

// Translasi -P1 = (0, 3, 0)
LIBS.translateY(temp, 3);
MOVEMATRIX = LIBS.multiply(MOVEMATRIX, temp);

// Rotasi X 90°
temp = LIBS.get_I4();
LIBS.rotateX(temp, Math.PI/2);
MOVEMATRIX = LIBS.multiply(MOVEMATRIX, temp);

// Rotasi Y -45°
temp = LIBS.get_I4();
LIBS.rotateY(temp, -Math.PI/4);
MOVEMATRIX = LIBS.multiply(MOVEMATRIX, temp);

// Rotasi Z sesuai waktu
temp = LIBS.get_I4();
LIBS.rotateZ(temp, time * 0.001);
MOVEMATRIX = LIBS.multiply(MOVEMATRIX, temp);

// Balikkan Y
temp = LIBS.get_I4();
LIBS.rotateY(temp, Math.PI/4);
MOVEMATRIX = LIBS.multiply(MOVEMATRIX, temp);

// Balikkan X
temp = LIBS.get_I4();
LIBS.rotateX(temp, -Math.PI/2);
MOVEMATRIX = LIBS.multiply(MOVEMATRIX, temp);

// Translasi balik
temp = LIBS.get_I4();
LIBS.translateY(temp, -3);
MOVEMATRIX = LIBS.multiply(MOVEMATRIX, temp);

GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX);
GL.drawElements(...);
```

---

# BAB 10 — Hierarchical Object (OOP)

Fokus: membuat objek dengan OOP (ES6 class), hubungan parent-child, dan transformasi `Mpos`, `Mmove`, serta `Mworld`.

---

## MyObject.js (Class)

```javascript
// MyObject.js
export class MyObject {
    GL = null;
    SHADER_PROGRAM = null;

    _position = null;
    _color = null;
    _MMatrix = null;

    OBJECT_VERTEX = null;
    OBJECT_FACES = null;

    vertex = [];
    faces = [];

    POSITION_MATRIX = LIBS.get_I4(); // Mpos
    MOVE_MATRIX     = LIBS.get_I4(); // Mmove

    childs = [];

    constructor(GL, SHADER_PROGRAM, _position, _color, _Mmatrix) {
        this.GL = GL;
        this.SHADER_PROGRAM = SHADER_PROGRAM;
        this._position = _position;
        this._color = _color;
        this._MMatrix = _Mmatrix;

        this.vertex = [/* default cube vertex */];
        this.faces  = [/* default cube faces */];
    }

    setup() {
        this.OBJECT_VERTEX = this.GL.createBuffer();
        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(this.vertex), this.GL.STATIC_DRAW);

        this.OBJECT_FACES = this.GL.createBuffer();
        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.bufferData(this.GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces), this.GL.STATIC_DRAW);

        this.childs.forEach(child => child.setup());
    }

    render(PARENT_MATRIX) {
        var Mlocal = LIBS.multiply(this.POSITION_MATRIX, this.MOVE_MATRIX);
        this.MODEL_MATRIX = LIBS.multiply(PARENT_MATRIX, Mlocal);

        this.GL.useProgram(this.SHADER_PROGRAM);
        this.GL.uniformMatrix4fv(this._MMatrix, false, this.MODEL_MATRIX);

        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, 24, 0);
        this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, 24, 12);

        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);

        this.childs.forEach(child => child.render(this.MODEL_MATRIX));
    }
}
```

---

## main.js (Pembuatan Hirarki)

```javascript
import { MyObject } from "./MyObject.js";

var Object1 = new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
var Object2 = new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
var Object3 = new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);

Object1.childs.push(Object2);
Object2.childs.push(Object3);

LIBS.translateX(Object2.POSITION_MATRIX, 5);
LIBS.scaleX(Object2.POSITION_MATRIX, 0.75);
LIBS.scaleY(Object2.POSITION_MATRIX, 0.75);
LIBS.scaleZ(Object2.POSITION_MATRIX, 0.75);

LIBS.translateY(Object3.POSITION_MATRIX, 4);
LIBS.scaleX(Object3.POSITION_MATRIX, 0.75);
LIBS.scaleY(Object3.POSITION_MATRIX, 0.75);
LIBS.scaleZ(Object3.POSITION_MATRIX, 0.75);

Object1.setup();

function animate(t) {
    var dt = t - lastTime; lastTime = t;

    LIBS.rotateY(Object1.MOVE_MATRIX, dt * 0.001);
    LIBS.rotateX(Object2.MOVE_MATRIX, dt * 0.001);
    LIBS.rotateZ(Object3.MOVE_MATRIX, dt * 0.001);

    GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
    GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);

    Object1.render(LIBS.get_I4());
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

---

## Penutup

- **Instanced Drawing** → reuse VBO/EBO + transformasi berbeda  
- **Arbitrary Rotation** → translasi + rotasi untuk arbitrary point/axis  
- **Hierarchical OOP** → class `MyObject` dengan `POSITION_MATRIX`, `MOVE_MATRIX`, `childs`
