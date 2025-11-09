import * as THREE from 'three';

import { adjust } from '../../lib/color.js';
import { randomFloat, randomInt } from '../../lib/random.js';
import { pickColor } from './helpers.js';

// Create a dedicated Three.js renderer per invocation so we never clash with 2D draws.
const createRenderer = (canvas) =>
  new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance',
  });

// Build the snowfield; tweak density / spans / focus to change the scene feel.
const createSnowScene = (width, height, colors) => {
  const baseColor = pickColor(colors);
  const backgroundHex = adjust(baseColor ?? '#111111', { l: -0.55 });
  const backgroundColor = new THREE.Color(backgroundHex);

  const scene = new THREE.Scene();
  scene.background = backgroundColor.clone();
  scene.fog = new THREE.Fog(backgroundColor.clone().multiplyScalar(0.85), 12, 38);

  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambient);
  const moonLight = new THREE.DirectionalLight(0xe0f4ff, 0.65);
  moonLight.position.set(-6, 12, 10);
  scene.add(moonLight);
  const rimLight = new THREE.PointLight(0xbdd9ff, 0.35, 18, 2);
  rimLight.position.set(4, -3, -6);
  scene.add(rimLight);

  // Density controls: raise base count for heavier snowfall (GPU cost ~linear).
  const baseCount = Math.max(450, Math.floor((width * height) / 16000));
  const flakeCount = randomInt(Math.floor(baseCount * 0.9), Math.floor(baseCount * 1.3));

  const positions = new Float32Array(flakeCount * 3);
  const colorsArray = new Float32Array(flakeCount * 3);
  const sizes = new Float32Array(flakeCount);
  const drifts = new Float32Array(flakeCount);
  const twinkles = new Float32Array(flakeCount);

  // Snow volume footprint; widen spans for more parallax.
  const spanX = 26;
  const spanY = 18;
  const spanZ = 26;

  const palette = colors.length > 1 ? colors.slice(1) : colors;

  for (let index = 0; index < flakeCount; index += 1) {
    const idx = index * 3;
    const x = randomFloat(-spanX, spanX);
    const y = randomFloat(-spanY * 0.4, spanY);
    const z = randomFloat(-spanZ * 0.5, spanZ * 0.5);

    positions[idx] = x;
    positions[idx + 1] = y;
    positions[idx + 2] = z;

    const flakeHex = adjust(pickColor(palette) ?? baseColor ?? '#ffffff', {
      l: randomFloat(0.25, 0.6),
    });
    const color = new THREE.Color(flakeHex);
    colorsArray[idx] = color.r;
    colorsArray[idx + 1] = color.g;
    colorsArray[idx + 2] = color.b;

    sizes[index] = randomFloat(0.85, 2.15); // Increase range for chunkier flakes.
    drifts[index] = randomFloat(0.4, 1.3); // Larger values = broader sway.
    twinkles[index] = Math.random() * Math.PI * 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('drift', new THREE.BufferAttribute(drifts, 1));
  geometry.setAttribute('twinkle', new THREE.BufferAttribute(twinkles, 1));
  geometry.computeBoundingSphere();

  const material = new THREE.ShaderMaterial({
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uFocusDistance: { value: 13.5 }, // Move focus away/toward camera.
      uFocusRange: { value: 6.5 }, // Tighten for stronger blur falloff.
    },
    // Vertex shader defines drift and depth of field behaviour.
    vertexShader: `
      attribute float size;
      attribute float drift;
      attribute float twinkle;
      varying vec3 vColor;
      varying float vFocus;
      varying float vTwinkle;
      uniform float uTime;
      uniform float uFocusDistance;
      uniform float uFocusRange;

      void main() {
        vColor = color;
        vTwinkle = twinkle;

        float time = uTime * 0.4;
        vec3 transformed = position;
        transformed.x += sin(twinkle + time * 0.7) * drift * 0.6;
        transformed.y += cos(twinkle * 1.7 + time) * drift * 0.9;
        transformed.z += sin(twinkle * 1.3 + time * 0.5) * drift * 0.4;

        vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
        float viewZ = max(-mvPosition.z, 0.0001);

        float focus = clamp(1.0 - abs(viewZ - uFocusDistance) / max(uFocusRange, 0.0001), 0.0, 1.0);
        vFocus = focus;

        float perspective = 320.0 / viewZ;
        float focusScale = mix(1.65, 0.55, focus);
        gl_PointSize = size * perspective * focusScale;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    // Fragment shader draws a stylised six-arm flake with focus-weighted softness.
    fragmentShader: `
      varying vec3 vColor;
      varying float vFocus;
      varying float vTwinkle;
      uniform float uTime;

      void main() {
        vec2 uv = gl_PointCoord * 2.0 - 1.0;
        float r = length(uv);
        if (r > 1.0) discard;

        float angle = atan(uv.y, uv.x);
        float axial = abs(cos(angle * 3.0));
        float secondary = abs(sin(angle * 3.0));

        float core = pow(max(0.0, 1.0 - r), 3.6);
        float arm = pow(axial, 12.0) * smoothstep(0.95, 0.25, r);

        float branchMask = smoothstep(0.65, 0.08, r) * pow(max(0.0, 1.0 - secondary * 1.35), 8.0);
        float lattice = smoothstep(0.45, 0.05, r) * pow(max(0.0, cos(angle * 9.0)), 10.0);

        float detail = branchMask * 0.6 + lattice * 0.4;
        float flake = max(core, arm) + detail;

        float halo = exp(-r * r * mix(5.2, 3.2, vFocus)) * 0.5;
        float sparkle = mix(0.75, 1.12, vFocus) *
          (0.78 + 0.22 * sin(vTwinkle * 3.1 + uTime * 1.7));

        float alpha = clamp((flake * 0.85 + halo) * sparkle, 0.0, 1.0);
        vec3 color = mix(vColor * 0.6, vec3(0.95), clamp(vFocus + 0.15, 0.0, 1.0));

        gl_FragColor = vec4(color, alpha);
      }
    `,
  });

  const points = new THREE.Points(geometry, material);
  points.position.set(0, -2.5, 0);
  scene.add(points);

  // Camera placement; adjust radius / tilt for framing tweaks.
  const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 60);
  const radius = 18;
  camera.position.set(0, 2.8, radius);
  camera.lookAt(0, -1.2, 0);

  const snowFloorGeo = new THREE.PlaneGeometry(80, 60);
  const snowFloorMat = new THREE.MeshBasicMaterial({
    color: backgroundColor.clone().multiplyScalar(0.85),
    transparent: true,
    opacity: 0.35,
  });
  const snowFloor = new THREE.Mesh(snowFloorGeo, snowFloorMat);
  snowFloor.rotation.x = -Math.PI / 2;
  snowFloor.position.y = -spanY * 0.55;
  snowFloor.position.z = -8;
  scene.add(snowFloor);

  return {
    scene,
    camera,
    objects: [points, snowFloor],
    resources: [geometry, material, snowFloorGeo, snowFloorMat],
    backgroundHex,
  };
};

// Render to a PNG data URL so we can blit back onto the 2D canvas.
const renderToDataUrl = (renderer, scene, camera) => {
  renderer.setPixelRatio(1);
  renderer.render(scene, camera);
  return renderer.domElement.toDataURL('image/png');
};

export const snowflakes = {
  name: 'snowflakes',
  label: 'Snowflakes',
  mode: 'webgl',
  async draw({ canvas, width, height, colors }) {
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;

    const renderer = createRenderer(offscreenCanvas);
    renderer.setSize(width, height, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.physicallyCorrectLights = true;

    const { scene, camera, objects, resources, backgroundHex } = createSnowScene(
      width,
      height,
      colors,
    );

    renderer.setClearColor(new THREE.Color(backgroundHex), 1);

    const pointsMaterial = objects[0]?.material;
    if (pointsMaterial && pointsMaterial.uniforms?.uTime) {
      // Bake multiple frames so the depth-of-field glow feels soft, not speckled.
      const clock = new THREE.Clock();
      for (let frame = 0; frame < 56; frame += 1) {
        pointsMaterial.uniforms.uTime.value = clock.getElapsedTime() + frame * 0.04;
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
