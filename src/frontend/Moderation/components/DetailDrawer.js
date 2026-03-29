import { useState } from 'react';
import { COLORS as C, GR, SEV_MAP } from '../constants';

export function DetailDrawer({ flag, onClose, onAction }) {
  const [revealed, setRevealed] = useState(false);
  const [note, setNote] = useState('');
  if (!flag) return null;
  const sm = SEV_MAP[flag.severity];

  return (
    <>
      <div className="detail-overlay" onClick={onClose}/>
      <div className="detail-drawer">
        <div className="dh">
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,marginBottom:14}}>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:6}}>
                <span className={sm.cls}><span style={{width:5,height:5,borderRadius:'50%',background:sm.dot,display:'inline-block'}}/>  {sm.label}</span>
                {flag.urgent&&<span style={{padding:'2px 8px',borderRadius:6,background:'rgba(255,107,157,.15)',border:'1px solid rgba(255,107,157,.3)',fontFamily:'DM Mono,monospace',fontSize:'.58rem',color:C.ro,fontWeight:700,animation:'urgentPulse 2s infinite'}}>ðŸš¨ URGENT</span>}
                <div className="ai-badge"><div className="ai-dot"/>AI SCORE: {flag.aiScore}%</div>
              </div>
              <div style={{fontFamily:'Clash Display,sans-serif',fontSize:'1rem',fontWeight:700,marginBottom:3,lineHeight:1.3}}>{flag.type}</div>
              <div style={{fontSize:'.76rem',color:C.t2}}>{flag.course} Â· {flag.lesson}</div>
            </div>
            <button className="btn-icon" onClick={onClose}>âœ•</button>
          </div>
          <div style={{display:'flex',gap:8,padding:'10px 14px',borderRadius:11,background:'rgba(8,11,26,.97)',border:`1px solid ${C.bord}`}}>
            <div style={{width:34,height:34,borderRadius:10,background:'linear-gradient(135deg,#ff6b9d,#f02079)',display:'grid',placeItems:'center',fontFamily:'Clash Display,sans-serif',fontSize:'.7rem',fontWeight:900,color:'#050814',flexShrink:0}}>
              {flag.reporter.split(' ').map(n=>n[0]).join('')}
            </div>
            <div>
              <div style={{fontWeight:600,fontSize:'.84rem'}}>{flag.reporter}</div>
              <div style={{fontFamily:'DM Mono,monospace',fontSize:'.62rem',color:C.t2}}>{flag.reporterEmail}</div>
            </div>
            <div style={{marginLeft:'auto',textAlign:'right',flexShrink:0}}>
              <div style={{fontFamily:'DM Mono,monospace',fontSize:'.62rem',color:C.t3}}>{flag.time}</div>
              <div style={{fontFamily:'DM Mono,monospace',fontSize:'.62rem',color:C.ro,marginTop:2}}>{flag.reports} reports</div>
            </div>
          </div>
        </div>

        <div className="ds">
          <div style={{fontFamily:'DM Mono,monospace',fontSize:'.62rem',letterSpacing:'.1em',color:C.t3,textTransform:'uppercase',marginBottom:12}}>AI Analysis</div>
          <div style={{background:'linear-gradient(135deg,rgba(232,24,124,.07),rgba(139,92,246,.04))',borderRadius:13,padding:'14px 16px',border:'1px solid rgba(232,24,124,.14)',marginBottom:14}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div style={{display:'flex',alignItems:'center',gap:7}}>
                <div className="ai-badge"><div className="ai-dot"/>GEMINI 2.0</div>
                <span style={{fontSize:'.78rem',fontWeight:600}}>Violation Probability</span>
              </div>
              <div style={{fontFamily:'Clash Display,sans-serif',fontSize:'1.2rem',fontWeight:700,color:flag.aiScore>=80?C.ro:flag.aiScore>=60?C.am:C.em}}>{flag.aiScore}%</div>
            </div>
            <div className="prog-bar">
              <div className="prog-fill" style={{'--pw':`${flag.aiScore}%`,width:`${flag.aiScore}%`,background:flag.aiScore>=80?GR.ro:flag.aiScore>=60?GR.am:GR.em}}/>
            </div>
          </div>
          <div style={{marginBottom:8,fontFamily:'DM Mono,monospace',fontSize:'.6rem',color:C.t3,textTransform:'uppercase',letterSpacing:'.08em'}}>Detected Issues</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
            {flag.aiTags.map(t=><div key={t} className="keyword-tag">{t}</div>)}
          </div>
        </div>

        <div className="ds">
          <div style={{fontFamily:'DM Mono,monospace',fontSize:'.62rem',letterSpacing:'.1em',color:C.t3,textTransform:'uppercase',marginBottom:12}}>Reported Content</div>
          <div className={`content-preview${revealed?'':' blurred'}`}>
            {flag.content}
            {!revealed && (
              <div className="preview-reveal" onClick={()=>setRevealed(true)}>
                <div style={{textAlign:'center'}}>
                  <div style={{fontSize:'1.4rem',marginBottom:6}}>ðŸ”’</div>
                  <div style={{fontFamily:'DM Mono,monospace',fontSize:'.68rem',color:C.text,fontWeight:700}}>CLICK TO REVEAL</div>
                  <div style={{fontSize:'.7rem',color:C.t2,marginTop:2}}>Potentially sensitive content</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="ds">
          <div style={{fontFamily:'DM Mono,monospace',fontSize:'.62rem',letterSpacing:'.1em',color:C.t3,textTransform:'uppercase',marginBottom:12}}>Timeline</div>
          {[
            {ico:'ðŸš©',text:`Reported by ${flag.reporter}`,time:flag.time,col:C.ro},
            {ico:'ðŸ¤–',text:`AI scan completed â€” ${flag.aiScore}% violation probability`,time:'Automated',col:C.vt},
            {ico:'ðŸ“¬',text:'Notification sent to instructor',time:'Automated',col:C.cy},
            flag.status==='under_review'&&{ico:'ðŸ‘',text:'Under manual review by moderator',time:'1h ago',col:C.am},
            flag.status==='resolved'&&{ico:'âœ“',text:`Resolved â€” ${flag.resolution==='approved'?'Violation confirmed':'Report dismissed'}`,time:'Review complete',col:flag.resolution==='approved'?C.ro:C.em},
          ].filter(Boolean).map((item,i)=>(
            <div key={i} style={{display:'flex',gap:10,marginBottom:10,alignItems:'flex-start'}}>
              <div style={{width:28,height:28,borderRadius:8,background:`${item.col}14`,border:`1px solid ${item.col}22`,display:'grid',placeItems:'center',fontSize:'.78rem',flexShrink:0}}>{item.ico}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:'.82rem',fontWeight:500}}>{item.text}</div>
                <div style={{fontFamily:'DM Mono,monospace',fontSize:'.62rem',color:C.t3,marginTop:1}}>{item.time}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="ds">
          <div style={{fontFamily:'DM Mono,monospace',fontSize:'.62rem',letterSpacing:'.1em',color:C.t3,textTransform:'uppercase',marginBottom:10}}>Moderator Note</div>
          <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Add an internal note about this reportâ€¦"
            style={{width:'100%',padding:'11px 14px',borderRadius:12,border:'1px solid rgba(255,255,255,.08)',background:'rgba(255,255,255,.03)',color:'#e2f0ff',fontSize:'.84rem',outline:'none',resize:'vertical',minHeight:80,lineHeight:1.6,transition:'all .22s',fontFamily:'Outfit,sans-serif'}}
            onFocus={e=>{e.target.style.borderColor='rgba(255,107,157,.35)';e.target.style.boxShadow='0 0 0 3px rgba(255,107,157,.08)'}}
            onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,.08)';e.target.style.boxShadow='none'}}/>
        </div>

        <div style={{padding:'18px 24px',display:'flex',flexWrap:'wrap',gap:8,borderTop:'1px solid rgba(255,255,255,.06)',position:'sticky',bottom:0,background:'rgba(4,6,18,.98)',backdropFilter:'blur(20px)'}}>
          <button className="btn-approve" onClick={()=>onAction('approved','Violation confirmed & content removed.')}>âœ“ Approve Flag</button>
          <button className="btn-reject" onClick={()=>onAction('dismissed','Report dismissed â€” no violation found.')}>âœ• Dismiss</button>
          <button className="btn-warn" onClick={()=>onAction('warned','Warning issued to instructor.')}>âš  Warn Instructor</button>
          <button className="btn-sec" style={{marginLeft:'auto',fontSize:'.78rem',padding:'8px 14px'}} onClick={()=>onAction('escalated','Escalated to senior moderator.')}>â†‘ Escalate</button>
        </div>
      </div>
    </>
  );
}
