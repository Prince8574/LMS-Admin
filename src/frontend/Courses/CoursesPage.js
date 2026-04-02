import { useState, useEffect, useRef } from "react";
import { Sidebar } from "../../components/Sidebar";
import * as THREE from "three";

const G = {
  purple:"linear-gradient(135deg,#7c2fff,#8b5cf6)",
  pink:"linear-gradient(135deg,#f02079,#ff6b9d)",
  teal:"linear-gradient(135deg,#00d4aa,#3b82f6)",
  green:"linear-gradient(135deg,#4ade80,#00d4aa)",
  gold:"linear-gradient(135deg,#f0a500,#ff7a30)",
  violet:"linear-gradient(135deg,#e8187c,#8b5cf6)",
};

/* ══════════════════════════════════════ THREE.JS BG ══════════════════════════════════════ */
function useBg(ref) {
  useEffect(function() {
    let af;
    let R;
    function init() {
      if (!ref.current) return;
      R = new THREE.WebGLRenderer({ canvas: ref.current, alpha: true, antialias: true });
      R.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      R.setSize(window.innerWidth, window.innerHeight);
      const S = new THREE.Scene();
      const CAM = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 500);
      CAM.position.z = 55;

      function mkP(n, sp, sz, op, col) {
        const g = new THREE.BufferGeometry();
        const p = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) {
          p[i*3]=(Math.random()-.5)*sp; p[i*3+1]=(Math.random()-.5)*sp*.7; p[i*3+2]=(Math.random()-.5)*80;
        }
        g.setAttribute("position", new THREE.BufferAttribute(p, 3));
        return new THREE.Points(g, new THREE.PointsMaterial({ color:col||0xffffff, size:sz, transparent:true, opacity:op, sizeAttenuation:true }));
      }
      S.add(mkP(1800,250,.07,.14)); S.add(mkP(500,170,.13,.06));
      S.add(mkP(220,210,.055,.26,0x7c2fff)); S.add(mkP(160,190,.045,.18,0x8b5cf6)); S.add(mkP(100,180,.04,.16,0xf02079));

      [[0x7c2fff,28],[0x8b5cf6,40],[0xf02079,32]].forEach(function(item,i){
        const m=new THREE.Mesh(new THREE.TorusGeometry(item[1],.06,6,100),new THREE.MeshBasicMaterial({color:item[0],wireframe:true,transparent:true,opacity:.013+i*.004}));
        m.rotation.x=.6+i*.4; m.rotation.z=i*.5; m.userData={ry:.0009+i*.0005}; S.add(m);
      });
      [[0x7c2fff,2.8],[0x8b5cf6,2.2],[0xf02079,3.2],[0xa78bfa,1.9],[0xff6b9d,2.5]].forEach(function(item,i){
        const mesh=new THREE.Mesh(new THREE.IcosahedronGeometry(item[1],0),new THREE.MeshBasicMaterial({color:item[0],wireframe:true,transparent:true,opacity:.026+i*.006}));
        mesh.position.set((Math.random()-.5)*95,(Math.random()-.5)*68,(Math.random()-.5)*30-8);
        mesh.userData={rx:(Math.random()-.5)*.005,ry:(Math.random()-.5)*.008,fy:Math.random()*Math.PI*2,sp:.13+Math.random()*.18};
        S.add(mesh);
      });

      function animate() {
        af = requestAnimationFrame(animate);
        const t = performance.now() * 0.001;
        S.children.forEach(function(o) {
          if (o.userData.ry && !o.userData.rx) o.rotation.y += o.userData.ry;
          if (o.userData.rx) { o.rotation.x += o.userData.rx; o.rotation.y += o.userData.ry; o.position.y = Math.sin(t * o.userData.sp + o.userData.fy) * 4; }
        });
        R.render(S, CAM);
      }
      animate();

      function onResize() {
        CAM.aspect = window.innerWidth / window.innerHeight;
        CAM.updateProjectionMatrix();
        R.setSize(window.innerWidth, window.innerHeight);
      }
      window.addEventListener("resize", onResize);
      return function() { cancelAnimationFrame(af); R.dispose(); window.removeEventListener("resize", onResize); };
    }

    // Small delay to ensure canvas is mounted in DOM
    const timer = setTimeout(function() { init(); }, 50);
    return function() { clearTimeout(timer); cancelAnimationFrame(af); if(R) R.dispose(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/* ══════════════════════════════════════ COURSE DATA ══════════════════════════════════════ */

const BADGE_MAP = {
  Bestseller:{bg:"rgba(240,165,0,.14)",col:"#f0a500",bord:"rgba(240,165,0,.3)"},
  "Top Rated":{bg:"rgba(0,212,170,.1)",col:"#00d4aa",bord:"rgba(0,212,170,.25)"},
  New:{bg:"rgba(59,130,246,.12)",col:"#60a5fa",bord:"rgba(59,130,246,.28)"},
  Hot:{bg:"rgba(239,68,68,.1)",col:"#ef4444",bord:"rgba(239,68,68,.25)"},
  Trending:{bg:"rgba(167,139,250,.1)",col:"#a78bfa",bord:"rgba(167,139,250,.25)"},
  Popular:{bg:"rgba(244,114,182,.1)",col:"#f472b6",bord:"rgba(244,114,182,.25)"},
  Completed:{bg:"rgba(74,222,128,.1)",col:"#4ade80",bord:"rgba(74,222,128,.25)"},
};

const STATUS_MAP = {
  published:{label:"Published",bg:"rgba(124,47,255,.1)",col:"#9d7fff",bord:"rgba(124,47,255,.22)",dot:"#7c2fff"},
  draft:{label:"Draft",bg:"rgba(77,122,158,.1)",col:"#4d7a9e",bord:"rgba(77,122,158,.2)",dot:"#4d7a9e"},
  review:{label:"In Review",bg:"rgba(240,32,121,.1)",col:"#f02079",bord:"rgba(240,32,121,.2)",dot:"#f02079"},
  archived:{label:"Archived",bg:"rgba(255,107,157,.08)",col:"#ff6b9d",bord:"rgba(255,107,157,.15)",dot:"#ff6b9d"},
};

/* ══════════════════════════════════════ CSS ══════════════════════════════════════ */
const CSS = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,400&family=Satoshi:wght@400;500;600;700;900&display=swap');
*,::before,::after{box-sizing:border-box;margin:0;padding:0}
html{scrollbar-width:thin;scrollbar-color:#1a1540 transparent}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-thumb{background:linear-gradient(#7c2fff,#8b5cf6);border-radius:2px}
body{background:#050814;color:#ede8ff;font-family:'Satoshi',sans-serif;overflow:hidden;height:100vh}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes shimmer{0%{transform:translateX(-120%)}100%{transform:translateX(120%)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes popIn{from{opacity:0;transform:scale(0.92) translateY(14px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes overlayIn{from{opacity:0}to{opacity:1}}
@keyframes starPop{0%{transform:scale(0) rotate(-30deg)}70%{transform:scale(1.3)}100%{transform:scale(1)}}
@keyframes dotBlink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.6)}}
@keyframes prog{from{width:0}to{width:var(--pw,0%)}}
@keyframes toast{0%{opacity:0;transform:translateY(14px) scale(.92)}12%,84%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-7px) scale(.95)}}
@keyframes barGrow{from{height:0}to{height:var(--bh)}}
@keyframes slideR{from{opacity:0;transform:translateX(22px)}to{opacity:1;transform:translateX(0)}}
@keyframes lineIn{from{stroke-dashoffset:var(--tl,400)}to{stroke-dashoffset:0}}
.lv-layout{display:block;height:100vh;overflow:hidden}
.lv-sidebar{flex-shrink:0;background:rgba(3,5,15,.99);border-right:1px solid rgba(255,255,255,.05);display:flex;flex-direction:column;transition:width .3s cubic-bezier(.4,0,.2,1);overflow:hidden;position:relative;z-index:50}
.lv-sb-logo{display:flex;align-items:center;gap:10px;padding:16px 14px 13px;border-bottom:1px solid rgba(255,255,255,.05);flex-shrink:0;overflow:hidden}
.lv-sb-core{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#7c2fff,#8b5cf6);display:grid;place-items:center;font-size:.82rem;color:#050814;font-weight:900;box-shadow:0 0 16px rgba(124,47,255,.4);flex-shrink:0}
.lv-sb-nav{flex:1;overflow-y:auto;padding:5px 0;scrollbar-width:none}
.lv-sb-sec{padding:9px 13px 3px;font-size:.56rem;letter-spacing:.14em;color:#193348;text-transform:uppercase;white-space:nowrap;overflow:hidden}
.lv-sb-item{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:10px;margin:1px 7px;font-size:.78rem;font-weight:500;color:#4d7a9e;transition:all .2s;cursor:pointer;border:1px solid transparent;white-space:nowrap;overflow:hidden;position:relative;user-select:none}
.lv-sb-item:hover{color:#c8ddf0;background:rgba(255,255,255,.04)}
.lv-sb-item.active{color:#ede8ff;background:linear-gradient(135deg,rgba(124,47,255,.12),rgba(139,92,246,.05));border-color:rgba(124,47,255,.22)}
.lv-sb-item.active::before{content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:16px;border-radius:0 2px 2px 0;background:linear-gradient(#7c2fff,#8b5cf6);box-shadow:0 0 8px rgba(124,47,255,.6)}
.lv-sb-badge{margin-left:auto;padding:2px 6px;border-radius:99px;font-size:.56rem;font-weight:700;flex-shrink:0}
.lv-sb-bottom{margin-top:auto;border-top:1px solid rgba(255,255,255,.05);padding:10px 7px;flex-shrink:0}
.lv-sb-user{display:flex;align-items:center;gap:9px;padding:8px 9px;border-radius:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);cursor:pointer;overflow:hidden;transition:all .2s}
.lv-sb-user:hover{border-color:rgba(124,47,255,.22);background:rgba(124,47,255,.05)}
.lv-main{margin-left:240px;display:flex;flex-direction:column;height:100vh;overflow:hidden;min-width:0}
.lv-topbar{display:flex;align-items:center;gap:11px;padding:13px 22px;background:rgba(3,5,15,.92);backdrop-filter:blur(24px);border-bottom:1px solid rgba(255,255,255,.06);flex-shrink:0}
.lv-content{flex:1;overflow-y:auto;padding:20px 22px;scrollbar-width:thin;scrollbar-color:#0f1e38 transparent}
.lv-search{display:flex;align-items:center;gap:8px;flex:1;max-width:300px;padding:7px 11px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);transition:all .2s}
.lv-search:focus-within{border-color:rgba(124,47,255,.35);background:rgba(124,47,255,.04);box-shadow:0 0 0 3px rgba(124,47,255,.08)}
.lv-search input{background:none;border:none;outline:none;color:#ede8ff;font-family:'Satoshi',sans-serif;font-size:.8rem;flex:1}
.lv-search input::placeholder{color:#193348}
.btn-primary{display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:9px;border:none;background:linear-gradient(135deg,#7c2fff,#8b5cf6);color:#050814;font-family:'Satoshi',sans-serif;font-size:.78rem;font-weight:800;cursor:pointer;transition:all .22s;position:relative;overflow:hidden}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 10px 26px rgba(124,47,255,.38)}
.btn-primary::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent);transform:translateX(-150%);transition:.45s}
.btn-primary:hover::after{transform:translateX(150%)}
.btn-ghost{display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:9px;border:1px solid rgba(255,255,255,.09);background:transparent;color:#4d7a9e;font-family:'Satoshi',sans-serif;font-size:.78rem;font-weight:600;cursor:pointer;transition:all .2s}
.btn-ghost:hover{border-color:rgba(124,47,255,.3);color:#9d7fff;background:rgba(124,47,255,.06)}
.btn-icon{width:30px;height:30px;border-radius:8px;border:1px solid rgba(255,255,255,.07);background:transparent;display:grid;place-items:center;font-size:.82rem;color:#4d7a9e;cursor:pointer;transition:all .2s;flex-shrink:0}
.btn-icon:hover{border-color:rgba(124,47,255,.28);color:#9d7fff;background:rgba(124,47,255,.07)}
.v-btn{width:28px;height:28px;border-radius:7px;border:1px solid rgba(255,255,255,.07);background:transparent;display:grid;place-items:center;font-size:.82rem;color:#4d7a9e;cursor:pointer;transition:all .2s}
.v-btn.on{background:rgba(124,47,255,.12);border-color:rgba(124,47,255,.28);color:#9d7fff}
.stat-card{background:rgba(5,8,20,.97);border:1px solid rgba(255,255,255,.06);border-radius:15px;padding:15px 16px;position:relative;overflow:hidden;transition:all .26s;cursor:default}
.stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--g)}
.stat-card:hover{transform:translateY(-3px);border-color:rgba(124,47,255,.14);box-shadow:0 14px 36px rgba(0,0,0,.5)}
.c-card{background:rgba(8,12,28,.97);border:1px solid rgba(255,255,255,.06);border-radius:17px;overflow:hidden;transition:all .3s cubic-bezier(.4,0,.2,1);cursor:pointer;position:relative}
.c-card:hover{border-color:rgba(124,47,255,.25);transform:translateY(-5px);box-shadow:0 22px 55px rgba(0,0,0,.62),0 0 36px rgba(124,47,255,.06)}
.c-card::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at var(--mx,50%) var(--my,50%),rgba(124,47,255,.05),transparent 58%);opacity:0;transition:opacity .35s;pointer-events:none;z-index:1}
.c-card:hover::before{opacity:1}
.prog-track{background:rgba(255,255,255,.06);border-radius:99px;overflow:hidden}
.prog-fill{height:100%;border-radius:99px;position:relative;overflow:hidden;transition:width 1.4s cubic-bezier(.4,0,.2,1)}
.prog-fill::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent);animation:shimmer 2.4s ease-in-out infinite}
.tag{padding:3px 8px;border-radius:6px;font-size:.62rem;font-weight:700;background:rgba(255,255,255,.05);color:#4d7a9e;border:1px solid rgba(255,255,255,.06);white-space:nowrap;transition:all .2s;display:inline-block}
.bchip{padding:2px 7px;border-radius:5px;font-size:.58rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;display:inline-block}
.sbchip{padding:2px 7px;border-radius:5px;font-size:.56rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;display:inline-flex;align-items:center;gap:3px}
.lc-card{display:flex;align-items:stretch;background:rgba(8,12,28,.97);border:1px solid rgba(255,255,255,.06);border-radius:13px;overflow:hidden;transition:all .24s;cursor:pointer;margin-bottom:8px}
.lc-card:hover{border-color:rgba(124,47,255,.2);transform:translateX(3px);box-shadow:0 10px 34px rgba(0,0,0,.48)}
.f-pill{padding:5px 13px;border-radius:99px;border:1px solid rgba(255,255,255,.07);background:transparent;color:#4d7a9e;font-family:'Satoshi',sans-serif;font-size:.72rem;font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap}
.f-pill.on{background:rgba(124,47,255,.1);color:#9d7fff;border-color:rgba(124,47,255,.25)}
.f-pill:hover:not(.on){background:rgba(255,255,255,.04);color:#c8ddf0}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:1000;display:flex;align-items:center;justify-content:center;padding:18px;animation:overlayIn .22s ease both;backdrop-filter:blur(9px)}
.modal-box{background:#090d1f;border:1px solid rgba(255,255,255,.08);border-radius:20px;max-width:720px;width:100%;max-height:88vh;overflow-y:auto;animation:popIn .3s cubic-bezier(.34,1.2,.64,1) both;scrollbar-width:thin;scrollbar-color:#1a1540 transparent}
.builder-overlay{position:fixed;inset:0;z-index:201;display:flex;width:100vw;height:100vh}
.builder-sb{width:250px;flex-shrink:0;background:rgba(6,10,28,.88);border-right:1px solid rgba(124,47,255,.15);display:flex;flex-direction:column;overflow:hidden;position:relative;backdrop-filter:blur(24px)}
.builder-sb::before{content:'';position:absolute;top:0;left:0;right:0;height:200px;background:radial-gradient(ellipse at 50% 0%,rgba(124,47,255,.18),transparent 70%);pointer-events:none}
.builder-main{flex:1;min-width:0;overflow-y:auto;display:flex;flex-direction:column;background:rgba(4,7,18,.82);backdrop-filter:blur(12px)}
.builder-topbar{display:flex;align-items:center;gap:11px;padding:13px 22px;background:rgba(4,7,18,.95);border-bottom:1px solid rgba(124,47,255,.1);position:sticky;top:0;z-index:10;flex-shrink:0;width:100%;backdrop-filter:blur(20px)}
.builder-canvas{padding:28px 36px;width:100%;box-sizing:border-box;max-width:780px}
.form-group{margin-bottom:16px}
.form-label{font-size:.62rem;letter-spacing:.12em;color:#5a7a9e;text-transform:uppercase;margin-bottom:7px;display:block;font-weight:700}
.form-input{width:100%;padding:11px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:#ede8ff;font-family:'Satoshi',sans-serif;font-size:.86rem;outline:none;transition:all .22s}
.form-input:hover{border-color:rgba(124,47,255,.25);background:rgba(124,47,255,.03)}
.form-input:focus{border-color:rgba(124,47,255,.5);box-shadow:0 0 0 3px rgba(124,47,255,.12),0 2px 12px rgba(124,47,255,.08);background:rgba(124,47,255,.05)}
.form-input::placeholder{color:#2a3a50}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.form-textarea{resize:vertical;min-height:96px;line-height:1.65}
.section-block{background:rgba(5,8,22,.98);border:1px solid rgba(255,255,255,.07);border-radius:14px;margin-bottom:10px;overflow:hidden;transition:border-color .2s,box-shadow .2s}
.section-block:hover{border-color:rgba(124,47,255,.2);box-shadow:0 4px 20px rgba(124,47,255,.06)}
.section-header{display:flex;align-items:center;gap:9px;padding:13px 16px;cursor:pointer;background:rgba(124,47,255,.04);border-bottom:1px solid rgba(255,255,255,.05);transition:background .2s}
.section-header:hover{background:rgba(124,47,255,.08)}
.lesson-item{display:flex;align-items:center;gap:9px;padding:10px 16px;border-bottom:1px solid rgba(255,255,255,.04);transition:background .2s}
.lesson-item:last-child{border-bottom:none}
.lesson-item:hover{background:rgba(124,47,255,.05)}
.skill-pill{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:99px;background:rgba(124,47,255,.12);border:1px solid rgba(124,47,255,.28);font-size:.7rem;color:#9d7fff;transition:all .2s}
.skill-pill:hover{background:rgba(124,47,255,.2);border-color:rgba(124,47,255,.45)}
.skill-pill button{background:none;border:none;color:#9d7fff;padding:0;font-size:.7rem;cursor:pointer;opacity:.6;transition:opacity .2s;line-height:1}
.skill-pill button:hover{opacity:1}
.media-type{display:flex;flex-direction:column;align-items:center;gap:5px;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.02);cursor:pointer;transition:all .22s;min-width:76px}
.media-type:hover{border-color:rgba(124,47,255,.25);background:rgba(124,47,255,.06);transform:translateY(-2px)}
.media-type.selected{border-color:rgba(124,47,255,.45);background:rgba(124,47,255,.12);box-shadow:0 4px 16px rgba(124,47,255,.2)}
.upload-zone{border:2px dashed rgba(124,47,255,.25);border-radius:16px;padding:32px;text-align:center;cursor:pointer;transition:all .25s;background:rgba(124,47,255,.03)}
.upload-zone:hover{border-color:rgba(124,47,255,.55);background:rgba(124,47,255,.08);transform:scale(1.01);box-shadow:0 8px 32px rgba(124,47,255,.12)}
.toggle-wrap{position:relative;width:40px;height:22px;flex-shrink:0;display:inline-block}
.toggle-wrap input{opacity:0;width:0;height:0;position:absolute}
.toggle-slider{position:absolute;inset:0;border-radius:99px;cursor:pointer;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);transition:all .28s}
.toggle-slider::before{content:'';position:absolute;width:16px;height:16px;border-radius:50%;background:#fff;top:2px;left:2px;transition:all .28s;box-shadow:0 2px 6px rgba(0,0,0,.4)}
.toggle-wrap input:checked+.toggle-slider{background:linear-gradient(135deg,#7c2fff,#8b5cf6);border-color:#7c2fff;box-shadow:0 0 14px rgba(124,47,255,.55)}
.toggle-wrap input:checked+.toggle-slider::before{transform:translateX(18px)}
.pricing-toggle{display:flex;padding:4px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);margin-bottom:18px}
.pricing-opt{flex:1;padding:9px;border-radius:10px;text-align:center;cursor:pointer;font-size:.8rem;font-weight:600;color:#4d7a9e;transition:all .22s;border:1px solid transparent}
.pricing-opt.active{background:linear-gradient(135deg,rgba(124,47,255,.2),rgba(139,92,246,.1));color:#ede8ff;border-color:rgba(124,47,255,.32);box-shadow:0 2px 14px rgba(124,47,255,.22)}
.toast-el{position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;align-items:center;gap:11px;padding:12px 18px;border-radius:13px;background:rgba(5,8,20,.99);border:1px solid rgba(124,47,255,.25);box-shadow:0 18px 44px rgba(0,0,0,.62);animation:toast 3.4s ease forwards;font-size:.82rem}
.divider{height:1px;background:rgba(255,255,255,.055)}
.step-prog{width:18px;height:3px;border-radius:99px;transition:all .3s}
.dash-card{background:rgba(5,8,20,.97);border:1px solid rgba(255,255,255,.06);border-radius:15px;padding:18px;overflow:hidden;position:relative}
.assign-card{background:rgba(5,8,20,.97);border:1px solid rgba(255,255,255,.06);border-radius:13px;padding:14px 16px;margin-bottom:8px;transition:all .22s;cursor:pointer}
.assign-card:hover{border-color:rgba(124,47,255,.2);transform:translateX(3px)}
.grade-row{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:11px;background:rgba(5,8,20,.97);border:1px solid rgba(255,255,255,.05);margin-bottom:6px;transition:all .2s}
.grade-row:hover{border-color:rgba(124,47,255,.15)}
.sched-item{display:flex;gap:12px;padding:11px 14px;border-radius:11px;background:rgba(5,8,20,.97);border-left:3px solid var(--bc,#7c2fff);border-top:1px solid rgba(255,255,255,.05);border-right:1px solid rgba(255,255,255,.05);border-bottom:1px solid rgba(255,255,255,.05);margin-bottom:7px;transition:all .2s}
.msg-row{display:flex;gap:11px;padding:11px 14px;border-radius:0;background:rgba(5,8,20,.97);border-bottom:1px solid rgba(255,255,255,.04);cursor:pointer;transition:all .2s}
.msg-row:hover{background:rgba(124,47,255,.04)}
.msg-row.unread{background:rgba(124,47,255,.04)}
.notif-row{display:flex;gap:11px;padding:11px 14px;border-radius:11px;background:rgba(5,8,20,.97);border:1px solid rgba(255,255,255,.05);margin-bottom:6px;cursor:pointer;transition:all .2s}
.notif-row:hover{border-color:rgba(124,47,255,.15)}
.lb-row{display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:12px;background:rgba(5,8,20,.97);border:1px solid rgba(255,255,255,.05);margin-bottom:7px;transition:all .22s}
.lb-row:hover{border-color:rgba(124,47,255,.18);transform:translateX(3px)}
.lb-row.top1{border-color:rgba(240,165,0,.28);background:rgba(240,165,0,.04)}
.lb-row.top2{border-color:rgba(192,192,192,.2);background:rgba(192,192,192,.03)}
.lb-row.top3{border-color:rgba(205,127,50,.18);background:rgba(205,127,50,.03)}
.student-row{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:11px;border:1px solid rgba(255,255,255,.05);background:rgba(5,8,20,.97);transition:all .2s;cursor:pointer;margin-bottom:6px}
.student-row:hover{border-color:rgba(124,47,255,.18);background:rgba(124,47,255,.04);transform:translateX(3px)}
.profile-section{background:rgba(5,8,20,.97);border:1px solid rgba(255,255,255,.06);border-radius:15px;padding:20px;margin-bottom:14px}
.setting-row{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;border-radius:11px;background:rgba(5,8,20,.97);border:1px solid rgba(255,255,255,.05);margin-bottom:6px}
.input-pfx{position:relative}
.pfx-sym{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:#2a4a60;font-size:.86rem;pointer-events:none}
.input-pfx .form-input{padding-left:26px}`;

/* ══════════════════════════════════════ HELPER COMPONENTS ══════════════════════════════════════ */
function Stars({ rating, size = ".68rem" }) {
  return (
    <div style={{ display:"flex", gap:1 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{
          fontSize: size,
          color: i <= Math.floor(rating) ? "#f0a500"
            : i === Math.ceil(rating) && rating % 1 > .3 ? "#f0a500aa"
            : "#193348",
          animation: `starPop .4s ${i * .06}s both`,
        }}>★</span>
      ))}
    </div>
  );
}

function BadgeChip({ text }) {
  const b = BADGE_MAP[text] || BADGE_MAP.Bestseller;
  return (
    <span className="bchip" style={{ background:b.bg, color:b.col, border:`1px solid ${b.bord}` }}>
      {text}
    </span>
  );
}

function StatusChip({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.draft;
  return (
    <span className="sbchip" style={{ background:s.bg, color:s.col, border:`1px solid ${s.bord}` }}>
      <span style={{ width:4, height:4, borderRadius:"50%", background:s.dot, display:"inline-block" }}/>
      {s.label}
    </span>
  );
}

function ProgBar({ pct, gradient, h = 4 }) {
  const [w, setW] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setW(pct), 150); obs.disconnect(); }
    }, { threshold: .1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [pct]);
  return (
    <div ref={ref} className="prog-track" style={{ height: h }}>
      <div className="prog-fill" style={{ width:`${w}%`, background:gradient, height:"100%" }}/>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <label className="toggle-wrap">
      <input type="checkbox" checked={checked} onChange={onChange}/>
      <div className="toggle-slider"/>
    </label>
  );
}

function Toast({ msg, onDone }) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { const t = setTimeout(onDone, 3400); return () => clearTimeout(t); }, []);
  return (
    <div className="toast-el">
      <div style={{ width:22, height:22, borderRadius:6, background:"rgba(124,47,255,.14)", border:"1px solid rgba(124,47,255,.28)", display:"grid", placeItems:"center", fontSize:".76rem", flexShrink:0 }}>✓</div>
      {msg}
    </div>
  );
}

/* ══════════════════════════════════════ COURSE CARD ══════════════════════════════════════ */
function CourseCard({ course: c, idx, onOpen, onEdit, onDelete }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setVis(true), idx * 65); obs.disconnect(); }
    }, { threshold: .08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [idx]);
  const onMM = (e) => {
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
    ref.current.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
  };
  const disc = c.price > 0 ? Math.round((1 - c.price / c.originalPrice) * 100) : 0;
  const pGrad = c.progress === 100 ? "linear-gradient(90deg,#4ade80,#00d4aa)" : "linear-gradient(90deg,#7c2fff,#8b5cf6)";
  return (
    <div ref={ref} className="c-card" onClick={() => onOpen(c)} onMouseMove={onMM}
      style={{ opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(18px)", transition:`opacity .5s ${idx*.07}s, transform .5s ${idx*.07}s cubic-bezier(.4,0,.2,1)` }}>
      <div style={{ height:148, background:c.bg, position:"relative", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
        {c.thumbnail ? (
          <img src={c.thumbnail} alt={c.title} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", zIndex:0 }}/>
        ) : (
          <>
            <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse 65% 70% at 30% 40%,${c.accentGlow},transparent)` }}/>
            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:"3.6rem", opacity:.14, filter:"blur(1px)", animation:"float 4s ease-in-out infinite" }}>{c.emoji}</span>
            </div>
          </>
        )}
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,transparent 35%,rgba(0,0,0,.7))", zIndex:1 }}/>
        {!c.thumbnail && (
          <div style={{ position:"relative", zIndex:2, width:54, height:54, borderRadius:14, display:"grid", placeItems:"center", backdropFilter:"blur(8px)", background:`linear-gradient(135deg,${c.accent}22,${c.accent}44)`, border:`1.5px solid ${c.accent}55`, boxShadow:`0 0 22px ${c.accentGlow}` }}>
            <span style={{ fontSize:"1.6rem", filter:`drop-shadow(0 0 10px ${c.accentGlow})` }}>{c.emoji}</span>
          </div>
        )}
        <div style={{ position:"absolute", top:9, left:10, zIndex:3, display:"flex", gap:4, flexWrap:"wrap" }}>
          <BadgeChip text={c.badge}/><StatusChip status={c.status}/>
        </div>
        <div style={{ position:"absolute", top:9, right:10, zIndex:3, padding:"2px 7px", borderRadius:5, background:"rgba(0,0,0,.62)", backdropFilter:"blur(8px)", fontSize:".6rem", fontWeight:700, color:"#8899b8", border:"1px solid rgba(255,255,255,.08)" }}>{c.level}</div>
        {c.enrolled && (
          <div style={{ position:"absolute", bottom:0, left:0, right:0, zIndex:3, height:3, background:"rgba(0,0,0,.35)" }}>
            <div style={{ height:"100%", width:`${c.progress}%`, background:pGrad, transition:"width 1.5s ease" }}/>
          </div>
        )}
      </div>
      <div style={{ padding:"13px 15px 15px", display:"flex", flexDirection:"column", gap:8, position:"relative", zIndex:2 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:".58rem", fontWeight:800, letterSpacing:".09em", textTransform:"uppercase", color:c.accent }}>{c.cat}</span>
          <span style={{ fontSize:".65rem", color:"#193348" }}>{c.duration} · {c.lessons}L</span>
        </div>
        <div style={{ fontFamily:"'Fraunces',serif", fontSize:".9rem", fontWeight:900, letterSpacing:"-.03em", lineHeight:1.28, color:"#ede8ff", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{c.title}</div>
        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
          <div style={{ width:28, height:28, borderRadius:"50%", background:`linear-gradient(135deg,${c.accent}30,${c.accent}50)`, border:`1px solid ${c.accent}40`, color:c.accent, fontSize:".58rem", fontWeight:800, display:"grid", placeItems:"center", flexShrink:0 }}>{c.initials}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:".74rem", fontWeight:600, color:"#ede8ff" }}>{c.instructor}</div>
            <div style={{ fontSize:".62rem", color:"#193348" }}>{c.cat}</div>
          </div>
          {c.revenue !== "—"
            ? <div style={{ display:"inline-flex", alignItems:"center", padding:"2px 7px", borderRadius:5, fontSize:".6rem", fontWeight:700, background:"rgba(240,32,121,.1)", border:"1px solid rgba(240,32,121,.18)", color:"#f02079" }}>{c.revenue}</div>
            : <div style={{ fontSize:".65rem", color:"#193348" }}>No rev</div>}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          {c.rating ? <span style={{ fontSize:".76rem", fontWeight:800, color:"#f0a500" }}>{c.rating}</span> : null}
          {c.rating ? <Stars rating={c.rating}/> : <span style={{ fontSize:".66rem", color:"#193348" }}>No ratings yet</span>}
          {c.rating ? <span style={{ fontSize:".65rem", color:"#193348" }}>({c.students.toLocaleString()})</span> : null}
          <span style={{ marginLeft:"auto", fontSize:".62rem", color:"#193348" }}>{(c.students / 1000).toFixed(1)}k</span>
        </div>
        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
          {c.tags.slice(0, 3).map(t => <span key={t} className="tag">{t}</span>)}
          {c.tags.length > 3 && <span className="tag" style={{ color:"#193348" }}>+{c.tags.length - 3}</span>}
        </div>
        <div className="divider"/>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:7 }}>
          {c.enrolled ? (
            <>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:".65rem", color:c.progress===100?"#4ade80":"#9d7fff", fontWeight:700 }}>{c.progress===100?"✓ Done":`${c.progress}%`}</span>
                  {c.nextLesson && <span style={{ fontSize:".62rem", color:"#193348" }}>Next: {c.nextLesson}</span>}
                </div>
                <ProgBar pct={c.progress} gradient={pGrad} h={3}/>
              </div>
              <button onClick={e => { e.stopPropagation(); onOpen(c); }}
                style={{ padding:"7px 12px", borderRadius:9, border:"none", fontFamily:"'Satoshi',sans-serif", fontSize:".7rem", fontWeight:800, cursor:"pointer", flexShrink:0, background:c.progress===100?"linear-gradient(135deg,#4ade80,#00d4aa)":"linear-gradient(135deg,#7c2fff,#8b5cf6)", color:"#050814", transition:"all .2s" }}>
                {c.progress===100?"View Cert":"Continue →"}
              </button>
            </>
          ) : (
            <div style={{ display:"flex", alignItems:"baseline", gap:5 }}>
              <span style={{ fontFamily:"'Fraunces',serif", fontSize:"1rem", fontWeight:900, color:"#9d7fff" }}>{c.price===0?"FREE":`₹${c.price.toLocaleString()}`}</span>
              {c.price > 0 && c.originalPrice > c.price && (
                <>
                  <span style={{ fontSize:".68rem", color:"#193348", textDecoration:"line-through" }}>₹{c.originalPrice.toLocaleString()}</span>
                  <span style={{ fontSize:".62rem", fontWeight:800, color:"#4ade80", background:"rgba(74,222,128,.1)", padding:"1px 5px", borderRadius:4 }}>{disc}% off</span>
                </>
              )}
            </div>
          )}
        </div>
        <div style={{ display:"flex", gap:6, paddingTop:6, borderTop:"1px solid rgba(255,255,255,.07)" }}>
          <button onClick={e => { e.stopPropagation(); onEdit(c); }}
            style={{ flex:1, padding:"7px 6px", borderRadius:8, border:"1px solid rgba(124,47,255,.35)", background:"rgba(124,47,255,.12)", color:"#9d7fff", fontFamily:"'Satoshi',sans-serif", fontSize:".68rem", fontWeight:700, cursor:"pointer", transition:"all .18s", display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}
            onMouseOver={e => { e.currentTarget.style.background="rgba(124,47,255,.25)"; e.currentTarget.style.borderColor="rgba(124,47,255,.6)"; e.currentTarget.style.color="#b89fff"; }}
            onMouseOut={e => { e.currentTarget.style.background="rgba(124,47,255,.12)"; e.currentTarget.style.borderColor="rgba(124,47,255,.35)"; e.currentTarget.style.color="#9d7fff"; }}>
            ✏ Edit
          </button>
          <button
            style={{ flex:1, padding:"7px 6px", borderRadius:8, border:"1px solid rgba(0,212,170,.3)", background:"rgba(0,212,170,.1)", color:"#00d4aa", fontFamily:"'Satoshi',sans-serif", fontSize:".68rem", fontWeight:700, cursor:"pointer", transition:"all .18s", display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}
            onMouseOver={e => { e.currentTarget.style.background="rgba(0,212,170,.22)"; e.currentTarget.style.borderColor="rgba(0,212,170,.55)"; e.currentTarget.style.color="#00f0c0"; }}
            onMouseOut={e => { e.currentTarget.style.background="rgba(0,212,170,.1)"; e.currentTarget.style.borderColor="rgba(0,212,170,.3)"; e.currentTarget.style.color="#00d4aa"; }}
            onClick={e => { e.stopPropagation(); window.open(`http://localhost:3001/learn/${c._id || c.id}`, "_blank"); }}>
            👁 Preview
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(c.id); }}
            style={{ padding:"7px 10px", borderRadius:8, border:"1px solid rgba(239,68,68,.25)", background:"rgba(239,68,68,.08)", color:"#ef4444", fontSize:".68rem", cursor:"pointer", transition:"all .18s", display:"flex", alignItems:"center", justifyContent:"center" }}
            onMouseOver={e => { e.currentTarget.style.background="rgba(239,68,68,.2)"; e.currentTarget.style.borderColor="rgba(239,68,68,.5)"; }}
            onMouseOut={e => { e.currentTarget.style.background="rgba(239,68,68,.08)"; e.currentTarget.style.borderColor="rgba(239,68,68,.25)"; }}>
            🗑
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════ COURSE LIST ROW ══════════════════════════════════════ */
function CourseListRow({ course: c, idx, onOpen, onEdit, onDelete }) {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setVis(true), idx * 50); obs.disconnect(); }
    }, { threshold: .1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [idx]);
  const disc = c.price > 0 ? Math.round((1 - c.price / c.originalPrice) * 100) : 0;
  const pGrad = c.progress === 100 ? "linear-gradient(90deg,#4ade80,#00d4aa)" : "linear-gradient(90deg,#7c2fff,#8b5cf6)";
  return (
    <div ref={ref} className="lc-card" onClick={() => onOpen(c)}
      style={{ opacity:vis?1:0, transform:vis?"translateX(0)":"translateX(-14px)", transition:`opacity .48s ${idx*.05}s, transform .48s ${idx*.05}s ease` }}>
      <div style={{ width:96, background:c.bg, flexShrink:0, position:"relative", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ position:"absolute", inset:0, background:`radial-gradient(circle,${c.accentGlow},transparent 70%)` }}/>
        <span style={{ fontSize:"2rem", position:"relative", zIndex:1, filter:`drop-shadow(0 0 10px ${c.accentGlow})` }}>{c.emoji}</span>
        {c.enrolled && (
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3 }}>
            <div style={{ height:"100%", width:`${c.progress}%`, background:pGrad }}/>
          </div>
        )}
      </div>
      <div style={{ flex:1, padding:"11px 13px", display:"flex", gap:12, alignItems:"center" }}>
        <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:4 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}><BadgeChip text={c.badge}/> <StatusChip status={c.status}/></div>
          <div style={{ fontFamily:"'Fraunces',serif", fontSize:".88rem", fontWeight:900, letterSpacing:"-.03em", color:"#ede8ff", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{c.title}</div>
          <div style={{ fontSize:".7rem", color:"#193348" }}>{c.instructor} · {c.level} · {c.duration}</div>
          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
            <Stars rating={c.rating}/>
            {c.rating ? <span style={{ fontSize:".65rem", color:"#193348" }}>{c.rating} ({c.students.toLocaleString()})</span>
              : <span style={{ fontSize:".65rem", color:"#193348" }}>No ratings yet</span>}
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6, flexShrink:0 }}>
          {c.revenue !== "—" && <div style={{ fontSize:".68rem", fontWeight:700, color:"#f02079" }}>{c.revenue}</div>}
          {c.enrolled ? (
            <>
              <div style={{ fontSize:".68rem", color:c.progress===100?"#4ade80":"#9d7fff", fontWeight:700 }}>{c.progress===100?"✓ Done":`${c.progress}%`}</div>
              <div style={{ width:90, height:3, background:"rgba(255,255,255,.06)", borderRadius:99, overflow:"hidden" }}>
                <div style={{ width:`${c.progress}%`, height:"100%", background:pGrad }}/>
              </div>
              <button onClick={e => { e.stopPropagation(); onOpen(c); }}
                style={{ padding:"6px 11px", borderRadius:8, border:"none", fontFamily:"'Satoshi',sans-serif", fontSize:".68rem", fontWeight:800, cursor:"pointer", background:"linear-gradient(135deg,#7c2fff,#8b5cf6)", color:"#050814" }}>
                {c.progress===100?"Cert":"Continue"}
              </button>
            </>
          ) : (
            <>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:".95rem", fontWeight:900, color:"#9d7fff" }}>{c.price===0?"FREE":"₹"+c.price.toLocaleString()}</div>
                {c.price > 0 && <div style={{ fontSize:".65rem", color:"#193348", textDecoration:"line-through" }}>₹{c.originalPrice.toLocaleString()} <span style={{ textDecoration:"none", color:"#4ade80", fontWeight:700 }}>{disc}% off</span></div>}
              </div>
              <button onClick={e => { e.stopPropagation(); onOpen(c); }}
                style={{ padding:"6px 11px", borderRadius:8, border:"none", fontFamily:"'Satoshi',sans-serif", fontSize:".68rem", fontWeight:800, cursor:"pointer", background:"linear-gradient(135deg,#00d4aa,#3b82f6)", color:"#050814" }}>
                Enroll
              </button>
            </>
          )}
          <div style={{ display:"flex", gap:4 }}>
            <button onClick={e => { e.stopPropagation(); onEdit(c); }}
              style={{ padding:"4px 9px", borderRadius:7, border:"1px solid rgba(255,255,255,.07)", background:"transparent", color:"#4d7a9e", fontSize:".66rem", cursor:"pointer", transition:"all .18s" }}
              onMouseOver={e => { e.currentTarget.style.color="#9d7fff"; e.currentTarget.style.borderColor="rgba(124,47,255,.22)"; }}
              onMouseOut={e => { e.currentTarget.style.color="#4d7a9e"; e.currentTarget.style.borderColor="rgba(255,255,255,.07)"; }}>
              ✏ Edit
            </button>
            <button onClick={e => { e.stopPropagation(); onDelete(c.id); }}
              style={{ padding:"4px 7px", borderRadius:7, border:"1px solid rgba(255,255,255,.07)", background:"transparent", color:"#193348", fontSize:".66rem", cursor:"pointer", transition:"all .18s" }}
              onMouseOver={e => { e.currentTarget.style.color="#ef4444"; e.currentTarget.style.borderColor="rgba(239,68,68,.2)"; }}
              onMouseOut={e => { e.currentTarget.style.color="#193348"; e.currentTarget.style.borderColor="rgba(255,255,255,.07)"; }}>
              🗑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════ COURSE MODAL ══════════════════════════════════════ */
function CourseModal({ course: c, onClose, onEdit, onDelete }) {
  useEffect(() => {
    const esc = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const disc = c.price > 0 ? Math.round((1 - c.price / c.originalPrice) * 100) : 0;
  const pGrad = c.progress === 100 ? "linear-gradient(90deg,#4ade80,#00d4aa)" : "linear-gradient(90deg,#7c2fff,#8b5cf6)";
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <div style={{ height:180, background:c.bg, position:"relative", overflow:"hidden", borderRadius:"20px 20px 0 0" }}>
          {c.thumbnail
            ? <img src={c.thumbnail} alt={c.title} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", zIndex:0 }}/>
            : <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse 60% 80% at 30% 50%,${c.accentGlow},transparent)` }}/>
          }
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,transparent 30%,rgba(0,0,0,.75))", zIndex:1 }}/>
          {!c.thumbnail && (
            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", zIndex:1 }}>
              <span style={{ fontSize:"4.5rem", opacity:.12, filter:"blur(2px)" }}>{c.emoji}</span>
            </div>
          )}
          <div style={{ position:"absolute", bottom:16, left:20, zIndex:2 }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:6 }}>
              <span style={{ fontSize:".58rem", fontWeight:800, letterSpacing:".1em", textTransform:"uppercase", color:c.accent, background:`${c.accent}22`, padding:"2px 8px", borderRadius:5, border:`1px solid ${c.accent}44` }}>{c.cat}</span>
              <BadgeChip text={c.badge}/> <StatusChip status={c.status}/>
            </div>
            <div style={{ fontFamily:"'Fraunces',serif", fontSize:"1.2rem", fontWeight:900, letterSpacing:"-.04em", lineHeight:1.22, color:"#ede8ff", maxWidth:450 }}>{c.title}</div>
          </div>
          <button onClick={onClose}
            style={{ position:"absolute", top:12, right:12, zIndex:3, width:32, height:32, borderRadius:8, border:"1px solid rgba(255,255,255,.18)", background:"rgba(0,0,0,.5)", color:"#ede8ff", cursor:"pointer", backdropFilter:"blur(8px)", fontSize:".9rem", display:"grid", placeItems:"center", transition:"all .2s" }}
            onMouseOver={e => e.currentTarget.style.background="rgba(255,255,255,.12)"}
            onMouseOut={e => e.currentTarget.style.background="rgba(0,0,0,.5)"}>✕</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:1, background:"rgba(255,255,255,.05)" }}>
          {[{l:"Rating",v:c.rating?`${c.rating} ★`:"—",col:"#f0a500"},{l:"Students",v:`${(c.students/1000).toFixed(1)}k`,col:"#00d4aa"},{l:"Revenue",v:c.revenue,col:"#f02079"},{l:"Duration",v:c.duration,col:"#ede8ff"}].map(({l,v,col}) => (
            <div key={l} style={{ padding:"10px 11px", background:"#090d1f", textAlign:"center" }}>
              <div style={{ fontFamily:"'Fraunces',serif", fontSize:"1rem", fontWeight:900, color:col }}>{v}</div>
              <div style={{ fontSize:".58rem", textTransform:"uppercase", letterSpacing:".08em", color:"#193348", marginTop:2, fontWeight:700 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ padding:"18px 20px", display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:12, background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,255,255,.055)" }}>
            <div style={{ width:40, height:40, borderRadius:11, background:`linear-gradient(135deg,${c.accent}30,${c.accent}50)`, border:`1px solid ${c.accent}40`, color:c.accent, fontSize:".78rem", fontWeight:900, display:"grid", placeItems:"center", flexShrink:0 }}>{c.initials}</div>
            <div>
              <div style={{ fontSize:".86rem", fontWeight:700 }}>{c.instructor}</div>
              <div style={{ fontSize:".7rem", color:"#193348", marginTop:1 }}>{c.cat} Instructor</div>
            </div>
            <div style={{ marginLeft:"auto", textAlign:"right" }}>
              <div style={{ fontSize:".72rem", color:"#4d7a9e" }}>Updated: {c.updated}</div>
              <div style={{ fontSize:".68rem", color:"#193348", marginTop:1 }}>{c.lessons} lessons</div>
            </div>
          </div>
          <div>
            <div style={{ fontSize:".58rem", fontWeight:800, letterSpacing:".1em", textTransform:"uppercase", color:"#193348", marginBottom:7 }}>About</div>
            <div style={{ fontSize:".82rem", color:"#4d7a9e", lineHeight:1.68 }}>{c.description}</div>
          </div>
          <div>
            <div style={{ fontSize:".58rem", fontWeight:800, letterSpacing:".1em", textTransform:"uppercase", color:"#193348", marginBottom:8 }}>What Students Will Learn</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              {c.outcomes.map((o, i) => (
                <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:7, padding:"7px 10px", borderRadius:8, background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,255,255,.055)" }}>
                  <span style={{ color:"#4ade80", flexShrink:0, marginTop:1, fontSize:".82rem" }}>✓</span>
                  <span style={{ fontSize:".76rem", color:"#4d7a9e" }}>{o}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            {c.tags.map(t => <span key={t} className="tag" style={{ fontSize:".7rem", padding:"3px 9px" }}>{t}</span>)}
          </div>

          {/* Curriculum */}
          {c.curriculum && c.curriculum.length > 0 && (
            <div>
              <div style={{ fontSize:".58rem", fontWeight:800, letterSpacing:".1em", textTransform:"uppercase", color:"#193348", marginBottom:8 }}>Curriculum</div>
              {c.curriculum.map((sec, si) => (
                <div key={si} style={{ marginBottom:8, background:"rgba(255,255,255,.025)", borderRadius:10, overflow:"hidden", border:"1px solid rgba(255,255,255,.055)" }}>
                  <div style={{ padding:"8px 12px", background:"rgba(255,255,255,.03)", fontSize:".78rem", fontWeight:700, display:"flex", alignItems:"center", gap:7 }}>
                    <span style={{ fontSize:".6rem", color:"#7c2fff", fontWeight:800 }}>S{si+1}</span> {sec.title}
                    <span style={{ marginLeft:"auto", fontSize:".62rem", color:"#193348" }}>{sec.lessons?.length || 0} lessons</span>
                  </div>
                  {sec.lessons?.map((l, li) => (
                    <div key={li} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 12px", borderTop:"1px solid rgba(255,255,255,.04)" }}>
                      <span style={{ fontSize:".8rem" }}>{l.type==="video"?"▶":l.type==="doc"?"📄":l.type==="quiz"?"❓":l.type==="live"?"🔴":"📝"}</span>
                      <span style={{ fontSize:".76rem", color:"#4d7a9e", flex:1 }}>{l.title}</span>
                      <span style={{ fontSize:".62rem", color:"#193348" }}>{l.dur}</span>
                      {l.free && <span style={{ fontSize:".58rem", color:"#7c2fff", fontWeight:700 }}>FREE</span>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
          {c.enrolled ? (
            <div style={{ padding:"14px 15px", borderRadius:12, background:`linear-gradient(135deg,${c.accent}0d,rgba(0,0,0,0))`, border:`1px solid ${c.accent}33` }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                <div style={{ fontSize:".82rem", fontWeight:700 }}>Your Progress</div>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:".96rem", fontWeight:900, color:c.progress===100?"#4ade80":"#9d7fff" }}>{c.progress}%</div>
              </div>
              <ProgBar pct={c.progress} gradient={pGrad} h={6}/>
              {c.nextLesson && <div style={{ fontSize:".7rem", color:"#193348", marginTop:6 }}>Next: <span style={{ color:"#4d7a9e", fontWeight:600 }}>{c.nextLesson}</span></div>}
              {c.certificate && (
                <div style={{ marginTop:10, display:"flex", alignItems:"center", gap:7, padding:"7px 10px", borderRadius:8, background:"rgba(74,222,128,.08)", border:"1px solid rgba(74,222,128,.2)" }}>
                  <span>🏅</span><span style={{ fontSize:".76rem", color:"#4ade80", fontWeight:700 }}>Certificate Earned!</span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding:"15px 16px", borderRadius:12, background:"rgba(124,47,255,.05)", border:"1px solid rgba(124,47,255,.18)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                <div>
                  <div style={{ fontSize:".58rem", color:"#193348", marginBottom:3, fontWeight:700, letterSpacing:".08em" }}>PRICE</div>
                  <div style={{ fontFamily:"'Fraunces',serif", fontSize:"1.3rem", fontWeight:900, color:"#9d7fff" }}>{c.price===0?"FREE":`₹${c.price.toLocaleString()}`}</div>
                  {c.price > 0 && c.originalPrice > c.price && (
                    <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
                      <span style={{ fontSize:".72rem", color:"#193348", textDecoration:"line-through" }}>₹{c.originalPrice.toLocaleString()}</span>
                      <span style={{ fontSize:".66rem", fontWeight:800, color:"#4ade80", background:"rgba(74,222,128,.1)", padding:"1px 6px", borderRadius:4 }}>{disc}% OFF</span>
                    </div>
                  )}
                </div>
                <div style={{ width:1, height:40, background:"rgba(255,255,255,.07)" }}/>
                <div>
                  <div style={{ fontSize:".58rem", color:"#193348", marginBottom:3, fontWeight:700, letterSpacing:".08em" }}>STATUS</div>
                  <StatusChip status={c.status}/>
                </div>
                <div style={{ width:1, height:40, background:"rgba(255,255,255,.07)" }}/>
                <div>
                  <div style={{ fontSize:".58rem", color:"#193348", marginBottom:3, fontWeight:700, letterSpacing:".08em" }}>LEVEL</div>
                  <div style={{ fontSize:".8rem", fontWeight:600 }}>{c.level || "—"}</div>
                </div>
                <div style={{ marginLeft:"auto" }}>
                  <div style={{ fontSize:".58rem", color:"#193348", marginBottom:3, fontWeight:700, letterSpacing:".08em" }}>LESSONS</div>
                  <div style={{ fontFamily:"'Fraunces',serif", fontSize:"1rem", fontWeight:900, color:"#ede8ff" }}>{c.curriculum?.reduce((a,s)=>a+(s.lessons?.length||0),0) || c.lessons || 0}</div>
                </div>
              </div>
            </div>
          )}
          <div style={{ display:"flex", gap:7, paddingTop:3, borderTop:"1px solid rgba(255,255,255,.055)" }}>
            <button onClick={() => { onClose(); onEdit(c); }} className="btn-ghost" style={{ flex:1, justifyContent:"center", fontSize:".76rem" }}>✏ Edit Course</button>
            <button className="btn-ghost" style={{ padding:"8px 13px", fontSize:".76rem" }}>📊 Analytics</button>
            <button className="btn-ghost" style={{ padding:"8px 13px", fontSize:".76rem", color:"#ef4444", borderColor:"rgba(239,68,68,.2)" }} onClick={() => { onClose(); onDelete(c._id || c.id); }}>🗑 Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════ COURSE BUILDER ══════════════════════════════════════ */
const BUILDER_STEPS = [
  { id:"basics",    label:"Basic Info",  ico:"📋", desc:"Title & details" },
  { id:"curriculum",label:"Curriculum",  ico:"📚", desc:"Sections & lessons" },
  { id:"media",     label:"Media",       ico:"🎬", desc:"Thumbnail & video" },
  { id:"pricing",   label:"Pricing",     ico:"💰", desc:"Price & settings" },
  { id:"publish",   label:"Publish",     ico:"🚀", desc:"Review & go live" },
];
const DEFAULT_SECTIONS = [
  {id:1,title:"Getting Started",open:true,lessons:[{id:1,type:"video",title:"Welcome & Overview",dur:"5:30",free:true},{id:2,type:"doc",title:"Course Resources",dur:"—",free:true}]},
  {id:2,title:"Core Concepts",open:false,lessons:[{id:3,type:"video",title:"Introduction",dur:"12:45",free:false},{id:4,type:"quiz",title:"Quiz 1",dur:"10 Qs",free:false}]},
];
const TYPE_MAP = {video:"▶",doc:"📄",quiz:"❓",assignment:"📝",live:"🔴",article:"✍️"};
const TYPE_COLORS = {video:"#7c2fff",doc:"#3b82f6",quiz:"#f02079",assignment:"#f0a500",live:"#ef4444",article:"#00d4aa"};

function CourseBuilder({ onClose, editCourse, showToast, onSaved, admin = {} }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [sections, setSections] = useState(
    Array.isArray(editCourse?.curriculum) && editCourse.curriculum.length > 0
      ? editCourse.curriculum
      : DEFAULT_SECTIONS
  );
  const [newSecTitle, setNewSecTitle] = useState("");
  const [lessonInputs, setLessonInputs] = useState({});
  const [lessonType, setLessonType] = useState("video");
  const [pricingMode, setPricingMode] = useState(
    editCourse?.price === 0 ? "free" : editCourse?.price ? "paid" : "paid"
  );
  const [mediaType, setMediaType] = useState("video");
  const [thumbnail, setThumbnail] = useState({
    file: null,
    preview: editCourse?.thumbnail || "",
    link: editCourse?.thumbnail?.startsWith("http") ? editCourse.thumbnail : "",
    mode: editCourse?.thumbnail ? "link" : "upload"
  });
  const [promoVideo, setPromoVideo] = useState({
    file: null,
    preview: editCourse?.promoVideoUrl || "",
    link: editCourse?.promoVideoUrl || "",
    mode: editCourse?.promoVideoUrl ? "link" : "upload"
  });
  const handleFileChange = (setter, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    // For images: also read as base64 so it persists in card
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = ev => setter(s => ({ ...s, file, preview: ev.target.result, mode:"upload" }));
      reader.readAsDataURL(file);
    } else {
      setter(s => ({ ...s, file, preview, mode:"upload" }));
    }
  };
  const [skillInput, setSkillInput] = useState("");
  const [quizQuestions, setQuizQuestions] = useState([
    { id:1, q:"", type:"mcq", options:["","","",""], correct:0 }
  ]);
  const [quizSettings, setQuizSettings] = useState({ timeLimit:15, passing:70, attempts:3 });
  const addQuestion = () => setQuizQuestions(qs => [...qs, { id:Date.now(), q:"", type:"mcq", options:["","","",""], correct:0 }]);
  const removeQuestion = id => setQuizQuestions(qs => qs.filter(q => q.id !== id));
  const updateQuestion = (id, key, val) => setQuizQuestions(qs => qs.map(q => q.id===id ? {...q,[key]:val} : q));
  const updateOption = (qid, idx, val) => setQuizQuestions(qs => qs.map(q => q.id===qid ? {...q, options:q.options.map((o,i)=>i===idx?val:o)} : q));
  const [form, setForm] = useState({
    title:       editCourse?.title       || "",
    subtitle:    editCourse?.subtitle    || "",
    description: editCourse?.description || "",
    category:    editCourse?.category || editCourse?.cat || "Development",
    level:       editCourse?.level       || "Beginner",
    language:    editCourse?.language    || "Hindi + English",
    support:     editCourse?.support     || "Community",
    price:       editCourse?.price       || "",
    originalPrice: editCourse?.originalPrice || "",
    certificate_template: "Standard",
    skills:      Array.isArray(editCourse?.tags) ? editCourse.tags.slice() : [],
    outcomes:    Array.isArray(editCourse?.outcomes) ? editCourse.outcomes.filter(Boolean).concat(["","","",""]).slice(0,Math.max(4, editCourse.outcomes.filter(Boolean).length)) : ["","","",""],
    certificate: editCourse?.certificate ?? true,
    lifetime:    editCourse?.lifetime    ?? true,
    downloadable: editCourse?.downloadable ?? true,
    previewVideo: editCourse?.previewVideo ?? true,
  });
  const uf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const buildPayload = (status) => {
    // Get admin info from prop or token
    let instructorName = admin?.name || "Admin";
    let instructorInitials = admin?.initials || "AD";
    if (instructorName === "Admin") {
      try {
        const token = localStorage.getItem("admin_token");
        if (token) {
          const p = JSON.parse(atob(token.split('.')[1]));
          if (p.name) { instructorName = p.name; instructorInitials = p.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2); }
        }
      } catch (_) {}
    }
    return {
      ...form,
      curriculum:    sections,
      quiz:          mediaType === "quiz" ? { ...quizSettings, questions: quizQuestions } : null,
      assignment:    mediaType === "assignment" ? form.assignment : null,
      mediaType,
      status,
      isPublished:   status === "published",
      tags:          Array.isArray(form.skills) ? form.skills : (form.skills || "").split(",").map(s => s.trim()).filter(Boolean),
      outcomes:      Array.isArray(form.outcomes) ? form.outcomes.filter(o => o.trim()) : [],
      instructor:    { name: instructorName, initials: instructorInitials },
      thumbnail:     thumbnail.link || thumbnail.preview || "",
      promoVideoUrl: promoVideo.link || (promoVideo.preview?.startsWith("blob:") ? "" : promoVideo.preview) || "",
    };
  };

  const handleSave = async (status) => {
    const token = localStorage.getItem("admin_token");
    setSaving(true);
    try {
      const { courseService } = await import("./courseService");
      let thumbnailUrl = thumbnail.link || "";

      if (thumbnail.file && token) {
        const upRes = await courseService.uploadThumbnail(thumbnail.file);
        if (upRes.success) thumbnailUrl = upRes.url;
      } else if (thumbnail.preview && thumbnail.preview.startsWith("data:")) {
        thumbnailUrl = thumbnail.preview;
      }

      const payload = { ...buildPayload(status), thumbnail: thumbnailUrl };

      if (token) {
        const res = editCourse
          ? await courseService.update(editCourse._id || editCourse.id, payload)
          : await courseService.create(payload);
        if (res.success) {
          onSaved && onSaved(res.data);

          // Auto-create assignment when publishing a new course
          if (status === "published" && !editCourse && form.title) {
            try {
              await fetch("http://localhost:5000/api/assignments", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                  title:      form.title,
                  courseName: form.title,
                  description: form.description || `Assignment for ${form.title}`,
                  type:       "assignment",
                  priority:   "medium",
                  maxScore:   100,
                  dueDate:    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                  isActive:   true,
                }),
              });
            } catch (_) {}
            showToast("🚀 Course published! Redirecting to Assignments…");
            onClose();
            // Redirect to assignments page
            setTimeout(() => { window.location.href = "/assignments"; }, 1200);
            return;
          }

          showToast(status === "published" ? "🚀 Course published!" : "✓ Draft saved!");
          onClose();
          return;
        }
        showToast("❌ " + (res.message || "Save failed"));
      } else {
        onSaved && onSaved({ ...payload, _id: Date.now(), id: Date.now() });
        showToast(status === "published" ? "🚀 Published (local)" : "✓ Saved locally");
        onClose();
      }
    } catch (e) {
      const payload = buildPayload(status);
      onSaved && onSaved({ ...payload, _id: Date.now(), id: Date.now(), thumbnail: thumbnail.preview || thumbnail.link || "" });
      showToast("✓ Saved locally (backend offline)");
      onClose();
    } finally {
      setSaving(false);
    }
  };
  const toggleSection = id => setSections(ss => ss.map(s => s.id === id ? { ...s, open: !s.open } : s));
  const deleteSection = id => setSections(ss => ss.filter(s => s.id !== id));
  const deleteLesson = (sid, lid) => setSections(ss => ss.map(s => s.id === sid ? { ...s, lessons: s.lessons.filter(l => l.id !== lid) } : s));
  const addSection = () => { if (!newSecTitle.trim()) return; setSections(ss => [...ss, { id: Date.now(), title: newSecTitle.trim(), open: true, lessons: [] }]); setNewSecTitle(""); };
  const addLesson = sid => {
    const t = (lessonInputs[sid] || "").trim();
    if (!t) return;
    const url = lessonInputs[`${sid}_url`] || "";
    const content = lessonInputs[`${sid}_content`] || "";
    setSections(ss => ss.map(s => s.id === sid ? {
      ...s, lessons: [...s.lessons, {
        id: Date.now(), type: lessonType, title: t, dur: "—", free: false,
        videoUrl:  (lessonType === "video" || lessonType === "live") ? url : "",
        docUrl:    lessonType === "doc" ? url : "",
        content:   lessonType === "article" ? content : "",
      }]
    } : s));
    setLessonInputs(li => ({ ...li, [sid]: "", [`${sid}_url`]: "", [`${sid}_content`]: "" }));
  };
  const addSkill = () => { if (!skillInput.trim() || form.skills.includes(skillInput.trim())) return; uf("skills", [...form.skills, skillInput.trim()]); setSkillInput(""); };
  const totalLessons = sections.reduce((a, s) => a + s.lessons.length, 0);
  const checklist = [
    { l: "Course title & description", ok: !!form.title },
    { l: "Curriculum sections", ok: sections.some(s => s.lessons.length > 0) },
    { l: "Thumbnail uploaded", ok: !!(thumbnail.file || thumbnail.link) },
    { l: "Pricing configured", ok: pricingMode === "free" || !!form.price },
    { l: "Skills/tags added", ok: form.skills.length > 0 },
  ];
  return (
    <>
      <div className="builder-overlay" style={{ zIndex:201 }}>
        <div className="builder-sb" style={{ position:"relative", zIndex:1 }}>
        <div style={{ padding:"18px 16px 14px", borderBottom:"1px solid rgba(124,47,255,.12)", background:"rgba(124,47,255,.04)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:4 }}>
            <div style={{ width:28, height:28, borderRadius:9, background:"linear-gradient(135deg,#7c2fff,#8b5cf6)", display:"grid", placeItems:"center", fontSize:".8rem", color:"#fff", fontWeight:900, boxShadow:"0 0 14px rgba(124,47,255,.5)" }}>⬡</div>
            <div style={{ fontSize:".9rem", fontWeight:800, color:"#ede8ff" }}>Course Builder</div>
          </div>
          <div style={{ fontSize:".56rem", letterSpacing:".12em", color:"#4d7a9e", textTransform:"uppercase", fontWeight:700 }}>{editCourse ? "✏ EDITING COURSE" : "✨ NEW COURSE"}</div>
        </div>
        <div style={{ padding:"12px 10px", flex:1, overflowY:"auto", scrollbarWidth:"none" }}>
          {BUILDER_STEPS.map((s, i) => (
            <div key={s.id} onClick={() => setStep(i)}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 11px", borderRadius:11, cursor:"pointer", background:i===step?"rgba(124,47,255,.12)":"transparent", border:i===step?"1px solid rgba(124,47,255,.28)":"1px solid transparent", marginBottom:3, transition:"all .2s", position:"relative" }}>
              {/* Step number circle */}
              <div style={{ width:24, height:24, borderRadius:"50%", flexShrink:0, display:"grid", placeItems:"center", fontSize:".62rem", fontWeight:800, background:i<step?"linear-gradient(135deg,#7c2fff,#8b5cf6)":i===step?"linear-gradient(135deg,#7c2fff,#8b5cf6)":"rgba(255,255,255,.05)", border:`1.5px solid ${i<=step?"#7c2fff":"rgba(255,255,255,.09)"}`, color:i<step?"#fff":i===step?"#fff":"#2a4a60", boxShadow:i===step?"0 0 12px rgba(124,47,255,.6)":"none", transition:"all .3s" }}>
                {i < step ? "✓" : i + 1}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:".78rem", fontWeight:i===step?700:500, color:i===step?"#ede8ff":i<step?"#7c2fff":"#2a4a60", transition:"color .2s" }}>{s.label}</div>
                <div style={{ fontSize:".6rem", color:i===step?"#4d7a9e":"#193348", marginTop:1 }}>{s.desc}</div>
              </div>
              <span style={{ fontSize:".9rem", opacity:i===step?1:0.3 }}>{s.ico}</span>
            </div>
          ))}

          {/* Progress bar */}
          <div style={{ margin:"12px 10px 8px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
              <span style={{ fontSize:".58rem", color:"#4d7a9e", letterSpacing:".08em" }}>PROGRESS</span>
              <span style={{ fontSize:".58rem", color:"#7c2fff", fontWeight:700 }}>{Math.round((step / (BUILDER_STEPS.length - 1)) * 100)}%</span>
            </div>
            <div style={{ height:3, background:"rgba(255,255,255,.06)", borderRadius:99, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${(step / (BUILDER_STEPS.length - 1)) * 100}%`, background:"linear-gradient(90deg,#7c2fff,#8b5cf6)", borderRadius:99, transition:"width .4s ease" }} />
            </div>
          </div>

          {form.title && (
            <div style={{ margin:"8px 8px 10px", padding:"12px 13px", borderRadius:12, background:"rgba(124,47,255,.07)", border:"1px solid rgba(124,47,255,.16)" }}>
              <div style={{ fontSize:".52rem", letterSpacing:".1em", color:"#4d7a9e", marginBottom:4, fontWeight:700, textTransform:"uppercase" }}>PREVIEW</div>
              <div style={{ fontWeight:700, fontSize:".78rem", lineHeight:1.3, marginBottom:3, color:"#ede8ff" }}>{form.title}</div>
              <div style={{ fontSize:".66rem", color:"#4d7a9e" }}>{form.category} · {form.level}</div>
            </div>
          )}
        </div>
      </div>
      <div className="builder-main" style={{ position:"relative", zIndex:1 }}>
        <div className="builder-topbar">
          <button className="btn-icon" onClick={onClose}>✕</button>
          <div style={{ fontSize:".92rem", fontWeight:700 }}>{editCourse ? `Editing: ${editCourse.title}` : "New Course"}</div>
          <div style={{ flex:1 }}/>
          <div style={{ display:"flex", gap:3 }}>{BUILDER_STEPS.map((_, i) => (<div key={i} style={{ width:18, height:3, borderRadius:99, transition:"all .3s", background:i<step?"#7c2fff":i===step?"#8b5cf6":"rgba(255,255,255,.1)" }}/>))}</div>
          <div style={{ fontSize:".64rem", color:"#4d7a9e" }}>{step+1}/{BUILDER_STEPS.length}</div>
          <button onClick={() => handleSave("draft")} disabled={saving}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:10, border:"1px solid rgba(124,47,255,.25)", background:"rgba(124,47,255,.08)", color:"#9d7fff", fontFamily:"'Satoshi',sans-serif", fontSize:".78rem", fontWeight:700, cursor:saving?"not-allowed":"pointer", transition:"all .2s" }}
            onMouseEnter={e => { if(!saving) e.currentTarget.style.background="rgba(124,47,255,.16)"; }}
            onMouseLeave={e => { e.currentTarget.style.background="rgba(124,47,255,.08)"; }}>
            {saving ? "Saving…" : "💾 Save Draft"}
          </button>
        </div>
        <div className="builder-canvas">
          <div style={{ marginBottom:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#7c2fff", boxShadow:"0 0 8px rgba(124,47,255,.8)", animation:"dotBlink 2s infinite" }}/>
              <div style={{ fontSize:".58rem", color:"#7c2fff", letterSpacing:".12em", fontWeight:700, textTransform:"uppercase" }}>STEP {step+1} / {BUILDER_STEPS.length} — {BUILDER_STEPS[step].desc}</div>
            </div>
            <div style={{ fontFamily:"'Fraunces',serif", fontSize:"1.5rem", fontWeight:900, letterSpacing:"-.04em", background:"linear-gradient(135deg,#ede8ff,#9d7fff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{BUILDER_STEPS[step].label}</div>
          </div>

          {step === 0 && (
            <div>
              {/* Section Card 1 — Course Info */}
              <div style={{ background:"rgba(8,12,28,.8)", border:"1px solid rgba(124,47,255,.12)", borderRadius:16, padding:"20px 22px", marginBottom:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16, paddingBottom:12, borderBottom:"1px solid rgba(255,255,255,.06)" }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:"rgba(124,47,255,.15)", border:"1px solid rgba(124,47,255,.3)", display:"grid", placeItems:"center", fontSize:".85rem" }}>📋</div>
                  <div>
                    <div style={{ fontSize:".82rem", fontWeight:700, color:"#ede8ff" }}>Course Information</div>
                    <div style={{ fontSize:".62rem", color:"#4d7a9e" }}>Basic details about your course</div>
                  </div>
                </div>
                <div className="form-group"><label className="form-label">Course Title *</label><input className="form-input" placeholder="e.g. Complete React Developer 2026" value={form.title} onChange={e => uf("title", e.target.value)}/></div>
                <div className="form-group"><label className="form-label">Subtitle</label><input className="form-input" placeholder="Short description for search results" value={form.subtitle} onChange={e => uf("subtitle", e.target.value)}/></div>
                <div className="form-group" style={{ marginBottom:0 }}><label className="form-label">Description</label><textarea className="form-input form-textarea" placeholder="Describe what students will learn, who it's for, and what makes it unique…" value={form.description} onChange={e => uf("description", e.target.value)}/></div>
              </div>

              {/* Section Card 2 — Category & Level */}
              <div style={{ background:"rgba(8,12,28,.8)", border:"1px solid rgba(124,47,255,.12)", borderRadius:16, padding:"20px 22px", marginBottom:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16, paddingBottom:12, borderBottom:"1px solid rgba(255,255,255,.06)" }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:"rgba(0,212,170,.12)", border:"1px solid rgba(0,212,170,.25)", display:"grid", placeItems:"center", fontSize:".85rem" }}>🎯</div>
                  <div>
                    <div style={{ fontSize:".82rem", fontWeight:700, color:"#ede8ff" }}>Category & Level</div>
                    <div style={{ fontSize:".62rem", color:"#4d7a9e" }}>Help students find your course</div>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group" style={{ marginBottom:0 }}><label className="form-label">Category</label><select className="form-input" style={{ appearance:"none", cursor:"pointer" }} value={form.category} onChange={e => uf("category", e.target.value)}>{["Development","Design","Data Science","Business","Cloud & DevOps","Marketing"].map(x => <option key={x} style={{ background:"#04090f" }}>{x}</option>)}</select></div>
                  <div className="form-group" style={{ marginBottom:0 }}><label className="form-label">Level</label><select className="form-input" style={{ appearance:"none", cursor:"pointer" }} value={form.level} onChange={e => uf("level", e.target.value)}>{["Beginner","Intermediate","Advanced","All Levels"].map(x => <option key={x} style={{ background:"#04090f" }}>{x}</option>)}</select></div>
                </div>
              </div>

              {/* Section Card 3 — Skills */}
              <div style={{ background:"rgba(8,12,28,.8)", border:"1px solid rgba(124,47,255,.12)", borderRadius:16, padding:"20px 22px", marginBottom:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16, paddingBottom:12, borderBottom:"1px solid rgba(255,255,255,.06)" }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:"rgba(240,165,0,.12)", border:"1px solid rgba(240,165,0,.25)", display:"grid", placeItems:"center", fontSize:".85rem" }}>🏷️</div>
                  <div>
                    <div style={{ fontSize:".82rem", fontWeight:700, color:"#ede8ff" }}>Skills & Tags</div>
                    <div style={{ fontSize:".62rem", color:"#4d7a9e" }}>What students will gain</div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                  <input className="form-input" placeholder="Add a skill or tag…" style={{ flex:1 }} value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addSkill()}/>
                  <button className="btn-primary" style={{ padding:"10px 16px", fontSize:".78rem", flexShrink:0 }} onClick={addSkill}>+ Add</button>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, minHeight:28 }}>
                  {form.skills.map((s, i) => (<div key={s} className="skill-pill" style={{ animation:`fadeUp .3s ${i*.04}s both` }}>{s}<button onClick={() => uf("skills", form.skills.filter(x => x !== s))}>✕</button></div>))}
                  {!form.skills.length && <span style={{ fontSize:".74rem", color:"#2a3a50", fontStyle:"italic" }}>No skills added yet…</span>}
                </div>
              </div>

              {/* Section Card 4 — Learning Outcomes */}
              <div style={{ background:"rgba(8,12,28,.8)", border:"1px solid rgba(124,47,255,.12)", borderRadius:16, padding:"20px 22px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16, paddingBottom:12, borderBottom:"1px solid rgba(255,255,255,.06)" }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:"rgba(74,222,128,.12)", border:"1px solid rgba(74,222,128,.25)", display:"grid", placeItems:"center", fontSize:".85rem" }}>✅</div>
                  <div>
                    <div style={{ fontSize:".82rem", fontWeight:700, color:"#ede8ff" }}>What Students Will Learn</div>
                    <div style={{ fontSize:".62rem", color:"#4d7a9e" }}>Key takeaways from your course</div>
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {form.outcomes.map((o, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:24, height:24, borderRadius:7, background:"rgba(74,222,128,.1)", border:"1px solid rgba(74,222,128,.22)", display:"grid", placeItems:"center", fontSize:".72rem", color:"#4ade80", flexShrink:0 }}>✓</div>
                      <input className="form-input" placeholder={`Learning outcome ${i+1}…`} value={o}
                        onChange={e => uf("outcomes", form.outcomes.map((x,j) => j===i ? e.target.value : x))}
                        style={{ flex:1 }}/>
                      <button onClick={() => uf("outcomes", form.outcomes.filter((_,j) => j!==i))}
                        style={{ background:"none", border:"none", color:"#2a3a50", cursor:"pointer", fontSize:".82rem", padding:"4px 6px", borderRadius:6, transition:"color .2s, background .2s", flexShrink:0 }}
                        onMouseOver={e => { e.currentTarget.style.color="#ef4444"; e.currentTarget.style.background="rgba(239,68,68,.1)"; }}
                        onMouseOut={e => { e.currentTarget.style.color="#2a3a50"; e.currentTarget.style.background="transparent"; }}>✕</button>
                    </div>
                  ))}
                  <button onClick={() => uf("outcomes", [...form.outcomes, ""])}
                    style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 14px", borderRadius:10, border:"1px dashed rgba(74,222,128,.28)", background:"rgba(74,222,128,.04)", color:"#4ade80", fontSize:".76rem", fontWeight:600, cursor:"pointer", transition:"all .2s", fontFamily:"'Satoshi',sans-serif", width:"fit-content" }}
                    onMouseOver={e => { e.currentTarget.style.borderColor="rgba(74,222,128,.55)"; e.currentTarget.style.background="rgba(74,222,128,.1)"; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor="rgba(74,222,128,.28)"; e.currentTarget.style.background="rgba(74,222,128,.04)"; }}>
                    + Add Outcome
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <div style={{ display:"flex", gap:9, marginBottom:16 }}>
                {[{l:"Sections",v:sections.length,c:"#7c2fff"},{l:"Lessons",v:totalLessons,c:"#8b5cf6"},{l:"Est.",v:`~${totalLessons*12}m`,c:"#f02079"}].map(({l,v,c}) => (
                  <div key={l} style={{ padding:"8px 13px", borderRadius:10, background:`${c}0d`, border:`1px solid ${c}1e` }}>
                    <div style={{ fontFamily:"'Fraunces',serif", fontSize:".96rem", fontWeight:900, color:c }}>{v}</div>
                    <div style={{ fontSize:".64rem", color:"#4d7a9e", marginTop:1 }}>{l}</div>
                  </div>
                ))}
              </div>
              {sections.map((sec, si) => (
                <div key={sec.id} className="section-block">
                  <div className="section-header" onClick={() => toggleSection(sec.id)}>
                    <span style={{ color:"#7c2fff", fontSize:".6rem", fontWeight:700 }}>S{si+1}</span>
                    <div style={{ flex:1, fontWeight:600, fontSize:".84rem" }}>{sec.title}</div>
                    <span style={{ fontSize:".6rem", color:"#4d7a9e" }}>{sec.lessons.length}L</span>
                    <button onClick={e => { e.stopPropagation(); deleteSection(sec.id); }} style={{ background:"none", border:"none", color:"#193348", cursor:"pointer", fontSize:".74rem", padding:"2px 5px", borderRadius:5, transition:"color .2s" }} onMouseOver={e => e.currentTarget.style.color="#ef4444"} onMouseOut={e => e.currentTarget.style.color="#193348"}>🗑</button>
                    <span style={{ color:"#4d7a9e", fontSize:".76rem", display:"inline-block", transform:sec.open?"rotate(180deg)":"none", transition:".22s" }}>▾</span>
                  </div>
                  {sec.open && (
                    <div>
                      {sec.lessons.map(l => (
                        <div key={l.id} className="lesson-item">
                          <div style={{ width:22, height:22, borderRadius:6, display:"grid", placeItems:"center", fontSize:".66rem", background:"rgba(124,47,255,.1)", border:"1px solid rgba(124,47,255,.18)", color:"#9d7fff", flexShrink:0 }}>{TYPE_MAP[l.type]||"▶"}</div>
                          <div style={{ flex:1 }}><div style={{ fontSize:".78rem", fontWeight:500 }}>{l.title}</div><div style={{ fontSize:".6rem", color:"#193348", marginTop:1 }}>{l.type.toUpperCase()} · {l.dur}{l.free && <span style={{ color:"#7c2fff" }}> · FREE</span>}</div></div>
                          <button onClick={() => deleteLesson(sec.id, l.id)} style={{ background:"none", border:"none", color:"#193348", cursor:"pointer", fontSize:".72rem", padding:2, borderRadius:5, transition:"color .2s" }} onMouseOver={e => e.currentTarget.style.color="#ef4444"} onMouseOut={e => e.currentTarget.style.color="#193348"}>✕</button>
                        </div>
                      ))}
                      <div style={{ padding:"8px 13px", borderTop:"1px solid rgba(255,255,255,.04)" }}>
                        <div style={{ display:"flex", gap:6, marginBottom:9, flexWrap:"wrap" }}>
                          {Object.entries(TYPE_MAP).map(([type, ico]) => {
                            const col = TYPE_COLORS[type];
                            const active = lessonType === type;
                            return (
                              <button key={type} onClick={() => setLessonType(type)} style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:8, border:`1px solid ${active ? col : "rgba(255,255,255,.08)"}`, fontSize:".74rem", fontWeight:active?700:500, cursor:"pointer", fontFamily:"'Satoshi',sans-serif", transition:"all .18s", background:active?`${col}18`:"transparent", color:active?col:"#4d7a9e", boxShadow:active?`0 0 10px ${col}30`:"none" }}>
                                <span style={{ fontSize:".9rem" }}>{ico}</span> {type}
                              </button>
                            );
                          })}
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                          <div style={{ display:"flex", gap:6 }}>
                            <input className="form-input" placeholder="Lesson title…" style={{ flex:1, padding:"7px 11px" }} value={lessonInputs[sec.id] || ""} onChange={e => setLessonInputs(li => ({ ...li, [sec.id]: e.target.value }))} onKeyDown={e => e.key === "Enter" && addLesson(sec.id)}/>
                            <button className="btn-primary" style={{ padding:"7px 11px", fontSize:".74rem" }} onClick={() => addLesson(sec.id)}>Add</button>
                          </div>
                          {(lessonType === "video" || lessonType === "live") && (
                            <input className="form-input" placeholder="Video URL (YouTube, Drive, MP4)…" style={{ padding:"7px 11px", fontSize:".76rem" }}
                              value={lessonInputs[`${sec.id}_url`] || ""}
                              onChange={e => setLessonInputs(li => ({ ...li, [`${sec.id}_url`]: e.target.value }))}/>
                          )}
                          {lessonType === "doc" && (
                            <input className="form-input" placeholder="Document URL (Drive, PDF link)…" style={{ padding:"7px 11px", fontSize:".76rem" }}
                              value={lessonInputs[`${sec.id}_url`] || ""}
                              onChange={e => setLessonInputs(li => ({ ...li, [`${sec.id}_url`]: e.target.value }))}/>
                          )}
                          {lessonType === "article" && (
                            <textarea className="form-input form-textarea" placeholder="Write article content here… (supports Markdown: **bold**, *italic*, ## heading, - list, `code`, > quote)" style={{ minHeight:120, fontSize:".78rem", lineHeight:1.6 }}
                              value={lessonInputs[`${sec.id}_content`] || ""}
                              onChange={e => setLessonInputs(li => ({ ...li, [`${sec.id}_content`]: e.target.value }))}/>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div style={{ display:"flex", gap:7, marginTop:7 }}>
                <input className="form-input" placeholder="New section title…" value={newSecTitle} onChange={e => setNewSecTitle(e.target.value)} onKeyDown={e => e.key === "Enter" && addSection()}/>
                <button className="btn-primary" style={{ whiteSpace:"nowrap", padding:"8px 14px", fontSize:".76rem" }} onClick={addSection}>+ Section</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              {/* Content Type Selector */}
              <div className="form-group">
                <label className="form-label">Content Type</label>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
                  {[
                    {id:"video",ico:"🎬",l:"VIDEO",col:"#7c2fff"},
                    {id:"live",ico:"🔴",l:"LIVE",col:"#ef4444"},
                    {id:"doc",ico:"📄",l:"DOCUMENT",col:"#3b82f6"},
                    {id:"audio",ico:"🎙️",l:"AUDIO",col:"#f0a500"},
                    {id:"quiz",ico:"❓",l:"QUIZ",col:"#f02079"},
                    {id:"assignment",ico:"📝",l:"ASSIGNMENT",col:"#00d4aa"},
                  ].map(({id,ico,l,col}) => {
                    const active = mediaType === id;
                    return (
                      <div key={id} onClick={() => setMediaType(id)}
                        style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5, padding:"10px 16px", borderRadius:11, border:`1px solid ${active?col:"rgba(255,255,255,.08)"}`, background:active?`${col}18`:"rgba(255,255,255,.02)", cursor:"pointer", transition:"all .2s", minWidth:72, boxShadow:active?`0 0 14px ${col}30`:"none" }}>
                        <div style={{ fontSize:"1.3rem" }}>{ico}</div>
                        <div style={{ fontSize:".58rem", fontWeight:700, letterSpacing:".06em", color:active?col:"#4d7a9e" }}>{l}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Thumbnail — always shown */}
              <div className="form-group">
                <label className="form-label">Course Thumbnail</label>
                {/* Mode toggle */}
                <div style={{ display:"flex", gap:6, marginBottom:8 }}>
                  {["upload","link"].map(m => (
                    <button key={m} onClick={() => setThumbnail(s=>({...s,mode:m}))}
                      style={{ padding:"4px 12px", borderRadius:7, border:`1px solid ${thumbnail.mode===m?"#7c2fff":"rgba(255,255,255,.08)"}`, background:thumbnail.mode===m?"rgba(124,47,255,.12)":"transparent", color:thumbnail.mode===m?"#9d7fff":"#4d7a9e", fontSize:".72rem", fontWeight:600, cursor:"pointer", fontFamily:"'Satoshi',sans-serif", transition:"all .18s" }}>
                      {m==="upload"?"📁 Upload File":"🔗 Paste Link"}
                    </button>
                  ))}
                </div>
                {thumbnail.mode === "upload" ? (
                  <label className="upload-zone" style={{ display:"block" }}>
                    <input type="file" accept="image/png,image/jpeg,image/webp" style={{ display:"none" }} onChange={e => handleFileChange(setThumbnail, e)}/>
                    {thumbnail.preview ? (
                      <div style={{ position:"relative" }}>
                        <img src={thumbnail.preview} alt="thumbnail" style={{ width:"100%", maxHeight:160, objectFit:"cover", borderRadius:9 }}/>
                        <div style={{ marginTop:6, fontSize:".72rem", color:"#4ade80" }}>✓ {thumbnail.file?.name}</div>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize:"2rem", marginBottom:7 }}>🖼️</div>
                        <div style={{ fontWeight:600, marginBottom:3 }}>Drop image or click to browse</div>
                        <div style={{ color:"#4d7a9e", fontSize:".74rem" }}>PNG, JPG, WEBP · Max 2MB · 1280×720</div>
                      </>
                    )}
                  </label>
                ) : (
                  <div>
                    <input className="form-input" placeholder="https://example.com/thumbnail.jpg" value={thumbnail.link}
                      onChange={e => setThumbnail(s=>({...s,link:e.target.value}))}/>
                    {thumbnail.link && (
                      <img src={thumbnail.link} alt="preview" style={{ width:"100%", maxHeight:140, objectFit:"cover", borderRadius:9, marginTop:8 }} onError={e=>e.target.style.display="none"}/>
                    )}
                  </div>
                )}
              </div>

              {/* VIDEO */}
              {mediaType === "video" && (
                <div className="form-group">
                  <label className="form-label">Promo Video</label>
                  <div style={{ display:"flex", gap:6, marginBottom:8 }}>
                    {["upload","link"].map(m => (
                      <button key={m} onClick={() => setPromoVideo(s=>({...s,mode:m}))}
                        style={{ padding:"4px 12px", borderRadius:7, border:`1px solid ${promoVideo.mode===m?"#7c2fff":"rgba(255,255,255,.08)"}`, background:promoVideo.mode===m?"rgba(124,47,255,.12)":"transparent", color:promoVideo.mode===m?"#9d7fff":"#4d7a9e", fontSize:".72rem", fontWeight:600, cursor:"pointer", fontFamily:"'Satoshi',sans-serif", transition:"all .18s" }}>
                        {m==="upload"?"📁 Upload File":"🔗 Paste Link"}
                      </button>
                    ))}
                  </div>
                  {promoVideo.mode === "upload" ? (
                    <label className="upload-zone" style={{ display:"block" }}>
                      <input type="file" accept="video/mp4,video/webm,video/*" style={{ display:"none" }} onChange={e => handleFileChange(setPromoVideo, e)}/>
                      {promoVideo.file ? (
                        <div>
                          <div style={{ fontSize:"1.4rem", marginBottom:5 }}>🎬</div>
                          <div style={{ fontWeight:600, fontSize:".82rem", color:"#4ade80" }}>✓ {promoVideo.file.name}</div>
                          <div style={{ fontSize:".7rem", color:"#4d7a9e", marginTop:3 }}>{(promoVideo.file.size/1024/1024).toFixed(1)} MB</div>
                        </div>
                      ) : (
                        <>
                          <div style={{ fontSize:"2rem", marginBottom:7 }}>🎬</div>
                          <div style={{ fontWeight:600, marginBottom:3 }}>Upload intro / promo video</div>
                          <div style={{ color:"#4d7a9e", fontSize:".74rem" }}>MP4, WEBM · Max 500MB · Min 720p</div>
                        </>
                      )}
                    </label>
                  ) : (
                    <div>
                      <input className="form-input" placeholder="YouTube, Vimeo, Drive link…" value={promoVideo.link}
                        onChange={e => setPromoVideo(s=>({...s,link:e.target.value}))}/>
                      {promoVideo.link && (
                        <div style={{ marginTop:8, padding:"10px 12px", borderRadius:9, background:"rgba(124,47,255,.07)", border:"1px solid rgba(124,47,255,.18)", fontSize:".76rem", color:"#9d7fff", wordBreak:"break-all" }}>
                          🔗 {promoVideo.link}
                        </div>
                      )}
                      <div style={{ marginTop:6, fontSize:".68rem", color:"#193348" }}>Supports: YouTube · Vimeo · Google Drive · Loom · Direct MP4 URL</div>
                    </div>
                  )}
                </div>
              )}

              {/* LIVE */}
              {mediaType === "live" && (
                <div className="form-group">
                  <label className="form-label">Live Session Setup</label>
                  <div style={{ padding:"16px", borderRadius:12, background:"rgba(239,68,68,.06)", border:"1px solid rgba(239,68,68,.2)", display:"flex", flexDirection:"column", gap:10 }}>
                    <div className="form-group" style={{ marginBottom:0 }}><label className="form-label">Stream Title</label><input className="form-input" placeholder="e.g. Live Q&A — React Hooks"/></div>
                    <div className="form-row">
                      <div className="form-group" style={{ marginBottom:0 }}><label className="form-label">Date</label><input className="form-input" type="date"/></div>
                      <div className="form-group" style={{ marginBottom:0 }}><label className="form-label">Time</label><input className="form-input" type="time"/></div>
                    </div>
                    <div className="form-group" style={{ marginBottom:0 }}><label className="form-label">Platform</label>
                      <select className="form-input" style={{ appearance:"none", cursor:"pointer" }}>
                        {["Zoom","Google Meet","YouTube Live","Custom RTMP"].map(x => <option key={x} style={{ background:"#04090f" }}>{x}</option>)}
                      </select>
                    </div>
                    {/* Meeting Link */}
                    <div className="form-group" style={{ marginBottom:0 }}>
                      <label className="form-label">Meeting Link</label>
                      <div style={{ position:"relative" }}>
                        <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", fontSize:".9rem", pointerEvents:"none" }}>🔗</span>
                        <input className="form-input" style={{ paddingLeft:32 }}
                          placeholder="https://zoom.us/j/... or meet.google.com/..."
                        />
                      </div>
                      <div style={{ fontSize:".62rem", color:"#4d7a9e", marginTop:5, display:"flex", alignItems:"center", gap:5 }}>
                        <span>💡</span> Students will see this link when the session starts
                      </div>
                    </div>
                    {/* Duration */}
                    <div className="form-group" style={{ marginBottom:0 }}>
                      <label className="form-label">Duration (minutes)</label>
                      <input className="form-input" type="number" placeholder="e.g. 60" min="15" max="480"/>
                    </div>
                  </div>
                </div>
              )}

              {/* DOCUMENT */}
              {mediaType === "doc" && (
                <div className="form-group">
                  <label className="form-label">Document</label>
                  <div style={{ display:"flex", gap:6, marginBottom:8 }}>
                    {["upload","link"].map(m => (
                      <button key={m} onClick={() => setPromoVideo(s=>({...s,mode:m}))}
                        style={{ padding:"4px 12px", borderRadius:7, border:`1px solid ${promoVideo.mode===m?"#3b82f6":"rgba(255,255,255,.08)"}`, background:promoVideo.mode===m?"rgba(59,130,246,.12)":"transparent", color:promoVideo.mode===m?"#60a5fa":"#4d7a9e", fontSize:".72rem", fontWeight:600, cursor:"pointer", fontFamily:"'Satoshi',sans-serif", transition:"all .18s" }}>
                        {m==="upload"?"📁 Upload File":"🔗 Paste Link"}
                      </button>
                    ))}
                  </div>
                  {promoVideo.mode === "upload" ? (
                    <label className="upload-zone" style={{ display:"block" }}>
                      <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" style={{ display:"none" }} onChange={e => handleFileChange(setPromoVideo, e)}/>
                      {promoVideo.file ? (
                        <div><div style={{ fontSize:"1.4rem", marginBottom:5 }}>📄</div><div style={{ fontWeight:600, fontSize:".82rem", color:"#4ade80" }}>✓ {promoVideo.file.name}</div><div style={{ fontSize:".7rem", color:"#4d7a9e", marginTop:3 }}>{(promoVideo.file.size/1024/1024).toFixed(1)} MB</div></div>
                      ) : (
                        <><div style={{ fontSize:"2rem", marginBottom:7 }}>📄</div><div style={{ fontWeight:600, marginBottom:3 }}>Upload PDF, DOC or PPT</div><div style={{ color:"#4d7a9e", fontSize:".74rem" }}>PDF, DOCX, PPTX · Max 50MB</div></>
                      )}
                    </label>
                  ) : (
                    <div>
                      <input className="form-input" placeholder="Google Drive, Dropbox, or direct PDF link…" value={promoVideo.link} onChange={e => setPromoVideo(s=>({...s,link:e.target.value}))}/>
                      <div style={{ marginTop:6, fontSize:".68rem", color:"#193348" }}>Supports: Google Drive · Dropbox · OneDrive · Direct URL</div>
                    </div>
                  )}
                </div>
              )}

              {/* AUDIO */}
              {mediaType === "audio" && (
                <div className="form-group">
                  <label className="form-label">Audio</label>
                  <div style={{ display:"flex", gap:6, marginBottom:8 }}>
                    {["upload","link"].map(m => (
                      <button key={m} onClick={() => setPromoVideo(s=>({...s,mode:m}))}
                        style={{ padding:"4px 12px", borderRadius:7, border:`1px solid ${promoVideo.mode===m?"#f0a500":"rgba(255,255,255,.08)"}`, background:promoVideo.mode===m?"rgba(240,165,0,.12)":"transparent", color:promoVideo.mode===m?"#f0a500":"#4d7a9e", fontSize:".72rem", fontWeight:600, cursor:"pointer", fontFamily:"'Satoshi',sans-serif", transition:"all .18s" }}>
                        {m==="upload"?"📁 Upload File":"🔗 Paste Link"}
                      </button>
                    ))}
                  </div>
                  {promoVideo.mode === "upload" ? (
                    <label className="upload-zone" style={{ display:"block" }}>
                      <input type="file" accept="audio/mp3,audio/wav,audio/mpeg,audio/*" style={{ display:"none" }} onChange={e => handleFileChange(setPromoVideo, e)}/>
                      {promoVideo.file ? (
                        <div><div style={{ fontSize:"1.4rem", marginBottom:5 }}>🎙️</div><div style={{ fontWeight:600, fontSize:".82rem", color:"#4ade80" }}>✓ {promoVideo.file.name}</div><div style={{ fontSize:".7rem", color:"#4d7a9e", marginTop:3 }}>{(promoVideo.file.size/1024/1024).toFixed(1)} MB</div></div>
                      ) : (
                        <><div style={{ fontSize:"2rem", marginBottom:7 }}>🎙️</div><div style={{ fontWeight:600, marginBottom:3 }}>Upload audio lecture</div><div style={{ color:"#4d7a9e", fontSize:".74rem" }}>MP3, WAV · Max 200MB</div></>
                      )}
                    </label>
                  ) : (
                    <div>
                      <input className="form-input" placeholder="SoundCloud, Spotify, or direct MP3 link…" value={promoVideo.link} onChange={e => setPromoVideo(s=>({...s,link:e.target.value}))}/>
                      <div style={{ marginTop:6, fontSize:".68rem", color:"#193348" }}>Supports: SoundCloud · Anchor · Direct MP3 URL</div>
                    </div>
                  )}
                </div>
              )}

              {/* QUIZ */}
              {mediaType === "quiz" && (
                <div className="form-group">
                  {/* Settings bar */}
                  <div style={{ display:"flex", gap:8, marginBottom:14 }}>
                    {[{l:"Time (mins)",k:"timeLimit",ph:"15"},{l:"Pass Score %",k:"passing",ph:"70"},{l:"Attempts",k:"attempts",ph:"3"}].map(({l,k,ph}) => (
                      <div key={k} style={{ flex:1 }}>
                        <label className="form-label">{l}</label>
                        <input className="form-input" type="number" placeholder={ph} value={quizSettings[k]} onChange={e => setQuizSettings(s => ({...s,[k]:e.target.value}))}/>
                      </div>
                    ))}
                  </div>

                  {/* Questions */}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                    <label className="form-label" style={{ marginBottom:0 }}>Questions ({quizQuestions.length})</label>
                    <button className="btn-primary" style={{ padding:"5px 12px", fontSize:".72rem" }} onClick={addQuestion}>+ Add Question</button>
                  </div>

                  {quizQuestions.map((q, qi) => (
                    <div key={q.id} style={{ background:"rgba(240,32,121,.04)", border:"1px solid rgba(240,32,121,.15)", borderRadius:12, padding:"14px", marginBottom:10 }}>
                      {/* Question header */}
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                        <div style={{ width:22, height:22, borderRadius:6, background:"rgba(240,32,121,.15)", border:"1px solid rgba(240,32,121,.3)", display:"grid", placeItems:"center", fontSize:".66rem", fontWeight:800, color:"#f02079", flexShrink:0 }}>Q{qi+1}</div>
                        <select value={q.type} onChange={e => updateQuestion(q.id,"type",e.target.value)}
                          style={{ padding:"4px 8px", borderRadius:7, border:"1px solid rgba(255,255,255,.08)", background:"rgba(255,255,255,.04)", color:"#ede8ff", fontSize:".72rem", cursor:"pointer", outline:"none" }}>
                          <option value="mcq" style={{ background:"#04090f" }}>Multiple Choice</option>
                          <option value="truefalse" style={{ background:"#04090f" }}>True / False</option>
                          <option value="short" style={{ background:"#04090f" }}>Short Answer</option>
                        </select>
                        <button onClick={() => removeQuestion(q.id)}
                          style={{ marginLeft:"auto", background:"none", border:"none", color:"#193348", cursor:"pointer", fontSize:".8rem", padding:"2px 6px", borderRadius:5, transition:"color .2s" }}
                          onMouseOver={e => e.currentTarget.style.color="#ef4444"}
                          onMouseOut={e => e.currentTarget.style.color="#193348"}>🗑</button>
                      </div>

                      {/* Question text */}
                      <input className="form-input" placeholder={`Question ${qi+1}…`} value={q.q}
                        onChange={e => updateQuestion(q.id,"q",e.target.value)}
                        style={{ marginBottom:10 }}/>

                      {/* MCQ options */}
                      {q.type === "mcq" && (
                        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                          {q.options.map((opt, oi) => (
                            <div key={oi} style={{ display:"flex", alignItems:"center", gap:8 }}>
                              <div onClick={() => updateQuestion(q.id,"correct",oi)}
                                style={{ width:18, height:18, borderRadius:"50%", border:`2px solid ${q.correct===oi?"#4ade80":"rgba(255,255,255,.15)"}`, background:q.correct===oi?"rgba(74,222,128,.15)":"transparent", cursor:"pointer", flexShrink:0, transition:"all .18s", display:"grid", placeItems:"center" }}>
                                {q.correct===oi && <div style={{ width:8, height:8, borderRadius:"50%", background:"#4ade80" }}/>}
                              </div>
                              <input className="form-input" placeholder={`Option ${oi+1}`} value={opt}
                                onChange={e => updateOption(q.id, oi, e.target.value)}
                                style={{ flex:1, padding:"6px 10px", fontSize:".78rem", borderColor:q.correct===oi?"rgba(74,222,128,.3)":"rgba(255,255,255,.08)" }}/>
                            </div>
                          ))}
                          <div style={{ fontSize:".62rem", color:"#193348", marginTop:2 }}>● = correct answer</div>
                        </div>
                      )}

                      {/* True/False */}
                      {q.type === "truefalse" && (
                        <div style={{ display:"flex", gap:8 }}>
                          {["True","False"].map((opt,oi) => (
                            <div key={opt} onClick={() => updateQuestion(q.id,"correct",oi)}
                              style={{ flex:1, padding:"8px", borderRadius:9, border:`1px solid ${q.correct===oi?"#4ade80":"rgba(255,255,255,.08)"}`, background:q.correct===oi?"rgba(74,222,128,.1)":"rgba(255,255,255,.02)", cursor:"pointer", textAlign:"center", fontSize:".8rem", fontWeight:600, color:q.correct===oi?"#4ade80":"#4d7a9e", transition:"all .18s" }}>
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Short answer */}
                      {q.type === "short" && (
                        <input className="form-input" placeholder="Expected answer (for auto-grading)…"
                          style={{ fontSize:".78rem" }}/>
                      )}
                    </div>
                  ))}

                  {quizQuestions.length === 0 && (
                    <div style={{ textAlign:"center", padding:"20px", color:"#193348", fontSize:".78rem" }}>No questions yet. Click "+ Add Question"</div>
                  )}
                </div>
              )}

              {/* ASSIGNMENT */}
              {mediaType === "assignment" && (
                <div className="form-group">
                  <label className="form-label">Assignment Details</label>
                  <div style={{ padding:"16px", borderRadius:12, background:"rgba(0,212,170,.06)", border:"1px solid rgba(0,212,170,.2)", display:"flex", flexDirection:"column", gap:10 }}>
                    <div className="form-group" style={{ marginBottom:0 }}><label className="form-label">Assignment Title</label><input className="form-input" placeholder="e.g. Build a REST API"/></div>
                    <div className="form-group" style={{ marginBottom:0 }}><label className="form-label">Instructions</label><textarea className="form-input form-textarea" placeholder="Describe what students need to submit…"/></div>
                    <div className="form-row">
                      <div className="form-group" style={{ marginBottom:0 }}><label className="form-label">Max Points</label><input className="form-input" type="number" placeholder="100"/></div>
                      <div className="form-group" style={{ marginBottom:0 }}><label className="form-label">Due (days after enroll)</label><input className="form-input" type="number" placeholder="7"/></div>
                    </div>
                    <div className="form-group" style={{ marginBottom:0 }}>
                      <label className="form-label">Submission Type</label>
                      <select className="form-input" style={{ appearance:"none", cursor:"pointer" }}>
                        {["File Upload","Text/Code","GitHub Link","Google Drive Link"].map(x => <option key={x} style={{ background:"#04090f" }}>{x}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Toggles */}
              <div style={{ background:"rgba(4,8,20,.99)", borderRadius:13, border:"1px solid rgba(255,255,255,.07)", padding:14, display:"flex", flexDirection:"column", gap:11, marginTop:8 }}>
                {[{key:"certificate",l:"Completion Certificate",s:"Students earn on completion"},{key:"lifetime",l:"Lifetime Access",s:"Never expires"},{key:"downloadable",l:"Downloadable Resources",s:"Files students can save"},{key:"previewVideo",l:"Free Preview Lesson",s:"First lesson is free"}].map(({key,l,s}) => (
                  <div key={key} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div><div style={{ fontSize:".8rem", fontWeight:600, marginBottom:1 }}>{l}</div><div style={{ fontSize:".68rem", color:"#4d7a9e" }}>{s}</div></div>
                    <Toggle checked={form[key]} onChange={e => uf(key, e.target.checked)}/>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="pricing-toggle">
                {[{id:"free",l:"Free"},{id:"paid",l:"Paid"},{id:"subscription",l:"Subscription"}].map(({id,l}) => (
                  <div key={id} className={`pricing-opt${pricingMode===id?" active":""}`} onClick={() => setPricingMode(id)}>{l}</div>
                ))}
              </div>
              {pricingMode === "paid" && (
                <>
                  <div className="form-row" style={{ marginBottom:13 }}>
                    <div className="form-group" style={{ marginBottom:0 }}><label className="form-label">Original Price (₹)</label><div className="input-pfx"><span className="pfx-sym">₹</span><input className="form-input" type="number" placeholder="9999" value={form.originalPrice} onChange={e => uf("originalPrice", e.target.value)}/></div></div>
                    <div className="form-group" style={{ marginBottom:0 }}><label className="form-label">Sale Price (₹)</label><div className="input-pfx"><span className="pfx-sym">₹</span><input className="form-input" type="number" placeholder="4999" value={form.price} onChange={e => uf("price", e.target.value)}/></div></div>
                  </div>
                  <div style={{ padding:"14px 16px", borderRadius:12, background:"linear-gradient(135deg,rgba(124,47,255,.05),rgba(139,92,246,.04))", border:"1px solid rgba(124,47,255,.12)" }}>
                    <div style={{ fontSize:".58rem", letterSpacing:".1em", color:"#193348", marginBottom:8, fontWeight:700 }}>REVENUE FORECAST</div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:9 }}>
                      {[{l:"10 students",v:`₹${((form.price||0)*10*.8/1000).toFixed(1)}K`},{l:"50 students",v:`₹${((form.price||0)*50*.8/1000).toFixed(1)}K`},{l:"100 students",v:`₹${((form.price||0)*100*.8/1000).toFixed(1)}K`}].map(({l,v}) => (
                        <div key={l} style={{ textAlign:"center" }}><div style={{ fontFamily:"'Fraunces',serif", fontSize:".9rem", fontWeight:900, color:"#7c2fff" }}>{v}</div><div style={{ fontSize:".65rem", color:"#4d7a9e", marginTop:1 }}>{l}</div></div>
                      ))}
                    </div>
                    <div style={{ marginTop:8, fontSize:".63rem", color:"#193348" }}>* After 20% platform fee.</div>
                  </div>
                </>
              )}
              {pricingMode === "free" && (<div style={{ padding:20, borderRadius:12, textAlign:"center", background:"rgba(124,47,255,.05)", border:"1px solid rgba(124,47,255,.14)" }}><div style={{ fontSize:"1.6rem", marginBottom:8 }}>🎁</div><div style={{ fontWeight:700, marginBottom:4 }}>Free Course</div><div style={{ color:"#4d7a9e", fontSize:".8rem" }}>Available free to all LearnVerse learners.</div></div>)}
              {pricingMode === "subscription" && (<div style={{ padding:"14px 16px", borderRadius:12, background:"rgba(240,32,121,.06)", border:"1px solid rgba(240,32,121,.18)" }}><div style={{ fontWeight:600, marginBottom:6 }}>Subscription Bundle</div><div style={{ color:"#4d7a9e", fontSize:".8rem", marginBottom:10 }}>Part of LearnVerse Pro (₹999/mo).</div><div style={{ display:"flex", alignItems:"center", gap:7 }}><div style={{ width:6, height:6, borderRadius:"50%", background:"#7c2fff", animation:"dotBlink 2s infinite" }}/><span style={{ fontSize:".66rem", color:"#7c2fff" }}>3,240 subscribers get instant access</span></div></div>)}
            </div>
          )}

          {step === 4 && (
            <div style={{ textAlign:"center", paddingTop:14 }}>
              <div style={{ fontSize:"2.5rem", marginBottom:10 }}>🚀</div>
              <div style={{ fontFamily:"'Fraunces',serif", fontSize:"1.15rem", fontWeight:900, marginBottom:7 }}>Ready to Publish?</div>
              <div style={{ color:"#4d7a9e", fontSize:".82rem", maxWidth:360, margin:"0 auto 20px", lineHeight:1.65 }}>Review before going live on LearnVerse.</div>
              <div style={{ background:"rgba(4,8,20,.99)", borderRadius:13, border:"1px solid rgba(255,255,255,.07)", padding:16, textAlign:"left", marginBottom:18 }}>
                {checklist.map(({l,ok}) => (
                  <div key={l} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 0", borderBottom:"1px solid rgba(255,255,255,.04)" }}>
                    <div style={{ width:17, height:17, borderRadius:"50%", flexShrink:0, display:"grid", placeItems:"center", background:ok?"rgba(124,47,255,.14)":"rgba(240,32,121,.1)", border:`1.5px solid ${ok?"rgba(124,47,255,.3)":"rgba(240,32,121,.25)"}`, fontSize:".64rem", color:ok?"#9d7fff":"#f02079" }}>{ok?"✓":"!"}</div>
                    <span style={{ fontSize:".8rem", color:ok?"#ede8ff":"#4d7a9e" }}>{l}</span>
                    <span style={{ marginLeft:"auto", fontSize:".6rem", fontWeight:700, letterSpacing:".06em", color:ok?"#7c2fff":"#f02079" }}>{ok?"DONE":"PENDING"}</span>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
                <button onClick={() => handleSave("draft")} disabled={saving}
                  style={{ display:"flex", alignItems:"center", gap:7, padding:"12px 22px", borderRadius:12, border:"1px solid rgba(255,255,255,.1)", background:"rgba(255,255,255,.04)", color:"#8899b8", fontFamily:"'Satoshi',sans-serif", fontSize:".84rem", fontWeight:600, cursor:saving?"not-allowed":"pointer", transition:"all .2s", opacity:saving?.7:1 }}
                  onMouseEnter={e => { if(!saving){ e.currentTarget.style.borderColor="rgba(124,47,255,.3)"; e.currentTarget.style.color="#ede8ff"; }}}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,.1)"; e.currentTarget.style.color="#8899b8"; }}>
                  💾 Save Draft
                </button>
                <button onClick={() => handleSave("published")} disabled={saving}
                  style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 28px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#7c2fff,#8b5cf6)", color:"#fff", fontFamily:"'Satoshi',sans-serif", fontSize:".88rem", fontWeight:800, cursor:saving?"not-allowed":"pointer", transition:"all .25s", boxShadow:"0 4px 20px rgba(124,47,255,.4)", opacity:saving?.7:1 }}
                  onMouseEnter={e => { if(!saving){ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 28px rgba(124,47,255,.55)"; }}}
                  onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 4px 20px rgba(124,47,255,.4)"; }}>
                  {saving ? "Publishing…" : "🚀 Publish Course"}
                </button>
              </div>
            </div>
          )}

          {step < BUILDER_STEPS.length - 1 && (
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10, marginTop:28, paddingTop:18, borderTop:"1px solid rgba(124,47,255,.1)" }}>
              {step > 0 ? (
                <button onClick={() => setStep(s => Math.max(0, s - 1))}
                  style={{ display:"flex", alignItems:"center", gap:7, padding:"11px 20px", borderRadius:12, border:"1px solid rgba(255,255,255,.1)", background:"rgba(255,255,255,.04)", color:"#8899b8", fontFamily:"'Satoshi',sans-serif", fontSize:".84rem", fontWeight:600, cursor:"pointer", transition:"all .2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(124,47,255,.3)"; e.currentTarget.style.color="#ede8ff"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,.1)"; e.currentTarget.style.color="#8899b8"; }}>
                  ← Back
                </button>
              ) : <div/>}
              <button onClick={() => setStep(s => s + 1)}
                style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 28px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#7c2fff,#8b5cf6)", color:"#fff", fontFamily:"'Satoshi',sans-serif", fontSize:".88rem", fontWeight:800, cursor:"pointer", transition:"all .25s", boxShadow:"0 4px 20px rgba(124,47,255,.4)", position:"relative", overflow:"hidden" }}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 28px rgba(124,47,255,.55)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 4px 20px rgba(124,47,255,.4)"; }}>
                Continue → <span style={{ fontSize:".7rem", opacity:.7 }}>({BUILDER_STEPS[step+1]?.label})</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

/* ══════════════════════════════════════ SIDEBAR ══════════════════════════════════════ */
/* ══════════════════════════════════════ STAT ROW ══════════════════════════════════════ */
function StatRow({ items, cols = 4 }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols},1fr)`, gap:11, marginBottom:18 }}>
      {items.map(({ ico, v, l, s, g, col }) => (
        <div key={l} className="stat-card" style={{ "--g": g }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:9 }}>
            <div style={{ width:34, height:34, borderRadius:9, background:`${col}18`, border:`1px solid ${col}28`, display:"grid", placeItems:"center", fontSize:".9rem" }}>{ico}</div>
            <div style={{ fontSize:".58rem", color:col, padding:"2px 6px", borderRadius:99, background:`${col}0d`, border:`1px solid ${col}18` }}>{s}</div>
          </div>
          <div style={{ fontFamily:"'Fraunces',serif", fontSize:"1.6rem", fontWeight:900, letterSpacing:"-.05em", color:col, lineHeight:1 }}>{v}</div>
          <div style={{ fontSize:".72rem", color:"#4d7a9e", marginTop:2 }}>{l}</div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════ COURSES PAGE ══════════════════════════════════════ */
function CoursesPage({ onOpenModal, onEditCourse, courses, setCourses }) {
  const [view, setView] = useState("grid");
  const [cat, setCat] = useState("All");
  const [statusF, setStatusF] = useState("all");
  const [search, setSearch] = useState("");
  const handleDelete = async id => {
    if (!window.confirm("Delete this course?")) return;
    setCourses(cs => cs.filter(c => c.id !== id && c._id !== id));
    const token = localStorage.getItem("admin_token");
    if (token) {
      try {
        const { courseService } = await import("./courseService");
        await courseService.remove(id);
      } catch (e) {}
    }
  };
  const filtered = courses.filter(c => {
    const cm = cat === "All" || c.cat === cat;
    const sm = statusF === "all" || c.status === statusF;
    const qm = !search || c.title.toLowerCase().includes(search) || c.instructor.toLowerCase().includes(search) || c.tags.some(t => t.toLowerCase().includes(search));
    return cm && sm && qm;
  });
  const inProgress = courses.filter(c => c.enrolled && c.progress > 0 && c.progress < 100);
  return (
    <div style={{ animation:"fadeUp .5s ease both" }}>
      <StatRow items={[
        {ico:"📚",v:courses.length,l:"Total Courses",s:"+3 this week",g:G.purple,col:"#9d7fff"},
        {ico:"✅",v:courses.filter(c=>c.status==="published").length,l:"Published",s:"72.6% total",g:G.teal,col:"#00d4aa"},
        {ico:"⏳",v:courses.filter(c=>c.status==="review").length,l:"In Review",s:"Avg 2.1 days",g:G.pink,col:"#f02079"},
        {ico:"👥",v:"52.8K",l:"Enrollments",s:"↑12.4% MoM",g:G.violet,col:"#b47eff"},
      ]}/>
      {inProgress.length > 0 && (
        <div style={{ marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:11 }}>
            <div style={{ fontFamily:"'Fraunces',serif", fontSize:".96rem", fontWeight:900, letterSpacing:"-.03em" }}>Continue Learning</div>
            <button className="btn-ghost" style={{ fontSize:".72rem", padding:"5px 12px" }}>View all →</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:`repeat(${Math.min(inProgress.length,3)},1fr)`, gap:11 }}>
            {inProgress.map(c => (
              <div key={c.id} onClick={() => onOpenModal(c)}
                style={{ background:`linear-gradient(135deg,rgba(8,12,28,.97),${c.accent}0d)`, border:`1px solid ${c.accent}33`, borderRadius:14, padding:13, cursor:"pointer", transition:"all .24s", display:"flex", gap:11, alignItems:"center" }}
                onMouseOver={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 14px 32px rgba(0,0,0,.5)"}}
                onMouseOut={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none"}}>
                <div style={{ width:44, height:44, borderRadius:11, background:c.bg, display:"grid", placeItems:"center", fontSize:"1.4rem", flexShrink:0 }}>{c.emoji}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:".8rem", fontWeight:700, marginBottom:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{c.title}</div>
                  <div style={{ fontSize:".66rem", color:"#193348", marginBottom:6 }}>Next: {c.nextLesson}</div>
                  <ProgBar pct={c.progress} gradient={G.purple} h={3}/>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:".62rem", color:"#193348", marginTop:3 }}>
                    <span style={{ color:"#9d7fff", fontWeight:700 }}>{c.progress}%</span>
                    <span>{c.duration}</span>
                  </div>
                </div>
                <button onClick={e => e.stopPropagation()} style={{ padding:7, borderRadius:8, border:"none", background:"linear-gradient(135deg,#7c2fff,#8b5cf6)", color:"#050814", fontSize:".82rem", cursor:"pointer", flexShrink:0 }}>▶</button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap", marginBottom:14 }}>
        <div style={{ display:"flex", gap:4, background:"rgba(5,8,20,.97)", padding:4, borderRadius:10, border:"1px solid rgba(255,255,255,.06)" }}>
          {["All","Development","Design","Data Science","Cloud","Business"].map(c => (
            <button key={c} className={`f-pill${cat===c?" on":""}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:4 }}>
          {["all","published","draft","review"].map((s,i) => (
            <button key={s} className={`f-pill${statusF===s?" on":""}`} onClick={() => setStatusF(s)} style={{ fontSize:".68rem", padding:"4px 10px" }}>{["All Status","Published","Draft","Review"][i]}</button>
          ))}
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
        <span style={{ fontSize:".76rem", color:"#193348" }}>{filtered.length} courses</span>
        <div style={{ flex:1 }}/>
        <div style={{ display:"flex", gap:3 }}>
          <button className={`v-btn${view==="grid"?" on":""}`} onClick={() => setView("grid")}>⊞</button>
          <button className={`v-btn${view==="list"?" on":""}`} onClick={() => setView("list")}>☰</button>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:"50px 20px" }}>
          <div style={{ fontSize:"2.5rem", marginBottom:10, opacity:.4 }}>🔍</div>
          <div style={{ fontFamily:"'Fraunces',serif", fontSize:"1.1rem", fontWeight:900, color:"#4d7a9e", marginBottom:7 }}>No courses found</div>
          <button className="btn-ghost" onClick={() => { setCat("All"); setStatusF("all"); setSearch(""); }}>Clear filters</button>
        </div>
      ) : view === "grid" ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(268px,1fr))", gap:14 }}>
          {filtered.map((c,i) => <CourseCard key={c.id} course={c} idx={i} onOpen={onOpenModal} onEdit={onEditCourse} onDelete={handleDelete}/>)}
          <div onClick={() => onEditCourse(null)}
            style={{ borderRadius:17, border:"2px dashed rgba(124,47,255,.18)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, minHeight:250, cursor:"pointer", background:"rgba(124,47,255,.02)", transition:"all .28s" }}
            onMouseOver={e=>{e.currentTarget.style.borderColor="rgba(124,47,255,.42)";e.currentTarget.style.background="rgba(124,47,255,.06)"}}
            onMouseOut={e=>{e.currentTarget.style.borderColor="rgba(124,47,255,.18)";e.currentTarget.style.background="rgba(124,47,255,.02)"}}>
            <div style={{ width:46, height:46, borderRadius:13, background:"rgba(124,47,255,.1)", border:"2px dashed rgba(124,47,255,.28)", display:"grid", placeItems:"center", fontSize:"1.4rem", color:"#9d7fff" }}>+</div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontWeight:700, fontSize:".84rem", marginBottom:2 }}>Create New Course</div>
              <div style={{ fontSize:".72rem", color:"#4d7a9e" }}>Step-by-step builder</div>
            </div>
          </div>
        </div>
      ) : (
        <div>{filtered.map((c,i) => <CourseListRow key={c.id} course={c} idx={i} onOpen={onOpenModal} onEdit={onEditCourse} onDelete={handleDelete}/>)}</div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════ MAIN APP ══════════════════════════════════════ */
export default function AdminPanel() {
  const [courses, setCourses] = useState([]);
  const [modalCourse, setModalCourse] = useState(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [toast, setToast] = useState(null);
  const [admin, setAdmin] = useState({ name:"Admin", initials:"AD", email:"" });
  const [filterKey, setFilterKey] = useState(0);
  const builderBgRef = useRef(null);
  useBg(builderBgRef);

  const fetchCourses = () => {
    const token = localStorage.getItem("admin_token");
    const headers = token ? { Authorization:`Bearer ${token}` } : {};
    fetch("http://localhost:5000/api/courses", { headers })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const mapped = (d.data || []).map(c => {
            const iName = typeof c.instructor === "object" ? c.instructor?.name || "Admin" : "Admin";
            const iInit = typeof c.instructor === "object" ? c.instructor?.initials || "AD" : "AD";
            return {
              ...c,
              id:         String(c._id),
              cat:        c.category || c.cat || "Development",
              instructor: iName,
              initials:   iInit,
              accent:     c.accent     || "#7c2fff",
              accentGlow: c.accentGlow || "rgba(124,47,255,.28)",
              bg:         c.bg         || "linear-gradient(135deg,#0a0f1a,#1a0533)",
              emoji:      c.emoji      || "📘",
              badge:      c.badge      || "New",
              enrolled:   false,
              progress:   0,
              students:   c.enrolledStudents || 0,
              rating:     c.rating     || 0,
              revenue:    c.revenue    || "—",
              tags:       Array.isArray(c.tags) ? c.tags : [],
              outcomes:   Array.isArray(c.outcomes) ? c.outcomes : [],
              level:      c.level      || "Beginner",
              status:     c.status     || "draft",
            };
          });
          setCourses(mapped);
        }
      }).catch(() => {});
  };

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    // Fetch admin profile
    fetch("http://localhost:5000/api/auth/me", { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.success && (d.admin || d.data)) {
          const info = d.admin || d.data;
          const n = info.name || info.email || "Admin";
          setAdmin({ name: n, email: info.email || "", initials: n.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2) });
        }
      }).catch(() => {});

    fetchCourses();
  }, []);
  const showToast = msg => setToast(msg);
  const handleEditCourse = c => { setEditCourse(c); setBuilderOpen(true); };
  const handleDelete = async id => {
    if (!window.confirm("Delete this course?")) return;
    setCourses(cs => cs.filter(c => c.id !== id && c._id !== id));
    const token = localStorage.getItem("admin_token");
    if (token) {
      try {
        const { courseService } = await import("./courseService");
        await courseService.remove(id);
      } catch (e) {}
    }
  };
  const handleSaved = (newCourse) => {
    // Refetch from backend to keep state in sync (regardless of newCourse value)
    fetchCourses();
    setFilterKey(k => k + 1);
  };
  return (
    <div className="lv-layout">
      <style>{CSS}</style>
      <Sidebar />
      <div className="lv-main">
        <header className="lv-topbar">
          <div style={{ fontFamily:"'Fraunces',serif", fontSize:"1rem", fontWeight:900, letterSpacing:"-.04em" }}>
            My <em style={{ fontStyle:"italic", color:"#9d7fff" }}>Courses</em>
          </div>
          <div className="lv-search"><span style={{ color:"#193348", fontSize:".85rem" }}>🔍</span><input placeholder="Search…"/></div>
          <div style={{ flex:1 }}/>
          <button className="btn-icon" style={{ position:"relative" }}>🔔
            <div style={{ position:"absolute", top:4, right:4, width:6, height:6, borderRadius:"50%", background:"#ef4444", border:"2px solid #050814" }}/>
          </button>
          <div title={admin.email} style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,rgba(124,47,255,.22),rgba(139,92,246,.14))", border:"1px solid rgba(124,47,255,.25)", display:"grid", placeItems:"center", fontSize:".62rem", fontWeight:900, color:"#9d7fff", cursor:"pointer" }}>{admin.initials}</div>
          <button className="btn-primary" onClick={() => { setEditCourse(null); setBuilderOpen(true); }}>+ New Course</button>
        </header>
        <div className="lv-content">
          <CoursesPage key={filterKey} onOpenModal={setModalCourse} onEditCourse={handleEditCourse} courses={courses} setCourses={setCourses}/>
        </div>
      </div>
      {modalCourse && (
        <CourseModal course={modalCourse} onClose={() => setModalCourse(null)} onEdit={c => { setModalCourse(null); handleEditCourse(c); }} onDelete={id => { setModalCourse(null); handleDelete(id); }}/>
      )}
      {builderOpen && (
        <>
          <canvas ref={builderBgRef} style={{ position:"fixed", inset:0, zIndex:199, pointerEvents:"none", background:"linear-gradient(135deg,#050814 0%,#0a0520 50%,#050814 100%)" }}/>
          <CourseBuilder editCourse={editCourse} admin={admin} onSaved={handleSaved} onClose={() => { setBuilderOpen(false); setEditCourse(null); }} showToast={showToast}/>
        </>
      )}
      {toast && <Toast msg={toast} onDone={() => setToast(null)}/>}
    </div>
  );
}
