import { C, GR } from '../constants';

export function LeftPanel({ mode }) {
  const content = {
    login: {
      headline: <>Sign in &<br/><span style={{background:GR.full,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Keep growing.</span></>,
      sub: "Access your courses, track progress, and connect with 186 world-class instructors — all in one place.",
    },
    register: {
      headline: <>Join 52K+<br/><span style={{background:GR.full,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>learners today.</span></>,
      sub: "Create your free account and unlock access to 1,284 expert-led courses across 8 categories.",
    },
    forgot: {
      headline: <>Reset &<br/><span style={{background:GR.full,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>get back in.</span></>,
      sub: "We'll send a secure one-time code to your email so you can reset your password instantly.",
    },
  };
  const { headline, sub } = content[mode] || content.login;

  return (
    <div className="auth-left">
      <div className="orb" style={{width:500,height:500,top:"-15%",left:"-10%",background:"radial-gradient(circle,rgba(124,47,255,.14),transparent 65%)",position:"absolute"}}/>
      <div className="orb" style={{width:380,height:380,bottom:"-10%",right:"0%",background:"radial-gradient(circle,rgba(240,32,121,.1),transparent 65%)",position:"absolute",animationDelay:"2s"}}/>
      <div className="left-content">
        <div className="logo-wrap" style={{animation:"slideL .6s .1s ease both",opacity:0}}>
          <div className="logo-icon">
            <div className="logo-ring-a"/><div className="logo-ring-b"/>
            <span style={{position:"relative",zIndex:1}}>⬡</span>
          </div>
          <div>
            <div className="logo-text">Learn<span style={{background:GR.full,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Verse</span></div>
            <div style={{fontFamily:"DM Mono,monospace",fontSize:".5rem",letterSpacing:".18em",color:C.t3}}>ADMIN PLATFORM</div>
          </div>
        </div>
        <h1 className="left-headline" style={{animation:"slideL .6s .2s ease both",opacity:0}}>{headline}</h1>
        <p className="left-sub" style={{animation:"slideL .6s .28s ease both",opacity:0}}>{sub}</p>
        <div className="stats-row" style={{animation:"slideL .6s .34s ease both",opacity:0}}>
          {[{v:"52K+",l:"LEARNERS"},{v:"1,284",l:"COURSES"},{v:"4.8★",l:"AVG RATING"},{v:"186",l:"INSTRUCTORS"}].map(({v,l},i) => (
            <div key={l} className="stat-item">
              <div className="stat-val" style={{background:i%2===0?GR.main:GR.hot,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{v}</div>
              <div className="stat-label">{l}</div>
            </div>
          ))}
        </div>
        <div className="features-list">
          {[
            {ico:"🚀",col:C.p,  bg:`${C.p}18`,  l:"AI-Powered Learning",    d:"Personalised course recommendations"},
            {ico:"🎓",col:C.pk, bg:`${C.pk}14`, l:"Verified Certificates",   d:"Industry-recognised on completion"},
            {ico:"⚡",col:C.vi, bg:`${C.vi}14`, l:"Live Instructor Support", d:"Real-time doubt resolution"},
            {ico:"🔒",col:C.tl, bg:`${C.tl}14`, l:"Secure & Private",        d:"AES-256 encrypted, GDPR compliant"},
          ].map(({ico,col,bg,l,d},i) => (
            <div key={l} className="feature-item" style={{animationDelay:(i*.08+.4)+"s"}}>
              <div className="feat-icon" style={{background:bg,border:`1px solid ${col}28`}}>{ico}</div>
              <div><div className="feat-label">{l}</div><div className="feat-desc">{d}</div></div>
            </div>
          ))}
        </div>
      </div>
      <div className="float-badge fb-1">
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:10,background:GR.full,display:"grid",placeItems:"center",fontSize:".8rem",color:"#fff",flexShrink:0}}>🔥</div>
          <div>
            <div style={{fontFamily:"Clash Display,sans-serif",fontWeight:700,fontSize:".85rem"}}>9,240</div>
            <div style={{fontFamily:"DM Mono,monospace",fontSize:".58rem",color:C.t2,marginTop:1}}>ACTIVE RIGHT NOW</div>
          </div>
        </div>
      </div>
      <div className="float-badge fb-2">
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:10,background:GR.hot,display:"grid",placeItems:"center",fontSize:".8rem",color:"#fff",flexShrink:0}}>⭐</div>
          <div>
            <div style={{fontFamily:"Clash Display,sans-serif",fontWeight:700,fontSize:".85rem"}}>4.9/5.0</div>
            <div style={{fontFamily:"DM Mono,monospace",fontSize:".58rem",color:C.t2,marginTop:1}}>PLATFORM RATING</div>
          </div>
        </div>
      </div>
    </div>
  );
}
