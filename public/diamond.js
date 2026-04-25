console.log('Diamond script loading...');

// =====================================================================
// DIAMOND CONFIGURATION NOTES:
// =====================================================================
// 1. COLORS: Modify the colors array inside createDiamondScene() function
// 2. POSITIONS: Diamond positions are controlled in index.astro HTML
//    Look for elements with class "diamond-container" and modify their
//    style attributes (top, bottom, left, right, width, height)
// 3. SCROLL MOVEMENT: Controlled via data-scroll-speed attribute in HTML
// =====================================================================

// Global flag to track loading
let diamondsLoaded = 0;
let totalDiamondsExpected = 0; // Will be set based on container count

// Set a timeout to show error if diamonds don't load
setTimeout(function() {
  if (diamondsLoaded === 0 && totalDiamondsExpected > 0) {
    console.error('Diamonds failed to load within timeout');
    const loadingMsgs = document.querySelectorAll('.diamond-loading');
    loadingMsgs.forEach(msg => {
      msg.textContent = 'Failed to load diamond. Check console for errors.';
      msg.style.color = 'red';
    });
  }
}, 10000); // 10 second timeout

// Function to create a diamond scene in a given container
function createDiamondScene(container, index) {
  console.log(`Creating diamond scene #${index} in container:`, container);
  
  // Check if Three.js is loaded
  if (typeof THREE === 'undefined') {
    console.error('THREE is not defined. Make sure Three.js is loaded before diamond.js');
    const loadingMsg = container.querySelector('.diamond-loading');
    if (loadingMsg) {
      loadingMsg.textContent = 'Three.js not loaded. Check network.';
      loadingMsg.style.color = 'red';
    }
    return null;
  }
  
  console.log(`Three.js version for diamond #${index}:`, THREE.REVISION);
  
  // Get container dimensions
  const width = container.clientWidth || 300;
  const height = container.clientHeight || 300;
  const aspect = width / height;
  const scene = new THREE.Scene();
  scene.background = null; // Transparent background
  
  // Increased field of view to ensure diamonds fit completely in canvas
  const camera = new THREE.PerspectiveCamera(85, aspect, 0.1, 1000);
  let time = 0;
  
  const renderer = new THREE.WebGLRenderer({ 
    alpha: true,
    antialias: true 
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);
  
  console.log(`Renderer created and appended for diamond #${index}`);

  // Lights - each diamond gets its own lights
  const ambient = new THREE.AmbientLight(0x606060);
  scene.add(ambient);
  const hemi = new THREE.HemisphereLight(0xffffdd, 0x080820, 1.2);
  scene.add(hemi);
  
  // Add directional light for sparkle
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);
  
  // Add point lights for extra sparkle
  const pointLight1 = new THREE.PointLight(0xffffff, 0.8, 12);
  pointLight1.position.set(-5, 3, -5);
  scene.add(pointLight1);
  
  const pointLight2 = new THREE.PointLight(0xaaccff, 0.6, 10);
  pointLight2.position.set(3, -2, 4);
  scene.add(pointLight2);

  // Adjust camera distance based on diamond size to ensure it fits in view
  // Larger diamonds need more distance, smaller diamonds can be closer
  const baseCameraDistance = 8.0;
  const sizeAdjustment = index * 0.5; // Increase distance for larger diamonds
  camera.position.z = baseCameraDistance + sizeAdjustment;

  // Create diamond geometry with subdivisions for more faces
  console.log(`Creating procedural diamond #${index} from Octahedron...`);
  
  // Vary subdivisions based on index for more variety
  // To make diamonds more pointy, use fewer subdivisions (0-2 instead of 1-3)
  const detailLevel = Math.min(2, Math.max(0, index)); // 0, 1, 2, 2, 2 (more angular with fewer subdivisions)
  const geometry = new THREE.OctahedronGeometry(1, detailLevel); // radius 1, varying subdivisions
  
  // Scale Y to make it taller and more pointy like a diamond
  // Adjusted Y scale to ensure diamonds fit in view while remaining pointy
  const yScale = 1.6 + (index * 0.1); // 1.6, 1.7, 1.8, 1.9, 2.0 (pointy but fits in view)
  geometry.scale(1, yScale, 1);
  
  // Create diamond material - use MeshPhysicalMaterial with transmission for glass-like appearance
  // ========================================================================================
  // COLOR CUSTOMIZATION: Change the colors array below to modify diamond colors
  // Colors are in hexadecimal format (0xRRGGBB)
  // Example: 0xff0000 = red, 0x00ff00 = green, 0x0000ff = blue, 0xffffff = white
  // ========================================================================================
  const colors = [
    0xffffff, // Pure white
    0xf0f8ff, // Alice blue
    0xe6f2ff, // Light blue
    0xf0ffff, // Azure
    0xf5f5f5  // White smoke
  ];
  const diamondColor = colors[index % colors.length];
  // ========================================================================================
  
  let diamondMaterial;
  try {
    // Try to use MeshPhysicalMaterial with transmission properties (r125+)
    if (THREE.MeshPhysicalMaterial && THREE.MeshPhysicalMaterial.prototype.isMeshPhysicalMaterial) {
      diamondMaterial = new THREE.MeshPhysicalMaterial({
        color: diamondColor,
        metalness: 0,
        roughness: 0.05 + (index * 0.01), // Slightly varied roughness
        transmission: 0.95 - (index * 0.05), // Vary transmission
        thickness: 1.0 + (index * 0.2), // Vary thickness
        ior: 2.42, // Diamond's index of refraction
        specularIntensity: 1.0,
        envMapIntensity: 1.5 + (index * 0.1),
        transparent: true,
        opacity: 0.9 - (index * 0.05),
        side: THREE.DoubleSide,
        premultipliedAlpha: true
      });
      console.log(`Using MeshPhysicalMaterial with transmission for diamond #${index}`);
    } else {
      throw new Error('MeshPhysicalMaterial with transmission not available');
    }
  } catch (e) {
    console.warn(`Using MeshStandardMaterial fallback for diamond #${index}:`, e.message);
    diamondMaterial = new THREE.MeshStandardMaterial({
      color: diamondColor,
      metalness: 0,
      roughness: 0.05 + (index * 0.01),
      envMapIntensity: 1.5 + (index * 0.1),
      transparent: true,
      opacity: 0.9 - (index * 0.05),
      side: THREE.DoubleSide
    });
  }
  
  // Create diamond mesh
  const diamond = new THREE.Mesh(geometry, diamondMaterial);
  diamond.castShadow = true;
  diamond.receiveShadow = true;
  
  // Scale and position - add some variation based on index
  // Increased scale for larger diamonds that stay behind content
  const scale = 1.1 + (index * 0.08); // 1.1, 1.18, 1.26, 1.34, 1.42 (larger diamonds)
  diamond.scale.set(scale, scale, scale);
  diamond.position.set(0, 0, 0);
  
  scene.add(diamond);
  console.log(`Diamond #${index} created and added to scene`);
  
  // Create a simple environment map for reflections
  const envMapSize = 256;
  const envCanvas = document.createElement('canvas');
  envCanvas.width = envMapSize;
  envCanvas.height = envMapSize;
  const envContext = envCanvas.getContext('2d');
  
  // Create gradient background for environment
  const gradient = envContext.createRadialGradient(
    envMapSize/2, envMapSize/2, 0,
    envMapSize/2, envMapSize/2, envMapSize/2
  );
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(0.3, '#aaccff');
  gradient.addColorStop(0.6, '#5588ff');
  gradient.addColorStop(1, '#003388');
  
  envContext.fillStyle = gradient;
  envContext.fillRect(0, 0, envMapSize, envMapSize);
  
  // Add sparkles
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * envMapSize;
    const y = Math.random() * envMapSize;
    const size = Math.random() * 3 + 1;
    envContext.fillStyle = '#ffffff';
    envContext.beginPath();
    envContext.arc(x, y, size/2, 0, Math.PI * 2);
    envContext.fill();
  }
  
  const envTexture = new THREE.CanvasTexture(envCanvas);
  envTexture.mapping = THREE.EquirectangularReflectionMapping;
  
  // Apply environment map to material if supported
  if (diamondMaterial.envMap !== undefined) {
    diamondMaterial.envMap = envTexture;
    diamondMaterial.needsUpdate = true;
  }
  
  // Mark as loaded
  diamondsLoaded++;
  
  // Hide loading message and border for this container
  const loadingMsg = container.querySelector('.diamond-loading');
  if (loadingMsg) {
    loadingMsg.style.display = 'none';
  }
  container.style.border = 'none';
  
  // Animation parameters unique to each diamond
  const rotationSpeedY = 0.015 + (index * 0.002); // Different rotation speeds
  const rotationSpeedX = 0.005 + (index * 0.001);
  const pulseSpeed = 0.3 + (index * 0.1);
  const pulseAmount = 0.03;
  const lightSpeed = 0.5 + (index * 0.1);
  
  // Animation function
  function animate() {
    requestAnimationFrame(animate);
    
    // Rotate diamond with unique speed
    diamond.rotation.y += rotationSpeedY;
    diamond.rotation.x += rotationSpeedX;
    
    // Pulsating scale effect with unique parameters
    const scaleVariation = 1.2 + Math.sin(time * pulseSpeed) * pulseAmount;
    diamond.scale.set(scaleVariation, scaleVariation, scaleVariation);
    
    // Move lights for sparkle effect with unique speed
    const lightAngle = time * lightSpeed;
    dirLight.position.x = Math.cos(lightAngle) * 5;
    dirLight.position.z = Math.sin(lightAngle) * 5;
    
    pointLight1.position.x = Math.cos(lightAngle + 1) * 4;
    pointLight1.position.z = Math.sin(lightAngle + 1) * 4;
    
    pointLight2.position.y = Math.sin(lightAngle * 0.7) * 3;
    pointLight2.position.x = Math.cos(lightAngle * 0.5) * 5;
    
    time += 0.016; // ~60fps
    
    renderer.render(scene, camera);
  }
  
  // Start animation with delay based on index (staggered appearance)
  setTimeout(() => {
    animate();
    console.log(`Animation started for diamond #${index}`);
  }, index * 300); // 300ms delay between each diamond
  
  return { scene, camera, renderer, diamond, animate };
}

// Initialize all diamonds when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing diamonds...');
  
  const containers = document.querySelectorAll('.diamond-container');
  console.log(`Found ${containers.length} diamond containers`);
  
  // Update expected count
  totalDiamondsExpected = containers.length;
  
  if (containers.length === 0) {
    console.warn('No diamond containers found. Looking for elements with class .diamond-container');
    return;
  }
  
  // Create a diamond scene in each container
  containers.forEach((container, index) => {
    console.log(`Setting up diamond #${index}`);
    createDiamondScene(container, index);
  });
});