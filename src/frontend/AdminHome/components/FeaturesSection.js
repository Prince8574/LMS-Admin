import React from 'react';
import { C, GR, FEATURES } from '../constants';

export default function FeaturesSection() {
  return (
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
              <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:f.g,borderRadius:'24px 24px 0 0',opacity:.85}}/>
              <div style={{position:'absolute',top:24,bottom:24,left:0,width:2,background:f.g,borderRadius:1,opacity:.3}}/>

              <div className="feat-icon-wrap" style={{background:`${f.col}14`,border:`1px solid ${f.col}28`,boxShadow:`0 0 20px ${f.col}18`}}>
                <span style={{fontSize:'1.4rem',color:f.col,filter:`drop-shadow(0 0 10px ${f.col}99)`}}>{f.icon}</span>
              </div>

              <div className="clash" style={{fontSize:'1.12rem',fontWeight:700,letterSpacing:'-.02em',marginBottom:10}}>{f.title}</div>
              <p style={{fontSize:'.86rem',color:C.t2,lineHeight:1.7,marginBottom:20}}>{f.desc}</p>

              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {f.stats.map(s=>(
                  <div key={s} style={{padding:'4px 11px',borderRadius:8,background:`${f.col}0e`,border:`1px solid ${f.col}25`,fontFamily:'DM Mono,monospace',fontSize:'.65rem',fontWeight:700,color:f.col,transition:'all .2s'}}
                    onMouseEnter={e=>{e.currentTarget.style.background=`${f.col}1e`;e.currentTarget.style.boxShadow=`0 0 12px ${f.col}30`}}
                    onMouseLeave={e=>{e.currentTarget.style.background=`${f.col}0e`;e.currentTarget.style.boxShadow='none'}}
                  >{s}</div>
                ))}
              </div>

              <div style={{position:'absolute',bottom:22,right:22,width:30,height:30,borderRadius:8,background:`${f.col}14`,border:`1px solid ${f.col}28`,display:'grid',placeItems:'center',fontSize:'.8rem',color:f.col,opacity:0,transition:'opacity .25s,transform .25s'}}
                className="feat-arrow">→</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
