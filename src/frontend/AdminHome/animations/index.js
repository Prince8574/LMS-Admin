/**
 * Animation Manager
 * Central hub for all GSAP animations
 */

import { animateHero } from './heroAnimations';
import { animateNavbar } from './navbarAnimations';
import { setupScrollAnimations, cleanupScrollTriggers } from './scrollAnimations';

export class AnimationManager {
  constructor(gsap) {
    this.gsap = gsap;
  }
  
  /**
   * Initialize all animations
   */
  initAll() {
    if (!this.gsap) return;
    
    // Navbar animations
    animateNavbar(this.gsap);
    
    // Hero animations
    animateHero(this.gsap);
    
    // Scroll-triggered animations
    setupScrollAnimations(this.gsap);
  }
  
  /**
   * Cleanup all animations
   */
  cleanup() {
    cleanupScrollTriggers();
  }
}

/**
 * Load GSAP from CDN
 */
export function loadGSAP() {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.gsap) {
      resolve(window.gsap);
      return;
    }
    
    // Load main GSAP
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
    script.onload = () => {
      // Load ScrollTrigger plugin
      const scrollScript = document.createElement('script');
      scrollScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js';
      scrollScript.onload = () => {
        window.gsap.registerPlugin(window.ScrollTrigger);
        resolve(window.gsap);
      };
      scrollScript.onerror = reject;
      document.head.appendChild(scrollScript);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * React Hook for GSAP
 */
export function useAnimations() {
  let manager = null;
  
  loadGSAP().then(gsap => {
    manager = new AnimationManager(gsap);
    manager.initAll();
  });
  
  return () => {
    if (manager) {
      manager.cleanup();
    }
  };
}
