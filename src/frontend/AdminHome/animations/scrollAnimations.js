/**
 * Scroll-triggered Animations
 */

import { EASING, SCROLL_TRIGGER_DEFAULTS } from './gsapConfig';

export function setupScrollAnimations(gsap) {
  const ScrollTrigger = window.ScrollTrigger;
  if (!ScrollTrigger) return;
  
  // Stats section
  gsap.fromTo('.stat-card',
    { opacity: 0, y: 30, scale: 0.94 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.65,
      stagger: 0.1,
      ease: EASING.smooth,
      scrollTrigger: {
        trigger: '.stats-section',
        start: SCROLL_TRIGGER_DEFAULTS.start
      }
    }
  );
  
  // Feature cards
  gsap.fromTo('.feat-card',
    { opacity: 0, y: 36, scale: 0.96 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.7,
      stagger: { each: 0.1, from: 'start' },
      ease: EASING.smooth,
      scrollTrigger: {
        trigger: '.feat-grid',
        start: 'top 78%'
      }
    }
  );
  
  // Marquee
  gsap.fromTo('.marquee-wrap',
    { opacity: 0 },
    {
      opacity: 1,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.marquee-wrap',
        start: 'top 92%'
      }
    }
  );
  
  // Testimonials
  gsap.fromTo('.testi',
    { opacity: 0, y: 24, rotateX: 6 },
    {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: 0.6,
      stagger: 0.13,
      ease: EASING.smooth,
      scrollTrigger: {
        trigger: '.testi-grid',
        start: SCROLL_TRIGGER_DEFAULTS.start
      }
    }
  );
  
  // CTA section
  gsap.fromTo('.cta-card',
    { opacity: 0, y: 40, scale: 0.96 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.9,
      ease: EASING.smooth,
      scrollTrigger: {
        trigger: '.cta-card',
        start: 'top 82%'
      }
    }
  );
  
  // Login section
  gsap.fromTo('.login-section',
    { opacity: 0, y: 32 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: EASING.smooth,
      scrollTrigger: {
        trigger: '.login-section',
        start: SCROLL_TRIGGER_DEFAULTS.start
      }
    }
  );
  
  // Footer
  gsap.fromTo('.footer-section',
    { opacity: 0, y: 16 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.footer-section',
        start: 'top 94%'
      }
    }
  );
}

export function cleanupScrollTriggers() {
  const ScrollTrigger = window.ScrollTrigger;
  if (ScrollTrigger) {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }
}
