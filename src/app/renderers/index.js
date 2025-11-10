import { softGradient } from './softGradient.js';
import { particleWaves } from './particleWaves.js';
import { spectrumDots } from './spectrumDots.js';
import { neuralCurves } from './neuralCurves.js';
import { auroraBlurs } from './auroraBlurs.js';
import { gradientMesh } from './gradientMesh.js';
/* import { neonHorizon } from './neonHorizon.js';
import { cyberRain } from './cyberRain.js';
import { quantumCity } from './quantumCity.js';
import { synthwaveMirage } from './synthwaveMirage.js';
import { hologramPalms } from './hologramPalms.js'; */
import { bokehBloom } from './bokehBloom.js';
/* import { barnsleyFern } from './barnsleyFern.js';
import { fractalTree } from './fractalTree.js';
import { glassBubbles } from './glassBubbles.js'; */
import { layeredWaves } from './layeredWaves.js';
import { snowflakes } from './snowflakes.js';

export const RENDERER_DEFINITIONS = [
  softGradient,
  particleWaves,
  spectrumDots,
  neuralCurves,
  auroraBlurs,
  gradientMesh,
  /* neonHorizon,
  cyberRain,
  quantumCity,
  synthwaveMirage,
  hologramPalms, */
  bokehBloom,
  /* barnsleyFern,
  fractalTree,
  glassBubbles, */
  layeredWaves,
  snowflakes,
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
