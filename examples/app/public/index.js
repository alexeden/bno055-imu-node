const createPointLight = (color, x, y, z) => {
  const light = new THREE.PointLight(0xffffff, 1, 0, 2);
  light.position.set(x, y, z);
  return light;
};

const ws = new WebSocket(`wss://${location.host}`);

const canvas = document.getElementById('model');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window && window.devicePixelRatio || 2);
renderer.setSize(400, 400);

const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 10000);
camera.position.set(0, 0, -5);
camera.aspect = 1;
camera.lookAt(new THREE.Vector3(0, 0, 0));

const scene = new THREE.Scene({ background: new THREE.Color(0xffffff) });
scene.add(createPointLight(0xffffff, 0, 0, 0));
scene.add(createPointLight(0xffffff, 0, 10, 0));
scene.add(createPointLight(0xffffff, 10, 20, 10));
scene.add(createPointLight(0xffffff, -10, -20, -10));
scene.add(createPointLight(0xffffff, 0, 0, 10));
scene.add(new THREE.AmbientLight(0x404040));

const material = new THREE.MeshBasicMaterial({ color: 0x00FFFF });
const geometry = window.geometry = new THREE.BoxGeometry(2, 2, 2);
const mesh = window.mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

renderer.render(scene, camera);


const animate = () => {
  requestAnimationFrame(animate);
  // this.controls.update(this.clock.getDelta());
  renderer.render(scene, camera);
};

animate();
