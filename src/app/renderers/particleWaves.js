import * as THREE from 'three';

import { paletteAt, pickColor } from './helpers.js';

/**
 * Create a Three.js renderer that draws into the provided canvas.
 * This renderer is created per-render so we never fight the 2D context
 * that the app normally uses.
 */
const createRenderer = (canvas) =>
  new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });

/**
 * Build the particle-wave scene.
 * Interesting knobs:
 *  - cols/rows: particle density (watch performance).
 *  - spanX/spanZ: size of the wave plane.
 *  - amp: vertical amplitude of the wave.
 *  - baseYOffset/additional sin offsets: vertical placement of the wave.
 *  - shader code (vertex/fragment) for different glow behaviours.
 */
const createParticleScene = (width, height, colors, pixelRatio) => {
  const scene = new THREE.Scene();

  // Always keep the background pure black for maximum neon contrast.
  const bgColor = new THREE.Color('#000000');
  scene.background = bgColor.clone();
  scene.fog = new THREE.Fog(scene.background, 20, 42);

  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
  dirLight.position.set(5, 8, 6);
  scene.add(dirLight);

  const cols = 240;
  const rows = 180;
  const total = cols * rows;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(total * 3);
  const colorsArray = new Float32Array(total * 3);
  const sizes = new Float32Array(total);
  const phases = new Float32Array(total);

  const spanX = 24; // widen for broader horizon coverage
  const spanZ = 16;
  const amp = 0.95; // vertical amplitude of the wave
  const wavePhase = Math.random() * Math.PI * 2;
  const secondary = Math.random() * Math.PI * 2;
  const sizeBoost = 1 + Math.max(0, pixelRatio - 1) * 0.8;

  let ptr = 0;
  for (let zi = 0; zi < rows; zi += 1) {
    const v = zi / (rows - 1 || 1);
    for (let xi = 0; xi < cols; xi += 1) {
      const u = xi / (cols - 1 || 1);
      const x = (u - 0.5) * spanX;
      const z = (v - 0.5) * spanZ;

      const wave =
        Math.sin(u * Math.PI * 6 + wavePhase) +
        Math.cos(v * Math.PI * 4 + secondary) +
        Math.sin((u + v) * Math.PI * 3);
 	    const y = (wave / 3) * amp + Math.sin(u * Math.PI * 2) * 0.2;

      const idx = ptr * 3;
      positions[idx] = x;
      // Base Y offset keeps the wave centered; adjust -0.35 for higher/lower placement.
      positions[idx + 1] = y + Math.sin((u + v) * Math.PI * 4) * 0.18 - 0.35;
      positions[idx + 2] = z;

      const colorRatio = THREE.MathUtils.clamp((y + amp) / (amp * 2), 0, 1);
      const palette = colors.length > 1 ? colors.slice(1) : colors;
      const colorHex = paletteAt(palette, colorRatio);
      const color = new THREE.Color(colorHex);
      colorsArray[idx] = color.r;
      colorsArray[idx + 1] = color.g;
      colorsArray[idx + 2] = color.b;

      sizes[ptr] =
        THREE.MathUtils.lerp(0.08, 0.2, Math.random()) *
        (Math.random() * 0.6 + 0.7) *
        sizeBoost;
      phases[ptr] = (wave + Math.random()) * 0.5;
      ptr += 1;
    }
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
    },
    vertexShader: `
      attribute float size;
      attribute float phase;
      varying float vPhase;
      varying vec3 vColor;
      attribute vec3 color;
      uniform float uTime;
      uniform float uPixelRatio;
      void main() {
        vColor = color;
        vPhase = phase;
        vec3 transformed = position;
        transformed.y += sin(phase + uTime) * 0.18;
        vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
        float pointSize = size * (350.0 / -mvPosition.z);
        float pixelScale = 1.0 + max(0.0, uPixelRatio - 1.0) * 0.85;
        gl_PointSize = pointSize * pixelScale;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying float vPhase;
      varying vec3 vColor;
      void main() {
        vec2 uv = gl_PointCoord * 2.0 - 1.0;
        float d = dot(uv, uv);
        if (d > 1.0) discard;
        float falloff = pow(1.0 - d, 3.0);
        vec3 color = vColor * (0.75 + 0.25 * sin(vPhase));
        gl_FragColor = vec4(color, falloff);
      }
    `,
  });

  const points = new THREE.Points(geometry, material);
  points.position.y = -0.25;
  points.rotation.x = -0.35;
  scene.add(points);

  const gridMaterial = new THREE.LineBasicMaterial({
    color: new THREE.Color(pickColor(colors.slice(1), '#1a8fff')),
    transparent: true,
    opacity: 0,
  });

  const grid = new THREE.Group();
  const gridRows = 24;
  const gridCols = 32;
  const gridDepth = 12;
  const gridWidth = 14;
  const gridGeometries = [];
  for (let i = 0; i <= gridRows; i += 1) {
    const z = (i / gridRows - 0.5) * gridDepth;
    const geometryLine = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-gridWidth / 2, -1.8, z),
      new THREE.Vector3(gridWidth / 2, -1.8, z),
    ]);
    gridGeometries.push(geometryLine);
    const line = new THREE.Line(geometryLine, gridMaterial);
    grid.add(line);
  }
  for (let i = 0; i <= gridCols; i += 1) {
    const x = (i / gridCols - 0.5) * gridWidth;
    const geometryLine = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, -1.8, -gridDepth / 2),
      new THREE.Vector3(x, -1.8, gridDepth / 2),
    ]);
    gridGeometries.push(geometryLine);
    const line = new THREE.Line(geometryLine, gridMaterial);
    grid.add(line);
  }
  scene.add(grid);

  const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);

  return {
    scene,
    camera,
    objects: [points, grid],
    resources: [geometry, material, gridMaterial, ...gridGeometries],
  };
};

