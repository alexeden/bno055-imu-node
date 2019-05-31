const createPointLight = (color, x, y, z) => {
  const light = new THREE.PointLight(0xffffff, 1, 0, 2);
  light.position.set(x, y, z);
  return light;
};

const canvas = document.getElementById('model');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window && window.devicePixelRatio || 2);
renderer.setSize(window.innerWidth, window.innerHeight);

const camera = window.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 10000);
camera.position.set(0, -50, 0);
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
camera.lookAt(new THREE.Vector3(0, 0, 0));

const scene = new THREE.Scene({ background: new THREE.Color(0xffffff) });
scene.background = new THREE.Color(0xFFFFFF);
scene.add(createPointLight(0xffffff, 0, 0, 0));
scene.add(createPointLight(0xffffff, 0, 10, 0));
scene.add(createPointLight(0xffffff, 10, 20, 10));
scene.add(createPointLight(0xffffff, -10, -20, -10));
scene.add(createPointLight(0xffffff, 0, 0, 10));
scene.add(new THREE.AmbientLight(0x404040));

const material = new THREE.MeshLambertMaterial({
  color: 0x005cb5,
});
const h = 20;
const w = 27;
const d = 1.5;
const r = 5.08 / 2;

const corners = new THREE.Shape();
const board = new THREE.Shape();

board.moveTo(r, 0);
board.lineTo(r, 0);
board.lineTo(w - r, 0);
board.lineTo(w, r);
board.lineTo(w, h - r);
board.lineTo(w - r, h);
board.lineTo(r, h);
board.lineTo(0, h - r);
board.lineTo(0, r);
board.lineTo(r, 0);
board.closePath();

corners.moveTo(r, r);
corners.arc(0, 0, r, 0, 2 * Math.PI, false);
corners.moveTo(r, h - r);
corners.arc(0, 0, r, 0, 2 * Math.PI, false);
corners.closePath();
corners.moveTo(w - r, r);
corners.arc(0, 0, r, 0, 2 * Math.PI, false);
corners.closePath();
corners.moveTo(w - r, h - r);
corners.arc(0, 0, r, 0, 2 * Math.PI, false);
corners.closePath();

board.add(corners);

const geometry = new THREE.ExtrudeGeometry(board, { bevelEnabled: false, depth: d });
geometry.translate(-w / 2, -h / 2, -d / 2);

const mesh = window.mesh = new THREE.Mesh(geometry, material);
mesh.matrixAutoUpdate = false;
scene.add(mesh);

renderer.render(scene, camera);

const ws = new WebSocket(`wss://${location.host}`);

ws.addEventListener('message', message => {
  const { x, y, z, w } = JSON.parse(message.data);
  const sum = Math.abs(x) + Math.abs(y) + Math.abs(z) + Math.abs(w);
  if (sum < 1) return;
  mesh.quaternion.set(x, y, z, w);
  mesh.updateMatrix();
});

const animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
};

animate();
