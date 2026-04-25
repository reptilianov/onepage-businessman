const aspect = 300 / 300;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x444444);
const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
let time = 0;

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(300, 300);
document.getElementById('diamond-container').appendChild(renderer.domElement);

const ambient = new THREE.AmbientLight(0x404040);
scene.add(ambient);
const hemi = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
scene.add(hemi);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.z = 4;

let diamond;

function animate() {
  requestAnimationFrame(animate);

  if (diamond) {
    diamond.rotation.y += 0.01;
  }

  time += 0.02;

  controls.update();

  renderer.render(scene, camera);
};

const gltfLoader = new THREE.GLTFLoader();
gltfLoader.setCrossOrigin('anonymous');
const dracoLoader = new THREE.DRACOLoader();
gltfLoader.setDRACOLoader(dracoLoader);
gltfLoader.load("https://assets.codepen.io/439000/diamond2.glb", function (data) {
  gltf = data;
  diamond = gltf.scene;
  diamond.scale.set(1, 1, 1);
  diamond.position.set(0, 0, 0);
  diamond.castShadow = true;
  diamond.receiveShadow = true;

  const mat = new THREE.MeshPhysicalMaterial({
    map: null,
    color: 0xFFFFFF,
    metalness: 0,
    roughness: 0,
    opacity: 0.3,
    side: THREE.FrontSide,
    transparent: true,
    envMapIntensity: 7,
    premultipliedAlpha: true,
    reflectivity: 2.15
  });
  
  diamond.children[1].material = mat;

  scene.add(diamond);

  new THREE.RGBELoader()
  .load('https://assets.codepen.io/439000/neon_photostudio_1k.hdr', texture => {

    texture.mapping = THREE.EquirectangularReflectionMapping;

    mat.envMap = texture;
    mat.needsUpdate = true;

  });

  animate();
});