const renderToDataUrl = (renderer, scene, camera) => {
  renderer.render(scene, camera);
  return renderer.domElement.toDataURL('image/png');
};

export const particleWaves = {
  name: 'particleWaves',
  label: 'Particle Waves',
  mode: 'webgl',
  applyNoise: false,
  async draw({ canvas, width, height, colors, pixelRatio = 1 }) {
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;

    const renderer = createRenderer(offscreenCanvas);
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(pixelRatio);
    renderer.setClearColor(0x000000, 0);

    const { scene, camera, objects, resources } = createParticleScene(
      width,
      height,
      colors,
      pixelRatio,
    );

    // Camera parameters for tweaking:
    //  - radiusRange: distance from the wave.
    //  - yawSpread: left/right sweep in degrees.
    //  - pitchRange/camHeightRange: vertical placement and tilt.
    const radius = THREE.MathUtils.lerp(10.5, 12.5, Math.random());
    const yaw = THREE.MathUtils.degToRad(THREE.MathUtils.randFloatSpread(18)); // +/-9°
    const pitch = THREE.MathUtils.degToRad(THREE.MathUtils.randFloat(0, 6));
    const camY = THREE.MathUtils.lerp(2.4, 8.0, Math.random());
    camera.position.set(
      Math.sin(yaw) * radius,
      camY,
      Math.cos(yaw) * radius,
    );
    camera.lookAt(0, -0.1, 0);
    camera.rotation.x -= pitch;

    const particleMaterial = objects[0]?.material;
    if (particleMaterial && particleMaterial.uniforms) {
      if (particleMaterial.uniforms.uPixelRatio) {
        particleMaterial.uniforms.uPixelRatio.value = pixelRatio;
      }
      const tempClock = new THREE.Clock();
      for (let i = 0; i < 48; i += 1) {
        const t = tempClock.getElapsedTime() + i * 0.04;
        particleMaterial.uniforms.uTime.value = t;
        renderer.render(scene, camera);
      }
    }
    const dataUrl = renderToDataUrl(renderer, scene, camera);

    objects.forEach((object) => scene.remove(object));
    resources.forEach((resource) => resource.dispose?.());
    renderer.dispose();
    if (renderer.forceContextLoss) {
      renderer.forceContextLoss();
    }

    await new Promise((resolve) => {
      const image = new globalThis.Image();
      image.onload = () => {
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(image, 0, 0, width, height);
        }
        offscreenCanvas.width = 1;
        offscreenCanvas.height = 1;
        resolve();
      };
      image.src = dataUrl;
    });
  },
};
