/**
 * Navbar Animations
 */

import { EASING } from './gsapConfig';

export function animateNavbar(gsap) {
  // Navbar container
  gsap.fromTo('.nav',
    { opacity: 0, y: -30 },
    { opacity: 1, y: 0, duration: 0.7, ease: EASING.smooth, delay: 0.05 }
  );
  
  // Navbar inner
  gsap.fromTo('.nav-inner',
    { scaleX: 0.82, opacity: 0 },
    { scaleX: 1, opacity: 1, duration: 0.6, ease: EASING.bounce, delay: 0.15 }
  );
  
  // Nav links
  gsap.fromTo('.nav-link',
    { opacity: 0, y: -8 },
    { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out', delay: 0.35 }
  );
  
  // Status indicator
  gsap.fromTo('.nav-status',
    { opacity: 0, scale: 0.85 },
    { opacity: 1, scale: 1, duration: 0.4, ease: EASING.bounce, delay: 0.55 }
  );
  
  // CTA button
  gsap.fromTo('.btn-nav-cta',
    { opacity: 0, x: 12, scale: 0.9 },
    { opacity: 1, x: 0, scale: 1, duration: 0.4, ease: EASING.bounce, delay: 0.65 }
  );
  
  // Avatar
  gsap.fromTo('.nav-avatar',
    { opacity: 0, scale: 0.7, rotation: -20 },
    { opacity: 1, scale: 1, rotation: 0, duration: 0.4, ease: EASING.bounce, delay: 0.7 }
  );
  
  // Progress bar
  gsap.fromTo('.nav-progress',
    { scaleX: 0, opacity: 0 },
    { scaleX: 1, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.2 }
  );
}
