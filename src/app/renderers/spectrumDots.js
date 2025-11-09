import * as THREE from 'three';

import { paletteAt } from './helpers.js';

// Build the offscreen Three.js renderer.
const createRenderer = (canvas) =>
  new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance',
  });

// Build the spectrum dots scene with animated point sprites.
const createSpectrumScene = (width, height, colors, pixelRatio) => {
  const palette = colors.length > 1 ? colors.slice(1) : colors;
  const backgroundColor = new THREE.Color('#000000');

  const scene = new THREE.Scene();
  scene.background = backgroundColor.clone();
  scene.fog = new THREE.Fog(backgroundColor.clone().multiplyScalar(0.85), 12, 32);

  const ambient = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambient);
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.25);
  keyLight.position.set(-6, 6, 8);
  scene.add(keyLight);
  const rim = new THREE.PointLight(0xffffff, 0.45);
  rim.position.set(4, 2.8, -5);
  scene.add(rim);

  // Particle grid density; raise rows/cols for more dots (GPU cost rises quadratically).
  const rows = 14 + Math.floor(Math.random() * 7);
  const cols = 320 + Math.floor(Math.random() * 160);
  const total = rows * cols;
  const sizeBoost = 1 + Math.max(0, pixelRatio - 1) * 0.8;

  const positions = new Float32Array(total * 3);
  const colorsArray = new Float32Array(total * 3);
  const sizes = new Float32Array(total);
  const amplitudes = new Float32Array(total);
  const frequencies = new Float32Array(total);
  const phases = new Float32Array(total);
  const shifts = new Float32Array(total);

  // Dot layout footprint; tweak spanX for horizontal spread and depth for perspective depth.
  const spanX = 36;
  const depth = 9;
  let ptr = 0;
  for (let row = 0; row < rows; row += 1) {
    const rowRatio = rows > 1 ? row / (rows - 1) : 0;
    // BaseY keeps each row's band in frame; widen lerp range to move the wave stack vertically.
    const baseY =
      THREE.MathUtils.lerp(-2.8, 2.1, rowRatio) + THREE.MathUtils.randFloatSpread(0.5);
    const z =
      THREE.MathUtils.lerp(-depth / 2, depth / 2, rowRatio) +
      THREE.MathUtils.randFloatSpread(0.6);
    const rowPhase = Math.random() * Math.PI * 2;
    const rowShift = Math.random();
    const rowAmp = THREE.MathUtils.lerp(0.45, 1.25, Math.random()); // Taller oscillations; increase for bigger peaks.
    const rowFreq = THREE.MathUtils.lerp(0.18, 0.36, Math.random()); // Higher value = tighter waves; lower for slower flow.

    for (let col = 0; col < cols; col += 1) {
      const colRatio = cols > 1 ? col / (cols - 1) : 0;
      const x = (colRatio - 0.5) * spanX;
      const idx = ptr * 3;
      positions[idx] = x;
      positions[idx + 1] = baseY;
      positions[idx + 2] =
        z + Math.sin(colRatio * Math.PI * 4 + rowPhase) * 0.7 + THREE.MathUtils.randFloatSpread(0.18);

      const paletteT = (colRatio + rowShift) % 1;
      const color = new THREE.Color(paletteAt(palette, paletteT));
      colorsArray[idx] = color.r;
      colorsArray[idx + 1] = color.g;
      colorsArray[idx + 2] = color.b;

      // Per-dot animation knobs; increase size lerp for larger dots.
      sizes[ptr] = THREE.MathUtils.lerp(0.1, 0.26, Math.random()) * sizeBoost;
      amplitudes[ptr] = rowAmp * (0.8 + Math.random() * 0.6);
      frequencies[ptr] = rowFreq * (0.7 + Math.random() * 0.6);
      phases[ptr] = rowPhase + Math.random() * Math.PI * 2;
      shifts[ptr] = rowShift + colRatio * 0.75;
      ptr += 1;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('amp', new THREE.BufferAttribute(amplitudes, 1));
  geometry.setAttribute('freq', new THREE.BufferAttribute(frequencies, 1));
  geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute('shift', new THREE.BufferAttribute(shifts, 1));
  geometry.computeBoundingSphere();

  const material = new THREE.ShaderMaterial({
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
    },
    // Vertex shader drives the wave motion; adjust perspective multiplier for point size scaling.
    vertexShader: `
      attribute float size;
      attribute float amp;
      attribute float freq;
      attribute float phase;
      attribute float shift;
      varying vec3 vColor;
      varying float vStrength;
      varying float vShift;
      uniform float uTime;
      uniform float uPixelRatio;
      void main() {
        vColor = color;
        vShift = shift;
        float time = uTime * 0.8;
        float wave = sin(position.x * freq + time + phase);
        float ripple = sin((position.z + shift) * (freq * 0.6) + time * 1.4);
        float band = sin((shift + time * 0.2) * 6.28318);
        float offset = (wave + ripple * 0.6 + band * 0.4) * amp;
        vec3 transformed = position;
        transformed.y += offset;
        transformed.y += sin((position.x - shift) * freq * 0.4 + time * 1.8) * amp * 0.35;
        vStrength = abs(offset);
        vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
        float perspective = 320.0 / max(1.0, -mvPosition.z);
        float pixelScale = 1.0 + max(0.0, uPixelRatio - 1.0) * 0.85;
        gl_PointSize = size * perspective * (1.0 + vStrength * 0.8) * pixelScale;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    // Fragment shader controls softness/alpha; tune falloff/twinkle for glow behaviour.
    fragmentShader: `
      uniform float uTime;
      varying vec3 vColor;
      varying float vStrength;
      varying float vShift;
      void main() {
        vec2 uv = gl_PointCoord * 2.0 - 1.0;
        float d = dot(uv, uv);
        if (d > 1.0) discard;
        float falloff = exp(-d * (1.6 - vStrength * 0.5));
        float twinkle = 0.7 + 0.3 * sin((vShift + uTime * 0.25) * 6.28318);
        float alpha = falloff * (0.45 + vStrength * 0.55);
        vec3 color = vColor * (0.9 + vStrength * 0.6) * twinkle;
        gl_FragColor = vec4(color, alpha);
      }
    `,
  });

  const points = new THREE.Points(geometry, material);
  points.position.y = -0.4;
  points.rotation.x = THREE.MathUtils.degToRad(-18 + Math.random() * 4);
  points.rotation.z = THREE.MathUtils.degToRad(THREE.MathUtils.randFloatSpread(4));
  scene.add(points);

  // Camera framing; change radius for distance, yaw spread for angle, camHeight for elevation.
  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
  const radius = THREE.MathUtils.lerp(16, 20, Math.random());
  const yaw = THREE.MathUtils.degToRad(THREE.MathUtils.randFloatSpread(12));
  const camHeight = THREE.MathUtils.lerp(1.6, 3.8, Math.random());
  camera.position.set(Math.sin(yaw) * radius, camHeight, Math.cos(yaw) * radius);
  camera.lookAt(0, 1, 0);

  return {
    scene,
    camera,
    objects: [points],
    resources: [geometry, material],
    backgroundHex: '#000000',
  };
};

// Render the scene and capture the canvas as a data URL.
const renderToDataUrl = (renderer, scene, camera) => {
  renderer.render(scene, camera);
  return renderer.domElement.toDataURL('image/png');
};

export const spectrumDots = {
  name: 'spectrumDots',
  label: 'Spectrum Dots',
  mode: 'webgl',
  applyNoise: false,
  async draw({ canvas, width, height, colors, pixelRatio = 1 }) {
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;

    const renderer = createRenderer(offscreenCanvas);
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(pixelRatio);
    // Tone mapping + exposure influence perceived vibrancy.
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.04;
    renderer.physicallyCorrectLights = true;

    const { scene, camera, objects, resources, backgroundHex } = createSpectrumScene(
      width,
      height,
      colors,
      pixelRatio,
    );

    const backgroundColor = new THREE.Color(backgroundHex);
    renderer.setClearColor(backgroundColor, 1);

    const pointsMaterial = objects[0]?.material;
    if (pointsMaterial && pointsMaterial.uniforms?.uTime) {
      if (pointsMaterial.uniforms.uPixelRatio) {
        pointsMaterial.uniforms.uPixelRatio.value = pixelRatio;
      }
      // Increase loop count to bake in more animation frames (higher values add render time).
      const tempClock = new THREE.Clock();
      for (let i = 0; i < 48; i += 1) {
        pointsMaterial.uniforms.uTime.value = tempClock.getElapsedTime() + i * 0.045;
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
          ctx.fillStyle = backgroundHex;
          ctx.fillRect(0, 0, width, height);
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
