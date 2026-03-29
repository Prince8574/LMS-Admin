/**
 * Animation controller for Three.js scene
 */

export class SceneAnimator {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.time = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.animationId = null;
    
    // Object collections
    this.rings = [];
    this.shapes = [];
    this.stars = {
      violet: null,
      cyan: null,
      green: null
    };
    this.hero = null;
  }
  
  /**
   * Add objects to animate
   */
  addRings(rings) {
    this.rings = rings;
  }
  
  addShapes(shapes) {
    this.shapes = shapes;
  }
  
  addStars(violet, cyan, green) {
    this.stars = { violet, cyan, green };
  }
  
  addHero(hero) {
    this.hero = hero;
  }
  
  /**
   * Update mouse position for parallax
   */
  updateMouse(clientX, clientY) {
    this.mouseX = (clientX / window.innerWidth - 0.5) * 2;
    this.mouseY = -(clientY / window.innerHeight - 0.5) * 2;
  }
  
  /**
   * Animate rings
   */
  animateRings() {
    this.rings.forEach(ring => {
      ring.rotation.y += ring.userData.ry;
      ring.rotation.z += ring.userData.rz;
    });
  }
  
  /**
   * Animate shapes
   */
  animateShapes() {
    this.shapes.forEach(shape => {
      shape.rotation.x += shape.userData.rx;
      shape.rotation.y += shape.userData.ry;
      shape.position.y += Math.sin(
        this.time * shape.userData.sp + shape.userData.fy
      ) * 0.007;
    });
  }
  
  /**
   * Animate hero shape
   */
  animateHero() {
    if (this.hero) {
      this.hero.rotation.x += this.hero.userData.rx;
      this.hero.rotation.y += this.hero.userData.ry;
    }
  }
  
  /**
   * Animate stars
   */
  animateStars() {
    if (this.stars.violet) this.stars.violet.rotation.y += 0.0002;
    if (this.stars.cyan) this.stars.cyan.rotation.y -= 0.0001;
    if (this.stars.green) this.stars.green.rotation.z += 0.00008;
  }
  
  /**
   * Apply parallax effect to camera
   */
  applyParallax() {
    this.camera.position.x += (this.mouseX * 4 - this.camera.position.x) * 0.022;
    this.camera.position.y += (this.mouseY * 2.5 - this.camera.position.y) * 0.022;
    this.camera.lookAt(0, 0, 0);
  }
  
  /**
   * Main animation loop
   */
  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    
    this.time += 0.005;
    
    this.animateRings();
    this.animateShapes();
    this.animateHero();
    this.animateStars();
    this.applyParallax();
    
    this.renderer.render(this.scene, this.camera);
  }
  
  /**
   * Start animation
   */
  start() {
    this.animate();
  }
  
  /**
   * Stop animation
   */
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  /**
   * Handle window resize
   */
  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
