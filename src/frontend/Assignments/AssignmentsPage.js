import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import * as THREE from "three";
import { Sidebar } from "../../components/Sidebar";
import GradeModal from "./components/GradeModal";
import { createSafeRenderer } from "../../utils/safeWebGL";

const API   = "http://localhost:5000/api/assignments";
const token = () => localStorage.getItem("admin_token");

const C = {
  bg:"#050814", s1:"rgba(5,8,20,.97)", s2:"rgba(8,12,28,.97)",
  em:"#7c2fff", emL:"rgba(124,47,255,.1)", emB:"rgba(124,47,255,.22)",
  pink:"#f02079", teal:"#00d4aa", green:"#4ade80", amber:"#f59e0b",
  red:"#ef4444", gold:"#f0a500", blue:"#60a5fa", violet:"#a78bfa",
  t0:"#ede8ff", t1:"#c8ddf0", t2:"#4d7a9e", t3:"#193348",
  bord:"rgba(255,255,255,.06)",
};
const G = {
  em:"linear-gradient(135deg,#7c2fff,#8b5cf6)",
  pink:"linear-gradient(135deg,#f02079,#ff6b9d)",
  teal:"linear-gradient(135deg,#00d4aa,#3b82f6)",
  gold:"linear-gradient(135deg,#f0a500,#ff7a30)",
  violet:"linear-gradient(135deg,#a78bfa,#7c2fff)",
};

const TYPES      = ["Coding","Report","Design","Quiz","Project","Research"];
const PRIORITIES = ["low","medium","high","critical"];
const COURSES    = [
  "Data Structures & Algorithms","Machine Learning Fundamentals",
  "Database Management Systems","Operating Systems","Computer Networks",
  "Full Stack Web Development","AWS Solutions Architect","UI/UX Design",
];
const COURSE_ICONS = {
  "Data Structures & Algorithms":"🧮","Machine Learning Fundamentals":"🤖",
  "Database Management Systems":"🗄️","Operating Systems":"💻","Computer Networks":"🌐",
  "Full Stack Web Development":"🌍","AWS Solutions Architect":"☁️","UI/UX Design":"🎨",
};
const COURSE_COLORS = ["#4F6EF7","#A855F7","#00d4aa","#f0a500","#38BDF8","#4ade80","#f472b6","#f59e0b"];
const TYPE_META = {
  Coding:   { ico:"💻", col:"#60a5fa", desc:"Programming task" },
  Report:   { ico:"📄", col:"#a78bfa", desc:"Written submission" },
  Design:   { ico:"🎨", col:"#f472b6", desc:"Creative work" },
  Quiz:     { ico:"📝", col:"#f0a500", desc:"Knowledge check" },
  Project:  { ico:"🚀", col:"#4ade80", desc:"Full project" },
  Research: { ico:"🔬", col:"#00d4aa", desc:"Research paper" },
};
const PRI_META = {
  low:      { col:C.teal,   label:"Low",      ico:"🟢" },
  medium:   { col:C.amber,  label:"Medium",   ico:"🟡" },
  high:     { col:C.red,    label:"High",     ico:"🔴" },
  critical: { col:C.pink,   label:"Critical", ico:"🚨" },
};

