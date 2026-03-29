/**
 * GSAP Animation Configuration
 */

// GSAP CDN URLs
export const GSAP_CDN = {
  core: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
  scrollTrigger: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js'
};

// Animation timing presets
export const TIMING = {
  fast: 0.3,
  normal: 0.5,
  slow: 0.8,
  verySlow: 1.2
};

// Easing presets
export const EASING = {
  smooth: 'power3.out',
  bounce: 'back.out(2)',
  elastic: 'elastic.out(1, 0.3)',
  linear: 'none'
};

// Common animation configs
export const FADE_UP = {
  from: { opacity: 0, y: 30 },
  to: { opacity: 1, y: 0, duration: 0.6, ease: EASING.smooth }
};

export const FADE_IN = {
  from: { opacity: 0 },
  to: { opacity: 1, duration: 0.5, ease: EASING.smooth }
};

export const SCALE_IN = {
  from: { opacity: 0, scale: 0.9 },
  to: { opacity: 1, scale: 1, duration: 0.5, ease: EASING.bounce }
};

export const SLIDE_LEFT = {
  from: { opacity: 0, x: -40 },
  to: { opacity: 1, x: 0, duration: 0.5, ease: EASING.smooth }
};

export const SLIDE_RIGHT = {
  from: { opacity: 0, x: 40 },
  to: { opacity: 1, x: 0, duration: 0.5, ease: EASING.smooth }
};

// Scroll trigger defaults
export const SCROLL_TRIGGER_DEFAULTS = {
  start: 'top 80%',
  toggleActions: 'play none none none'
};
