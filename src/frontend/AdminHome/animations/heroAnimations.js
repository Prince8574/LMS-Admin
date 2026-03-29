/**
 * Hero Section Animations
 */

import { EASING } from './gsapConfig';

export function animateHero(gsap) {
  const tl = gsap.timeline({ delay: 0.15 });
  
  // Hero tag
  tl.fromTo('.hero-tag',
    { opacity: 0, y: 24, scale: 0.9 },
    { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: EASING.bounce }
  );
  
  // Hero subtitle
  tl.fromTo('.hero-sub',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.65, ease: EASING.smooth },
    '-=0.2'
  );
  
  // Hero buttons
  tl.fromTo('.hero-btns',
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: 0.55, ease: EASING.smooth },
    '-=0.2'
  );
  
  // Hero badges
  tl.fromTo('.hero-badges',
    { opacity: 0, y: 12 },
    { opacity: 1, y: 0, duration: 0.5, ease: EASING.smooth },
    '-=0.2'
  );
  
  // Hero right panel
  tl.fromTo('.hero-right',
    { opacity: 0, x: 50, scale: 0.94, rotateY: 8 },
    { opacity: 1, x: 0, scale: 1, rotateY: 0, duration: 1.1, ease: EASING.smooth },
    '-=0.9'
  );
  
  // Float badges
  tl.fromTo('.hero-float-1',
    { opacity: 0, x: -20 },
    { opacity: 1, x: 0, duration: 0.5, ease: EASING.bounce },
    '-=0.5'
  );
  
  tl.fromTo('.hero-float-2',
    { opacity: 0, x: 20 },
    { opacity: 1, x: 0, duration: 0.5, ease: EASING.bounce },
    '-=0.4'
  );
  
  return tl;
}
