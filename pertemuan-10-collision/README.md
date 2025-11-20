# Collision


## STEP 0 --- Template dasar

Template dari [main.js](main.js)

------------------------------------------------------------------------

## STEP 1 --- Tambah player + movement (WASD + Q/E)

``` js
const PLAYER_SIZE = 4;
const player = new THREE.Mesh(
  new THREE.BoxGeometry(PLAYER_SIZE, PLAYER_SIZE, PLAYER_SIZE),
  new THREE.MeshPhongMaterial({ color: '#8AC', transparent: true, opacity: 1 })
);
player.position.set(0, PLAYER_SIZE/2, 0);
player.castShadow = true;
scene.add(player);

const keys = { w:false, a:false, s:false, d:false, q:false, e:false };

window.addEventListener("keydown", e => {
  const k = e.key.toLowerCase();
  if (keys[k] !== undefined) keys[k] = true;
});
window.addEventListener("keyup", e => {
  const k = e.key.toLowerCase();
  if (keys[k] !== undefined) keys[k] = false;
});

let speed = 0.2;
function movePlayer() {
  if (keys.w) player.position.z -= speed;
  if (keys.s) player.position.z += speed;
  if (keys.a) player.position.x -= speed;
  if (keys.d) player.position.x += speed;
  if (keys.q) player.position.y += speed;
  if (keys.e) player.position.y -= speed;
}
```

------------------------------------------------------------------------

## STEP 2 --- Bounding box player

``` js
let playerBB = new THREE.Box3().setFromObject(player);
```

------------------------------------------------------------------------

## STEP 3 --- Obstacles (Cube + Sphere)

``` js
function randomPos(min, max, safeRadius = 6) {
  let x, z;
  do {
    x = Math.random() * (max - min) + min;
    z = Math.random() * (max - min) + min;
  } while (Math.hypot(x, z) < safeRadius);
  return { x, z };
}

const cubes = [];
const cubesBB = [];

for (let i = 0; i < 5; i++) {
  const c = new THREE.Mesh(
    new THREE.BoxGeometry(3,3,3),
    new THREE.MeshPhongMaterial({ color: '#8AC' })
  );
  const p = randomPos(-15, 15);
  c.position.set(p.x, 1.5, p.z);
  c.castShadow = true;
  scene.add(c);
  cubes.push(c);
  cubesBB.push(new THREE.Box3().setFromObject(c));
}

const spheres = [];
const spheresBB = [];

for (let i = 0; i < 5; i++) {
  const s = new THREE.Mesh(
    new THREE.SphereGeometry(1.5, 12, 8),
    new THREE.MeshPhongMaterial({ color: 'rgba(247,249,144,1)' })
  );
  const p = randomPos(-15, 15);
  s.position.set(p.x, 1.5, p.z);
  s.castShadow = true;
  scene.add(s);
  spheres.push(s);
  spheresBB.push(new THREE.Sphere(s.position.clone(), 1.5));
}
```

------------------------------------------------------------------------

## STEP 4 --- Collision detection

``` js
function updatePlayerBB() {
    playerBB.copy(player.geometry.boundingBox).applyMatrix4(player.matrixWorld);
}

function checkCollision() {
  updatePlayerBB();

  let collided = false;
  let contains = false;

  for (let i = 0; i < cubes.length; i++) {
    cubesBB[i].setFromObject(cubes[i]);
    if (playerBB.containsBox(cubesBB[i])) contains = true;
    else if (playerBB.intersectsBox(cubesBB[i])) collided = true;
  }

  for (let i = 0; i < spheres.length; i++) {
    spheresBB[i].center.copy(spheres[i].position);
    if (playerBB.intersectsSphere(spheresBB[i])) collided = true;
  }

  if (!collided && !contains) {
    player.material.opacity = 1;
    player.material.color.set("#8AC");
  } else if (contains && collided) {
    player.material.opacity = 0.5;
    player.material.color.set("blue");
  } else if (contains) {
    player.material.opacity = 0.5;
    player.material.color.set("green");
  } else {
    player.material.opacity = 0.5;
    player.material.color.set("red");
  }
}
```

------------------------------------------------------------------------

## STEP 5 --- Debug helper (optional)

``` js
const helper = new THREE.Box3Helper(playerBB, 0xff0000);
scene.add(helper);
```

------------------------------------------------------------------------

## STEP 6 --- Animation loop

``` js
let prev = 0;
function animate(t) {
  const dt = (t - prev) * 0.001;
  prev = t;

  movePlayer();
  checkCollision();

  controls.update();
  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

------------------------------------------------------------------------

