import { useEffect } from 'react';
import * as THREE from 'three';

export function useBg(ref) {
  useEffect(() => {
    if (!ref.current) return;
    const R = new THREE.WebGLRenderer({ canvas: ref.current, alpha: true, antialias: true });
    R.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    R.setSize(window.innerWidth, window.innerHeight);
    const S = new THREE.Scene();
    const CAM = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 600);
    CAM.position.z = 55;

    const mkPts = (n, sp, sz, op, col) => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        pos[i * 3] = (Math.random() - .5) * sp;
        pos[i * 3 + 1] = (Math.random() - .5) * sp * .6;
        pos[i * 3 + 2] = (Math.random() - .5) * 90;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      return new THREE.Points(geo, new THREE.PointsMaterial({ color: col || 0xffffff, size: sz, transparent: true, opacity: op, sizeAttenuation: true }));
    };

    [mkPts(2200, 300, .05, .1), mkPts(280, 200, .09, .05, 0xff6b9d), mkPts(200, 220, .08, .05, 0xf02079), mkPts(150, 180, .07, .04, 0x7c2fff), mkPts(100, 190, .06, .04, 0xe8187c)].forEach(p => S.add(p));

    const rings = [
      { col: 0xff6b9d, r: 24, t: .06, rx: .4, rz: .2, ry: .0005 },
      { col: 0xf02079, r: 38, t: .05, rx: .9, rz: .5, ry: .0003 },
      { col: 0x7c2fff, r: 17, t: .04, rx: 1.3, rz: .9, ry: .0007 },
      { col: 0xe8187c, r: 46, t: .035, rx: .6, rz: 1.2, ry: .0003 }
    ];

    const RM = rings.map(({ col, r, t, rx, rz, ry }) => {
      const m = new THREE.Mesh(new THREE.TorusGeometry(r, t, 8, 120), new THREE.MeshBasicMaterial({ color: col, wireframe: true, transparent: true, opacity: .013 }));
      m.rotation.x = rx; m.rotation.z = rz; m.userData = { ry, rz2: .00015 }; S.add(m); return m;
    });

    const shapes = [
      { col: 0xff6b9d, sz: 3.2, geo: 'ico' }, { col: 0xf02079, sz: 2.5, geo: 'oct' }, { col: 0x7c2fff, sz: 1.9, geo: 'tet' },
      { col: 0xe8187c, sz: 3.0, geo: 'dod' }, { col: 0x8b5cf6, sz: 1.6, geo: 'tet' }, { col: 0xff6b9d, sz: 3.4, geo: 'ico' }
    ];

    const SM = shapes.map(({ col, sz, geo }, i) => {
      let g;
      if (geo === 'ico') g = new THREE.IcosahedronGeometry(sz, 0);
      else if (geo === 'oct') g = new THREE.OctahedronGeometry(sz, 0);
      else if (geo === 'tet') g = new THREE.TetrahedronGeometry(sz, 0);
      else g = new THREE.DodecahedronGeometry(sz, 0);
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: col, wireframe: true, transparent: true, opacity: .032 + i * .006 }));
      m.position.set((Math.random() - .5) * 110, (Math.random() - .5) * 80, (Math.random() - .5) * 40 - 10);
      m.userData = { rx: (Math.random() - .5) * .008, ry: (Math.random() - .5) * .01, fy: Math.random() * Math.PI * 2, sp: .07 + Math.random() * .1 };
      S.add(m); return m;
    });

    const hero = new THREE.Mesh(new THREE.IcosahedronGeometry(6, 1), new THREE.MeshBasicMaterial({ color: 0xff6b9d, wireframe: true, transparent: true, opacity: .04 }));
    hero.position.set(-18, 2, -14); S.add(hero);

    let pmx = 0, pmy = 0, t = 0, raf;
    const onM = e => { pmx = (e.clientX / window.innerWidth - .5) * 2; pmy = -(e.clientY / window.innerHeight - .5) * 2 };
    const onR = () => { CAM.aspect = window.innerWidth / window.innerHeight; CAM.updateProjectionMatrix(); R.setSize(window.innerWidth, window.innerHeight) };
    window.addEventListener('mousemove', onM); window.addEventListener('resize', onR);

    const loop = () => {
      raf = requestAnimationFrame(loop); t += .004;
      RM.forEach(m => { m.rotation.y += m.userData.ry; m.rotation.z += m.userData.rz2 });
      SM.forEach(m => { m.rotation.x += m.userData.rx; m.rotation.y += m.userData.ry; m.position.y += Math.sin(t * m.userData.sp + m.userData.fy) * .006 });
      hero.rotation.x += .002; hero.rotation.y += .004;
      CAM.position.x += (pmx * 3.5 - CAM.position.x) * .022; CAM.position.y += (pmy * 2.2 - CAM.position.y) * .022;
      CAM.lookAt(0, 0, 0); R.render(S, CAM);
    };
    loop();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', onM); window.removeEventListener('resize', onR); R.dispose() };
  }, []);
}
