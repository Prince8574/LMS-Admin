import { useEffect } from 'react';
import * as THREE from 'three';

export function useThreeBackground(ref) {
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
      return new THREE.Points(geo, new THREE.PointsMaterial({
        color: col || 0xffffff,
        size: sz,
        transparent: true,
        opacity: op,
        sizeAttenuation: true
      }));
    };

    [
      mkPts(2400, 300, .05, .11),
      mkPts(320, 200, .09, .06, 0x00d97e),
      mkPts(240, 220, .08, .05, 0x22d3ee),
      mkPts(160, 180, .07, .05, 0xf59e0b),
      mkPts(110, 190, .06, .04, 0xfb7185)
    ].forEach(p => S.add(p));

    const rings = [
      { col: 0x00d97e, r: 24, t: .06, rx: .4, rz: .2, ry: .0005 },
      { col: 0x22d3ee, r: 38, t: .05, rx: .9, rz: .5, ry: .0003 },
      { col: 0xf59e0b, r: 17, t: .04, rx: 1.3, rz: .9, ry: .0007 },
      { col: 0xa78bfa, r: 48, t: .035, rx: .6, rz: 1.2, ry: .0003 },
      { col: 0xfb7185, r: 32, t: .04, rx: 1.0, rz: .4, ry: .0004 }
    ];

    const RM = rings.map(({ col, r, t, rx, rz, ry }) => {
      const m = new THREE.Mesh(
        new THREE.TorusGeometry(r, t, 8, 120),
        new THREE.MeshBasicMaterial({ color: col, wireframe: true, transparent: true, opacity: .013 })
      );
      m.rotation.x = rx;
      m.rotation.z = rz;
      m.userData = { ry, rz2: .00015 };
      S.add(m);
      return m;
    });

    const shapes = [
      { col: 0x00d97e, sz: 3.2, geo: 'ico' },
      { col: 0x22d3ee, sz: 2.5, geo: 'oct' },
      { col: 0xf59e0b, sz: 1.9, geo: 'tet' },
      { col: 0xa78bfa, sz: 3.0, geo: 'dod' },
      { col: 0xfb7185, sz: 1.6, geo: 'tet' },
      { col: 0x22d3ee, sz: 3.5, geo: 'ico' }
    ];

    const SM = shapes.map(({ col, sz, geo }, i) => {
      let g;
      if (geo === 'ico') g = new THREE.IcosahedronGeometry(sz, 0);
      else if (geo === 'oct') g = new THREE.OctahedronGeometry(sz, 0);
      else if (geo === 'tet') g = new THREE.TetrahedronGeometry(sz, 0);
      else g = new THREE.DodecahedronGeometry(sz, 0);

      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({
        color: col,
        wireframe: true,
        transparent: true,
        opacity: .033 + i * .006
      }));

      m.position.set(
        (Math.random() - .5) * 110,
        (Math.random() - .5) * 80,
        (Math.random() - .5) * 40 - 10
      );

      m.userData = {
        rx: (Math.random() - .5) * .008,
        ry: (Math.random() - .5) * .01,
        fy: Math.random() * Math.PI * 2,
        sp: .07 + Math.random() * .1
      };

      S.add(m);
      return m;
    });

    const hero = new THREE.Mesh(
      new THREE.IcosahedronGeometry(6, 1),
      new THREE.MeshBasicMaterial({ color: 0x00d97e, wireframe: true, transparent: true, opacity: .04 })
    );
    hero.position.set(-16, 2, -12);
    S.add(hero);

    let pmx = 0, pmy = 0, t = 0, raf;

    const onM = e => {
      pmx = (e.clientX / window.innerWidth - .5) * 2;
      pmy = -(e.clientY / window.innerHeight - .5) * 2;
    };

    const onR = () => {
      CAM.aspect = window.innerWidth / window.innerHeight;
      CAM.updateProjectionMatrix();
      R.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', onM);
    window.addEventListener('resize', onR);

    const loop = () => {
      raf = requestAnimationFrame(loop);
      t += .004;

      RM.forEach(m => {
        m.rotation.y += m.userData.ry;
        m.rotation.z += m.userData.rz2;
      });

      SM.forEach(m => {
        m.rotation.x += m.userData.rx;
        m.rotation.y += m.userData.ry;
        m.position.y += Math.sin(t * m.userData.sp + m.userData.fy) * .006;
      });

      hero.rotation.x += .002;
      hero.rotation.y += .004;

      CAM.position.x += (pmx * 3 - CAM.position.x) * .02;
      CAM.position.y += (pmy * 2 - CAM.position.y) * .02;
      CAM.lookAt(0, 0, 0);

      R.render(S, CAM);
    };

    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onM);
      window.removeEventListener('resize', onR);
      R.dispose();
    };
  }, [ref]);
}
