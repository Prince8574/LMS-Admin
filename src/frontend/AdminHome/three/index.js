/**
 * Three.js Scene Manager
 * Main entry point for Three.js background
 */

import * as THREE from 'three';
import { STAR_LAYERS, TORUS_RINGS, WIREFRAME_SHAPES, CAMERA_CONFIG } from './config';
import { 
  createParticleSystem, 
  createTorusRing, 
  createWireframeShape,
  createHeroShape,
  createSatelliteShapes
} from './scene';
import { SceneAnimator } from './animator';

export class ThreeBackground {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.animator = null;
    
    this.init();
  }
  
  /**
   * Initialize Three.js scene
   */
  init() {
    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Setup scene
    this.scene = new THREE.Scene();
    
    // Setup camera
    this.camera = new THREE.PerspectiveCamera(
      CAMERA_CONFIG.fov,
      window.innerWidth / window.innerHeight,
      CAMERA_CONFIG.near,
      CAMERA_CONFIG.far
    );
    this.camera.position.z = CAMERA_CONFIG.initialZ;
    
    // Create animator
    this.animator = new SceneAnimator(this.scene, this.camera, this.renderer);
    
    // Add objects to scene
    this.addStars();
    this.addRings();
    this.addShapes();
    this.addHeroShapes();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Start animation
    this.animator.start();
  }
  
  /**
   * Add star layers
   */
  addStars() {
    const starObjects = {};
    
    STAR_LAYERS.forEach(layer => {
      const stars = createParticleSystem(
        layer.count,
        layer.spread,
        layer.size,
        layer.opacity,
        layer.color
      );
      this.scene.add(stars);
      
      if (layer.name === 'violet' || layer.name === 'cyan' || layer.name === 'green') {
        starObjects[layer.name] = stars;
      }
    });
    
    this.animator.addStars(
      starObjects.violet,
      starObjects.cyan,
      starObjects.green
    );
  }
  
  /**
   * Add torus rings
   */
  addRings() {
    const rings = TORUS_RINGS.map(config => {
      const ring = createTorusRing(config);
      this.scene.add(ring);
      return ring;
    });
    
    this.animator.addRings(rings);
  }
  
  /**
   * Add wireframe shapes
   */
  addShapes() {
    const shapes = WIREFRAME_SHAPES.map((config, index) => {
      const shape = createWireframeShape(config, index);
      this.scene.add(shape);
      return shape;
    });
    
    this.animator.addShapes(shapes);
  }
  
  /**
   * Add hero shapes
   */
  addHeroShapes() {
    // Main hero shape
    const hero = createHeroShape();
    this.scene.add(hero);
    this.animator.addHero(hero);
    
    // Satellite shapes
    const satellites = createSatelliteShapes();
    satellites.forEach(sat => this.scene.add(sat));
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Mouse move for parallax
    window.addEventListener('mousemove', (e) => {
      this.animator.updateMouse(e.clientX, e.clientY);
    });
    
    // Window resize
    window.addEventListener('resize', () => {
      this.animator.handleResize();
    });
  }
  
  /**
   * Cleanup
   */
  dispose() {
    this.animator.stop();
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('resize', this.handleResize);
    this.renderer.dispose();
  }
}

/**
 * React Hook wrapper
 */
export function useThreeBackground(canvasRef) {
  let background = null;
  
  if (canvasRef.current && !background) {
    background = new ThreeBackground(canvasRef.current);
  }
  
  return () => {
    if (background) {
      background.dispose();
    }
  };
}
