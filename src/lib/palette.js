import { adjust } from './color.js';

const BASE_PALETTES = [
  ['#281733', '#7a2bcb', '#3c6ef5', '#14c9ff', '#ff6bd6'],
  ['#0f1021', '#2b1d52', '#5a189a', '#9d4edd', '#ff6be6'],
  ['#0e0f1f', '#132a4a', '#2a6f97', '#6a4c93', '#ff77e1'],
  ['#141225', '#1f1a3d', '#384b7d', '#5f5aa2', '#e56bdc'],
  ['#0b0d1a', '#1b1d3b', '#283c63', '#4476bf', '#d966ff'],
  ['#120f1f', '#331b4a', '#523a78', '#3e78b2', '#ff7ac6'],
  ['#1d1d1d', '#ff5a3d', '#ffd166', '#2bdc8c', '#2ec5ff'],
  [
    '#5a2a97',
    '#564dad',
    '#006caa',
    '#34bbc1',
    '#5cba50',
    '#ebdd08',
    '#f49d08',
    '#f03933',
    '#ed1b36',
  ],
  ['#2e2e2e', '#4e4e4e'],
  ['#6200d2', '#4c037a'],
  ['#ff7a01', '#AA00FF', '#8E24AA', '#ff7a01'],
  ['#C51162', '#6200EA', '#AA00FF'],
  ['#C51162', '#6200EA', '#304FFE'],
  ['#311b92', '#8b00d1'],
  ['#2503bb', '#4a21ad', '#8b00d1'],
  ['#C51162', '#6200EA', '#5b00db', '#4527A0'],
  ['#5b00db', '#009ddb'],
  ['#4204d4', '#009dd9', '#00acee'],
  ['#f06aff', '#0086d0'],
  ['#311b92', '#009cf0'],
  ['#C51162', '#E91E63', '#FF4081'],
  ['#1453a8', '#0f82af', '#00acee', '#00acee'],
  ['#AA00FF', '#304FFE'],
  ['#7e01bd', '#273fbe'],
  ['#0288d1', '#304FFE'],
  ['#0cabf1', '#e128af'],
  ['#60308c', '#6d77f6'],
  ['#743ce8', '#28357a'],
];

export const getRandomPalette = () => {
  const base = BASE_PALETTES[Math.floor(Math.random() * BASE_PALETTES.length)];
  return base.map((hex, index) => {
    const brightnessShift = index === base.length - 1 ? -0.05 : -0.12;
    return adjust(hex, { s: -0.18, l: brightnessShift });
  });
};
