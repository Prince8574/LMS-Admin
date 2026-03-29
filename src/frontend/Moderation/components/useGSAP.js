import { useState, useEffect } from 'react';

export function useGSAP() {
  const [g, setG] = useState(null);
  useEffect(() => {
    if (window.gsap) { setG(window.gsap); return }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
    s.onload = () => {
      const ss = document.createElement('script');
      ss.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js';
      ss.onload = () => { window.gsap.registerPlugin(window.ScrollTrigger); setG(window.gsap) };
      document.head.appendChild(ss);
    };
    document.head.appendChild(s);
  }, []);
  return g;
}
