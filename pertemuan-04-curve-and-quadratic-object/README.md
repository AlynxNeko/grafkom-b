# B-Spline Curve dengan WebGL

Pada bab sebelumnya kita sudah membuat **triangle** sederhana.  
Sekarang kita akan memodifikasi kode tersebut agar dapat menggambar **kurva B-Spline** menggunakan **control point**.

---

## Menambahkan Fungsi `generateBSpline`

Ganti bagian awal fungsi `main` di `main.js` dengan menambahkan fungsi baru:

```javascript
function generateBSpline(controlPoint, m, degree) {
    var curves = [];
    var knotVector = [];
    var n = controlPoint.length / 2;

    // Generate knot vector
    for (var i = 0; i < n + degree + 1; i++) {
        if (i < degree + 1) knotVector.push(0);
        else if (i >= n) knotVector.push(n - degree);
        else knotVector.push(i - degree);
    }

    // Basis function
    var basisFunc = function (i, j, t) {
        if (j == 0) {
            return (knotVector[i] <= t && t < knotVector[i + 1]) ? 1 : 0;
        }
        var den1 = knotVector[i + j] - knotVector[i];
        var den2 = knotVector[i + j + 1] - knotVector[i + 1];

        var term1 = 0, term2 = 0;
        if (den1 != 0 && !isNaN(den1)) {
            term1 = ((t - knotVector[i]) / den1) * basisFunc(i, j - 1, t);
        }
        if (den2 != 0 && !isNaN(den2)) {
            term2 = ((knotVector[i + j + 1] - t) / den2) * basisFunc(i + 1, j - 1, t);
        }
        return term1 + term2;
    };

    for (var t = 0; t < m; t++) {
        var x = 0, y = 0;
        var u = (t / m * (knotVector[n] - knotVector[degree])) + knotVector[degree];
        for (var key = 0; key < n; key++) {
            var C = basisFunc(key, degree, u);
            x += (controlPoint[key * 2] * C);
            y += (controlPoint[key * 2 + 1] * C);
        }
        curves.push(x);
        curves.push(y);
    }
    return curves;
}
```

---

## Mengganti Vertex dengan Control Point

Hapus deklarasi `triangle_vertex` dan ganti dengan `bSpline_controlPoint`:

```javascript
var bSpline_controlPoint = [
    -1.0, -1.0,
    -1.0,  1.0,
     1.0,  1.0,
     1.0, -1.0
];

var bSpline_vertex = generateBSpline(bSpline_controlPoint, 20, 2);

var SPLINE_VERTEX = GL.createBuffer();
GL.bindBuffer(GL.ARRAY_BUFFER, SPLINE_VERTEX);
GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(bSpline_vertex), GL.STATIC_DRAW);
```

---

## Mengganti Draw Mode

Sebelumnya kita menggunakan:

```javascript
GL.bindBuffer(GL.ARRAY_BUFFER, TRIANGLE_VERTEX);
...
GL.drawArrays(GL.TRIANGLES, 0, triangle_vertex.length / 2);
```

Sekarang kita ganti dengan:

```javascript
GL.bindBuffer(GL.ARRAY_BUFFER, SPLINE_VERTEX);
...
GL.drawArrays(GL.LINE_STRIP, 0, bSpline_vertex.length / 2);
```

Sehingga hasil yang digambar adalah kurva **B-Spline**.

---


---------------------------------------------------------------------------



# BAB 6. Quadric Object

Objek kuadrik sering digunakan dalam komputer grafik karena mempunyai bentuk yang bagus. Objek kuadrik dibentuk dengan menggunakan persamaan kuadrik.  
Ada 6 tipe dasar objek kuadrik:

1. **Ellipsoid**  
2. **Paraboloid**  
3. **Elliptic cone**  
4. **Hyperboloid satu sisi**  
5. **Hyperboloid dua sisi**  
6. **Hyperbolic paraboloid**

