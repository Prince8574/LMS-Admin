/**
 * Safely creates a THREE.WebGLRenderer.
 * Returns null if WebGL is not supported instead of throwing.
 */
export function createSafeRenderer(THREE, canvas, opts = {}) {
  try {
    const ctx = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!ctx) return null;
    return new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, ...opts });
  } catch (e) {
    console.warn('WebGL not available:', e.message);
    return null;
  }
}
