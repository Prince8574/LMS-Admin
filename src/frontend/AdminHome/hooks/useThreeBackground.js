import { useEffect } from 'react';
import * as THREE from 'three';

export function useThreeBackground(ref) {
  useEffect(() => {
    if (!ref.current) return;
    
    const R = new THREE.WebGLRenderer({ canvas: ref.current, alpha: true, antialias: true });
    R.setPixelRatio(Math.min(devicePixelRatio, 2));
    R.setSize(innerWidth, innerHeight);
    const S = new THREE.Scene();
    const CAM = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 800);
    CAM.position.z = 52;

    // ── Dense starfield with multiple layers
    const mkP = (n, sp, sz, op, col) => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(n * 3);
      const speeds = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        pos[i*3]   = (Math.random()-.5)*sp;
        pos[i*3+1] = (Math.random()-.5)*sp*.7;
        pos[i*3+2] = (Math.random()-.5)*100;
        speeds[i]  = Math.random()*.005+.001;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
      geo.setAttribute('speed', new THREE.BufferAttribute(speeds,1));
      return new THREE.Points(geo, new THREE.PointsMaterial({
        color:col||0xffffff,
        size:sz,
        transparent:true,
        opacity:op,
        sizeAttenuation:true
      }));
    };

    const starsWhite  = mkP(3200, 300, .055, .15);
    const starsViolet = mkP(480, 220, .09, .08, 0x7c3aff);
    const starsCyan   = mkP(320, 240, .07, .07, 0x00e5ff);
    const starsGreen  = mkP(180, 210, .06, .06, 0x00ff88);
    const starsRose   = mkP(120, 200, .05, .05, 0xff3366);
    const starsAmber  = mkP(90,  180, .05, .04, 0xffaa00);
    [starsWhite,starsViolet,starsCyan,starsGreen,starsRose,starsAmber].forEach(p=>S.add(p));

    // ── Torus rings — layered depth
    const rings = [
      {col:0x7c3aff,r:24,t:.07,rx:.3,rz:.2,ry:.0007,op:.018},
      {col:0x00e5ff,r:38,t:.05,rx:.8,rz:.5,ry:.0005,op:.014},
      {col:0x00ff88,r:18,t:.045,rx:1.2,rz:.8,ry:.0009,op:.012},
      {col:0xff3366,r:48,t:.04,rx:.5,rz:1.1,ry:.0004,op:.010},
      {col:0xffaa00,r:32,t:.035,rx:.9,rz:.3,ry:.0006,op:.009},
    ];
    const ringMeshes = rings.map(({col,r,t,rx,rz,ry,op})=>{
      const m = new THREE.Mesh(
        new THREE.TorusGeometry(r,t,8,120),
        new THREE.MeshBasicMaterial({color:col,wireframe:true,transparent:true,opacity:op})
      );
      m.rotation.x=rx; m.rotation.z=rz; m.userData={ry,rz:.0002};
      S.add(m); return m;
    });

    // ── Wireframe shapes cluster
    const shapes = [
      {col:0x7c3aff,sz:3.5,geo:'ico',rx:.004,ry:.007},
      {col:0x00e5ff,sz:2.6,geo:'oct',rx:-.005,ry:.006},
      {col:0x00ff88,sz:2.0,geo:'tet',rx:.006,ry:-.008},
      {col:0xff3366,sz:3.0,geo:'dod',rx:-.003,ry:.005},
      {col:0x7c3aff,sz:1.8,geo:'tet',rx:.007,ry:.004},
      {col:0x00e5ff,sz:3.8,geo:'ico',rx:-.004,ry:-.006},
      {col:0xffaa00,sz:2.2,geo:'oct',rx:.005,ry:.007},
      {col:0x9d6bff,sz:1.5,geo:'ico',rx:-.006,ry:.008},
    ];
    const shapeMeshes = shapes.map(({col,sz,geo,rx,ry},i)=>{
      let g;
      if(geo==='ico') g=new THREE.IcosahedronGeometry(sz,0);
      else if(geo==='oct') g=new THREE.OctahedronGeometry(sz,0);
      else if(geo==='tet') g=new THREE.TetrahedronGeometry(sz,0);
      else g=new THREE.DodecahedronGeometry(sz,0);
      const mesh=new THREE.Mesh(g,new THREE.MeshBasicMaterial({
        color:col,wireframe:true,transparent:true,opacity:.04+i*.007
      }));
      mesh.position.set(
        (Math.random()-.5)*110,
        (Math.random()-.5)*80,
        (Math.random()-.5)*40-10
      );
      mesh.userData={rx,ry,fy:Math.random()*Math.PI*2,sp:.06+Math.random()*.12};
      S.add(mesh); return mesh;
    });

    // ── Hero focal icosahedron
    const hero = new THREE.Mesh(
      new THREE.IcosahedronGeometry(7,1),
      new THREE.MeshBasicMaterial({color:0x7c3aff,wireframe:true,transparent:true,opacity:.05})
    );
    hero.position.set(16,2,-12);
    hero.userData={rx:.003,ry:.006};
    S.add(hero);

    // ── Smaller satellite shapes around hero
    [0x00e5ff, 0x00ff88, 0xff3366].forEach((col,i) => {
      const m = new THREE.Mesh(
        new THREE.OctahedronGeometry(1.5,0),
        new THREE.MeshBasicMaterial({color:col,wireframe:true,transparent:true,opacity:.08})
      );
      const angle = (i/3)*Math.PI*2;
      m.position.set(16+Math.cos(angle)*12, Math.sin(angle)*8, -8);
      m.userData={rx:.008,ry:.012,orbitAngle:angle,orbitR:12};
      S.add(m);
    });

    let pmx=0,pmy=0,t=0,raf;
    const onM=e=>{
      pmx=(e.clientX/innerWidth-.5)*2;
      pmy=-(e.clientY/innerHeight-.5)*2
    };
    const onR=()=>{
      CAM.aspect=innerWidth/innerHeight;
      CAM.updateProjectionMatrix();
      R.setSize(innerWidth,innerHeight)
    };
    window.addEventListener('mousemove',onM);
    window.addEventListener('resize',onR);

    const loop=()=>{
      raf=requestAnimationFrame(loop); t+=.005;
      ringMeshes.forEach(m=>{
        m.rotation.y+=m.userData.ry;
        m.rotation.z+=m.userData.rz;
      });
      shapeMeshes.forEach(m=>{
        m.rotation.x+=m.userData.rx;
        m.rotation.y+=m.userData.ry;
        m.position.y+=Math.sin(t*m.userData.sp+m.userData.fy)*.007;
      });
      hero.rotation.x+=hero.userData.rx;
      hero.rotation.y+=hero.userData.ry;
      starsViolet.rotation.y+=.0002;
      starsCyan.rotation.y-=.0001;
      starsGreen.rotation.z+=.00008;
      CAM.position.x+=(pmx*4-CAM.position.x)*.022;
      CAM.position.y+=(pmy*2.5-CAM.position.y)*.022;
      CAM.lookAt(0,0,0);
      R.render(S,CAM);
    };
    loop();

    return()=>{
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove',onM);
      window.removeEventListener('resize',onR);
      R.dispose();
    };
  },[]);
}
