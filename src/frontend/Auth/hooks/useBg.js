import { useEffect } from "react";
import * as THREE from "three";

export function useBg(ref) {
  useEffect(() => {
    if (!ref.current) return;
    const R = new THREE.WebGLRenderer({ canvas: ref.current, alpha: true, antialias: true });
    R.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    R.setSize(window.innerWidth, window.innerHeight);
    const S = new THREE.Scene();
    const CAM = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 600);
    CAM.position.z = 55;

    const mkPts = (n, sp, sz, op, col) => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        pos[i*3]   = (Math.random()-.5)*sp;
        pos[i*3+1] = (Math.random()-.5)*sp*.65;
        pos[i*3+2] = (Math.random()-.5)*90;
      }
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      return new THREE.Points(geo, new THREE.PointsMaterial({ color: col||0xffffff, size: sz, transparent: true, opacity: op, sizeAttenuation: true }));
    };

    [
      mkPts(2800, 300, .05, .12),
      mkPts(420,  220, .09, .07, 0x7c2fff),
      mkPts(320,  240, .08, .06, 0x8b5cf6),
      mkPts(240,  200, .07, .05, 0xf02079),
      mkPts(160,  210, .06, .04, 0xe8187c),
      mkPts(100,  180, .05, .04, 0x22d3ee),
    ].forEach(p => S.add(p));

    const rings = [
      { col:0x7c2fff, r:26, t:.07,  rx:.35, rz:.2,  ry:.0006, op:.018 },
      { col:0xf02079, r:42, t:.055, rx:.85, rz:.55, ry:.0004, op:.014 },
      { col:0x8b5cf6, r:18, t:.05,  rx:1.2, rz:.9,  ry:.0008, op:.012 },
      { col:0xe8187c, r:54, t:.04,  rx:.55, rz:1.2, ry:.0003, op:.010 },
      { col:0x22d3ee, r:34, t:.04,  rx:.95, rz:.4,  ry:.0005, op:.011 },
    ];
    const RM = rings.map(({ col,r,t,rx,rz,ry,op }) => {
      const m = new THREE.Mesh(
        new THREE.TorusGeometry(r,t,8,120),
        new THREE.MeshBasicMaterial({ color:col, wireframe:true, transparent:true, opacity:op })
      );
      m.rotation.x = rx; m.rotation.z = rz; m.userData = { ry, rz2:.00018 };
      S.add(m); return m;
    });

    const shapeData = [
      { col:0x7c2fff, sz:4,   geo:"ico" },
      { col:0x8b5cf6, sz:2.8, geo:"oct" },
      { col:0xf02079, sz:2.2, geo:"tet" },
      { col:0xe8187c, sz:3.4, geo:"dod" },
      { col:0x22d3ee, sz:1.8, geo:"tet" },
      { col:0x7c2fff, sz:3.8, geo:"ico" },
      { col:0xf02079, sz:2.4, geo:"oct" },
    ];
    const SM = shapeData.map(({ col,sz,geo },i) => {
      let g;
      if(geo==="ico")      g = new THREE.IcosahedronGeometry(sz,0);
      else if(geo==="oct") g = new THREE.OctahedronGeometry(sz,0);
      else if(geo==="tet") g = new THREE.TetrahedronGeometry(sz,0);
      else                 g = new THREE.DodecahedronGeometry(sz,0);
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color:col, wireframe:true, transparent:true, opacity:.04+i*.007 }));
      m.position.set((Math.random()-.5)*120, (Math.random()-.5)*85, (Math.random()-.5)*45-12);
      m.userData = { rx:(Math.random()-.5)*.009, ry:(Math.random()-.5)*.011, fy:Math.random()*Math.PI*2, sp:.07+Math.random()*.12 };
      S.add(m); return m;
    });

    const hero = new THREE.Mesh(
      new THREE.IcosahedronGeometry(8, 1),
      new THREE.MeshBasicMaterial({ color:0x7c2fff, wireframe:true, transparent:true, opacity:.055 })
    );
    hero.position.set(-16, 0, -18); S.add(hero);

    const hero2 = new THREE.Mesh(
      new THREE.OctahedronGeometry(5, 0),
      new THREE.MeshBasicMaterial({ color:0xf02079, wireframe:true, transparent:true, opacity:.04 })
    );
    hero2.position.set(18, -4, -15); S.add(hero2);

    let pmx=0, pmy=0, t=0, raf;
    const onM = e => { pmx=(e.clientX/window.innerWidth-.5)*2; pmy=-(e.clientY/window.innerHeight-.5)*2; };
    const onR = () => { CAM.aspect=window.innerWidth/window.innerHeight; CAM.updateProjectionMatrix(); R.setSize(window.innerWidth,window.innerHeight); };
    window.addEventListener("mousemove", onM);
    window.addEventListener("resize", onR);

    const loop = () => {
      raf = requestAnimationFrame(loop); t += .004;
      RM.forEach(m => { m.rotation.y += m.userData.ry; m.rotation.z += m.userData.rz2; });
      SM.forEach(m => {
        m.rotation.x += m.userData.rx;
        m.rotation.y += m.userData.ry;
        m.position.y += Math.sin(t * m.userData.sp + m.userData.fy) * .006;
      });
      hero.rotation.x  += .003; hero.rotation.y  += .006;
      hero2.rotation.x -= .002; hero2.rotation.y -= .005;
      CAM.position.x += (pmx*4 - CAM.position.x) * .022;
      CAM.position.y += (pmy*2.5 - CAM.position.y) * .022;
      CAM.lookAt(0,0,0); R.render(S, CAM);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onM);
      window.removeEventListener("resize", onR);
      R.dispose();
    };
  }, []);
}