const BUILDER_STEPS = [
  { id:"basics",   label:"Basics",      ico:"📋", desc:"Title & course" },
  { id:"details",  label:"Details",     ico:"⚙️",  desc:"Type, priority, dates" },
  { id:"content",  label:"Content",     ico:"📝", desc:"Description & requirements" },
  { id:"grading",  label:"Grading",     ico:"🏆", desc:"Scoring & rubric" },
  { id:"review",   label:"Review",      ico:"✅", desc:"Preview & publish" },
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900&family=Satoshi:wght@400;500;600;700;900&display=swap');
*,::before,::after{box-sizing:border-box;margin:0;padding:0}
body{background:#050814;color:#ede8ff;font-family:'Satoshi',sans-serif;overflow:hidden;height:100vh}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:linear-gradient(#7c2fff,#8b5cf6);border-radius:2px}
@keyframes overlayIn{from{opacity:0}to{opacity:1}}
@keyframes popIn{from{opacity:0;transform:scale(.93) translateY(14px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes shimmer{0%{transform:translateX(-120%)}100%{transform:translateX(120%)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes toast{0%{opacity:0;transform:translateY(14px) scale(.92)}12%,84%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-7px) scale(.95)}}
@keyframes slideInRight{from{opacity:0;transform:translateX(32px)}to{opacity:1;transform:translateX(0)}}
@keyframes slideInLeft{from{opacity:0;transform:translateX(-32px)}to{opacity:1;transform:translateX(0)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulseGlow{0%,100%{box-shadow:0 0 0 0 rgba(124,47,255,.4)}50%{box-shadow:0 0 0 8px rgba(124,47,255,0)}}
.ff{font-family:'Fraunces',serif!important}
.lv-main{margin-left:240px;display:flex;flex-direction:column;height:100vh;overflow:hidden;position:relative;z-index:10}
.lv-topbar{display:flex;align-items:center;gap:11px;padding:13px 22px;background:rgba(3,5,15,.88);backdrop-filter:blur(28px);border-bottom:1px solid rgba(255,255,255,.06);flex-shrink:0;position:relative;z-index:20}
.lv-content{flex:1;overflow-y:auto;padding:20px 22px;scrollbar-width:thin;scrollbar-color:#0f1e38 transparent;position:relative;z-index:10}
.btn-primary{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:10px;border:none;background:linear-gradient(135deg,#7c2fff,#8b5cf6);color:#fff;font-family:'Satoshi',sans-serif;font-size:.8rem;font-weight:800;cursor:pointer;transition:all .22s;position:relative;overflow:hidden;white-space:nowrap}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(124,47,255,.45)}
.btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none}
.btn-primary::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);transform:translateX(-150%);transition:.45s}
.btn-primary:hover:not(:disabled)::after{transform:translateX(150%)}
.btn-ghost{display:inline-flex;align-items:center;gap:6px;padding:8px 15px;border-radius:10px;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.05);color:#c8ddf0;font-family:'Satoshi',sans-serif;font-size:.78rem;font-weight:600;cursor:pointer;transition:all .2s}
.btn-ghost:hover{border-color:rgba(124,47,255,.4);color:#9d7fff;background:rgba(124,47,255,.08)}
.btn-danger{display:inline-flex;align-items:center;gap:6px;padding:8px 15px;border-radius:10px;border:1px solid rgba(239,68,68,.22);background:transparent;color:#ef4444;font-family:'Satoshi',sans-serif;font-size:.78rem;font-weight:600;cursor:pointer;transition:all .2s}
.btn-danger:hover{background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.4)}
.f-pill{padding:5px 13px;border-radius:99px;border:1px solid rgba(255,255,255,.07);background:transparent;color:#4d7a9e;font-family:'Satoshi',sans-serif;font-size:.72rem;font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap}
.f-pill.on{background:rgba(124,47,255,.1);color:#9d7fff;border-color:rgba(124,47,255,.25)}
.f-pill:hover:not(.on){background:rgba(255,255,255,.04);color:#c8ddf0}
.a-row{display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:13px;background:rgba(5,8,20,.92);border:1px solid rgba(255,255,255,.06);margin-bottom:8px;cursor:pointer;position:relative;overflow:hidden;transition:border-color .2s}
.a-row::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at var(--mx,50%) var(--my,50%),rgba(124,47,255,.07),transparent 55%);opacity:0;transition:opacity .3s;pointer-events:none}
.a-row:hover::before{opacity:1}
.a-row:hover{border-color:rgba(124,47,255,.25)}
.stat-card{border-radius:15px;padding:16px 18px;position:relative;overflow:hidden;background:rgba(5,8,20,.97);border:1px solid rgba(255,255,255,.06);transition:transform .22s,border-color .22s}
.stat-card:hover{transform:translateY(-3px);border-color:rgba(124,47,255,.14)}
.form-input{width:100%;padding:10px 13px;border-radius:11px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:#ede8ff;font-family:'Satoshi',sans-serif;font-size:.84rem;outline:none;transition:all .2s}
.form-input:focus{border-color:rgba(124,47,255,.45);box-shadow:0 0 0 3px rgba(124,47,255,.1);background:rgba(124,47,255,.03)}
.form-input::placeholder{color:#193348}
.form-label{font-size:.58rem;letter-spacing:.1em;color:#2a4a60;text-transform:uppercase;margin-bottom:6px;display:block;font-weight:700}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:13px}
.form-row-3{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:13px}
.form-group{margin-bottom:0}
.lv-search{display:flex;align-items:center;gap:8px;flex:1;max-width:280px;padding:7px 11px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);transition:all .2s}
.lv-search:focus-within{border-color:rgba(124,47,255,.38)}
.lv-search input{background:none;border:none;outline:none;color:#ede8ff;font-family:'Satoshi',sans-serif;font-size:.8rem;flex:1}
.lv-search input::placeholder{color:#193348}
.toast-el{position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;align-items:center;gap:11px;padding:12px 18px;border-radius:13px;background:rgba(5,8,20,.99);border:1px solid rgba(124,47,255,.25);box-shadow:0 18px 44px rgba(0,0,0,.62);animation:toast 3.4s ease forwards;font-size:.82rem}
.req-pill{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:99px;background:rgba(124,47,255,.1);border:1px solid rgba(124,47,255,.22);font-size:.72rem;color:#9d7fff;transition:all .2s}
.req-pill:hover{background:rgba(124,47,255,.16)}
.req-pill button{background:none;border:none;color:#9d7fff;cursor:pointer;font-size:.72rem;opacity:.5;padding:0;line-height:1;transition:opacity .2s}
.req-pill button:hover{opacity:1}
.type-card{padding:13px 14px;border-radius:12px;border:1.5px solid rgba(255,255,255,.07);background:rgba(255,255,255,.02);cursor:pointer;transition:all .22s;text-align:center}
.type-card:hover{border-color:rgba(124,47,255,.25);background:rgba(124,47,255,.05);transform:translateY(-2px)}
.type-card.sel{border-color:rgba(124,47,255,.5);background:rgba(124,47,255,.1);box-shadow:0 0 0 3px rgba(124,47,255,.12)}
.pri-card{display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:11px;border:1.5px solid rgba(255,255,255,.07);background:rgba(255,255,255,.02);cursor:pointer;transition:all .22s}
.pri-card:hover{transform:translateY(-1px)}
.pri-card.sel{box-shadow:0 0 0 3px rgba(124,47,255,.12)}
.step-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:11px;cursor:pointer;transition:all .2s;position:relative}
.step-item:hover{background:rgba(255,255,255,.03)}
.step-item.active{background:rgba(124,47,255,.1);border:1px solid rgba(124,47,255,.22)}
.step-item.done .step-num{background:linear-gradient(135deg,#4ade80,#00d4aa)!important;border-color:#4ade80!important}
.step-connector{width:2px;height:18px;margin:2px 0 2px 19px;border-radius:99px;background:rgba(255,255,255,.06);transition:background .3s}
.step-connector.done{background:linear-gradient(#4ade80,#00d4aa)}
.preview-card{background:rgba(8,12,28,.97);border:1px solid rgba(255,255,255,.07);border-radius:16px;overflow:hidden;transition:all .3s}
.rubric-row{display:flex;align-items:center;gap:10px;padding:10px 13px;border-radius:10px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);margin-bottom:7px}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.82);z-index:1000;display:flex;align-items:center;justify-content:center;padding:18px;animation:overlayIn .22s ease both;backdrop-filter:blur(12px)}
.modal-box{background:#090d1f;border:1px solid rgba(255,255,255,.08);border-radius:20px;width:100%;max-width:440px;animation:popIn .32s cubic-bezier(.34,1.2,.64,1) both}
`;

/* ══ Three.js bg ════════════════════════════════════════════════════════════ */
function useBg(ref) {
  useEffect(function() {
    if (!ref.current) return;
    const R = createSafeRenderer(THREE, ref.current);
    if (!R) return;
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
    let pmx=0,pmy=0,t=0,raf;
    function onM(e){pmx=(e.clientX/window.innerWidth-.5)*2;pmy=-(e.clientY/window.innerHeight-.5)*2;}
    function onR(){CAM.aspect=window.innerWidth/window.innerHeight;CAM.updateProjectionMatrix();R.setSize(window.innerWidth,window.innerHeight);}
    window.addEventListener("mousemove",onM); window.addEventListener("resize",onR);
    function loop(){
      raf=requestAnimationFrame(loop); t+=.005;
      S.children.forEach(function(m){
        if(m.isMesh&&m.geometry.type==="TorusGeometry"){m.rotation.y+=m.userData.ry;m.rotation.z+=.0003;}
        if(m.isMesh&&m.geometry.type==="IcosahedronGeometry"){m.rotation.x+=m.userData.rx||0;m.rotation.y+=m.userData.ry||0;m.position.y+=Math.sin(t*(m.userData.sp||.15)+(m.userData.fy||0))*.006;}
      });
      CAM.position.x+=(pmx*5-CAM.position.x)*.03; CAM.position.y+=(pmy*3-CAM.position.y)*.03;
      CAM.lookAt(0,0,0); R.render(S,CAM);
    }
    loop();
    return function(){cancelAnimationFrame(raf);window.removeEventListener("mousemove",onM);window.removeEventListener("resize",onR);R.dispose();};
  },[ref]);
}

/* ══ Small helpers ══════════════════════════════════════════════════════════ */
function fmtDate(d){if(!d)return"—";return new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});}
function daysLeft(d){
  if(!d)return null;
  const diff=Math.ceil((new Date(d)-Date.now())/86400000);
  if(diff<0)return{label:"Overdue",col:C.red};
  if(diff===0)return{label:"Due today",col:C.amber};
  if(diff<=3)return{label:diff+"d left",col:C.amber};
  return{label:diff+"d left",col:C.t2};
}
function TypeBadge({type}){
  const m=TYPE_META[type]||{ico:"📋",col:C.t2};
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:6,fontSize:".65rem",fontWeight:700,background:m.col+"18",border:"1px solid "+m.col+"33",color:m.col}}>{m.ico} {type}</span>;
}
function PriBadge({priority}){
  const m=PRI_META[priority]||PRI_META.medium;
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:6,fontSize:".62rem",fontWeight:700,background:m.col+"18",border:"1px solid "+m.col+"33",color:m.col}}><span style={{width:5,height:5,borderRadius:"50%",background:m.col,display:"inline-block"}}/>{m.label}</span>;
}
function StatCard({icon,label,value,sub,grad,idx}){
  const ref=useRef(null);
  useEffect(function(){if(!ref.current)return;gsap.fromTo(ref.current,{opacity:0,y:22},{opacity:1,y:0,duration:.55,delay:idx*.1,ease:"power3.out"});},[]);
  return(
    <div ref={ref} className="stat-card" style={{opacity:0}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:grad,borderRadius:"15px 15px 0 0"}}/>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
        <div style={{width:34,height:34,borderRadius:9,background:grad,display:"grid",placeItems:"center",fontSize:"1rem",flexShrink:0,opacity:.85}}>{icon}</div>
        <span style={{fontSize:".67rem",color:C.t2,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase"}}>{label}</span>
      </div>
      <div style={{fontFamily:"'Fraunces',serif",fontSize:"1.7rem",fontWeight:900,color:C.t0,lineHeight:1}}>{value}</div>
      {sub&&<div style={{fontSize:".68rem",color:C.t2,marginTop:5}}>{sub}</div>}
    </div>
  );
}
function Toast({msg,onDone}){
  useEffect(function(){const t=setTimeout(onDone,3400);return function(){clearTimeout(t);};},[]);
  return(
    <div className="toast-el">
      <div style={{width:22,height:22,borderRadius:6,background:"rgba(124,47,255,.14)",border:"1px solid rgba(124,47,255,.28)",display:"grid",placeItems:"center",fontSize:".76rem",flexShrink:0}}>✓</div>
      {msg}
    </div>
  );
}
function DeleteModal({assignment,onConfirm,onClose}){
  return(
    <div className="modal-overlay" onClick={function(e){if(e.target===e.currentTarget)onClose();}}>
      <div className="modal-box">
        <div style={{padding:"32px 28px",textAlign:"center"}}>
          <div style={{fontSize:"2.6rem",marginBottom:14}}>🗑️</div>
          <div style={{fontFamily:"'Fraunces',serif",fontSize:"1.05rem",fontWeight:900,color:C.t0,marginBottom:8}}>Delete Assignment?</div>
          <div style={{fontSize:".82rem",color:C.t2,lineHeight:1.6,marginBottom:22}}>
            "<span style={{color:C.t1}}>{assignment.title}</span>" will be permanently removed.
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"center"}}>
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn-danger" onClick={onConfirm} style={{whiteSpace:"nowrap"}}>Yes, Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══ Assignment Builder — full-page overlay ═════════════════════════════════ */
function AssignmentBuilder({initial, onSave, onClose}) {
  const blank = {
    title:"", description:"", type:"Coding", priority:"medium", course:"",
    dueDate:"", dueTime:"11:59", maxScore:100, estimatedTime:"", requirements:[], rubric:[],
    tags:"", instructions:"", submissionType:"file",
  };
  const [form, setForm]       = useState(initial ? Object.assign({},blank,initial) : blank);
  const [step, setStep]       = useState(0);
  const [reqInput, setReqInput] = useState("");
  const [rubricInput, setRubricInput] = useState({criterion:"",points:""});
  const [saving, setSaving]   = useState(false);
  const [errors, setErrors]   = useState({});
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const stepRefs   = useRef([]);

  useEffect(function(){
    if(overlayRef.current){
      gsap.fromTo(overlayRef.current,{opacity:0},{opacity:1,duration:.3,ease:"power2.out"});
    }
    if(contentRef.current){
      gsap.fromTo(contentRef.current,{x:40,opacity:0},{x:0,opacity:1,duration:.4,ease:"power3.out",delay:.1});
    }
  },[]);

  function animateStep(){
    if(contentRef.current){
      gsap.fromTo(contentRef.current,{opacity:0,x:24},{opacity:1,x:0,duration:.35,ease:"power2.out"});
    }
  }

  function set(k,v){setForm(function(p){return Object.assign({},p,{[k]:v});});}

  function addReq(){
    const v=reqInput.trim(); if(!v)return;
    set("requirements",form.requirements.concat(v)); setReqInput("");
  }
  function removeReq(i){set("requirements",form.requirements.filter(function(_,idx){return idx!==i;}));}

  function addRubric(){
    const c=rubricInput.criterion.trim(), p=Number(rubricInput.points);
    if(!c||!p)return;
    set("rubric",(form.rubric||[]).concat({criterion:c,points:p}));
    setRubricInput({criterion:"",points:""});
  }
  function removeRubric(i){set("rubric",(form.rubric||[]).filter(function(_,idx){return idx!==i;}));}

  function validate(){
    const e={};
    if(!form.title.trim())e.title="Title is required";
    if(!form.course)e.course="Please select a course";
    setErrors(e);
    return Object.keys(e).length===0;
  }

  async function handleSave(){
    if(!validate())return;
    setSaving(true);
    const body=Object.assign({},form,{
      tags:typeof form.tags==="string"?form.tags.split(",").map(function(t){return t.trim();}).filter(Boolean):form.tags,
    });
    await onSave(body);
    setSaving(false);
  }

  function goStep(n){setStep(n);animateStep();}
  function next(){if(step<BUILDER_STEPS.length-1)goStep(step+1);}
  function prev(){if(step>0)goStep(step-1);}

  const isEdit=!!initial;
  const rubricTotal=(form.rubric||[]).reduce(function(s,r){return s+r.points;},0);

  /* ── Step panels ── */
  function StepBasics(){
    return(
      <div style={{display:"flex",flexDirection:"column",gap:18}}>
        <div>
          <label className="form-label">Assignment Title *</label>
          <input className="form-input" style={{fontSize:"1rem",padding:"12px 14px",fontWeight:600}}
            placeholder="e.g. Build a REST API with Node.js & Express"
            value={form.title} onChange={function(e){set("title",e.target.value);}}/>
          {errors.title&&<div style={{fontSize:".7rem",color:C.red,marginTop:5}}>⚠ {errors.title}</div>}
        </div>
        <div>
          <label className="form-label">Course *</label>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:9}}>
            {COURSES.map(function(c,i){
              const sel=form.course===c;
              const col=COURSE_COLORS[i%COURSE_COLORS.length];
              return(
                <div key={c} onClick={function(){set("course",c);}}
                  style={{display:"flex",alignItems:"center",gap:10,padding:"11px 13px",borderRadius:11,
                    border:"1.5px solid "+(sel?col+"66":"rgba(255,255,255,.07)"),
                    background:sel?col+"12":"rgba(255,255,255,.02)",cursor:"pointer",transition:"all .2s"}}>
                  <span style={{fontSize:"1.2rem"}}>{COURSE_ICONS[c]||"📚"}</span>
                  <span style={{fontSize:".76rem",fontWeight:sel?700:500,color:sel?C.t0:C.t2,lineHeight:1.3}}>{c}</span>
                  {sel&&<span style={{marginLeft:"auto",fontSize:".7rem",color:col}}>✓</span>}
                </div>
              );
            })}
          </div>
          {errors.course&&<div style={{fontSize:".7rem",color:C.red,marginTop:5}}>⚠ {errors.course}</div>}
        </div>
        <div>
          <label className="form-label">Tags (comma separated)</label>
          <input className="form-input" placeholder="e.g. backend, api, node, express"
            value={form.tags} onChange={function(e){set("tags",e.target.value);}}/>
        </div>
      </div>
    );
  }

  function StepDetails(){
    return(
      <div style={{display:"flex",flexDirection:"column",gap:20}}>
        {/* Type */}
        <div>
          <label className="form-label">Assignment Type</label>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9}}>
            {TYPES.map(function(t){
              const m=TYPE_META[t]; const sel=form.type===t;
              return(
                <div key={t} className={"type-card"+(sel?" sel":"")}
                  onClick={function(){set("type",t);}}
                  style={{borderColor:sel?m.col+"66":"rgba(255,255,255,.07)",background:sel?m.col+"10":"rgba(255,255,255,.02)"}}>
                  <div style={{fontSize:"1.5rem",marginBottom:5}}>{m.ico}</div>
                  <div style={{fontSize:".78rem",fontWeight:700,color:sel?m.col:C.t1}}>{t}</div>
                  <div style={{fontSize:".65rem",color:C.t2,marginTop:2}}>{m.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Priority */}
        <div>
          <label className="form-label">Priority Level</label>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:9}}>
            {PRIORITIES.map(function(p){
              const m=PRI_META[p]; const sel=form.priority===p;
              return(
                <div key={p} className={"pri-card"+(sel?" sel":"")}
                  onClick={function(){set("priority",p);}}
                  style={{borderColor:sel?m.col+"55":"rgba(255,255,255,.07)",background:sel?m.col+"0e":"rgba(255,255,255,.02)"}}>
                  <span style={{fontSize:"1.1rem"}}>{m.ico}</span>
                  <div>
                    <div style={{fontSize:".8rem",fontWeight:700,color:sel?m.col:C.t1}}>{m.label}</div>
                    <div style={{fontSize:".65rem",color:C.t2}}>Priority</div>
                  </div>
                  {sel&&<div style={{marginLeft:"auto",width:8,height:8,borderRadius:"50%",background:m.col,boxShadow:"0 0 8px "+m.col}}/>}
                </div>
              );
            })}
          </div>
        </div>
        {/* Dates & score */}
        <div className="form-row-3">
          <div>
            <label className="form-label">Due Date</label>
            <input type="date" className="form-input" value={form.dueDate}
              onChange={function(e){set("dueDate",e.target.value);}} style={{colorScheme:"dark"}}/>
          </div>
          <div>
            <label className="form-label">Due Time</label>
            <input type="time" className="form-input" value={form.dueTime}
              onChange={function(e){set("dueTime",e.target.value);}} style={{colorScheme:"dark"}}/>
          </div>
          <div>
            <label className="form-label">Max Score (pts)</label>
            <input type="number" className="form-input" placeholder="100"
              value={form.maxScore} onChange={function(e){set("maxScore",Number(e.target.value));}}/>
          </div>
          <div>
            <label className="form-label">Estimated Time</label>
            <input className="form-input" placeholder="e.g. 3 hours"
              value={form.estimatedTime} onChange={function(e){set("estimatedTime",e.target.value);}}/>
          </div>
        </div>
        {/* Submission type */}
        <div>
          <label className="form-label">Submission Type</label>
          <div style={{display:"flex",gap:9}}>
            {["file","link","text","github"].map(function(s){
              const icons={file:"📎",link:"🔗",text:"📝",github:"🐙"};
              const sel=form.submissionType===s;
              return(
                <div key={s} onClick={function(){set("submissionType",s);}}
                  style={{flex:1,padding:"10px 8px",borderRadius:10,border:"1.5px solid "+(sel?"rgba(124,47,255,.5)":"rgba(255,255,255,.07)"),
                    background:sel?"rgba(124,47,255,.1)":"rgba(255,255,255,.02)",cursor:"pointer",textAlign:"center",transition:"all .2s"}}>
                  <div style={{fontSize:"1.2rem",marginBottom:4}}>{icons[s]}</div>
                  <div style={{fontSize:".7rem",fontWeight:600,color:sel?C.violet:C.t2,textTransform:"capitalize"}}>{s}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  function StepContent(){
    const LANGS=["JavaScript","Python","Java","C++","C","TypeScript","Go","Rust","PHP","Ruby","Swift","Kotlin","SQL","Bash"];
    const DESIGN_TOOLS=["Figma","Adobe XD","Sketch","Illustrator","Photoshop","Canva","InVision","Framer"];
    const CITE_STYLES=["APA","MLA","Chicago","Harvard","IEEE"];
    const TECH_STACK_OPTIONS=["React","Node.js","Express","MongoDB","PostgreSQL","Python","Django","Flask","Vue","Angular","Docker","AWS","Firebase","GraphQL"];

    /* ── type-specific extra section ── */
    function TypeExtras(){
      if(form.type==="Coding"){
        const langs=form.codingLangs||[];
        const toggleLang=function(l){set("codingLangs",langs.includes(l)?langs.filter(function(x){return x!==l;}):langs.concat(l));};
        return(
          <div style={{display:"flex",flexDirection:"column",gap:14,padding:"16px",borderRadius:13,background:"rgba(96,165,250,.04)",border:"1px solid rgba(96,165,250,.14)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:"1rem"}}>💻</span>
              <span style={{fontSize:".78rem",fontWeight:800,color:"#60a5fa",letterSpacing:".04em",textTransform:"uppercase"}}>Coding Assignment</span>
            </div>
            {/* Language selector */}
            <div>
              <label className="form-label">Allowed Languages</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                {LANGS.map(function(l){
                  const sel=langs.includes(l);
                  return(
                    <span key={l} onClick={function(){toggleLang(l);}} style={{padding:"4px 11px",borderRadius:99,fontSize:".72rem",fontWeight:600,cursor:"pointer",transition:"all .2s",
                      background:sel?"rgba(96,165,250,.15)":"rgba(255,255,255,.03)",
                      border:"1px solid "+(sel?"rgba(96,165,250,.45)":"rgba(255,255,255,.08)"),
                      color:sel?"#60a5fa":C.t2}}>
                      {sel?"✓ ":""}{l}
                    </span>
                  );
                })}
              </div>
            </div>
            {/* Starter code */}
            <div>
              <label className="form-label">Starter Code (optional)</label>
              <div style={{borderRadius:11,overflow:"hidden",border:"1px solid rgba(96,165,250,.18)",background:"#0d1117"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 13px",background:"rgba(96,165,250,.06)",borderBottom:"1px solid rgba(96,165,250,.1)"}}>
                  <div style={{display:"flex",gap:6}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:"#ef4444"}}/>
                    <div style={{width:10,height:10,borderRadius:"50%",background:"#f59e0b"}}/>
                    <div style={{width:10,height:10,borderRadius:"50%",background:"#4ade80"}}/>
                  </div>
                  <span style={{fontSize:".65rem",color:"#60a5fa",fontWeight:600}}>{langs[0]||"Code"}</span>
                </div>
                <textarea value={form.starterCode||""} onChange={function(e){set("starterCode",e.target.value);}}
                  placeholder={"// Write starter code here...\nfunction solution() {\n  // students complete this\n}"}
                  style={{width:"100%",minHeight:160,padding:"14px 16px",background:"transparent",border:"none",outline:"none",
                    color:"#e2e8f0",fontFamily:"'Courier New',monospace",fontSize:".82rem",lineHeight:1.7,resize:"vertical",
                    colorScheme:"dark"}}/>
              </div>
            </div>
            {/* Test cases */}
            <div>
              <label className="form-label">Sample Test Cases</label>
              <textarea className="form-input" rows={3} placeholder={"Input: [1,2,3]\nExpected Output: 6\n\nInput: []\nExpected Output: 0"}
                style={{fontFamily:"'Courier New',monospace",fontSize:".8rem",lineHeight:1.6,resize:"vertical"}}
                value={form.testCases||""} onChange={function(e){set("testCases",e.target.value);}}/>
            </div>
          </div>
        );
      }

      if(form.type==="Quiz"){
        const questions=form.questions||[];
        function addQuestion(){
          set("questions",questions.concat({q:"",options:["","","",""],correct:0}));
        }
        function setQ(i,field,val){
          const updated=questions.map(function(q,idx){return idx===i?Object.assign({},q,{[field]:val}):q;});
          set("questions",updated);
        }
        function setOpt(qi,oi,val){
          const updated=questions.map(function(q,idx){
            if(idx!==qi)return q;
            const opts=q.options.map(function(o,j){return j===oi?val:o;});
            return Object.assign({},q,{options:opts});
          });
          set("questions",updated);
        }
        function removeQ(i){set("questions",questions.filter(function(_,idx){return idx!==i;}));}
        return(
          <div style={{display:"flex",flexDirection:"column",gap:14,padding:"16px",borderRadius:13,background:"rgba(240,165,0,.04)",border:"1px solid rgba(240,165,0,.14)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:"1rem"}}>📝</span>
                <span style={{fontSize:".78rem",fontWeight:800,color:C.gold,letterSpacing:".04em",textTransform:"uppercase"}}>Quiz Builder</span>
                <span style={{padding:"2px 8px",borderRadius:99,background:"rgba(240,165,0,.12)",border:"1px solid rgba(240,165,0,.25)",fontSize:".65rem",color:C.gold,fontWeight:700}}>{questions.length} Q</span>
              </div>
              <button className="btn-ghost" onClick={addQuestion} style={{fontSize:".72rem",padding:"5px 11px"}}>+ Add Question</button>
            </div>
            {questions.length===0&&(
              <div style={{padding:"24px",borderRadius:10,border:"1px dashed rgba(240,165,0,.15)",textAlign:"center",color:C.t3,fontSize:".78rem"}}>
                No questions yet — click "+ Add Question"
              </div>
            )}
            {questions.map(function(q,qi){
              return(
                <div key={qi} style={{padding:"14px",borderRadius:11,background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.07)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                    <div style={{width:22,height:22,borderRadius:6,background:"rgba(240,165,0,.15)",border:"1px solid rgba(240,165,0,.3)",display:"grid",placeItems:"center",fontSize:".68rem",fontWeight:900,color:C.gold,flexShrink:0}}>{qi+1}</div>
                    <input className="form-input" placeholder={"Question "+(qi+1)+"…"} value={q.q}
                      onChange={function(e){setQ(qi,"q",e.target.value);}} style={{flex:1}}/>
                    <button onClick={function(){removeQ(qi);}} style={{background:"none",border:"none",color:C.t3,cursor:"pointer",fontSize:".9rem",padding:"4px",flexShrink:0,transition:"color .2s"}}
                      onMouseOver={function(e){e.currentTarget.style.color=C.red;}} onMouseOut={function(e){e.currentTarget.style.color=C.t3;}}>✕</button>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                    {q.options.map(function(opt,oi){
                      const isCorrect=q.correct===oi;
                      return(
                        <div key={oi} style={{display:"flex",alignItems:"center",gap:7,padding:"7px 10px",borderRadius:9,
                          border:"1.5px solid "+(isCorrect?"rgba(74,222,128,.4)":"rgba(255,255,255,.07)"),
                          background:isCorrect?"rgba(74,222,128,.06)":"rgba(255,255,255,.02)",transition:"all .2s"}}>
                          <div onClick={function(){setQ(qi,"correct",oi);}} style={{width:16,height:16,borderRadius:"50%",flexShrink:0,cursor:"pointer",
                            border:"2px solid "+(isCorrect?"#4ade80":"rgba(255,255,255,.2)"),
                            background:isCorrect?"#4ade80":"transparent",transition:"all .2s",display:"grid",placeItems:"center"}}>
                            {isCorrect&&<div style={{width:6,height:6,borderRadius:"50%",background:"#050814"}}/>}
                          </div>
                          <input value={opt} onChange={function(e){setOpt(qi,oi,e.target.value);}}
                            placeholder={"Option "+(oi+1)}
                            style={{background:"none",border:"none",outline:"none",color:isCorrect?"#4ade80":C.t1,fontFamily:"'Satoshi',sans-serif",fontSize:".78rem",flex:1,minWidth:0}}/>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{fontSize:".65rem",color:C.t3,marginTop:7}}>Click the circle to mark correct answer</div>
                </div>
              );
            })}
          </div>
        );
      }

      if(form.type==="Design"){
        const tools=form.designTools||[];
        const toggleTool=function(t){set("designTools",tools.includes(t)?tools.filter(function(x){return x!==t;}):tools.concat(t));};
        return(
          <div style={{display:"flex",flexDirection:"column",gap:14,padding:"16px",borderRadius:13,background:"rgba(244,114,182,.04)",border:"1px solid rgba(244,114,182,.14)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:"1rem"}}>🎨</span>
              <span style={{fontSize:".78rem",fontWeight:800,color:"#f472b6",letterSpacing:".04em",textTransform:"uppercase"}}>Design Assignment</span>
            </div>
            <div>
              <label className="form-label">Allowed Tools</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                {DESIGN_TOOLS.map(function(t){
                  const sel=tools.includes(t);
                  return(
                    <span key={t} onClick={function(){toggleTool(t);}} style={{padding:"4px 11px",borderRadius:99,fontSize:".72rem",fontWeight:600,cursor:"pointer",transition:"all .2s",
                      background:sel?"rgba(244,114,182,.15)":"rgba(255,255,255,.03)",
                      border:"1px solid "+(sel?"rgba(244,114,182,.45)":"rgba(255,255,255,.08)"),
                      color:sel?"#f472b6":C.t2}}>
                      {sel?"✓ ":""}{t}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="form-row">
              <div>
                <label className="form-label">Deliverable Format</label>
                <input className="form-input" placeholder="e.g. .fig, .pdf, .png" value={form.deliverableFormat||""}
                  onChange={function(e){set("deliverableFormat",e.target.value);}}/>
              </div>
              <div>
                <label className="form-label">Screen / Canvas Size</label>
                <input className="form-input" placeholder="e.g. 1440×900, Mobile 375px" value={form.canvasSize||""}
                  onChange={function(e){set("canvasSize",e.target.value);}}/>
              </div>
            </div>
            <div>
              <label className="form-label">Design Brief / Moodboard URL</label>
              <input className="form-input" placeholder="https://figma.com/..." value={form.designBrief||""}
                onChange={function(e){set("designBrief",e.target.value);}}/>
            </div>
          </div>
        );
      }

      if(form.type==="Report"||form.type==="Research"){
        const col=form.type==="Research"?"#00d4aa":"#a78bfa";
        const colA=form.type==="Research"?"rgba(0,212,170,.04)":"rgba(167,139,250,.04)";
        const colB=form.type==="Research"?"rgba(0,212,170,.14)":"rgba(167,139,250,.14)";
        return(
          <div style={{display:"flex",flexDirection:"column",gap:14,padding:"16px",borderRadius:13,background:colA,border:"1px solid "+colB}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:"1rem"}}>{form.type==="Research"?"🔬":"📄"}</span>
              <span style={{fontSize:".78rem",fontWeight:800,color:col,letterSpacing:".04em",textTransform:"uppercase"}}>{form.type} Assignment</span>
            </div>
            <div className="form-row">
              <div>
                <label className="form-label">Min Word Count</label>
                <input type="number" className="form-input" placeholder="e.g. 1000" value={form.minWords||""}
                  onChange={function(e){set("minWords",e.target.value);}}/>
              </div>
              <div>
                <label className="form-label">Max Word Count</label>
                <input type="number" className="form-input" placeholder="e.g. 3000" value={form.maxWords||""}
                  onChange={function(e){set("maxWords",e.target.value);}}/>
              </div>
            </div>
            <div className="form-row">
              <div>
                <label className="form-label">Citation Style</label>
                <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                  {CITE_STYLES.map(function(s){
                    const sel=(form.citationStyle||"")=== s;
                    return(
                      <span key={s} onClick={function(){set("citationStyle",s);}} style={{padding:"4px 11px",borderRadius:99,fontSize:".72rem",fontWeight:600,cursor:"pointer",transition:"all .2s",
                        background:sel?col+"22":"rgba(255,255,255,.03)",border:"1px solid "+(sel?col+"55":"rgba(255,255,255,.08)"),color:sel?col:C.t2}}>
                        {sel?"✓ ":""}{s}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="form-label">Submission Format</label>
                <input className="form-input" placeholder="e.g. PDF, DOCX" value={form.reportFormat||""}
                  onChange={function(e){set("reportFormat",e.target.value);}}/>
              </div>
            </div>
            <div>
              <label className="form-label">Required Sections / Outline</label>
              <textarea className="form-input" rows={3} placeholder={"e.g.\n1. Abstract\n2. Introduction\n3. Methodology\n4. Results\n5. Conclusion"}
                style={{resize:"vertical",lineHeight:1.6,fontFamily:"'Courier New',monospace",fontSize:".8rem"}}
                value={form.outline||""} onChange={function(e){set("outline",e.target.value);}}/>
            </div>
          </div>
        );
      }

      if(form.type==="Project"){
        const stack=form.techStack||[];
        const toggleStack=function(t){set("techStack",stack.includes(t)?stack.filter(function(x){return x!==t;}):stack.concat(t));};
        const milestones=form.milestones||[];
        function addMilestone(){set("milestones",milestones.concat({title:"",dueDate:""}));}
        function setMilestone(i,field,val){
          set("milestones",milestones.map(function(m,idx){return idx===i?Object.assign({},m,{[field]:val}):m;}));
        }
        function removeMilestone(i){set("milestones",milestones.filter(function(_,idx){return idx!==i;}));}
        return(
          <div style={{display:"flex",flexDirection:"column",gap:14,padding:"16px",borderRadius:13,background:"rgba(74,222,128,.04)",border:"1px solid rgba(74,222,128,.14)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:"1rem"}}>🚀</span>
              <span style={{fontSize:".78rem",fontWeight:800,color:C.green,letterSpacing:".04em",textTransform:"uppercase"}}>Project Assignment</span>
            </div>
            <div>
              <label className="form-label">Tech Stack</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                {TECH_STACK_OPTIONS.map(function(t){
                  const sel=stack.includes(t);
                  return(
                    <span key={t} onClick={function(){toggleStack(t);}} style={{padding:"4px 11px",borderRadius:99,fontSize:".72rem",fontWeight:600,cursor:"pointer",transition:"all .2s",
                      background:sel?"rgba(74,222,128,.15)":"rgba(255,255,255,.03)",
                      border:"1px solid "+(sel?"rgba(74,222,128,.45)":"rgba(255,255,255,.08)"),
                      color:sel?C.green:C.t2}}>
                      {sel?"✓ ":""}{t}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="form-row">
              <div>
                <label className="form-label">GitHub Repo Template URL</label>
                <input className="form-input" placeholder="https://github.com/..." value={form.repoUrl||""}
                  onChange={function(e){set("repoUrl",e.target.value);}}/>
              </div>
              <div>
                <label className="form-label">Team Size</label>
                <input className="form-input" placeholder="e.g. Solo / 2-3 members" value={form.teamSize||""}
                  onChange={function(e){set("teamSize",e.target.value);}}/>
              </div>
            </div>
            {/* Milestones */}
            <div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <label className="form-label" style={{margin:0}}>Milestones</label>
                <button className="btn-ghost" onClick={addMilestone} style={{fontSize:".7rem",padding:"4px 10px"}}>+ Add</button>
              </div>
              {milestones.length===0&&(
                <div style={{padding:"14px",borderRadius:10,border:"1px dashed rgba(74,222,128,.15)",textAlign:"center",color:C.t3,fontSize:".78rem"}}>No milestones added</div>
              )}
              {milestones.map(function(m,i){
                return(
                  <div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:7}}>
                    <div style={{width:22,height:22,borderRadius:6,background:"rgba(74,222,128,.12)",border:"1px solid rgba(74,222,128,.28)",display:"grid",placeItems:"center",fontSize:".65rem",fontWeight:900,color:C.green,flexShrink:0}}>{i+1}</div>
                    <input className="form-input" placeholder={"Milestone "+(i+1)+" title"} value={m.title}
                      onChange={function(e){setMilestone(i,"title",e.target.value);}} style={{flex:1}}/>
                    <input type="date" className="form-input" value={m.dueDate}
                      onChange={function(e){setMilestone(i,"dueDate",e.target.value);}} style={{width:140,flexShrink:0,colorScheme:"dark"}}/>
                    <button onClick={function(){removeMilestone(i);}} style={{background:"none",border:"none",color:C.t3,cursor:"pointer",fontSize:".9rem",padding:"4px",flexShrink:0,transition:"color .2s"}}
                      onMouseOver={function(e){e.currentTarget.style.color=C.red;}} onMouseOut={function(e){e.currentTarget.style.color=C.t3;}}>✕</button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      return null;
    }

    return(
      <div style={{display:"flex",flexDirection:"column",gap:18}}>
        <div>
          <label className="form-label">Description</label>
          <textarea className="form-input" rows={4} placeholder="Describe what students need to accomplish in this assignment..."
            style={{resize:"vertical",lineHeight:1.65}}
            value={form.description} onChange={function(e){set("description",e.target.value);}}/>
        </div>
        <div>
          <label className="form-label">Detailed Instructions</label>
          <textarea className="form-input" rows={4} placeholder="Step-by-step instructions, hints, or additional context..."
            style={{resize:"vertical",lineHeight:1.65}}
            value={form.instructions} onChange={function(e){set("instructions",e.target.value);}}/>
        </div>
        {/* Type-specific section */}
        {TypeExtras()}
        <div style={{padding:"16px",borderRadius:13,background:"rgba(124,47,255,.04)",border:"1px solid rgba(124,47,255,.12)"}}>
          <label className="form-label" style={{marginBottom:10}}>Requirements</label>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <input className="form-input" placeholder="Type a requirement and press Enter or click Add"
              value={reqInput} onChange={function(e){setReqInput(e.target.value);}}
              onKeyDown={function(e){if(e.key==="Enter"){e.preventDefault();addReq();}}}
              style={{flex:1,minWidth:0}}/>
            <button onClick={addReq} style={{flexShrink:0,whiteSpace:"nowrap",padding:"9px 16px",borderRadius:10,border:"1px solid rgba(124,47,255,.35)",background:"rgba(124,47,255,.1)",color:C.violet,fontFamily:"'Satoshi',sans-serif",fontSize:".78rem",fontWeight:700,cursor:"pointer",transition:"all .2s"}}
              onMouseOver={function(e){e.currentTarget.style.background="rgba(124,47,255,.2)";}}
              onMouseOut={function(e){e.currentTarget.style.background="rgba(124,47,255,.1)";}}>
              + Add
            </button>
          </div>
          {form.requirements.length>0?(
            <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
              {form.requirements.map(function(r,i){
                return(
                  <span key={i} className="req-pill">
                    <span style={{fontSize:".7rem",color:C.violet,marginRight:2}}>✓</span>
                    {r}
                    <button onClick={function(){removeReq(i);}}>✕</button>
                  </span>
                );
              })}
            </div>
          ):(
            <div style={{padding:"14px",borderRadius:9,border:"1px dashed rgba(124,47,255,.15)",textAlign:"center",color:C.t3,fontSize:".76rem"}}>
              No requirements added yet
            </div>
          )}
        </div>
      </div>
    );
  }

  function StepGrading(){
    return(
      <div style={{display:"flex",flexDirection:"column",gap:18}}>
        {/* Rubric builder */}
        <div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <label className="form-label" style={{margin:0}}>Grading Rubric</label>
            {rubricTotal>0&&(
              <span style={{fontSize:".7rem",color:rubricTotal===form.maxScore?C.green:C.amber,fontWeight:700}}>
                {rubricTotal}/{form.maxScore} pts {rubricTotal===form.maxScore?"✓":""}
              </span>
            )}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 100px auto",gap:8,alignItems:"flex-end",marginBottom:12}}>
            <div>
              <label className="form-label">Criterion</label>
              <input className="form-input" placeholder="e.g. Code Quality, Correctness…"
                value={rubricInput.criterion} onChange={function(e){setRubricInput(function(p){return Object.assign({},p,{criterion:e.target.value});});}}
                onKeyDown={function(e){if(e.key==="Enter")addRubric();}}/>
            </div>
            <div>
              <label className="form-label">Points</label>
              <input type="number" className="form-input" placeholder="e.g. 25"
                value={rubricInput.points} onChange={function(e){setRubricInput(function(p){return Object.assign({},p,{points:e.target.value});});}}
                onKeyDown={function(e){if(e.key==="Enter")addRubric();}}/>
            </div>
            <button onClick={addRubric} style={{whiteSpace:"nowrap",padding:"10px 16px",borderRadius:10,border:"1px solid rgba(124,47,255,.35)",background:"rgba(124,47,255,.1)",color:C.violet,fontFamily:"'Satoshi',sans-serif",fontSize:".78rem",fontWeight:700,cursor:"pointer",transition:"all .2s",marginBottom:1}}
              onMouseOver={function(e){e.currentTarget.style.background="rgba(124,47,255,.2)";}}
              onMouseOut={function(e){e.currentTarget.style.background="rgba(124,47,255,.1)";}}>
              + Add
            </button>
          </div>
          {(form.rubric||[]).length>0?(
            <div>
              {(form.rubric||[]).map(function(r,i){
                const pct=form.maxScore>0?Math.min(100,r.points/form.maxScore*100):0;
                return(
                  <div key={i} className="rubric-row">
                    <div style={{width:32,height:32,borderRadius:8,background:G.em,display:"grid",placeItems:"center",fontSize:".72rem",fontWeight:900,color:"#fff",flexShrink:0}}>{r.points}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:".8rem",fontWeight:600,color:C.t0,marginBottom:4}}>{r.criterion}</div>
                      <div style={{height:3,borderRadius:99,background:"rgba(255,255,255,.06)"}}>
                        <div style={{height:"100%",width:pct+"%",background:G.em,borderRadius:99,transition:"width .6s ease"}}/>
                      </div>
                    </div>
                    <button onClick={function(){removeRubric(i);}} style={{background:"none",border:"none",color:C.t3,cursor:"pointer",fontSize:".8rem",padding:"4px",transition:"color .2s"}}
                      onMouseOver={function(e){e.currentTarget.style.color=C.red;}} onMouseOut={function(e){e.currentTarget.style.color=C.t3;}}>✕</button>
                  </div>
                );
              })}
            </div>
          ):(
            <div style={{padding:"20px",borderRadius:10,border:"1px dashed rgba(255,255,255,.07)",textAlign:"center",color:C.t3,fontSize:".78rem"}}>
              No rubric criteria added yet
            </div>
          )}
        </div>
        {/* Late policy */}
        <div>
          <label className="form-label">Late Submission Policy</label>
          <div style={{display:"flex",gap:9}}>
            {["No penalty","10% per day","50% deduction","Not accepted"].map(function(p){
              const sel=(form.latePolicy||"No penalty")===p;
              return(
                <div key={p} onClick={function(){set("latePolicy",p);}}
                  style={{flex:1,padding:"9px 8px",borderRadius:10,border:"1.5px solid "+(sel?"rgba(124,47,255,.45)":"rgba(255,255,255,.07)"),
                    background:sel?"rgba(124,47,255,.09)":"rgba(255,255,255,.02)",cursor:"pointer",textAlign:"center",transition:"all .2s"}}>
                  <div style={{fontSize:".72rem",fontWeight:600,color:sel?C.violet:C.t2,lineHeight:1.4}}>{p}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  function StepReview(){
    const ci=COURSES.indexOf(form.course)%COURSE_COLORS.length;
    const cc=COURSE_COLORS[ci<0?0:ci];
    const tm=TYPE_META[form.type]||{ico:"📋",col:C.t2};
    const pm=PRI_META[form.priority]||PRI_META.medium;
    const dl=daysLeft(form.dueDate);
    const tags=typeof form.tags==="string"?form.tags.split(",").map(function(t){return t.trim();}).filter(Boolean):form.tags||[];
    return(
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{padding:"4px 0 10px",borderBottom:"1px solid "+C.bord}}>
          <div style={{fontSize:".72rem",color:C.t2,marginBottom:6,fontWeight:600,letterSpacing:".06em",textTransform:"uppercase"}}>Preview</div>
          <div style={{fontFamily:"'Fraunces',serif",fontSize:"1.3rem",fontWeight:900,color:C.t0,lineHeight:1.2,marginBottom:8}}>{form.title||"Untitled Assignment"}</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <TypeBadge type={form.type}/>
            <PriBadge priority={form.priority}/>
            {dl&&<span style={{display:"inline-flex",alignItems:"center",padding:"3px 9px",borderRadius:6,fontSize:".62rem",fontWeight:700,background:dl.col+"18",border:"1px solid "+dl.col+"33",color:dl.col}}>{dl.label}</span>}
          </div>
        </div>
        {/* Info grid */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[
            {label:"Course",value:(COURSE_ICONS[form.course]||"📚")+" "+(form.course||"—")},
            {label:"Due Date",value:fmtDate(form.dueDate)+(form.dueTime?" · "+form.dueTime:"")},
            {label:"Max Score",value:(form.maxScore||100)+" pts"},
            {label:"Est. Time",value:form.estimatedTime||"—"},
            {label:"Submission",value:form.submissionType||"file"},
            {label:"Late Policy",value:form.latePolicy||"No penalty"},
          ].map(function(item){
            return(
              <div key={item.label} style={{padding:"10px 13px",borderRadius:10,background:"rgba(255,255,255,.02)",border:"1px solid "+C.bord}}>
                <div style={{fontSize:".6rem",color:C.t3,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",marginBottom:4}}>{item.label}</div>
                <div style={{fontSize:".82rem",color:C.t1,fontWeight:600}}>{item.value}</div>
              </div>
            );
          })}
        </div>
        {/* Requirements */}
        {form.requirements.length>0&&(
          <div style={{padding:"13px",borderRadius:11,background:"rgba(255,255,255,.02)",border:"1px solid "+C.bord}}>
            <div style={{fontSize:".6rem",color:C.t3,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",marginBottom:8}}>Requirements ({form.requirements.length})</div>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {form.requirements.map(function(r,i){
                return <div key={i} style={{fontSize:".78rem",color:C.t1,display:"flex",gap:7,alignItems:"flex-start"}}><span style={{color:C.green,flexShrink:0}}>✓</span>{r}</div>;
              })}
            </div>
          </div>
        )}
        {/* Rubric */}
        {(form.rubric||[]).length>0&&(
          <div style={{padding:"13px",borderRadius:11,background:"rgba(255,255,255,.02)",border:"1px solid "+C.bord}}>
            <div style={{fontSize:".6rem",color:C.t3,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",marginBottom:8}}>Rubric — {rubricTotal}/{form.maxScore} pts</div>
            {(form.rubric||[]).map(function(r,i){
              return(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<form.rubric.length-1?"1px solid rgba(255,255,255,.04)":"none"}}>
                  <span style={{fontSize:".78rem",color:C.t1}}>{r.criterion}</span>
                  <span style={{fontSize:".78rem",fontWeight:700,color:C.violet}}>{r.points} pts</span>
                </div>
              );
            })}
          </div>
        )}
        {/* Tags */}
        {tags.length>0&&(
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {tags.map(function(t){
              return <span key={t} style={{padding:"3px 9px",borderRadius:6,fontSize:".68rem",background:"rgba(255,255,255,.04)",border:"1px solid "+C.bord,color:C.t2}}>{t}</span>;
            })}
          </div>
        )}
      </div>
    );
  }

  const panels=[StepBasics,StepDetails,StepContent,StepGrading,StepReview];
  const Panel=panels[step];
  const stepsDone=step;

  return(
    <div ref={overlayRef} style={{position:"fixed",inset:0,zIndex:500,background:"rgba(2,4,14,.97)",backdropFilter:"blur(18px)",display:"flex",opacity:0}}>
      {/* Left step nav */}
      <div style={{width:230,flexShrink:0,background:"rgba(3,5,16,.99)",borderRight:"1px solid "+C.bord,display:"flex",flexDirection:"column",padding:"20px 14px"}}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:28,paddingBottom:16,borderBottom:"1px solid "+C.bord}}>
          <div style={{width:34,height:34,borderRadius:9,background:G.em,display:"grid",placeItems:"center",fontSize:".9rem",boxShadow:"0 0 16px rgba(124,47,255,.4)",flexShrink:0}}>📋</div>
          <div>
            <div style={{fontFamily:"'Fraunces',serif",fontSize:".88rem",fontWeight:900,color:C.t0}}>{isEdit?"Edit Assignment":"New Assignment"}</div>
            <div style={{fontSize:".65rem",color:C.t2}}>Step {step+1} of {BUILDER_STEPS.length}</div>
          </div>
        </div>
        {/* Steps */}
        <div style={{flex:1}}>
          {BUILDER_STEPS.map(function(s,i){
            const active=i===step;
            const done=i<step;
            return(
              <div key={s.id}>
                <div className={"step-item"+(active?" active":"")+(done?" done":"")}
                  onClick={function(){goStep(i);}}>
                  <div style={{width:28,height:28,borderRadius:8,display:"grid",placeItems:"center",fontSize:".78rem",flexShrink:0,
                    background:done?"linear-gradient(135deg,#4ade80,#00d4aa)":active?G.em:"rgba(255,255,255,.05)",
                    border:"1.5px solid "+(done?"#4ade80":active?"rgba(124,47,255,.5)":"rgba(255,255,255,.08)"),
                    boxShadow:active?"0 0 12px rgba(124,47,255,.35)":"none",
                    transition:"all .3s"}}>
                    {done?"✓":s.ico}
                  </div>
                  <div>
                    <div style={{fontSize:".78rem",fontWeight:active?700:500,color:active?C.t0:done?C.green:C.t2,transition:"color .2s"}}>{s.label}</div>
                    <div style={{fontSize:".62rem",color:C.t3}}>{s.desc}</div>
                  </div>
                </div>
                {i<BUILDER_STEPS.length-1&&(
                  <div className={"step-connector"+(done?" done":"")}/>
                )}
              </div>
            );
          })}
        </div>
        {/* Progress */}
        <div style={{marginTop:"auto",paddingTop:16,borderTop:"1px solid "+C.bord}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontSize:".65rem",color:C.t2}}>Progress</span>
            <span style={{fontSize:".65rem",color:C.violet,fontWeight:700}}>{Math.round(step/(BUILDER_STEPS.length-1)*100)}%</span>
          </div>
          <div style={{height:4,borderRadius:99,background:"rgba(255,255,255,.06)"}}>
            <div style={{height:"100%",width:(step/(BUILDER_STEPS.length-1)*100)+"%",background:G.em,borderRadius:99,transition:"width .4s ease"}}/>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        {/* Topbar */}
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"13px 24px",background:"rgba(2,4,14,.95)",borderBottom:"1px solid "+C.bord,flexShrink:0}}>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Fraunces',serif",fontSize:"1rem",fontWeight:900,color:C.t0}}>{BUILDER_STEPS[step].label}</div>
            <div style={{fontSize:".68rem",color:C.t2}}>{BUILDER_STEPS[step].desc}</div>
          </div>
          <button onClick={onClose} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:8,border:"1px solid rgba(239,68,68,.2)",background:"transparent",color:"#ef4444",fontFamily:"'Satoshi',sans-serif",fontSize:".74rem",fontWeight:600,cursor:"pointer",transition:"all .2s"}}
            onMouseOver={function(e){e.currentTarget.style.background="rgba(239,68,68,.08)";e.currentTarget.style.borderColor="rgba(239,68,68,.4)";}}
            onMouseOut={function(e){e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="rgba(239,68,68,.2)";}}>
            ✕ Cancel
          </button>
        </div>

        {/* Scrollable form area */}
        <div ref={contentRef} style={{flex:1,overflowY:"auto",padding:"28px 32px",scrollbarWidth:"thin",scrollbarColor:"#1a1540 transparent",opacity:0}}>
          {Panel()}
        </div>

        {/* Footer nav */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 32px",background:"rgba(2,4,14,.95)",borderTop:"1px solid "+C.bord,flexShrink:0}}>
          <button onClick={prev} style={{visibility:step===0?"hidden":"visible",display:"inline-flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:8,border:"1px solid rgba(255,255,255,.08)",background:"transparent",color:C.t2,fontFamily:"'Satoshi',sans-serif",fontSize:".74rem",fontWeight:600,cursor:"pointer",transition:"all .2s"}}
            onMouseOver={function(e){e.currentTarget.style.color=C.t1;e.currentTarget.style.borderColor="rgba(255,255,255,.16)";}}
            onMouseOut={function(e){e.currentTarget.style.color=C.t2;e.currentTarget.style.borderColor="rgba(255,255,255,.08)";}}>
            ← Back
          </button>
          <div style={{display:"flex",gap:6}}>
            {BUILDER_STEPS.map(function(_,i){
              return <div key={i} style={{width:i===step?20:6,height:6,borderRadius:99,background:i<step?"#4ade80":i===step?C.em:"rgba(255,255,255,.1)",transition:"all .3s"}}/>;
            })}
          </div>
          {step<BUILDER_STEPS.length-1?(
            <button className="btn-primary" onClick={next}>Next →</button>
          ):(
            <button className="btn-primary" onClick={handleSave} disabled={saving}
              style={{background:saving?"rgba(124,47,255,.5)":G.em,animation:saving?"none":"pulseGlow 2s infinite"}}>
              {saving?"Saving…":isEdit?"💾 Save Changes":"🚀 Publish Assignment"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══ Main Page ══════════════════════════════════════════════════════════════ */
export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [typeFilter, setTypeFilter]   = useState("All");
  const [priFilter, setPriFilter]     = useState("All");
  const [search, setSearch]           = useState("");
  const [showBuilder, setShowBuilder] = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast]             = useState(null);

  // ── Submissions tab state ──
  const [activeTab, setActiveTab]           = useState("assignments"); // "assignments" | "submissions"
  const [submissions, setSubmissions]       = useState([]);
  const [subsLoading, setSubsLoading]       = useState(false);
  const [subsFilter, setSubsFilter]         = useState("all"); // all | submitted | graded
  const [gradeTarget, setGradeTarget]       = useState(null); // submission being graded

  const bgRef    = useRef(null);
  const topRef   = useRef(null);
  const statsRef = useRef(null);
  const filterRef= useRef(null);
  const listRef  = useRef(null);

  useBg(bgRef);

  async function fetchAll(){
    try{
      const r=await fetch(API,{headers:{Authorization:"Bearer "+token()}});
      const d=await r.json();
      const list=d.data||d;
      setAssignments(Array.isArray(list)?list:[]);
    }catch(e){setAssignments([]);}
    setLoading(false);
  }
  useEffect(function(){fetchAll();},[]);

  async function fetchSubmissions(){
    setSubsLoading(true);
    try{
      const params=subsFilter!=="all"?"?status="+subsFilter:"";
      const r=await fetch("http://localhost:5000/api/assignments/submissions"+params,{headers:{Authorization:"Bearer "+token()}});
      const d=await r.json();
      setSubmissions(Array.isArray(d.data)?d.data:[]);
    }catch(e){setSubmissions([]);}
    setSubsLoading(false);
  }
  useEffect(function(){if(activeTab==="submissions")fetchSubmissions();},[activeTab,subsFilter]);

  async function handleGrade(submissionId, gradeData){
    try{
      const r=await fetch("http://localhost:5000/api/assignments/"+submissionId+"/grade",{
        method:"POST",
        headers:{"Content-Type":"application/json",Authorization:"Bearer "+token()},
        body:JSON.stringify(gradeData),
      });
      const d=await r.json();
      if(!r.ok||d.success===false) throw new Error(d.message||"Grade failed");
      setToast("✅ Graded & certificate generated!");
      setGradeTarget(null);
      fetchSubmissions();
    }catch(e){
      setToast("❌ "+e.message);
      throw e;
    }
  }

  /* entrance */
  useEffect(function(){
    if(loading)return;
    const tl=gsap.timeline({defaults:{ease:"power3.out"}});
    if(topRef.current)   tl.fromTo(topRef.current,  {opacity:0,y:-18},{opacity:1,y:0,duration:.5},0);
    if(statsRef.current) tl.fromTo(statsRef.current.querySelectorAll(".stat-card"),{opacity:0,y:22},{opacity:1,y:0,duration:.5,stagger:.09},.1);
    if(filterRef.current)tl.fromTo(filterRef.current,{opacity:0,y:14},{opacity:1,y:0,duration:.45},.25);
    animateRows();
  },[loading]);

  function animateRows(){
    if(!listRef.current)return;
    gsap.fromTo(listRef.current.querySelectorAll(".a-row"),{opacity:0,x:-22},{opacity:1,x:0,duration:.4,stagger:.055,ease:"power2.out"});
  }
  useEffect(function(){animateRows();},[typeFilter,priFilter,search]);

  function onRowEnter(e){gsap.to(e.currentTarget,{scale:1.012,duration:.22,ease:"power2.out"});}
  function onRowLeave(e){gsap.to(e.currentTarget,{scale:1,duration:.22,ease:"power2.out"});}
  function onRowMM(e){
    const r=e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx",((e.clientX-r.left)/r.width*100).toFixed(1)+"%");
    e.currentTarget.style.setProperty("--my",((e.clientY-r.top)/r.height*100).toFixed(1)+"%");
  }

  async function handleSave(form){
    const isEdit=!!editTarget;
    try{
      const r=await fetch(isEdit?API+"/"+editTarget._id:API,{
        method:isEdit?"PUT":"POST",
        headers:{"Content-Type":"application/json",Authorization:"Bearer "+token()},
        body:JSON.stringify(form),
      });
      const d=await r.json();
      if(!r.ok||d.success===false){
        setToast("Error: "+(d.message||"Save failed"));
        return;
      }
      setToast(isEdit?"Assignment updated ✓":"Assignment published ✓");
      setShowBuilder(false); setEditTarget(null);
      fetchAll();
    }catch(e){
      setToast("Network error — check console");
      console.error(e);
    }
  }

  async function handleDelete(){
    await fetch(API+"/"+deleteTarget._id,{method:"DELETE",headers:{Authorization:"Bearer "+token()}});
    setToast("Assignment deleted");
    setDeleteTarget(null); fetchAll();
  }

  const filtered=assignments.filter(function(a){
    if(typeFilter!=="All"&&a.type!==typeFilter)return false;
    if(priFilter!=="All"&&a.priority!==priFilter)return false;
    if(search&&!a.title.toLowerCase().includes(search.toLowerCase()))return false;
    return true;
  });

  const total   =assignments.length;
  const highPri =assignments.filter(function(a){return a.priority==="high"||a.priority==="critical";}).length;
  const overdue =assignments.filter(function(a){return a.dueDate&&new Date(a.dueDate)<new Date();}).length;
  const courses =new Set(assignments.map(function(a){return a.course;})).size;

  return(
    <>
      <style>{CSS}</style>
      <canvas ref={bgRef} style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",background:"linear-gradient(135deg,#050814 0%,#0a0520 50%,#050814 100%)"}}/>
      <Sidebar/>

      <div className="lv-main">
        {/* Topbar */}
        <div ref={topRef} className="lv-topbar" style={{opacity:0}}>
          <div style={{width:32,height:32,borderRadius:9,background:G.em,display:"grid",placeItems:"center",fontSize:".9rem",flexShrink:0,boxShadow:"0 0 16px rgba(124,47,255,.4)"}}>📋</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Fraunces',serif",fontSize:"1rem",fontWeight:900,color:C.t0,letterSpacing:"-.02em"}}>Assignments</div>
            <div style={{fontSize:".68rem",color:C.t2}}>{total} total · {filtered.length} shown</div>
          </div>
          {/* Tab switcher */}
          <div style={{display:"flex",gap:4,background:"rgba(255,255,255,.04)",padding:4,borderRadius:10,border:"1px solid "+C.bord}}>
            {[["assignments","📋 Assignments"],["submissions","📬 Submissions"]].map(function(item){
              var active=activeTab===item[0];
              return(
                <button key={item[0]} onClick={function(){setActiveTab(item[0]);}}
                  style={{padding:"6px 14px",borderRadius:7,border:"none",fontFamily:"'Satoshi',sans-serif",fontSize:".76rem",fontWeight:700,cursor:"pointer",transition:"all .2s",
                    background:active?"linear-gradient(135deg,#7c2fff,#8b5cf6)":"transparent",
                    color:active?"#fff":C.t2,boxShadow:active?"0 4px 12px rgba(124,47,255,.35)":"none"}}>
                  {item[1]}
                  {item[0]==="submissions"&&submissions.filter(function(s){return s.status==="submitted";}).length>0&&(
                    <span style={{marginLeft:5,background:"#ef4444",color:"#fff",borderRadius:99,fontSize:".6rem",padding:"1px 5px",fontWeight:900}}>
                      {submissions.filter(function(s){return s.status==="submitted";}).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="lv-search">
            <span style={{color:C.t2,fontSize:".82rem"}}>🔍</span>
            <input placeholder="Search assignments…" value={search} onChange={function(e){setSearch(e.target.value);}}/>
          </div>
          {activeTab==="assignments"&&(
            <button className="btn-primary" onClick={function(){setEditTarget(null);setShowBuilder(true);}}>
              ✨ New Assignment
            </button>
          )}
        </div>

        <div className="lv-content">
          {/* ── SUBMISSIONS TAB ── */}
          {activeTab==="submissions"&&(
            <div>
              {/* Sub-filters */}
              <div style={{display:"flex",gap:6,marginBottom:18,flexWrap:"wrap",alignItems:"center"}}>
                {[["all","All"],["submitted","⏳ Pending"],["graded","✅ Graded"]].map(function(item){
                  var on=subsFilter===item[0];
                  var cnt=item[0]==="all"?submissions.length:submissions.filter(function(s){return s.status===item[0];}).length;
                  return(
                    <button key={item[0]} className={"f-pill"+(on?" on":"")} onClick={function(){setSubsFilter(item[0]);}}>
                      {item[1]} <span style={{marginLeft:4,opacity:.6,fontSize:".62rem"}}>({cnt})</span>
                    </button>
                  );
                })}
                <button className="btn-ghost" style={{marginLeft:"auto",fontSize:".72rem",padding:"5px 12px"}} onClick={fetchSubmissions}>↻ Refresh</button>
              </div>

              {subsLoading&&(
                <div style={{textAlign:"center",padding:"60px 0",color:C.t2}}>
                  <div style={{width:28,height:28,border:"2px solid "+C.em,borderTopColor:"transparent",borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto 12px"}}/>
                  Loading submissions…
                </div>
              )}

              {!subsLoading&&submissions.length===0&&(
                <div style={{textAlign:"center",padding:"60px 0"}}>
                  <div style={{fontSize:"2.8rem",marginBottom:12}}>📭</div>
                  <div style={{color:C.t1,fontWeight:700,marginBottom:6}}>No submissions yet</div>
                  <div style={{color:C.t2,fontSize:".82rem"}}>Students haven't submitted any assignments</div>
                </div>
              )}

              {!subsLoading&&(subsFilter==="all"?submissions:submissions.filter(function(s){return s.status===subsFilter;})).map(function(sub){
                var pct=sub.score&&sub.maxScore?((sub.score/sub.maxScore)*100).toFixed(1):null;
                var gradeCol=pct>=90?C.green:pct>=70?C.teal:pct>=50?C.amber:C.red;
                var isPending=sub.status==="submitted";
                return(
                  <div key={sub._id} className="a-row" style={{flexDirection:"column",alignItems:"stretch",gap:0,padding:0,cursor:"default"}}>
                    {/* Top row */}
                    <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px"}}>
                      <div style={{width:38,height:38,borderRadius:10,background:isPending?"rgba(245,158,11,.12)":"rgba(74,222,128,.1)",border:"1px solid "+(isPending?"rgba(245,158,11,.3)":"rgba(74,222,128,.25)"),display:"grid",placeItems:"center",fontSize:"1rem",flexShrink:0}}>
                        {isPending?"⏳":"✅"}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,color:C.t0,fontSize:".88rem",marginBottom:2}}>{sub.assignmentTitle||"Untitled"}</div>
                        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                          <span style={{fontSize:".72rem",color:C.t2}}>📚 {sub.courseName||"—"}</span>
                          <span style={{fontSize:".72rem",color:C.t2}}>👤 {sub.student?.name||"Unknown"}</span>
                          <span style={{fontSize:".72rem",color:C.t2}}>📧 {sub.student?.email||"—"}</span>
                          <span style={{fontSize:".72rem",color:C.t2}}>📅 {sub.submittedAt?new Date(sub.submittedAt).toLocaleDateString("en-IN"):"—"}</span>
                        </div>
                      </div>
                      {/* Grade display or Grade button */}
                      {sub.status==="graded"?(
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div style={{fontFamily:"'Fraunces',serif",fontSize:"1.3rem",fontWeight:900,color:gradeCol,lineHeight:1}}>{pct}%</div>
                          <div style={{fontSize:".65rem",color:C.t2,marginTop:2}}>{sub.score}/{sub.maxScore} pts</div>
                          {sub.certificateId&&(
                            <div style={{fontSize:".62rem",color:C.green,marginTop:3,fontWeight:700}}>🎓 Cert: {sub.certificateId.slice(0,16)}…</div>
                          )}
                        </div>
                      ):(
                        <button className="btn-primary" style={{fontSize:".76rem",padding:"7px 14px",flexShrink:0}}
                          onClick={function(){setGradeTarget(sub);}}>
                          🎓 Grade
                        </button>
                      )}
                    </div>
                    {/* Submission content preview */}
                    {(sub.submissionText||sub.submissionUrl)&&(
                      <div style={{padding:"10px 16px 14px",borderTop:"1px solid "+C.bord}}>
                        {sub.submissionText&&(
                          <div style={{fontSize:".78rem",color:C.t2,lineHeight:1.6,marginBottom:sub.submissionUrl?8:0,background:"rgba(255,255,255,.02)",borderRadius:8,padding:"8px 12px",border:"1px solid "+C.bord}}>
                            📝 {sub.submissionText.slice(0,200)}{sub.submissionText.length>200?"…":""}
                          </div>
                        )}
                        {sub.submissionUrl&&(
                          <a href={sub.submissionUrl} target="_blank" rel="noopener noreferrer"
                            style={{fontSize:".76rem",color:C.violet,display:"inline-flex",alignItems:"center",gap:5,marginTop:4}}>
                            🔗 {sub.submissionUrl}
                          </a>
                        )}
                      </div>
                    )}
                    {/* Feedback row if graded */}
                    {sub.status==="graded"&&sub.feedback&&(
                      <div style={{padding:"8px 16px 12px",borderTop:"1px solid "+C.bord}}>
                        <span style={{fontSize:".7rem",color:C.t2,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase"}}>Feedback: </span>
                        <span style={{fontSize:".78rem",color:C.t1}}>{sub.feedback}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── ASSIGNMENTS TAB ── */}
          {activeTab==="assignments"&&<>
          {/* Stats */}
          <div ref={statsRef} style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
            <StatCard icon="📋" label="Total"    value={total}   sub="All assignments"    grad={G.em}   idx={0}/>
            <StatCard icon="⏰" label="Overdue"  value={overdue} sub="Past due date"      grad={G.gold} idx={1}/>
            <StatCard icon="📚" label="Courses"  value={courses} sub="Active courses"     grad={G.teal} idx={2}/>
          </div>

          {/* Filters */}
          <div ref={filterRef} style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16,opacity:0}}>
            <button className={"f-pill"+(typeFilter==="All"?" on":"")} onClick={function(){setTypeFilter("All");}}>All Types</button>
            {TYPES.map(function(t){
              return <button key={t} className={"f-pill"+(typeFilter===t?" on":"")} onClick={function(){setTypeFilter(t);}}>{TYPE_META[t].ico} {t}</button>;
            })}
            <div style={{width:1,background:C.bord,margin:"0 4px"}}/>
            <button className={"f-pill"+(priFilter==="All"?" on":"")} onClick={function(){setPriFilter("All");}}>All Priority</button>
            {PRIORITIES.map(function(p){
              return <button key={p} className={"f-pill"+(priFilter===p?" on":"")} onClick={function(){setPriFilter(p);}}>{PRI_META[p].ico} {PRI_META[p].label}</button>;
            })}
          </div>

          {/* List */}
          <div ref={listRef}>
            {loading&&(
              <div style={{textAlign:"center",padding:"60px 0",color:C.t2}}>
                <div style={{width:28,height:28,border:"2px solid "+C.em,borderTopColor:"transparent",borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto 12px"}}/>
                Loading…
              </div>
            )}
            {!loading&&filtered.length===0&&(
              <div style={{textAlign:"center",padding:"60px 0"}}>
                <div style={{fontSize:"2.8rem",marginBottom:12}}>📭</div>
                <div style={{color:C.t1,fontWeight:700,marginBottom:6}}>No assignments found</div>
                <div style={{color:C.t2,fontSize:".82rem",marginBottom:18}}>Adjust filters or create a new one</div>
                <button className="btn-primary" onClick={function(){setEditTarget(null);setShowBuilder(true);}}>✨ Create Assignment</button>
              </div>
            )}
            {!loading&&filtered.map(function(a,i){
              const ci=COURSES.indexOf(a.course)%COURSE_COLORS.length;
              const cc=COURSE_COLORS[ci<0?0:ci];
              const dl=daysLeft(a.dueDate);
              const tags=Array.isArray(a.tags)?a.tags:[];
              return(
                <div key={a._id||i} className="a-row"
                  onMouseEnter={onRowEnter} onMouseLeave={onRowLeave} onMouseMove={onRowMM}>
                  <div style={{width:3,height:44,borderRadius:99,background:cc,flexShrink:0}}/>
                  <div style={{width:40,height:40,borderRadius:11,background:cc+"18",border:"1px solid "+cc+"33",display:"grid",placeItems:"center",fontSize:"1.15rem",flexShrink:0}}>
                    {COURSE_ICONS[a.course]||"📋"}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                      <span style={{fontWeight:700,color:C.t0,fontSize:".88rem",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:300}}>{a.title}</span>
                      <TypeBadge type={a.type}/>
                      <PriBadge priority={a.priority}/>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                      <span style={{fontSize:".7rem",color:C.t2}}>{a.course}</span>
                      {tags.slice(0,3).map(function(t){
                        return <span key={t} style={{fontSize:".62rem",padding:"2px 7px",borderRadius:5,background:"rgba(255,255,255,.04)",border:"1px solid "+C.bord,color:C.t2}}>{t}</span>;
                      })}
                    </div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:".72rem",color:C.t1,fontWeight:600}}>{fmtDate(a.dueDate)}</div>
                    {dl&&<div style={{fontSize:".65rem",color:dl.col,marginTop:2,fontWeight:700}}>{dl.label}</div>}
                  </div>
                  <div style={{textAlign:"center",flexShrink:0,minWidth:52}}>
                    <div style={{fontFamily:"'Fraunces',serif",fontSize:"1rem",fontWeight:900,color:C.t0}}>{a.maxScore||100}</div>
                    <div style={{fontSize:".6rem",color:C.t2}}>pts</div>
                  </div>
                  <div style={{display:"flex",gap:6,flexShrink:0}}>
                    <button className="btn-ghost" style={{padding:"6px 11px",fontSize:".7rem"}}
                      onClick={function(e){e.stopPropagation();setEditTarget(a);setShowBuilder(true);}}>✏️ Edit</button>
                    <button className="btn-danger" style={{padding:"6px 11px",fontSize:".7rem"}}
                      onClick={function(e){e.stopPropagation();setDeleteTarget(a);}}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
          </>}
        </div>
      </div>

      {showBuilder&&(
        <AssignmentBuilder
          initial={editTarget}
          onSave={handleSave}
          onClose={function(){setShowBuilder(false);setEditTarget(null);}}
        />
      )}
      {deleteTarget&&(
        <DeleteModal assignment={deleteTarget} onConfirm={handleDelete} onClose={function(){setDeleteTarget(null);}}/>
      )}
      {gradeTarget&&(
        <GradeModal
          submission={gradeTarget}
          onClose={function(){setGradeTarget(null);}}
          onGrade={handleGrade}
        />
      )}
      {toast&&<Toast msg={toast} onDone={function(){setToast(null);}}/>}
    </>
  );
}
