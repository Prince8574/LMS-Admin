import * as THREE from 'three';

/**
 * Create particle system for stars
 */
export function createParticleSystem(count, spread, size, opacity, color) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  
  for (let i = 0; i < count; i++) {
    pos[i*3]   = (Math.random() - 0.5) * spread;
    pos[i*3+1] = (Math.random() - 0.5) * spread * 0.7;
    pos[i*3+2] = (Math.random() - 0.5) * 100;
    speeds[i]  = Math.random() * 0.005 + 0.001;
  }
  
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
  
  return new THREE.Points(geo, new THREE.PointsMaterial({
    color: color || 0xffffff,
    size: size,
    transparent: true,
    opacity: opacity,
    sizeAttenuation: true
  }));
}

/**
 * Create torus ring
 */
export function createTorusRing(config) {
  const { col, r, t, rx, rz, ry, op } = config;
  
  const mesh = new THREE.Mesh(
    new THREE.TorusGeometry(r, t, 8, 120),
    new THREE.MeshBasicMaterial({
      color: col,
      wireframe: true,
      transparent: true,
      opacity: op
    })
  );
  
  mesh.rotation.x = rx;
  mesh.rotation.z = rz;
  mesh.userData = { ry, rz: 0.0002 };
  
  return mesh;
}

/**
 * Create wireframe shape
 */
export function createWireframeShape(config, index) {
  const { col, sz, geo, rx, ry } = config;
  
  let geometry;
  switch(geo) {
    case 'ico':
      geometry = new THREE.IcosahedronGeometry(sz, 0);
      break;
    case 'oct':
      geometry = new THREE.OctahedronGeometry(sz, 0);
      break;
    case 'tet':
      geometry = new THREE.TetrahedronGeometry(sz, 0);
      break;
    case 'dod':
      geometry = new THREE.DodecahedronGeometry(sz, 0);
      break;
    default:
      geometry = new THREE.IcosahedronGeometry(sz, 0);
  }
  
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      color: col,
      wireframe: true,
      transparent: true,
      opacity: 0.04 + index * 0.007
    })
  );
  
  mesh.position.set(
    (Math.random() - 0.5) * 110,
    (Math.random() - 0.5) * 80,
    (Math.random() - 0.5) * 40 - 10
  );
  
  mesh.userData = {
    rx,
    ry,
    fy: Math.random() * Math.PI * 2,
    sp: 0.06 + Math.random() * 0.12
  };
  
  return mesh;
}

/**
 * Create hero focal shape
 */
export function createHeroShape() {
  const mesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(7, 1),
    new THREE.MeshBasicMaterial({
      color: 0x7c3aff,
      wireframe: true,
      transparent: true,
      opacity: 0.05
    })
  );
  
  mesh.position.set(16, 2, -12);
  mesh.userData = { rx: 0.003, ry: 0.006 };
  
  return mesh;
}

/**
 * Create satellite shapes around hero
 */
export function createSatelliteShapes() {
  const colors = [0x00e5ff, 0x00ff88, 0xff3366];
  const satellites = [];
  
  colors.forEach((col, i) => {
    const mesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.5, 0),
      new THREE.MeshBasicMaterial({
        color: col,
        wireframe: true,
        transparent: true,
        opacity: 0.08
      })
    );
    
    const angle = (i / 3) * Math.PI * 2;
    mesh.position.set(
      16 + Math.cos(angle) * 12,
      Math.sin(angle) * 8,
      -8
    );
    mesh.userData = {
      rx: 0.008,
      ry: 0.012,
      orbitAngle: angle,
      orbitR: 12
    };
    
    satellites.push(mesh);
  });
  
  return satellites;
}
