import React from 'react';
import { useNavigate } from 'react-router-dom';
import { C, GR } from '../constants';

export default function Hero({ heroLine, doBurst }) {
  const navigate = useNavigate();
  return (
    <section style={{minHeight:'100vh',display:'flex',alignItems:'center',padding:'0 64px',paddingTop:80,position:'relative',zIndex:2}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:64,alignItems:'center',maxWidth:1320,margin:'0 auto',width:'100%'}}>
        {/* Left */}
        <div>
          <div className="hero-tag" style={{opacity:0,marginBottom:24}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:C.v,animation:'dotBlink 2s infinite'}}/>
            LEARNVERSE ADMIN CONSOLE v2.6
          </div>

          <div className="clash" style={{fontSize:'clamp(2.4rem,4.5vw,4.2rem)',fontWeight:700,letterSpacing:'-.04em',lineHeight:1.05,marginBottom:24,minHeight:'calc(clamp(2.4rem,4.5vw,4.2rem) * 2.2)'}}>
            <span style={{background:GR.v,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',filter:'drop-shadow(0 0 30px rgba(124,58,255,.4))'}}>{heroLine}</span>
            {heroLine.length < 33 && <span style={{borderRight:'3px solid #7c3aff',marginLeft:2,animation:'typewriterCursor 1s infinite'}}/>}
          </div>

          <p className="hero-sub" style={{fontSize:'1.05rem',color:C.t2,lineHeight:1.75,maxWidth:500,marginBottom:38,opacity:0}}>
            One unified platform to manage 52,000+ learners, 1,284 courses, ₹8.4L monthly revenue
            and a team of 186 verified instructors — in real time.
          </p>

          <div className="hero-btns" style={{display:'flex',gap:14,marginBottom:40,opacity:0}}>
            <a href="#login" onClick={(e) => { e.preventDefault(); doBurst(); navigate('/auth'); }}>
              <button className="btn-v" style={{fontSize:'.96rem',padding:'15px 34px'}}>Access Dashboard →</button>
            </a>
            <button className="btn-outline" style={{fontSize:'.96rem',padding:'15px 28px'}}>Watch Demo ▶</button>
          </div>

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
            <div style={{height:2,background:GR.v,marginBottom:20,animation:'holoPulse 3s ease-in-out infinite',borderRadius:1}}/>

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
                {[[0,50],[65,38],[130,32],[195,15],[260,7]].map(([x,y],i)=>(
                  <circle key={i} cx={x} cy={y} r="3.5" fill={C.v} opacity=".9"
                    style={{filter:`drop-shadow(0 0 5px ${C.v})`,animation:`countUp .4s ${.8+i*.2}s both`}}
                  />
                ))}
              </svg>
            </div>

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

          <div className="hero-float-1 float-badge" style={{top:-20,left:-32,opacity:0,animation:'tagFloat 4s ease-in-out infinite'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:30,height:30,borderRadius:9,background:GR.v,display:'grid',placeItems:'center',fontSize:'.8rem',boxShadow:'0 0 15px rgba(124,58,255,.5)'}}>⬡</div>
              <div>
                <div style={{fontSize:'.78rem',fontWeight:700,color:C.text}}>52,840</div>
                <div style={{fontFamily:'DM Mono,monospace',fontSize:'.56rem',color:C.t3}}>TOTAL USERS</div>
              </div>
            </div>
          </div>

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
  );
}