Persamaan parametrik untuk masing-masing bentuk dapat dituliskan sebagai berikut:

| Nama Kuadrik             | X(u,v)           | Y(u,v)           | Z(u,v)         | v-range              | u-range    |
|---------------------------|------------------|------------------|----------------|----------------------|------------|
| **Ellipsoid**             | a cos(v) cos(u) | b cos(v) sin(u)  | c sin(v)       | (-π/2, π/2)          | (-π, π)    |
| **Hyperboloid satu sisi** | a sec(v) cos(u) | b sec(v) sin(u)  | c tan(v)       | (-π/2, π/2)          | (-π, π)    |
| **Hyperboloid dua sisi**  | a tan(v) cos(u) | b tan(v) sin(u)  | c sec(v)       | (-π/2, π/2) ∪ (π/2,3π/2) | (-π, π)    |
| **Elliptic cone**         | av cos(u)       | bv sin(u)        | cv             | semua bil            | (-π, π)    |
| **Elliptic paraboloid**   | av cos(u)       | bv sin(u)        | v²             | v ≥ 0                | (-π, π)    |
| **Hyperbolic paraboloid** | av tan(u)       | bv sec(u)        | v²             | v ≥ 0                | (-π, π)    |

---

## 6.1 Membuat Ellipsoid dengan Vertex Color

Kita bisa membuat **ellipsoid** dengan menggunakan fungsi `generateSphere` berikut:

```javascript
function generateSphere(a, b, c, stack, step) {
    var vertices = [];
    var faces = [];

    // Generate vertices and colors
    for (var i = 0; i <= stack; i++) {
        var u = i / stack * Math.PI - (Math.PI / 2); // Latitude
        for (var j = 0; j <= step; j++) {
            var v = j / step * 2 * Math.PI - Math.PI; // Longitude

            var x = a * Math.cos(v) * Math.cos(u);
            var y = b * Math.sin(u);
            var z = c * Math.sin(v) * Math.cos(u);

            // Push vertex position
            vertices.push(x, y, z);
            // Push color data (derived from position)
            vertices.push(...[x, y, z].map(val => val / 2 + 0.5));
        }
    }

    // Generate faces (indices)
    for (var i = 0; i < stack; i++) {
        for (var j = 0; j < step; j++) {
            // Index of the 4 vertices forming a quad
            var first = i * (step + 1) + j;
            var second = first + 1;
            var third = first + (step + 1);
            var fourth = third + 1;

            // Push two triangles to form the quad
            faces.push(first, second, fourth);
            faces.push(first, fourth, third);
        }
    }
    return { vertices, faces };
}

```

---

## 6.2 Menginisialisasi Data Objek

```javascript
var sphere = generateSphere(1, 1, 1, 20, 20);

// Vertex + warna
var object_vertex = sphere.vertices;

// Faces
var object_faces = sphere.faces;
```

---

## 6.3 Buffering Data

```javascript
// Buffer untuk vertex (posisi + warna)
var OBJECT_VERTEX = GL.createBuffer();
GL.bindBuffer(GL.ARRAY_BUFFER, OBJECT_VERTEX);
GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(object_vertex), GL.STATIC_DRAW);

// Buffer untuk faces
var OBJECT_FACES = GL.createBuffer();
GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, OBJECT_FACES);
GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(object_faces), GL.STATIC_DRAW);
```

---

## 6.4 Rendering

```javascript

    GL.bindBuffer(GL.ARRAY_BUFFER, OBJECT_VERTEX);
    GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
    GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 4 * 3);

    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, OBJECT_FACES);
    GL.drawElements(GL.TRIANGLES, object_faces.length, GL.UNSIGNED_SHORT, 0);

    GL.flush();
    window.requestAnimationFrame(animate);
```

---

## 6.5 Hasil

Ellipsoid dengan shader **vertex color** akan terlihat seperti bola 3D dengan warna gradasi RGB.
