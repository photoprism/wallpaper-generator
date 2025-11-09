import { softGradient } from './softGradient.js';
import { auroraBlurs } from './auroraBlurs.js';
import { layeredWaves } from './layeredWaves.js';
import { gradientMesh } from './gradientMesh.js';
import { neuralCurves } from './neuralCurves.js';
import { neonHorizon } from './neonHorizon.js';
import { cyberRain } from './cyberRain.js';
import { quantumCity } from './quantumCity.js';
import { synthwaveMirage } from './synthwaveMirage.js';
import { hologramPalms } from './hologramPalms.js';
import { particleWaves } from './particleWaves.js';
import { spectrumDots } from './spectrumDots.js';
import { barnsleyFern } from './barnsleyFern.js';
import { fractalTree } from './fractalTree.js';
import { bokehBloom } from './bokehBloom.js';
import { glassBubbles } from './glassBubbles.js';
import { snowflakes } from './snowflakes.js';

export const RENDERER_DEFINITIONS = [
  softGradient,
  auroraBlurs,
  layeredWaves,
  gradientMesh,
  neuralCurves,
  particleWaves,
  neonHorizon,
  cyberRain,
  quantumCity,
  synthwaveMirage,
  hologramPalms,
  spectrumDots,
  barnsleyFern,
  fractalTree,
  bokehBloom,
  glassBubbles,
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
