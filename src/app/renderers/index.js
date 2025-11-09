import { softGradient } from './softGradient.js';
import { auroraBlurs } from './auroraBlurs.js';
import { gradientMesh } from './gradientMesh.js';
import { neuralCurves } from './neuralCurves.js';
/* import { neonHorizon } from './neonHorizon.js';
import { cyberRain } from './cyberRain.js';
import { quantumCity } from './quantumCity.js';
import { synthwaveMirage } from './synthwaveMirage.js';
import { hologramPalms } from './hologramPalms.js'; */
import { particleWaves } from './particleWaves.js';
import { spectrumDots } from './spectrumDots.js';
import { bokehBloom } from './bokehBloom.js';
import { barnsleyFern } from './barnsleyFern.js';
import { fractalTree } from './fractalTree.js';
/* import { glassBubbles } from './glassBubbles.js'; */
import { snowflakes } from './snowflakes.js';
import { layeredWaves } from './layeredWaves.js';

export const RENDERER_DEFINITIONS = [
  softGradient,
  auroraBlurs,
  gradientMesh,
  neuralCurves,
  particleWaves,
  /* neonHorizon,
  cyberRain,
  quantumCity,
  synthwaveMirage,
  hologramPalms, */
  spectrumDots,
  bokehBloom,
  barnsleyFern,
  fractalTree,
  /* glassBubbles, */
  snowflakes,
  layeredWaves,
];

export const DEFAULT_STYLE = softGradient.name;

export const RENDERERS = RENDERER_DEFINITIONS.reduce((acc, renderer) => {
  acc[renderer.name] = renderer.draw;
  return acc;
}, {});

export const RENDERER_INFO = RENDERER_DEFINITIONS.reduce((acc, renderer) => {
  acc[renderer.name] = renderer;
  return acc;
}, {});
