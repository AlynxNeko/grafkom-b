# BAB 11 – Phong Shading (Lighting pada Objek 3D)

---

## 🎨 Konsep Dasar Phong Lighting

Dalam grafika komputer, **lighting (pencahayaan)** adalah teknik penting untuk memberikan efek realisme pada objek 3D. Tanpa pencahayaan, objek hanya akan tampak sebagai bentuk berwarna polos tanpa kedalaman.

**Phong Lighting Model** terdiri dari tiga komponen utama:

- 💡 **Ambient** – pencahayaan menyebar merata ke seluruh permukaan (cahaya umum).  
- ☀️ **Diffuse** – pencahayaan tergantung arah cahaya dan orientasi permukaan, memberikan efek terang–gelap.  
- ✨ **Specular** – pantulan cahaya tergantung posisi kamera, memberi efek mengkilap (highlight).

Ketiga komponen ini dikombinasikan untuk menciptakan efek permukaan yang realistis.

---

## 🧰 1. Menambahkan Normal Vector

Agar pencahayaan dapat dihitung, setiap vertex perlu memiliki **normal vector** – vektor tegak lurus permukaan yang digunakan untuk menentukan interaksi cahaya.

Tambahkan atribut `normal` di **vertex shader**:

```glsl
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
uniform mat4 Pmatrix, Vmatrix, Mmatrix;
varying vec3 vNormal;
varying vec2 vUV;

void main(void) {
  gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.);
  vNormal = vec3(Mmatrix * vec4(normal, 0.));
  vUV = uv;
}
```

Lalu hubungkan atribut ini di JavaScript:

```javascript
var _normal = GL.getAttribLocation(SHADER_PROGRAM, "normal");
GL.enableVertexAttribArray(_normal);
```
In render:
```javascript
GL.vertexAttribPointer(_normal, 3, GL.FLOAT, false, 4 * (3 + 3 + 2), 3 * 4);
```

---

## 💡 2. Parameter Sumber Cahaya & Material

Tambahkan konstanta untuk warna cahaya dan properti material di **fragment shader**:

```glsl
precision mediump float;
uniform sampler2D sampler;
varying vec3 vNormal;
varying vec2 vUV;

const vec3 source_ambient_color  = vec3(1.,1.,1.);
const vec3 source_diffuse_color  = vec3(1.,2.,4.);
const vec3 source_specular_color = vec3(1.,1.,1.);
const vec3 source_direction      = vec3(0.,0.,1.);

const vec3 mat_ambient_color  = vec3(0.3,0.3,0.3);
const vec3 mat_diffuse_color  = vec3(1.,1.,1.);
const vec3 mat_specular_color = vec3(1.,1.,1.);
const float mat_shininess = 10.;
```

---

## 🔦 3. Perhitungan Ambient Lighting

Ambient adalah pencahayaan dasar yang menyinari seluruh permukaan secara merata:

```glsl
void main(void) {
  vec3 color = vec3(texture2D(sampler, vUV));
  vec3 I_ambient = source_ambient_color * mat_ambient_color;
  vec3 I = I_ambient;
  gl_FragColor = vec4(I * color, 1.);
}
```

---

## ☀️ 4. Perhitungan Diffuse Lighting

Diffuse tergantung sudut antara arah cahaya dan normal permukaan:

```glsl
vec3 I_diffuse = source_diffuse_color * mat_diffuse_color * max(0., dot(vNormal, source_direction));
vec3 I = I_ambient + I_diffuse;
```

---

## 👁️ 5. Perhitungan Specular Lighting

Specular bergantung pada arah kamera. Tambahkan `vView` di vertex shader:

```glsl
varying vec3 vView;
```
dan di main nya
```glsl
vView = vec3(Vmatrix * Mmatrix * vec4(position, 1.));
```

Kemudian hitung specular di fragment shader:
```glsl
varying vec3 vView;
```
dan di main nya
```glsl
vec3 V = normalize(vView);
vec3 R = reflect(source_direction, vNormal);
vec3 I_specular = source_specular_color * mat_specular_color * pow(max(dot(R, V), 0.), mat_shininess);
vec3 I = I_ambient + I_diffuse + I_specular;
```

Untuk mencegah highlight muncul di area gelap:

```glsl
float lambert = max(0., dot(vNormal, source_direction));
vec3 I_specular = vec3(0.);
if (lambert > 0.) {
  vec3 V = normalize(vView);
  vec3 R = reflect(source_direction, vNormal);
  I_specular = source_specular_color * mat_specular_color * pow(max(dot(R, V), 0.), mat_shininess);
}
```

---

## ✅ Shader Lengkap (Final)

### Vertex Shader

```glsl
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
uniform mat4 Pmatrix, Vmatrix, Mmatrix;
varying vec3 vNormal;
varying vec2 vUV;
varying vec3 vView;

void main(void) {
  gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.);
  vNormal = vec3(Mmatrix * vec4(normal, 0.));
  vView = vec3(Vmatrix * Mmatrix * vec4(position, 1.));
  vUV = uv;
}
```

### Fragment Shader

```glsl
precision mediump float;
uniform sampler2D sampler;
varying vec3 vNormal;
varying vec2 vUV;
varying vec3 vView;

const vec3 source_ambient_color  = vec3(1.,1.,1.);
const vec3 source_diffuse_color  = vec3(1.,2.,4.);
const vec3 source_specular_color = vec3(1.,1.,1.);
const vec3 source_direction      = vec3(0.,0.,1.);

const vec3 mat_ambient_color  = vec3(0.3,0.3,0.3);
const vec3 mat_diffuse_color  = vec3(1.,1.,1.);
const vec3 mat_specular_color = vec3(1.,1.,1.);
const float mat_shininess = 10.;

void main(void) {
  vec3 color = vec3(texture2D(sampler, vUV));

  // Ambient
  vec3 I_ambient = source_ambient_color * mat_ambient_color;

  // Diffuse
  float lambert = max(0., dot(vNormal, source_direction));
  vec3 I_diffuse = source_diffuse_color * mat_diffuse_color * lambert;

  // Specular
  vec3 I_specular = vec3(0.);
  if (lambert > 0.) {
    vec3 V = normalize(vView);
    vec3 R = reflect(source_direction, vNormal);
    I_specular = source_specular_color * mat_specular_color * pow(max(dot(R, V), 0.), mat_shininess);
  }

  vec3 I = I_ambient + I_diffuse + I_specular;
  gl_FragColor = vec4(I * color, 1.);
}
```

---

## 📊 Hasil

✅ Objek 3D kini memiliki pencahayaan realistis:  
- Terang–gelap mengikuti arah cahaya.  
- Permukaan mengkilap saat sudut kamera tepat.  
- Detail geometri lebih jelas dan hidup.

---

## 📚 Ringkasan

| Komponen | Fungsi | Rumus |
|----------|--------|--------|
| Ambient  | Cahaya umum | `I_ambient = source_ambient * mat_ambient` |
| Diffuse  | Efek terang–gelap permukaan | `I_diffuse = source_diffuse * mat_diffuse * max(0, dot(N, L))` |
| Specular | Highlight pantulan | `I_specular = source_specular * mat_specular * pow(max(dot(R, V),0), shininess)` |

---

💡 **Tips:** Pastikan model memiliki **normal vector** yang benar dan sudah dinormalisasi untuk hasil lighting yang optimal.