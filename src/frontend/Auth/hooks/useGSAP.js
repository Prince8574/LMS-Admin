import { useState, useEffect } from "react";

export function useGSAP() {
  const [g, setG] = useState(null);
  useEffect(() => {
    if (window.gsap) { setG(window.gsap); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";
    s.onload = () => setG(window.gsap);
    document.head.appendChild(s);
  }, []);
  return g;
}
