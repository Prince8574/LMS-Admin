import React, { useState, useEffect, useRef } from 'react';
import { C, GR, STATS } from '../constants';

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

export default function StatsSection() {
  return (
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
  );
}
