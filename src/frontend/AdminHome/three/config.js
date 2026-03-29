/**
 * Three.js Scene Configuration
 */

// Star layers configuration
export const STAR_LAYERS = [
  { name: 'white',  count: 3200, spread: 300, size: 0.055, opacity: 0.15, color: null },
  { name: 'violet', count: 480,  spread: 220, size: 0.09,  opacity: 0.08, color: 0x7c3aff },
  { name: 'cyan',   count: 320,  spread: 240, size: 0.07,  opacity: 0.07, color: 0x00e5ff },
  { name: 'green',  count: 180,  spread: 210, size: 0.06,  opacity: 0.06, color: 0x00ff88 },
  { name: 'rose',   count: 120,  spread: 200, size: 0.05,  opacity: 0.05, color: 0xff3366 },
  { name: 'amber',  count: 90,   spread: 180, size: 0.05,  opacity: 0.04, color: 0xffaa00 },
];

// Torus rings configuration
export const TORUS_RINGS = [
  { col: 0x7c3aff, r: 24, t: 0.07,  rx: 0.3,  rz: 0.2,  ry: 0.0007, op: 0.018 },
  { col: 0x00e5ff, r: 38, t: 0.05,  rx: 0.8,  rz: 0.5,  ry: 0.0005, op: 0.014 },
  { col: 0x00ff88, r: 18, t: 0.045, rx: 1.2,  rz: 0.8,  ry: 0.0009, op: 0.012 },
  { col: 0xff3366, r: 48, t: 0.04,  rx: 0.5,  rz: 1.1,  ry: 0.0004, op: 0.010 },
  { col: 0xffaa00, r: 32, t: 0.035, rx: 0.9,  rz: 0.3,  ry: 0.0006, op: 0.009 },
];

// Wireframe shapes configuration
export const WIREFRAME_SHAPES = [
  { col: 0x7c3aff, sz: 3.5, geo: 'ico', rx: 0.004,  ry: 0.007 },
  { col: 0x00e5ff, sz: 2.6, geo: 'oct', rx: -0.005, ry: 0.006 },
  { col: 0x00ff88, sz: 2.0, geo: 'tet', rx: 0.006,  ry: -0.008 },
  { col: 0xff3366, sz: 3.0, geo: 'dod', rx: -0.003, ry: 0.005 },
  { col: 0x7c3aff, sz: 1.8, geo: 'tet', rx: 0.007,  ry: 0.004 },
  { col: 0x00e5ff, sz: 3.8, geo: 'ico', rx: -0.004, ry: -0.006 },
  { col: 0xffaa00, sz: 2.2, geo: 'oct', rx: 0.005,  ry: 0.007 },
  { col: 0x9d6bff, sz: 1.5, geo: 'ico', rx: -0.006, ry: 0.008 },
];

// Camera configuration
export const CAMERA_CONFIG = {
  fov: 70,
  near: 0.1,
  far: 800,
  initialZ: 52,
  parallaxX: 4,
  parallaxY: 2.5,
  smoothing: 0.022
};

// Animation speeds
export const ANIMATION_SPEEDS = {
  time: 0.005,
  starsVioletY: 0.0002,
  starsCyanY: -0.0001,
  starsGreenZ: 0.00008
};
