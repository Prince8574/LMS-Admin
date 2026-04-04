import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../Auth/services/authService";
import * as THREE from "three";
import { C, GR, FEATURES, STATS, TESTIMONIALS } from "./constants";
import { AnimatedAvatarSmall } from "../../components/AnimatedAvatarSmall";
import "./AdminLanding.css";
import { createSafeRenderer } from "../../utils/safeWebGL";

/* ════════════════════════════
THREE.JS — Enhanced Quantum Nebula Scene
════════════════════════════ */
function useBg(ref) {
  useEffect(() => {
    if (!ref.current) return;
    const R = createSafeRenderer(THREE, ref.current);
    if (!R) return;
    R.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    R.setSize(window.innerWidth, window.innerHeight);
    const S = new THREE.Scene();
    const CAM = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 800);
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

    // ── Hero focal icosahedron (larger, centered-right)
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
      pmx=(e.clientX/window.innerWidth-.5)*2;
      pmy=-(e.clientY/window.innerHeight-.5)*2
    };
    const onR=()=>{
      CAM.aspect=window.innerWidth/window.innerHeight;
      CAM.updateProjectionMatrix();
      R.setSize(window.innerWidth,window.innerHeight)
    };
    window.addEventListener('mousemove',onM);
    window.addEventListener('resize',onR);

    const loop=()=>{
      raf=requestAnimationFrame(loop); t+=.005;
      // Rings
      ringMeshes.forEach(m=>{
        m.rotation.y+=m.userData.ry;
        m.rotation.z+=m.userData.rz;
      });
      // Shapes float + rotate
      shapeMeshes.forEach(m=>{
        m.rotation.x+=m.userData.rx;
        m.rotation.y+=m.userData.ry;
        m.position.y+=Math.sin(t*m.userData.sp+m.userData.fy)*.007;
      });
      // Hero
      hero.rotation.x+=hero.userData.rx;
      hero.rotation.y+=hero.userData.ry;
      // Stars slow drift
      starsViolet.rotation.y+=.0002;
      starsCyan.rotation.y-=.0001;
      starsGreen.rotation.z+=.00008;
      // Parallax
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

/* ════════════════════════════
CUSTOM CURSOR
════════════════════════════ */
function CustomCursor() {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);
  const pos = useRef({x:0,y:0});
  const ring= useRef({x:0,y:0});

  useEffect(()=>{
    let raf;
    const onM=e=>{pos.current={x:e.clientX,y:e.clientY}};
    const loop=()=>{
      raf=requestAnimationFrame(loop);
      ring.current.x+=(pos.current.x-ring.current.x)*.14;
      ring.current.y+=(pos.current.y-ring.current.y)*.14;
      if(dotRef.current){
        dotRef.current.style.left=pos.current.x+'px';
        dotRef.current.style.top=pos.current.y+'px';
      }
      if(ringRef.current){
        ringRef.current.style.left=ring.current.x+'px';
        ringRef.current.style.top=ring.current.y+'px';
      }
    };
    const onEnter=()=>ringRef.current?.classList.add('hovered');
    const onLeave=()=>ringRef.current?.classList.remove('hovered');
    const onDown=()=>ringRef.current?.classList.add('clicking');
    const onUp=()=>ringRef.current?.classList.remove('clicking');

    document.querySelectorAll('a,button,.dd-item,.role-opt,.nav-avatar,.nav-bell').forEach(el=>{
      el.addEventListener('mouseenter',onEnter);
      el.addEventListener('mouseleave',onLeave);
    });
    window.addEventListener('mousemove',onM);
    window.addEventListener('mousedown',onDown);
    window.addEventListener('mouseup',onUp);
    loop();

    return()=>{
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove',onM);
      window.removeEventListener('mousedown',onDown);
      window.removeEventListener('mouseup',onUp);
    };
  },[]);

  return (
    <div className="cursor">
      <div ref={ringRef} className="cursor-ring" />
      <div ref={dotRef} className="cursor-dot" />
    </div>
  );
}

/* ════════════════════════════
ANIMATED NUMBER COUNTER
════════════════════════════ */
function Count({to,prefix="",suffix="",dec=0,color}) {
  const [v,setV]=useState(0);
  const ref=useRef(null);
  const done=useRef(false);

  useEffect(()=>{
    const obs=new IntersectionObserver(([e])=>{
      if(e.isIntersecting&&!done.current){
        done.current=true;
        const s=performance.now();
        const tick=n=>{
          const p=Math.min((n-s)/2000,1);
          const ease=1-Math.pow(1-p,4);
          setV(to*ease);
          if(p<1) requestAnimationFrame(tick); else setV(to);
        };
        requestAnimationFrame(tick);
      }
    },{threshold:.3});
    if(ref.current) obs.observe(ref.current);
    return()=>obs.disconnect();
  },[to]);

  const fmt=n=>dec?n.toFixed(dec):n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(0)+'K':Math.round(n).toLocaleString();
  return <span ref={ref} style={color?{color}:{}}>{prefix}{fmt(v)}{suffix}</span>;
}

/* ════════════════════════════
PARTICLES BURST EFFECT
════════════════════════════ */
function ParticleBurst({x,y,active}) {
  if(!active) return null;
  return (
    <div style={{position:'fixed',left:x,top:y,pointerEvents:'none',zIndex:9998}}>
      {[...Array(8)].map((_,i)=>(
        <div key={i} className="particle" style={{
          width:4,height:4,
          background:['#7c3aff','#00e5ff','#00ff88','#ff3366'][i%4],
          position:'absolute',
          '--tx':`${(Math.random()-.5)*60}px`,
          animation:`particleFloat .8s ${i*.05}s ease-out forwards`,
          transform:`rotate(${i*45}deg) translateX(20px)`
        }}/>
      ))}
    </div>
  );
}

/* ════════════════════════════
GSAP LOADER
════════════════════════════ */
function useGSAP() {
  const [g,setG]=useState(null);
  useEffect(()=>{
    if(window.gsap){
      setG(window.gsap);
      return
    }
    const s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
    s.onload=()=>{
      const ss=document.createElement('script');
      ss.src='https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js';
      ss.onload=()=>{
        window.gsap.registerPlugin(window.ScrollTrigger);
        setG(window.gsap)
      };
      document.head.appendChild(ss);
    };
    document.head.appendChild(s);
  },[]);
  return g;
}

/* ════════════════════════════════════════════
MAIN COMPONENT
════════════════════════════════════════════ */
export default function AdminLanding() {
  const bgRef=useRef(null);
  useBg(bgRef);
  const gsap=useGSAP();
  
  const [scrolled,setScrolled]=useState(false);
  const [scrollPct,setScrollPct]=useState(0);
  const [activeNav,setActiveNav]=useState('features');
  const [activeRole,setActiveRole]=useState("super");
  const [loginEmail,setLoginEmail]=useState("");
  const [loginPwd,setLoginPwd]=useState("");
  const [logging,setLogging]=useState(false);
  const [loggedIn,setLoggedIn]=useState(authService.isLoggedIn());
  const [adminUser,setAdminUser]=useState(null);
  const [burst,setBurst]=useState({x:0,y:0,active:false});
  const [heroLine,setHeroLine]=useState('');
  const navigate=useNavigate();

  // Load admin info on mount if logged in
  useEffect(()=>{
    if(authService.isLoggedIn()){
      authService.getMe().then(data=>{
        if(data.success) setAdminUser(data.admin);
      }).catch(()=>{});
    }
  },[]);

  const handleLogout=async()=>{
    await authService.logout();
    setLoggedIn(false);
    setAdminUser(null);
    navigate('/auth');
  };

  // Typewriter for hero
  useEffect(()=>{
    const text='The Command Centre for Education';
    let i=0;
    const iv=setInterval(()=>{
      setHeroLine(text.slice(0,i));
      i++;
      if(i>text.length) clearInterval(iv);
    },45);
    return()=>clearInterval(iv);
  },[]);

  // Scroll listener
  useEffect(()=>{
    const onScroll=()=>{
      setScrolled(window.scrollY>40);
      const el=document.documentElement;
      setScrollPct(Math.min(100,(window.scrollY/(el.scrollHeight-el.clientHeight))*100));
    };
    window.addEventListener('scroll',onScroll);
    return()=>window.removeEventListener('scroll',onScroll);
  },[]);

  // Hover sound-like pulse on interactive elements
  const doBurst=useCallback((e)=>{
    setBurst({x:e.clientX,y:e.clientY,active:true});
    setTimeout(()=>setBurst(b=>({...b,active:false})),900);
  },[]);

  // GSAP animations
  useEffect(()=>{
    if(!gsap) return;
    const tl=gsap.timeline({delay:.15});
    
    // Hero left side
    tl.fromTo('.hero-tag',   {opacity:0,y:24,scale:.9},          {opacity:1,y:0,scale:1,duration:.55,ease:'back.out(2)'})
      .fromTo('.hero-sub',   {opacity:0,y:20},                   {opacity:1,y:0,duration:.65,ease:'power3.out'},'-=.2')
      .fromTo('.hero-btns',  {opacity:0,y:16},                   {opacity:1,y:0,duration:.55,ease:'power3.out'},'-=.2')
      .fromTo('.hero-badges',{opacity:0,y:12},                   {opacity:1,y:0,duration:.5,ease:'power3.out'},'-=.2')
      .fromTo('.hero-right', {opacity:0,x:50,scale:.94,rotateY:8},{opacity:1,x:0,scale:1,rotateY:0,duration:1.1,ease:'power3.out'},'-=.9')
      .fromTo('.hero-float-1',{opacity:0,x:-20},                 {opacity:1,x:0,duration:.5,ease:'back.out(2)'},'-=.5')
      .fromTo('.hero-float-2',{opacity:0,x:20},                  {opacity:1,x:0,duration:.5,ease:'back.out(2)'},'-=.4');

    // Navbar
    gsap.fromTo('.nav',{opacity:0,y:-30},{opacity:1,y:0,duration:.7,ease:'power3.out',delay:.05});
    gsap.fromTo('.nav-inner',{scaleX:.82,opacity:0},{scaleX:1,opacity:1,duration:.6,ease:'back.out(1.5)',delay:.15});
    gsap.fromTo('.nav-link',{opacity:0,y:-8},{opacity:1,y:0,duration:.4,stagger:.06,ease:'power2.out',delay:.35});
    gsap.fromTo('.nav-status',{opacity:0,scale:.85},{opacity:1,scale:1,duration:.4,ease:'back.out(2)',delay:.55});
    gsap.fromTo('.btn-nav-cta',{opacity:0,x:12,scale:.9},{opacity:1,x:0,scale:1,duration:.4,ease:'back.out(2)',delay:.65});
    gsap.fromTo('.nav-avatar',{opacity:0,scale:.7,rotation:-20},{opacity:1,scale:1,rotation:0,duration:.4,ease:'back.out(2)',delay:.7});
    gsap.fromTo('.nav-progress',{scaleX:0,opacity:0},{scaleX:1,opacity:1,duration:.6,ease:'power2.out',delay:.2});

    // Scroll triggers
    const ST=window.ScrollTrigger;
    if(!ST) return;

    // Stats
    gsap.fromTo('.stat-card',{opacity:0,y:30,scale:.94},{opacity:1,y:0,scale:1,duration:.65,stagger:.1,ease:'power3.out',scrollTrigger:{trigger:'.stats-section',start:'top 80%'}});

    // Feature cards
    gsap.fromTo('.feat-card',{opacity:0,y:36,scale:.96},{opacity:1,y:0,scale:1,duration:.7,stagger:{each:.1,from:'start'},ease:'power3.out',scrollTrigger:{trigger:'.feat-grid',start:'top 78%'}});

    // Marquees
    gsap.fromTo('.marquee-wrap',{opacity:0},{opacity:1,duration:.7,ease:'power2.out',scrollTrigger:{trigger:'.marquee-wrap',start:'top 92%'}});

    // Testimonials
    gsap.fromTo('.testi',{opacity:0,y:24,rotateX:6},{opacity:1,y:0,rotateX:0,duration:.6,stagger:.13,ease:'power3.out',scrollTrigger:{trigger:'.testi-grid',start:'top 80%'}});

    // CTA
    gsap.fromTo('.cta-card',{opacity:0,y:40,scale:.96},{opacity:1,y:0,scale:1,duration:.9,ease:'power3.out',scrollTrigger:{trigger:'.cta-card',start:'top 82%'}});

    // Login
    gsap.fromTo('.login-section',{opacity:0,y:32},{opacity:1,y:0,duration:.8,ease:'power3.out',scrollTrigger:{trigger:'.login-section',start:'top 80%'}});

    // Footer
    gsap.fromTo('.footer-section',{opacity:0,y:16},{opacity:1,y:0,duration:.6,ease:'power2.out',scrollTrigger:{trigger:'.footer-section',start:'top 94%'}});

    return()=>ST.getAll().forEach(t=>t.kill());
  },[gsap]);

  // handleLogin — real API call
  const handleLogin=async()=>{
    if(!loginEmail||!loginPwd) return;
    setLogging(true);
    try {
      const data = await authService.login(loginEmail, loginPwd);
      if(data.success){
        setLoggedIn(true);
        setAdminUser(data.admin);
        navigate('/');
      }
    } catch(e) {
      // silent fail — user can use /auth page
    } finally {
      setLogging(false);
    }
  };

  return (
    <div style={{background:C.bg,color:C.text,minHeight:'100vh',position:'relative',overflowX:'hidden'}}>
      <ParticleBurst {...burst}/>
      
      {/* ── BG Layers ── */}
      <canvas ref={bgRef} style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none'}}/>
      <div className="grid-bg"/>
      <div className="scan"/>
      
      {/* Noise texture */}
      <div style={{position:'fixed',inset:'-50%',zIndex:0,pointerEvents:'none',opacity:.013,backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,animation:'noise 8s steps(10) infinite'}}/>
      
      {/* Ambient glows */}
      <div className="orb" style={{width:700,height:700,top:'-15%',left:'-8%',background:'radial-gradient(circle,rgba(124,58,255,.13),transparent 65%)',animation:'orbGlow 6s ease-in-out infinite',animationDelay:'0s',position:'fixed',zIndex:0}}/>
      <div className="orb" style={{width:550,height:550,top:'25%',right:'-10%',background:'radial-gradient(circle,rgba(0,229,255,.09),transparent 65%)',animation:'orbGlow 8s ease-in-out infinite',animationDelay:'2s',position:'fixed',zIndex:0}}/>
      <div className="orb" style={{width:450,height:450,bottom:'5%',left:'25%',background:'radial-gradient(circle,rgba(124,58,255,.07),transparent 65%)',animation:'orbGlow 7s ease-in-out infinite',animationDelay:'1s',position:'fixed',zIndex:0}}/>
      <div className="orb" style={{width:350,height:350,bottom:'20%',right:'15%',background:'radial-gradient(circle,rgba(0,255,136,.05),transparent 65%)',animation:'orbGlow 9s ease-in-out infinite',animationDelay:'3s',position:'fixed',zIndex:0}}/>
      
      {/* ══════════════════════════════
      SCROLL PROGRESS
      ══════════════════════════════ */}
      <div className="nav-progress" style={{width:`${scrollPct}%`}}/>

      {/* ══════════════════════════════
      NAVBAR
      ══════════════════════════════ */}
      <nav className={`nav${scrolled?' scrolled':''}`} style={{opacity:0}}>
        <div className="nav-inner">
          {/* ── LOGO ── */}
          <div className="nav-logo">
            <div className="logo-icon-wrap">
              <div className="logo-ring-1"/>
              <div className="logo-ring-2"/>
              <div className="logo-icon">⬡</div>
            </div>
            <div className="logo-wordmark">
              <div className="logo-text">Learn<span style={{background:GR.v,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Verse</span></div>
              <div className="logo-sub">Admin Console</div>
            </div>
            <div className="logo-badge">v2.6</div>
          </div>

          {/* ── NAV LINKS ── */}
          <div className="nav-links">
            {/* Features mega-dropdown */}
            <div className="nav-link-wrap">
              <a href="#features" className={`nav-link${activeNav==='features'?' active':''}`} onClick={()=>setActiveNav('features')}>
                Features<span style={{fontSize:'.55rem',opacity:.45,transition:'transform .2s'}}>▾</span>
              </a>
              <div className="nav-dropdown" style={{minWidth:260}}>
                <div className="dd-section-label">Platform Modules</div>
                {[
                  {ico:'📊',label:'Analytics',   sub:'Real-time platform data',col:C.v, link:null},
                  {ico:'👥',label:'User Mgmt',   sub:'52K+ learners',         col:C.c, link:null},
                  {ico:'💰',label:'Revenue',     sub:'Billing & payouts',      col:C.am, link:null},
                  {ico:'📚',label:'Courses',     sub:'1,284 active courses',   col:C.g, link:'/courses'},
                ].map(({ico,label,sub,col,link})=>(
                  link ? (
                    <Link key={label} to={link} style={{textDecoration:'none'}}>
                      <div className="dd-item">
                        <div className="dd-icon" style={{background:`${col}13`,border:`1px solid ${col}20`}}>{ico}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:'.8rem',fontWeight:600,color:C.text}}>{label}</div>
                          <div style={{fontFamily:'DM Mono,monospace',fontSize:'.6rem',color:C.t2,marginTop:1}}>{sub}</div>
                        </div>
                        <div className="dd-arrow">›</div>
                      </div>
                    </Link>
                  ) : (
                    <div key={label} className="dd-item">
                      <div className="dd-icon" style={{background:`${col}13`,border:`1px solid ${col}20`}}>{ico}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:'.8rem',fontWeight:600,color:C.text}}>{label}</div>
                        <div style={{fontFamily:'DM Mono,monospace',fontSize:'.6rem',color:C.t2,marginTop:1}}>{sub}</div>
                      </div>
                      <div className="dd-arrow">›</div>
                    </div>
                  )
                ))}
                {/* Divider */}
                <div style={{height:1,background:'rgba(255,255,255,.05)',margin:'6px 4px'}}/>
                <div className="dd-section-label">Admin Tools</div>
                {[
                  {ico:'🛡️',label:'Moderation', sub:'AI-assisted flagging',  col:C.r},
                  {ico:'👨‍🏫',label:'Instructors',sub:'186 verified experts',  col:C.v2},
                ].map(({ico,label,sub,col})=>(
                  <div key={label} className="dd-item">
                    <div className="dd-icon" style={{background:`${col}13`,border:`1px solid ${col}20`}}>{ico}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:'.8rem',fontWeight:600,color:C.text}}>{label}</div>
                      <div style={{fontFamily:'DM Mono,monospace',fontSize:'.6rem',color:C.t2,marginTop:1}}>{sub}</div>
                    </div>
                    <div className="dd-arrow">›</div>
                  </div>
                ))}
              </div>
            </div>

            <a href="#analytics" className={`nav-link${activeNav==='analytics'?' active':''}`} onClick={()=>setActiveNav('analytics')}>Analytics</a>

            {/* Security dropdown */}
            <div className="nav-link-wrap">
              <a href="#security" className={`nav-link${activeNav==='security'?' active':''}`} onClick={()=>setActiveNav('security')}>
                Security<span style={{fontSize:'.55rem',opacity:.45}}>▾</span>
              </a>
              <div className="nav-dropdown">
                <div className="dd-section-label">Security Suite</div>
                {[
                  {ico:'🔐',label:'Multi-Factor Auth',  sub:'TOTP + hardware keys', col:C.g},
                  {ico:'📋',label:'Audit Logs',         sub:'Full action history',   col:C.v},
                  {ico:'🌐',label:'IP Whitelist',       sub:'Geo-restrict access',   col:C.c},
                  {ico:'🔒',label:'AES-256 Encrypt',   sub:'Zero-knowledge model',  col:C.am},
                ].map(({ico,label,sub,col})=>(
                  <div key={label} className="dd-item">
                    <div className="dd-icon" style={{background:`${col}13`,border:`1px solid ${col}20`}}>{ico}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:'.8rem',fontWeight:600,color:C.text}}>{label}</div>
                      <div style={{fontFamily:'DM Mono,monospace',fontSize:'.6rem',color:C.t2,marginTop:1}}>{sub}</div>
                    </div>
                    <div className="dd-arrow">›</div>
                  </div>
                ))}
              </div>
            </div>

            <a href="#pricing" className={`nav-link${activeNav==='pricing'?' active':''}`} onClick={()=>setActiveNav('pricing')}>Pricing</a>
            <a href="#docs"    className={`nav-link${activeNav==='docs'?' active':''}`}    onClick={()=>setActiveNav('docs')}>Docs</a>
          </div>

          {/* ── RIGHT ZONE ── */}
          <div className="nav-right">
            {/* Search button */}
            <div className="nav-search-btn">
              <span style={{fontSize:'.8rem',opacity:.5}}>⌕</span>
              <span>Search</span>
              <div className="search-kbd">
                <span>⌘</span>
                <span>K</span>
              </div>
            </div>

            <div className="nav-divider"/>

            {/* Live status */}
            <div className="nav-status">
              <div className="status-dot"/>
              <span>Operational</span>
            </div>

            {/* Notification bell */}
            <div className="nav-icon-btn" title="Notifications">
              🔔
              <div className="icon-badge" style={{background:C.r}}/>
            </div>

            {/* Settings */}
            <div className="nav-icon-btn" title="Settings">⚙</div>

            <div className="nav-divider"/>

            {/* Sign in ghost — only when logged out */}
            {!loggedIn && (
              <Link to="/auth">
                <button className="btn-nav-ghost">Sign In</button>
              </Link>
            )}

            {/* Primary CTA — only when logged out */}
            {!loggedIn && (
              <Link to="/auth">
                <button className="btn-nav-cta">
                  Dashboard
                  <div className="cta-arrow">→</div>
                </button>
              </Link>
            )}

            {/* Avatar + logout — only when logged in */}
            {loggedIn && (
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div className="nav-avatar-wrap" title={adminUser?.name || "Admin"}>
                  <AnimatedAvatarSmall
                    avatarUrl={localStorage.getItem('admin_avatar')}
                    initials={adminUser?.name ? adminUser.name.slice(0,2).toUpperCase() : 'AD'}
                    size={38}
                  />
                  <div className="avatar-status"/>
                </div>
                <div style={{display:'flex',flexDirection:'column',lineHeight:1.2}}>
                  <span style={{fontSize:'.75rem',fontWeight:600,color:'#fff'}}>{adminUser?.name || "Admin"}</span>
                  <span style={{fontSize:'.62rem',color:'rgba(255,255,255,.4)',fontFamily:'DM Mono,monospace'}}>{adminUser?.role || "admin"}</span>
                </div>
                <button className="btn-nav-ghost" onClick={handleLogout} style={{marginLeft:4}}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════
      HERO SECTION
      ══════════════════════════════ */}
      <section style={{minHeight:'100vh',display:'flex',alignItems:'center',padding:'0 64px',paddingTop:80,position:'relative',zIndex:2}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:64,alignItems:'center',maxWidth:1320,margin:'0 auto',width:'100%'}}>
          {/* Left */}
          <div>
            <div className="hero-tag" style={{opacity:0,marginBottom:24}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:C.v,animation:'dotBlink 2s infinite'}}/>
              LEARNVERSE ADMIN CONSOLE v2.6
            </div>

            {/* Typewriter heading */}
            <div className="clash" style={{fontSize:'clamp(2.4rem,4.5vw,4.2rem)',fontWeight:700,letterSpacing:'-.04em',lineHeight:1.05,marginBottom:24,minHeight:'calc(clamp(2.4rem,4.5vw,4.2rem) * 2.2)'}}>
              <span style={{background:GR.v,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',filter:'drop-shadow(0 0 30px rgba(124,58,255,.4))'}}>{heroLine}</span>
              {heroLine.length < 33 && <span style={{borderRight:'3px solid #7c3aff',marginLeft:2,animation:'typewriterCursor 1s infinite'}}/>}
            </div>

            <p className="hero-sub" style={{fontSize:'1.05rem',color:C.t2,lineHeight:1.75,maxWidth:500,marginBottom:38,opacity:0}}>
              One unified platform to manage 52,000+ learners, 1,284 courses, ₹8.4L monthly revenue
              and a team of 186 verified instructors — in real time.
            </p>

            <div className="hero-btns" style={{display:'flex',gap:14,marginBottom:40,opacity:0}}>
              <Link to={loggedIn ? "/courses" : "/auth"} onClick={doBurst}>
                <button className="btn-v" style={{fontSize:'.96rem',padding:'15px 34px'}}>Access Dashboard →</button>
              </Link>
              <button className="btn-outline" style={{fontSize:'.96rem',padding:'15px 28px'}}>Watch Demo ▶</button>
            </div>

            {/* Trust badges */}
            <div className="hero-badges" style={{display:'flex',flexWrap:'wrap',gap:10,opacity:0}}>
              {[
                {ico:'🔒',l:'SOC 2 Compliant'},
                {ico:'⚡',l:'99.98% Uptime'},
                {ico:'🌐',l:'GDPR Ready'},
                {ico:'🛡️',l:'AES-256 Encrypted'},
              ].map(({ico,l})=>(
                <div key={l} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 13px',borderRadius:99,background:'rgba(255,255,255,.035)',border:'1px solid rgba(255,255,255,.08)',fontSize:'.72rem',color:C.t2,fontFamily:'DM Mono,monospace',transition:'all .2s'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(124,58,255,.3)';e.currentTarget.style.color=C.v2}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,.08)';e.currentTarget.style.color=C.t2}}
                >
                  <span>{ico}</span>{l}
                </div>
              ))}
            </div>
          </div>

          {/* Right — animated UI mockup */}
          <div className="hero-right" style={{position:'relative',opacity:0}}>
            <div className="hero-card">
              {/* Animated top gradient line */}
              <div style={{height:2,background:GR.v,marginBottom:20,animation:'holoPulse 3s ease-in-out infinite',borderRadius:1}}/>

              {/* Header */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
                <div>
                  <div style={{fontFamily:'Clash Display,sans-serif',fontSize:'1.05rem',fontWeight:700,marginBottom:2}}>Platform Overview</div>
                  <div style={{fontFamily:'DM Mono,monospace',fontSize:'.62rem',color:C.t3}}>LIVE · 09:41 AM IST</div>
                </div>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <div style={{width:6,height:6,borderRadius:'50%',background:C.g,animation:'dotBlink 2s ease infinite',boxShadow:`0 0 8px ${C.g}`}}/>
                  <span style={{fontFamily:'DM Mono,monospace',fontSize:'.62rem',color:C.g}}>LIVE</span>
                </div>
              </div>

              {/* Mini metric tiles */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}}>
                {[
                  {l:'Active Now',v:'9,240',c:C.v},
                  {l:"Today's Rev",v:'₹42.8K',c:C.am},
                  {l:'Enrollments',v:'384',c:C.c}
                ].map(({l,v,c})=>(
                  <div key={l} style={{padding:'12px',borderRadius:14,background:`${c}0e`,border:`1px solid ${c}25`,textAlign:'center',transition:'all .22s',cursor:'pointer'}}
                    onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.04)';e.currentTarget.style.borderColor=`${c}55`}}
                    onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.borderColor=`${c}25`}}
                  >
                    <div style={{fontFamily:'Clash Display,sans-serif',fontSize:'1.2rem',fontWeight:700,color:c,textShadow:`0 0 20px ${c}66`}}>{v}</div>
                    <div style={{fontFamily:'DM Mono,monospace',fontSize:'.56rem',color:C.t3,marginTop:3}}>{l.toUpperCase()}</div>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div style={{background:'rgba(255,255,255,.02)',borderRadius:14,padding:'14px',marginBottom:14,border:`1px solid ${C.bord}`}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                  <div style={{fontFamily:'DM Mono,monospace',fontSize:'.62rem',color:C.t3}}>REVENUE TREND</div>
                  <span style={{fontFamily:'DM Mono,monospace',fontSize:'.62rem',color:C.g,fontWeight:700}}>↑ 18.7%</span>
                </div>
                <svg viewBox="0 0 260 55" width="100%" height={55}>
                  <defs>
                    <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.v} stopOpacity=".22"/>
                      <stop offset="100%" stopColor={C.v} stopOpacity="0"/>
                    </linearGradient>
                    <linearGradient id="cg2" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={C.v}/>
                      <stop offset="100%" stopColor={C.c}/>
                    </linearGradient>
                  </defs>
                  <path d="M0,50 L30,43 L65,38 L95,28 L130,32 L165,20 L195,15 L225,10 L260,7 L260,55 L0,55 Z" fill="url(#hg)"/>
                  <polyline points="0,50 30,43 65,38 95,28 130,32 165,20 195,15 225,10 260,7"
                    fill="none" stroke="url(#cg2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{filter:`drop-shadow(0 0 6px ${C.v}99)`,strokeDasharray:700,strokeDashoffset:700,animation:'chartDraw 2.5s .8s ease forwards'}}
                  />
                  {/* Data dots */}
                  {[[0,50],[65,38],[130,32],[195,15],[260,7]].map(([x,y],i)=>(
                    <circle key={i} cx={x} cy={y} r="3.5" fill={C.v} opacity=".9"
                      style={{filter:`drop-shadow(0 0 5px ${C.v})`,animation:`countUp .4s ${.8+i*.2}s both`}}
                    />
                  ))}
                </svg>
              </div>

              {/* Activity feed */}
              {[
                {dot:C.g,text:'84 new enrollments in AWS Cert',t:'14m'},
                {dot:C.am,text:'₹1,24,800 revenue collected',t:'1h'},
                {dot:C.r,text:'12 failed payment attempts flagged',t:'4h'},
              ].map((a,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderBottom:i<2?`1px solid ${C.bord}`:'none',transition:'all .2s'}}
                  onMouseEnter={e=>e.currentTarget.style.paddingLeft='4px'}
                  onMouseLeave={e=>e.currentTarget.style.paddingLeft='0'}
                >
                  <div style={{width:7,height:7,borderRadius:'50%',background:a.dot,flexShrink:0,boxShadow:`0 0 8px ${a.dot}`,animation:'dotBlink 2s infinite'}}/>
                  <div style={{flex:1,fontSize:'.78rem',color:C.text}}>{a.text}</div>
                  <div style={{fontFamily:'DM Mono,monospace',fontSize:'.6rem',color:C.t3}}>{a.t}</div>
                </div>
              ))}
            </div>

            {/* Float badge 1 */}
            <div className="hero-float-1 float-badge" style={{top:-20,left:-32,opacity:0,animation:'tagFloat 4s ease-in-out infinite'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:30,height:30,borderRadius:9,background:GR.v,display:'grid',placeItems:'center',fontSize:'.8rem',boxShadow:'0 0 15px rgba(124,58,255,.5)'}}>⬡</div>
                <div>
                  <div style={{fontSize:'.78rem',fontWeight:700,color:C.text}}>52,840</div>
                  <div style={{fontFamily:'DM Mono,monospace',fontSize:'.56rem',color:C.t3}}>TOTAL USERS</div>
                </div>
              </div>
            </div>

            {/* Float badge 2 */}
            <div className="hero-float-2 float-badge" style={{bottom:-20,right:-32,opacity:0,animation:'tagFloat2 4.5s 1.5s ease-in-out infinite'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:30,height:30,borderRadius:9,background:GR.am,display:'grid',placeItems:'center',fontSize:'.8rem',boxShadow:'0 0 15px rgba(255,170,0,.4)'}}>◉</div>
                <div>
                  <div style={{fontSize:'.78rem',fontWeight:700,color:C.text}}>₹8.4L / mo</div>
                  <div style={{fontFamily:'DM Mono,monospace',fontSize:'.56rem',color:C.t3}}>MRR ↑18.7%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
      MARQUEE — dual row
      ══════════════════════════════ */}
      <div className="marquee-wrap" style={{position:'relative',zIndex:2,opacity:0}}>
        <div style={{overflow:'hidden',marginBottom:10}}>
          <div className="marquee-inner fwd" style={{display:'inline-flex',gap:52}}>
            {[...Array(2)].map((_,r)=>
              ['Course Management','◆','Live Analytics','◆','Revenue Tracking','◆','User Management','◆','Content Moderation','◆','Instructor Payouts','◆','AI Recommendations','◆'].map((t,i)=>(
                <span key={`${r}-${i}`} style={{fontFamily:'DM Mono,monospace',fontSize:'.7rem',color:t==='◆'?C.v2:C.t2,letterSpacing:'.06em',flexShrink:0}}>{t}</span>
              ))
            )}
          </div>
        </div>
        <div style={{overflow:'hidden'}}>
          <div className="marquee-inner rev" style={{display:'inline-flex',gap:52}}>
            {[...Array(2)].map((_,r)=>
              ['GDPR Compliance','◆','Real-time Alerts','◆','Role-Based Access','◆','Zero-Downtime Deploy','◆','AES-256 Encryption','◆','SSO Integration','◆','Audit Logging','◆'].map((t,i)=>(
                <span key={`${r}-${i}`} style={{fontFamily:'DM Mono,monospace',fontSize:'.7rem',color:t==='◆'?C.c:C.t3,letterSpacing:'.06em',flexShrink:0,opacity:.7}}>{t}</span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════
      STATS BAND
      ══════════════════════════════ */}
      <section id="analytics" className="stats-section" style={{padding:'90px 64px',position:'relative',zIndex:2}}>
        <div style={{maxWidth:1280,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:60}}>
            <div className="sec-label" style={{margin:'0 auto 16px'}}>
              <div className="sec-label-dot" style={{background:C.v}}/>
              BY THE NUMBERS
            </div>
            <div className="clash" style={{fontSize:'clamp(1.8rem,3vw,2.6rem)',fontWeight:700,letterSpacing:'-.04em',marginBottom:12}}>
              Platform <span style={{background:GR.v,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>metrics</span> at a glance
            </div>
            <p style={{color:C.t2,fontSize:'.95rem',maxWidth:500,margin:'0 auto',lineHeight:1.7}}>
              Everything you need to measure, monitor and grow your learning platform.
            </p>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:18}}>
            {STATS.map((s,i)=>(
              <div key={i} className="stat-card" style={{'--glow':`${s.col}12`,'--gc':s.gc,textAlign:'center'}}>
                <div className="stat-shimmer"/>
                <div style={{height:2.5,background:s.g,borderRadius:99,marginBottom:22}}/>
                {/* Animated icon */}
                <div style={{width:44,height:44,borderRadius:12,background:`${s.col}14`,border:`1px solid ${s.col}28`,display:'grid',placeItems:'center',margin:'0 auto 16px',fontSize:'1.2rem',animation:'pulse 3s ease-in-out infinite',animationDelay:`${i*.4}s`}}>
                  {['📊','💰','📚','⭐'][i]}
                </div>
                <div className="stat-num" style={{fontSize:'clamp(2rem,3.5vw,2.8rem)',color:s.col,marginBottom:8,textShadow:`0 0 40px ${s.col}55`}}>
                  <Count to={s.v} prefix={s.prefix||''} suffix={s.suffix||''} dec={s.dec||0} color={s.col}/>
                </div>
                <div style={{fontFamily:'Outfit,sans-serif',fontSize:'.88rem',fontWeight:700,color:C.text,marginBottom:4}}>{s.label}</div>
                <div style={{fontFamily:'DM Mono,monospace',fontSize:'.65rem',color:s.col,padding:'3px 10px',borderRadius:99,background:`${s.col}0e`,display:'inline-block'}}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="div-v"/>

      {/* ══════════════════════════════
      FEATURES
      ══════════════════════════════ */}
      <section id="features" style={{padding:'100px 64px',position:'relative',zIndex:2}}>
        <div style={{maxWidth:1280,margin:'0 auto'}}>
          <div className="feat-heading" style={{textAlign:'center',marginBottom:68,opacity:0}}>
            <div className="sec-label" style={{margin:'0 auto 16px'}}>
              <div className="sec-label-dot" style={{background:C.c}}/>
              CAPABILITIES
            </div>
            <div className="clash" style={{fontSize:'clamp(1.8rem,3vw,2.6rem)',fontWeight:700,letterSpacing:'-.04em',marginBottom:12}}>
              Built for admins who demand <span style={{background:GR.cg,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>control</span>
            </div>
            <p style={{color:C.t2,fontSize:'.95rem',maxWidth:520,margin:'0 auto',lineHeight:1.7}}>
              Six power modules — crafted to run a world-class learning platform without breaking a sweat.
            </p>
          </div>

          <div className="feat-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
            {FEATURES.map((f,i)=>(
              <div key={i} className="feat-card" style={{'--hc':f.hc}}
                onMouseMove={e=>{
                  const r=e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%');
                  e.currentTarget.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%');
                }}
              >
                {/* Top accent line */}
                <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:f.g,borderRadius:'24px 24px 0 0',opacity:.85}}/>
                {/* Left accent vertical line */}
                <div style={{position:'absolute',top:24,bottom:24,left:0,width:2,background:f.g,borderRadius:1,opacity:.3}}/>

                <div className="feat-icon-wrap" style={{background:`${f.col}14`,border:`1px solid ${f.col}28`,boxShadow:`0 0 20px ${f.col}18`}}>
                  <span style={{fontSize:'1.4rem',color:f.col,filter:`drop-shadow(0 0 10px ${f.col}99)`}}>{f.icon}</span>
                </div>

                <div className="clash" style={{fontSize:'1.12rem',fontWeight:700,letterSpacing:'-.02em',marginBottom:10}}>{f.title}</div>
                <p style={{fontSize:'.86rem',color:C.t2,lineHeight:1.7,marginBottom:20}}>{f.desc}</p>

                {/* Stats tags */}
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {f.stats.map(s=>(
                    <div key={s} style={{padding:'4px 11px',borderRadius:8,background:`${f.col}0e`,border:`1px solid ${f.col}25`,fontFamily:'DM Mono,monospace',fontSize:'.65rem',fontWeight:700,color:f.col,transition:'all .2s'}}
                      onMouseEnter={e=>{e.currentTarget.style.background=`${f.col}1e`;e.currentTarget.style.boxShadow=`0 0 12px ${f.col}30`}}
                      onMouseLeave={e=>{e.currentTarget.style.background=`${f.col}0e`;e.currentTarget.style.boxShadow='none'}}
                    >{s}</div>
                  ))}
                </div>

                {/* Arrow */}
                <div style={{position:'absolute',bottom:22,right:22,width:30,height:30,borderRadius:8,background:`${f.col}14`,border:`1px solid ${f.col}28`,display:'grid',placeItems:'center',fontSize:'.8rem',color:f.col,opacity:0,transition:'opacity .25s,transform .25s'}}
                  className="feat-arrow">→</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
      TESTIMONIALS
      ══════════════════════════════ */}
      <section style={{padding:'80px 64px',position:'relative',zIndex:2,background:'linear-gradient(180deg,transparent,rgba(6,10,20,.5),transparent)'}}>
        <div style={{maxWidth:1280,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:52}}>
            <div className="sec-label" style={{margin:'0 auto 16px'}}>
              <div className="sec-label-dot" style={{background:C.am}}/>
              WHAT INSTRUCTORS SAY
            </div>
            <div className="clash" style={{fontSize:'clamp(1.6rem,2.5vw,2.2rem)',fontWeight:700,letterSpacing:'-.04em'}}>
              Trusted by <span style={{background:GR.am,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>186 instructors</span>
            </div>
          </div>

          <div className="testi-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
            {TESTIMONIALS.map((t,i)=>(
              <div key={i} className="testi" style={{opacity:0,'--tc':t.tc}}>
                {/* Quote mark with gradient */}
                <div style={{fontSize:'2rem',lineHeight:1,marginBottom:16,background:t.tc,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',filter:'drop-shadow(0 0 10px rgba(255,170,0,.3))'}}>❝</div>
                <p style={{fontSize:'.88rem',color:C.t2,lineHeight:1.75,marginBottom:20}}>{t.text}</p>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:40,height:40,borderRadius:12,background:`linear-gradient(135deg,${t.col}33,${t.col}55)`,border:`1.5px solid ${t.col}44`,display:'grid',placeItems:'center',fontSize:'.75rem',fontWeight:900,color:t.col,flexShrink:0,boxShadow:`0 0 15px ${t.col}25`}}>
                    {t.av}
                  </div>
                  <div>
                    <div style={{fontSize:'.86rem',fontWeight:700}}>{t.name}</div>
                    <div style={{fontSize:'.72rem',color:C.t2,marginTop:2}}>{t.role}</div>
                  </div>
                  <div style={{marginLeft:'auto',display:'flex',gap:2}}>
                    {[...Array(5)].map((_,j)=>(
                      <span key={j} style={{color:C.am,fontSize:'.78rem',animation:`pulse 2s ${j*.15}s ease-in-out infinite`}}>★</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="div-v"/>

      {/* ══════════════════════════════
      CTA SECTION
      ══════════════════════════════ */}
      <section style={{padding:'80px 64px',position:'relative',zIndex:2}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div className="cta-card" style={{opacity:0}}>
            {/* Glow blobs */}
            <div style={{position:'absolute',top:'-50%',left:'-8%',width:450,height:450,background:'radial-gradient(circle,rgba(124,58,255,.16),transparent 65%)',pointerEvents:'none',animation:'liquidGlow 6s ease-in-out infinite'}}/>
            <div style={{position:'absolute',bottom:'-40%',right:'5%',width:350,height:350,background:'radial-gradient(circle,rgba(0,229,255,.11),transparent 65%)',pointerEvents:'none',animation:'liquidGlow 8s 2s ease-in-out infinite'}}/>

            <div style={{position:'relative',zIndex:1,display:'grid',gridTemplateColumns:'1fr auto',gap:48,alignItems:'center'}}>
              <div>
                <div style={{fontFamily:'DM Mono,monospace',fontSize:'.65rem',letterSpacing:'.14em',color:C.v2,marginBottom:18,display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:20,height:2,background:GR.v,borderRadius:1}}/>
                  READY TO LAUNCH
                </div>
                <div className="clash" style={{fontSize:'clamp(1.6rem,3vw,2.6rem)',fontWeight:700,letterSpacing:'-.04em',marginBottom:14,lineHeight:1.15}}>
                  Your entire platform,<br/>
                  <span style={{background:GR.v,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>one screen.</span>
                </div>
                <p style={{fontSize:'.92rem',color:C.t2,lineHeight:1.75,marginBottom:28,maxWidth:500}}>
                  Stop switching between 7 tools. LearnVerse Admin consolidates every management task into
                  a single, fast, beautiful interface built for modern learning platforms.
                </p>
                <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
                  {['No setup fee','Free onboarding','24/7 support','30-day trial'].map(f=>(
                    <div key={f} style={{display:'flex',alignItems:'center',gap:6,fontSize:'.78rem',color:C.g,fontFamily:'DM Mono,monospace'}}>
                      <span style={{filter:'drop-shadow(0 0 5px rgba(0,255,136,.6))'}}>✓</span>{f}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:12,minWidth:210}}>
                <Link to="/auth" onClick={doBurst}>
                  <button className="btn-v" style={{width:'100%',fontSize:'.95rem',padding:'15px 0'}}>Get Started Free →</button>
                </Link>
                <button className="btn-outline" style={{width:'100%',fontSize:'.9rem',padding:'14px 0',textAlign:'center'}}>Schedule a Demo</button>
                <div style={{textAlign:'center',fontSize:'.7rem',color:C.t3,fontFamily:'DM Mono,monospace'}}>No credit card required</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
      LOGIN SECTION
      ══════════════════════════════ */}
      <section id="login" className="login-section" style={{padding:'80px 64px 100px',position:'relative',zIndex:2,opacity:0}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 440px',gap:64,alignItems:'center'}}>
          {/* Left copy */}
          <div>
            <div className="sec-label" style={{marginBottom:20}}>
              <div className="sec-label-dot" style={{background:C.v}}/>
              SECURE ACCESS
            </div>
            <div className="clash" style={{fontSize:'clamp(1.8rem,3vw,2.4rem)',fontWeight:700,letterSpacing:'-.04em',marginBottom:18,lineHeight:1.15}}>
              Admin login.<br/>
              <span style={{background:GR.v,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Secure by design.</span>
            </div>
            <p style={{fontSize:'.9rem',color:C.t2,lineHeight:1.75,marginBottom:28,maxWidth:420}}>
              Multi-factor authentication, role-based access control, full audit logging and AES-256 encryption on all admin sessions.
            </p>

            {[
              {ico:'🔐',l:'Two-Factor Authentication',d:'TOTP + SMS + hardware key support'},
              {ico:'📋',l:'Full Audit Logging',d:'Every action timestamped and logged'},
              {ico:'⏱️',l:'Session Management',d:'Auto-timeout + device tracking'},
              {ico:'🌐',l:'IP Whitelisting',d:'Restrict access by IP range'},
            ].map(({ico,l,d})=>(
              <div key={l} style={{display:'flex',alignItems:'flex-start',gap:14,marginBottom:12,padding:'13px 16px',borderRadius:15,background:'rgba(255,255,255,.025)',border:`1px solid ${C.bord}`,transition:'all .24s'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(124,58,255,.25)';e.currentTarget.style.background='rgba(124,58,255,.04)';e.currentTarget.style.transform='translateX(4px)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.bord;e.currentTarget.style.background='rgba(255,255,255,.025)';e.currentTarget.style.transform='translateX(0)'}}
              >
                <span style={{fontSize:'1rem'}}>{ico}</span>
                <div>
                  <div style={{fontSize:'.84rem',fontWeight:600,marginBottom:2}}>{l}</div>
                  <div style={{fontSize:'.73rem',color:C.t2}}>{d}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Login card */}
          <div>
            {loggedIn?(
              <div className="login-card" style={{textAlign:'center',padding:'60px 40px'}}>
                <div style={{width:76,height:76,borderRadius:'50%',background:'rgba(0,255,136,.1)',border:'2px solid rgba(0,255,136,.35)',display:'grid',placeItems:'center',margin:'0 auto 22px',fontSize:'2rem',animation:'glowC 2s ease-in-out infinite'}}>✓</div>
                <div className="clash" style={{fontSize:'1.35rem',fontWeight:700,marginBottom:8}}>Welcome back!</div>
                <div style={{fontSize:'.86rem',color:C.t2,marginBottom:30}}>Redirecting to Admin Dashboard…</div>
                <div style={{display:'flex',justifyContent:'center',gap:8}}>
                  {[...Array(3)].map((_,i)=>(
                    <div key={i} style={{width:8,height:8,borderRadius:'50%',background:C.v,animation:`dotBlink 1.2s ${i*.2}s ease-in-out infinite`}}/>
                  ))}
                </div>
              </div>
            ):(
              <div className="login-card">
                <div style={{marginBottom:28}}>
                  <div className="clash" style={{fontSize:'1.38rem',fontWeight:700,letterSpacing:'-.03em',marginBottom:4}}>Sign in to Admin</div>
                  <div style={{fontFamily:'DM Mono,monospace',fontSize:'.64rem',color:C.t3,letterSpacing:'.08em'}}>LEARNVERSE CONSOLE · SECURED</div>
                </div>

                {/* Role selector */}
                <div style={{marginBottom:22}}>
                  <div style={{fontFamily:'DM Mono,monospace',fontSize:'.6rem',letterSpacing:'.1em',color:C.t3,textTransform:'uppercase',marginBottom:10}}>Access Level</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                    {[
                      {id:'super',l:'Super Admin',ico:'⬡'},
                      {id:'mod',l:'Moderator',ico:'◎'},
                      {id:'finance',l:'Finance',ico:'◉'}
                    ].map(({id,l,ico})=>(
                      <div key={id} className={`role-opt${activeRole===id?' sel':''}`} onClick={()=>setActiveRole(id)}>
                        <div style={{fontSize:'1.05rem',marginBottom:5,color:activeRole===id?C.v2:C.t2,filter:activeRole===id?`drop-shadow(0 0 8px ${C.v}88)`:'none'}}>{ico}</div>
                        <div style={{fontSize:'.66rem',fontWeight:700,color:activeRole===id?C.v2:C.t2,fontFamily:'DM Mono,monospace'}}>{l.split(' ')[0].toUpperCase()}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Email */}
                <div style={{marginBottom:14}}>
                  <div style={{fontFamily:'DM Mono,monospace',fontSize:'.6rem',letterSpacing:'.1em',color:C.t3,textTransform:'uppercase',marginBottom:7}}>Email</div>
                  <div style={{position:'relative'}}>
                    <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',fontSize:'.82rem',opacity:.35,pointerEvents:'none'}}>✉</span>
                    <input className="inp" type="email" placeholder="admin@learnverse.io"
                      value={loginEmail} onChange={e=>setLoginEmail(e.target.value)}
                      style={{paddingLeft:40}}
                    />
                  </div>
                </div>

                {/* Password */}
                <div style={{marginBottom:24}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:7}}>
                    <div style={{fontFamily:'DM Mono,monospace',fontSize:'.6rem',letterSpacing:'.1em',color:C.t3,textTransform:'uppercase'}}>Password</div>
                    <a href="#" style={{fontFamily:'DM Mono,monospace',fontSize:'.62rem',color:C.v2,transition:'color .2s'}}
                      onMouseEnter={e=>e.target.style.color=C.c}
                      onMouseLeave={e=>e.target.style.color=C.v2}
                    >Forgot?</a>
                  </div>
                  <div style={{position:'relative'}}>
                    <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',fontSize:'.82rem',opacity:.35,pointerEvents:'none'}}>🔒</span>
                    <input className="inp" type="password" placeholder="••••••••••••"
                      value={loginPwd} onChange={e=>setLoginPwd(e.target.value)} style={{paddingLeft:40}}
                      onKeyDown={e=>e.key==='Enter'&&handleLogin()}
                    />
                  </div>
                </div>

                {/* Submit */}
                <button className="btn-v" onClick={handleLogin}
                  style={{width:'100%',padding:'15px 0',fontSize:'.92rem',marginBottom:16}}
                  onMouseEnter={e=>e.currentTarget.style.letterSpacing='.03em'}
                  onMouseLeave={e=>e.currentTarget.style.letterSpacing='.01em'}
                >
                  {logging?(
                    <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
                      <span style={{width:17,height:17,border:'2.5px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .65s linear infinite',display:'inline-block'}}/>
                      Authenticating…
                    </span>
                  ):'Sign In →'}
                </button>

                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
                  <div style={{flex:1,height:1,background:C.bord}}/>
                  <span style={{fontFamily:'DM Mono,monospace',fontSize:'.6rem',color:C.t3}}>OR</span>
                  <div style={{flex:1,height:1,background:C.bord}}/>
                </div>

                <button className="btn-ghost" style={{marginBottom:20}}>🔐 Sign in with SSO</button>

                <div style={{padding:'12px 14px',borderRadius:13,background:'rgba(0,255,136,.05)',border:'1px solid rgba(0,255,136,.14)',display:'flex',alignItems:'center',gap:8}}>
                  <span style={{color:C.g,fontSize:'.82rem',flexShrink:0}}>🔒</span>
                  <span style={{fontFamily:'DM Mono,monospace',fontSize:'.62rem',color:C.t2,lineHeight:1.55}}>
                    Session secured with AES-256 · MFA enforced for all admin roles
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
      FOOTER
      ══════════════════════════════ */}
      <footer className="footer-section" style={{borderTop:`1px solid ${C.bord}`,padding:'40px 64px',position:'relative',zIndex:2,opacity:0}}>
        <div style={{maxWidth:1280,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:30,height:30,borderRadius:9,background:GR.v,display:'grid',placeItems:'center',fontSize:'.85rem',color:'#fff',boxShadow:'0 0 15px rgba(124,58,255,.4)'}}>⬡</div>
            <span style={{fontFamily:'Clash Display,sans-serif',fontSize:'.9rem',fontWeight:700}}>
              Learn<span style={{background:GR.v,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Verse</span>
              <span style={{fontFamily:'DM Mono,monospace',fontSize:'.58rem',color:C.t3,marginLeft:10}}>ADMIN v2.6</span>
            </span>
          </div>

          <div style={{display:'flex',gap:24}}>
            {['Privacy Policy','Terms of Service','Security','Status','Docs'].map(l=>(
              <a key={l} href="#" style={{fontFamily:'DM Mono,monospace',fontSize:'.66rem',color:C.t2,letterSpacing:'.04em',transition:'color .2s',position:'relative'}}
                onMouseEnter={e=>{e.target.style.color=C.v2}}
                onMouseLeave={e=>{e.target.style.color=C.t2}}
              >{l}</a>
            ))}
          </div>

          <div style={{fontFamily:'DM Mono,monospace',fontSize:'.64rem',color:C.t3}}>
            © 2026 LearnVerse Technologies Pvt. Ltd. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
