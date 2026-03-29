import { useState, useRef, useEffect } from "react";
import { Sidebar } from '../../components/Sidebar';
import { useBg } from './components/useBg';
import { useGSAP } from './components/useGSAP';
import { DetailDrawer } from './components/DetailDrawer';
import { COLORS as C, GR, FLAGS, REPORTS, BANNED, DMCA, CATEGORIES, SEV_MAP, STATUS_COLORS, STATUS_BORDER, STATUS_COLOR } from './constants';
import './Moderation.css';
/* ═══════════════════════
   MAIN PAGE
═══════════════════════ */
export default function ModerationPage() {
  const bgRef = useRef(null);
  useBg(bgRef);
  const gsap = useGSAP();

  const [tab, setTab] = useState('queue');
  const [catFilter, setCatFilter] = useState('All');
  const [sevFilter, setSevFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [drawer, setDrawer] = useState(null);
  const [flags, setFlags] = useState(FLAGS);
  const [toast, setToast] = useState(null);
  const [aiRunning, setAiRunning] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [revealed, setRevealed] = useState({});

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3200); };

  // GSAP entrance
  useEffect(()=>{
    if(!gsap) return;
    gsap.fromTo('.sb-logo',{opacity:0,y:-14},{opacity:1,y:0,duration:.5,ease:'power3.out',delay:.1});
    gsap.fromTo('.sb-item',{opacity:0,x:-18},{opacity:1,x:0,duration:.4,stagger:.05,ease:'power3.out',delay:.18});
    gsap.fromTo('.topbar',{opacity:0,y:-18},{opacity:1,y:0,duration:.5,ease:'power3.out',delay:.12});
    gsap.fromTo('.stat-mini',{opacity:0,y:24,scale:.93},{opacity:1,y:0,scale:1,duration:.6,stagger:.08,ease:'power3.out',delay:.38});
    gsap.fromTo('.page-tabs',{opacity:0,y:10},{opacity:1,y:0,duration:.4,ease:'power2.out',delay:.52});
    gsap.fromTo('.ai-scanner',{opacity:0,y:16},{opacity:1,y:0,duration:.5,ease:'power3.out',delay:.45});
  },[gsap]);

  const runAiScan = () => {
    setAiRunning(true); setAiProgress(0);
    const iv = setInterval(()=>{
      setAiProgress(p=>{
        if(p>=100){ clearInterval(iv); setAiRunning(false); showToast('AI scan complete — 3 new violations detected!'); return 100; }
        return p + (Math.random()*8+2);
      });
    },120);
  };

  const handleAction = (flagId, resolution, msg) => {
    setFlags(f=>f.map(x=>x.id===flagId?{...x,status:resolution==='approved'?'resolved':resolution==='dismissed'?'dismissed':'under_review',resolution}:x));
    setDrawer(null);
    showToast(msg);
  };

  const filteredFlags = flags.filter(f=>{
    const cm = catFilter==='All'||f.category===catFilter;
    const sm = sevFilter==='all'||f.severity===sevFilter;
    const qm = !search||f.type.toLowerCase().includes(search.toLowerCase())||f.course.toLowerCase().includes(search.toLowerCase())||f.reporter.toLowerCase().includes(search.toLowerCase());
    return cm&&sm&&qm;
  });

  const pending  = flags.filter(f=>f.status==='pending');
  const critical = flags.filter(f=>f.severity==='critical'&&f.status==='pending');

  const STATS = [
    {l:'Pending Review',v:pending.length,s:'Needs attention',c:C.am,g:GR.am,ico:'⏳'},
    {l:'Critical Flags',v:critical.length,s:'Urgent action',c:C.ro,g:GR.ro,ico:'🚨'},
    {l:'Resolved Today',v:28,s:'↑ 14 vs yesterday',c:C.em,g:GR.em,ico:'✅'},
    {l:'AI Accuracy',v:'94.2%',s:'Last 30 days',c:C.vt,g:GR.vt,ico:'🤖'},
    {l:'Avg Response',v:'3.8h',s:'< 4h SLA target',c:C.cy,g:GR.cy,ico:'⚡'},
  ];

  const TABS = [
    {id:'queue',    l:'Review Queue',     count:pending.length,  countCol:C.am},
    {id:'reports',  l:'All Reports',      count:flags.length,    countCol:C.cy},
    {id:'dmca',     l:'DMCA',             count:DMCA.filter(d=>d.status==='pending').length, countCol:C.am},
    {id:'banned',   l:'Banned Users',     count:BANNED.length,   countCol:C.ro},
    {id:'keywords', l:'AI Keywords',      count:null,            countCol:null},
  ];

  return (
    <div style={{position:'relative',minHeight:'100vh',background:C.bg}}>
      <canvas ref={bgRef} style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none'}}/>
      <div className="bg-grid"/>
      <div className="orb" style={{width:500,height:500,top:'-8%',right:'-4%',background:'radial-gradient(circle,rgba(255,107,157,.08),transparent 65%)',position:'fixed',zIndex:0}}/>
      <div className="orb" style={{width:380,height:380,bottom:'8%',left:'15%',background:'radial-gradient(circle,rgba(240,32,121,.06),transparent 65%)',position:'fixed',zIndex:0,animationDelay:'2s'}}/>
      <div className="orb" style={{width:280,height:280,top:'40%',left:'-4%',background:'radial-gradient(circle,rgba(232,24,124,.05),transparent 65%)',position:'fixed',zIndex:0,animationDelay:'1s'}}/>

      {/* ── SIDEBAR ── */}
      <Sidebar />

      {/* ── MAIN ── */}
      <div className="main-content">

        {/* Topbar */}
        <div className="topbar">
          <div>
            <div className="topbar-title" style={{display:'flex',alignItems:'center',gap:10}}>
              Content Moderation
              {critical.length>0&&<div style={{padding:'2px 10px',borderRadius:7,background:'rgba(255,107,157,.15)',border:'1px solid rgba(255,107,157,.3)',fontFamily:'DM Mono,monospace',fontSize:'.62rem',color:C.ro,fontWeight:700,animation:'urgentPulse 2s infinite'}}>🚨 {critical.length} CRITICAL</div>}
            </div>
            <div style={{fontFamily:'DM Mono,monospace',fontSize:'.62rem',color:C.t3}}>AI-assisted review · LearnVerse Shield v3</div>
          </div>
          <div className="topbar-search" style={{marginLeft:12}}>
            <span style={{color:C.t3,fontSize:'.88rem'}}>⌕</span>
            <input placeholder="Search reports, courses, users…" value={search} onChange={e=>setSearch(e.target.value)}/>
            {search&&<button onClick={()=>setSearch('')} style={{background:'none',border:'none',color:C.t3,fontSize:'.8rem',cursor:'pointer'}}>✕</button>}
          </div>
          <div style={{flex:1}}/>
          <button className="btn-sec" style={{fontSize:'.8rem'}} onClick={()=>showToast('Report exported!')}>📥 Export Report</button>
          <button className="btn-em" style={{fontSize:'.8rem',padding:'9px 18px'}} onClick={runAiScan} disabled={aiRunning}>
            {aiRunning
              ? <><span style={{width:14,height:14,border:'2px solid rgba(0,0,0,.3)',borderTopColor:'#050814',borderRadius:'50%',animation:'spin .65s linear infinite',display:'inline-block'}}/> Scanning…</>
              : <><span style={{fontSize:'.85rem'}}>🤖</span> Run AI Scan</>
            }
          </button>
        </div>

        <div style={{padding:'24px 32px',position:'relative',zIndex:1}}>

          {/* Stats */}
          <div className="stats-band">
            {STATS.map((s,i)=>(
              <div key={i} className="stat-mini" style={{'--g':s.g,animationDelay:`${i*.08}s`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                  <div style={{width:36,height:36,borderRadius:10,background:`${s.c}14`,border:`1px solid ${s.c}20`,display:'grid',placeItems:'center',fontSize:'.95rem'}}>{s.ico}</div>
                  <div style={{fontFamily:'DM Mono,monospace',fontSize:'.6rem',color:s.c,padding:'2px 8px',borderRadius:99,background:`${s.c}0d`,border:`1px solid ${s.c}18`}}>{s.s}</div>
                </div>
                <div className="stat-mini-val" style={{color:s.c}}>{s.v}</div>
                <div className="stat-mini-label">{s.l}</div>
              </div>
            ))}
          </div>

          {/* AI Scanner widget */}
          <div className="ai-scanner">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:aiRunning?10:0}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div className="ai-badge"><div className="ai-dot"/>LEARNVERSE SHIELD AI</div>
                <div style={{fontWeight:600,fontSize:'.88rem'}}>Automated Content Scanner</div>
              </div>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <div style={{fontFamily:'DM Mono,monospace',fontSize:'.65rem',color:C.t2}}>Last scan: 14 min ago</div>
                <div style={{padding:'3px 10px',borderRadius:99,background:'rgba(124,47,255,.1)',border:'1px solid rgba(124,47,255,.2)',fontFamily:'DM Mono,monospace',fontSize:'.62rem',color:C.em}}>✓ RUNNING</div>
              </div>
            </div>
            {aiRunning&&(
              <div>
                <div style={{fontFamily:'DM Mono,monospace',fontSize:'.68rem',color:C.vt,marginBottom:6}}>Scanning 1,284 courses · Analysing text, images, audio…</div>
                <div className="scanner-bar">
                  <div className="scanner-fill" style={{width:`${Math.min(aiProgress,100)}%`}}/>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',fontFamily:'DM Mono,monospace',fontSize:'.62rem',color:C.t3,marginTop:5}}>
                  <span>Processing: {Math.round(aiProgress*12.84)} / 1,284 courses</span>
                  <span>{Math.min(Math.round(aiProgress),100)}%</span>
                </div>
              </div>
            )}
            {!aiRunning&&(
              <div style={{display:'flex',gap:16,marginTop:8,flexWrap:'wrap'}}>
                {[{l:'Courses scanned',v:'1,284',c:C.em},{l:'Violations found',v:'47',c:C.ro},{l:'Auto-resolved',v:'31',c:C.cy},{l:'Manual review',v:'16',c:C.am}].map(({l,v,c})=>(
                  <div key={l} style={{fontFamily:'DM Mono,monospace',fontSize:'.7rem'}}>
                    <span style={{color:c,fontWeight:700,fontSize:'.88rem'}}>{v}</span>
                    <span style={{color:C.t3,marginLeft:5}}>{l}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="page-tabs">
            {TABS.map(t=>(
              <div key={t.id} className={`page-tab${tab===t.id?' active':''}`} onClick={()=>setTab(t.id)}>
                {t.l}
                {t.count!==null&&<div className="tab-count" style={{background:tab===t.id?`${t.countCol}18`:'rgba(255,255,255,.04)',border:`1px solid ${tab===t.id?`${t.countCol}28`:'rgba(255,255,255,.07)'}`,color:tab===t.id?t.countCol:C.t2}}>{t.count}</div>}
              </div>
            ))}
          </div>

          {/* ── REVIEW QUEUE TAB ── */}
          {tab==='queue'&&(
            <div>
              {/* Filters */}
              <div className="filter-row">
                <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                  {CATEGORIES.map(c=>(
                    <div key={c} className="filter-chip" onClick={()=>setCatFilter(c)}
                      style={{background:catFilter===c?'rgba(255,107,157,.12)':'transparent',borderColor:catFilter===c?C.ro:'rgba(255,255,255,.08)',color:catFilter===c?C.ro:C.t2,textTransform:'capitalize',letterSpacing:'.04em'}}>
                      {c}
                    </div>
                  ))}
                </div>
                <div style={{display:'flex',gap:5,marginLeft:'auto'}}>
                  {['all','critical','high','medium','low'].map(s=>(
                    <div key={s} className="filter-chip" onClick={()=>setSevFilter(s)}
                      style={{background:sevFilter===s?`${SEV_MAP[s]?.dot||C.cy}18`:'transparent',borderColor:sevFilter===s?SEV_MAP[s]?.dot||C.cy:'rgba(255,255,255,.08)',color:sevFilter===s?SEV_MAP[s]?.dot||C.cy:C.t2,textTransform:'uppercase',fontSize:'.62rem'}}>
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* Flag cards */}
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                {filteredFlags.map((f,i)=>{
                  const sm=SEV_MAP[f.severity];
                  return(
                    <div key={f.id} className={`flag-card${f.urgent?' urgent':''}`} style={{animationDelay:`${i*.06}s`}}>
                      <div className="flag-card-head">
                        {/* Left — type icon */}
                        <div style={{width:46,height:46,borderRadius:14,background:f.severity==='critical'?'rgba(255,107,157,.12)':f.severity==='high'?'rgba(240,32,121,.1)':'rgba(232,24,124,.08)',border:`1px solid ${f.severity==='critical'?'rgba(255,107,157,.25)':f.severity==='high'?'rgba(240,32,121,.2)':'rgba(232,24,124,.15)'}`,display:'grid',placeItems:'center',fontSize:'1.2rem',flexShrink:0}}>
                          {f.category==='hate_speech'?'😡':f.category==='copyright'?'©':f.category==='spam'?'📢':f.category==='plagiarism'?'📋':f.category==='misinformation'?'❌':'🚩'}
                        </div>

                        {/* Content */}
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:5}}>
                            <span className={sm.cls}><span style={{width:4,height:4,borderRadius:'50%',background:sm.dot,display:'inline-block',marginRight:3}}/>{sm.label}</span>
                            {f.urgent&&<span style={{padding:'2px 8px',borderRadius:5,background:'rgba(255,107,157,.14)',border:'1px solid rgba(255,107,157,.28)',fontFamily:'DM Mono,monospace',fontSize:'.58rem',color:C.ro,fontWeight:700}}>🚨 URGENT</span>}
                            <div className="ai-badge"><div className="ai-dot"/>AI: {f.aiScore}%</div>
                            <div style={{padding:'3px 9px',borderRadius:6,background:STATUS_COLORS[f.status]||'rgba(77,122,158,.08)',border:`1px solid ${STATUS_BORDER[f.status]||'rgba(77,122,158,.18)'}`,fontFamily:'DM Mono,monospace',fontSize:'.6rem',color:STATUS_COLOR[f.status]||C.t2,fontWeight:700,textTransform:'uppercase'}}>{f.status.replace('_',' ')}</div>
                          </div>
                          <div style={{fontWeight:700,fontSize:'.92rem',marginBottom:3}}>{f.type}</div>
                          <div style={{fontSize:'.78rem',color:C.t2,marginBottom:4}}>
                            <span style={{color:C.text}}>{f.course}</span>
                            <span style={{margin:'0 6px',color:C.t3}}>›</span>
                            <span>{f.lesson}</span>
                          </div>
                          <div style={{display:'flex',gap:14,fontSize:'.74rem',color:C.t3,fontFamily:'DM Mono,monospace',flexWrap:'wrap'}}>
                            <span>👤 {f.reporter}</span>
                            <span>⏱ {f.time}</span>
                            <span style={{color:f.reports>=5?C.ro:C.t3}}>📋 {f.reports} reports</span>
                          </div>
                        </div>

                        {/* Quick actions */}
                        <div style={{display:'flex',flexDirection:'column',gap:6,flexShrink:0}}>
                          <button className="btn-icon" onClick={()=>setDrawer(f)} title="View details" style={{width:32,height:32}}>👁</button>
                          {f.status==='pending'&&(
                            <>
                              <button className="btn-icon" onClick={()=>handleAction(f.id,'approved','Violation confirmed!')} title="Approve" style={{width:32,height:32,borderColor:'rgba(124,47,255,.2)',color:C.em}}>✓</button>
                              <button className="btn-icon" onClick={()=>handleAction(f.id,'dismissed','Report dismissed.')} title="Dismiss" style={{width:32,height:32,borderColor:'rgba(255,107,157,.2)',color:C.ro}}>✕</button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Content preview */}
                      <div className="flag-card-body">
                        <div style={{position:'relative'}}>
                          <div style={{fontSize:'.82rem',color:C.t2,lineHeight:1.65,overflow:'hidden',maxHeight:revealed[f.id]?'none':'3.5em',position:'relative'}}>
                            {f.content}
                            {!revealed[f.id]&&<div style={{position:'absolute',bottom:0,left:0,right:0,height:'1.5em',background:'linear-gradient(transparent,rgba(5,8,20,.98))'}}/>}
                          </div>
                          {!revealed[f.id]&&<button onClick={()=>setRevealed(r=>({...r,[f.id]:true}))} style={{background:'none',border:'none',color:C.vt,fontSize:'.74rem',cursor:'pointer',marginTop:4,fontFamily:'DM Mono,monospace',padding:0}}>Show full report ▾</button>}
                        </div>
                        {/* AI tags */}
                        <div style={{display:'flex',flexWrap:'wrap',gap:4,marginTop:10}}>
                          {f.aiTags.map(t=><div key={t} className="keyword-tag">{t}</div>)}
                        </div>
                      </div>

                      {/* Footer actions */}
                      {f.status==='pending'&&(
                        <div className="flag-card-foot">
                          <button className="btn-approve" style={{fontSize:'.76rem',padding:'7px 14px'}} onClick={()=>handleAction(f.id,'approved','Violation confirmed & content removed!')}>✓ Approve Flag</button>
                          <button className="btn-warn" style={{fontSize:'.76rem',padding:'7px 14px'}} onClick={()=>handleAction(f.id,'warned','Warning sent to instructor.')}>⚠ Warn Instructor</button>
                          <button className="btn-reject" style={{fontSize:'.76rem',padding:'7px 14px'}} onClick={()=>handleAction(f.id,'dismissed','Report dismissed.')}>✕ Dismiss</button>
                          <div style={{marginLeft:'auto',display:'flex',gap:6}}>
                            <button className="btn-sec" style={{fontSize:'.74rem',padding:'6px 12px'}} onClick={()=>setDrawer(f)}>View Details →</button>
                          </div>
                        </div>
                      )}
                      {f.status!=='pending'&&(
                        <div className="flag-card-foot" style={{justifyContent:'space-between'}}>
                          <div style={{fontFamily:'DM Mono,monospace',fontSize:'.65rem',color:STATUS_COLOR[f.status]}}>
                            {f.status==='resolved'?`✓ ${f.resolution==='approved'?'Violation confirmed':'Report dismissed'}`:f.status.replace('_',' ')}
                          </div>
                          <button className="btn-sec" style={{fontSize:'.74rem',padding:'5px 12px'}} onClick={()=>setDrawer(f)}>Details →</button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {filteredFlags.length===0&&(
                  <div style={{padding:'60px 20px',textAlign:'center',color:C.t2,background:'rgba(5,8,20,.98)',borderRadius:18,border:`1px solid ${C.bord}`}}>
                    <div style={{fontSize:'3rem',marginBottom:10}}>🛡️</div>
                    <div style={{fontFamily:'Clash Display,sans-serif',fontSize:'1.1rem',fontWeight:700,marginBottom:6}}>All Clear!</div>
                    <div>No reports match your current filters.</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ALL REPORTS TAB ── */}
          {tab==='reports'&&(
            <div style={{background:'rgba(5,8,20,.98)',borderRadius:20,border:`1px solid ${C.bord}`,overflow:'hidden'}}>
              <table className="report-table" style={{width:'100%'}}>
                <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,.06)'}}>
                  <th>REPORTER</th><th>TARGET</th><th>TYPE</th><th>SEVERITY</th><th>STATUS</th><th>TIME</th><th>ACTIONS</th>
                </tr></thead>
                <tbody>
                  {REPORTS.map((r,i)=>{
                    const sm=SEV_MAP[r.severity];
                    return(
                      <tr key={r.id} className="r-row" style={{animationDelay:`${i*.04}s`}}>
                        <td className="r-td" style={{fontWeight:600,fontSize:'.85rem'}}>{r.reporter}</td>
                        <td className="r-td" style={{fontSize:'.82rem',color:C.t2,maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.target}</td>
                        <td className="r-td"><div style={{padding:'3px 9px',borderRadius:7,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',fontFamily:'DM Mono,monospace',fontSize:'.62rem',color:C.text,display:'inline-block'}}>{r.type}</div></td>
                        <td className="r-td"><span className={sm.cls}><span style={{width:4,height:4,borderRadius:'50%',background:sm.dot,display:'inline-block'}}/>{sm.label}</span></td>
                        <td className="r-td"><div style={{padding:'3px 9px',borderRadius:7,background:STATUS_COLORS[r.status]||'transparent',border:`1px solid ${STATUS_BORDER[r.status]||C.bord}`,fontFamily:'DM Mono,monospace',fontSize:'.6rem',color:STATUS_COLOR[r.status]||C.t2,fontWeight:700,textTransform:'uppercase',display:'inline-block'}}>{r.status.replace('_',' ')}</div></td>
                        <td className="r-td" style={{fontFamily:'DM Mono,monospace',fontSize:'.72rem',color:C.t3}}>{r.time}</td>
                        <td className="r-td">
                          <div style={{display:'flex',gap:5}}>
                            <button className="btn-icon" style={{width:28,height:28,fontSize:'.78rem'}} onClick={()=>setDrawer(flags.find(f=>f.id===r.id)||flags[0])}>👁</button>
                            <button className="btn-icon" style={{width:28,height:28,fontSize:'.78rem',borderColor:'rgba(124,47,255,.2)',color:C.em}} onClick={()=>showToast('Report resolved!')}>✓</button>
                            <button className="btn-icon" style={{width:28,height:28,fontSize:'.78rem',borderColor:'rgba(255,107,157,.2)',color:C.ro}} onClick={()=>showToast('Report dismissed.')}>✕</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── DMCA TAB ── */}
          {tab==='dmca'&&(
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
                <div style={{fontSize:'.84rem',color:C.t2}}>Manage copyright claims and DMCA takedown notices</div>
                <button className="btn-em" style={{fontSize:'.78rem',padding:'8px 16px'}} onClick={()=>showToast('DMCA response sent!')}>+ File Counter-Notice</button>
              </div>
              {DMCA.map((d,i)=>{
                const sm=SEV_MAP[d.severity];
                return(
                  <div key={d.id} className="dmca-row" style={{animationDelay:`${i*.07}s`}}>
                    <div style={{display:'flex',gap:14,alignItems:'flex-start'}}>
                      <div style={{width:44,height:44,borderRadius:13,background:'rgba(240,32,121,.1)',border:'1px solid rgba(240,32,121,.22)',display:'grid',placeItems:'center',fontSize:'1.1rem',flexShrink:0}}>©</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5,flexWrap:'wrap'}}>
                          <div style={{fontFamily:'DM Mono,monospace',fontSize:'.64rem',color:C.t3,fontWeight:700}}>{d.id}</div>
                          <span className={sm.cls}><span style={{width:4,height:4,borderRadius:'50%',background:sm.dot,display:'inline-block'}}/>{sm.label}</span>
                          <div style={{padding:'3px 9px',borderRadius:7,background:STATUS_COLORS[d.status]||'rgba(77,122,158,.08)',border:`1px solid ${STATUS_BORDER[d.status]||C.bord}`,fontFamily:'DM Mono,monospace',fontSize:'.6rem',color:STATUS_COLOR[d.status]||C.t2,fontWeight:700,textTransform:'uppercase'}}>{d.status.replace('_',' ')}</div>
                        </div>
                        <div style={{fontWeight:700,fontSize:'.9rem',marginBottom:4}}>{d.title}</div>
                        <div style={{fontSize:'.78rem',color:C.t2,marginBottom:8}}>
                          Claimant: <span style={{color:C.text,fontWeight:600}}>{d.claimant}</span>
                          <span style={{margin:'0 8px',color:C.t3}}>·</span>
                          Course: <span style={{color:C.text}}>{d.course}</span>
                          <span style={{margin:'0 8px',color:C.t3}}>·</span>
                          Instructor: <span style={{color:C.text}}>{d.instructor}</span>
                        </div>
                        <div style={{display:'flex',gap:14,fontFamily:'DM Mono,monospace',fontSize:'.65rem',color:C.t3}}>
                          <span>Filed: {d.filed}</span>
                          <span style={{color:d.status==='pending'?C.ro:C.t3}}>Deadline: {d.deadline}</span>
                        </div>
                      </div>
                      <div style={{display:'flex',gap:7,flexShrink:0,flexWrap:'wrap',justifyContent:'flex-end'}}>
                        {d.status==='pending'&&<>
                          <button className="btn-approve" style={{fontSize:'.74rem',padding:'7px 12px'}} onClick={()=>showToast('Content taken down!')}>Takedown</button>
                          <button className="btn-warn" style={{fontSize:'.74rem',padding:'7px 12px'}} onClick={()=>showToast('Counter-notice filed!')}>Counter</button>
                        </>}
                        <button className="btn-sec" style={{fontSize:'.74rem',padding:'7px 12px'}} onClick={()=>showToast('DMCA details copied!')}>Details</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── BANNED USERS TAB ── */}
          {tab==='banned'&&(
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
                <div style={{fontSize:'.84rem',color:C.t2}}>{BANNED.length} accounts currently restricted or banned</div>
                <button className="btn-em" style={{fontSize:'.78rem',padding:'8px 16px'}} onClick={()=>showToast('Ban form opened!')}>+ Issue Ban</button>
              </div>
              {BANNED.map((b,i)=>(
                <div key={i} className="ban-row" style={{animationDelay:`${i*.07}s`}}>
                  <div style={{width:42,height:42,borderRadius:12,background:b.col,display:'grid',placeItems:'center',fontFamily:'Clash Display,sans-serif',fontSize:'.8rem',fontWeight:900,color:'#050814',flexShrink:0,boxShadow:'0 0 16px rgba(255,107,157,.25)'}}>{b.avatar}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:'.88rem',marginBottom:2}}>{b.name}</div>
                    <div style={{fontFamily:'DM Mono,monospace',fontSize:'.64rem',color:C.t2,marginBottom:4}}>{b.email}</div>
                    <div style={{fontSize:'.78rem',color:C.t2}}>{b.reason}</div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0,marginRight:8}}>
                    <div style={{padding:'3px 10px',borderRadius:7,background:b.duration==='Permanent'?'rgba(255,107,157,.12)':'rgba(240,32,121,.1)',border:`1px solid ${b.duration==='Permanent'?'rgba(255,107,157,.28)':'rgba(240,32,121,.22)'}`,fontFamily:'DM Mono,monospace',fontSize:'.62rem',color:b.duration==='Permanent'?C.ro:C.am,fontWeight:700,display:'inline-block',marginBottom:4}}>{b.duration==='Permanent'?'🔴 PERMANENT':`⏱ ${b.duration}`}</div>
                    <div style={{fontFamily:'DM Mono,monospace',fontSize:'.62rem',color:C.t3}}>Since {b.date}</div>
                  </div>
                  <div style={{display:'flex',gap:6,flexShrink:0}}>
                    <button className="btn-approve" style={{fontSize:'.74rem',padding:'7px 12px'}} onClick={()=>showToast(b.name+' has been unbanned!')}>Unban</button>
                    <button className="btn-sec" style={{fontSize:'.74rem',padding:'7px 12px'}} onClick={()=>showToast('Appeal reviewed!')}>Appeal</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── AI KEYWORDS TAB ── */}
          {tab==='keywords'&&(
            <div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
                {/* Blocked keywords */}
                <div style={{background:'rgba(5,8,20,.98)',borderRadius:18,border:'1px solid rgba(255,107,157,.15)',padding:20,animation:'cardIn .4s ease'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:'.9rem',marginBottom:2}}>🚫 Blocked Keywords</div>
                      <div style={{fontSize:'.74rem',color:C.t2}}>Auto-flagged content containing these terms</div>
                    </div>
                    <button className="btn-icon" onClick={()=>showToast('Keyword added!')} style={{width:30,height:30,fontSize:'.9rem',borderColor:'rgba(255,107,157,.2)',color:C.ro}}>+</button>
                  </div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                    {['scam','click here','free money','buy now','hack','piracy','torrent','crack software','adult content','violence','hate','fake certificate'].map(k=>(
                      <div key={k} className="keyword-tag" style={{cursor:'pointer',transition:'all .2s'}}
                        onMouseEnter={e=>e.currentTarget.style.background='rgba(255,107,157,.2)'}
                        onMouseLeave={e=>e.currentTarget.style.background='rgba(255,107,157,.1)'}>
                        {k} <span style={{opacity:.6,marginLeft:2}} onClick={()=>showToast(`"${k}" removed from blocklist!`)}>✕</span>
                      </div>
                    ))}
                  </div>
                  <div style={{marginTop:14,display:'flex',gap:8}}>
                    <input placeholder="Add keyword…" style={{flex:1,padding:'8px 12px',borderRadius:10,border:'1px solid rgba(255,255,255,.08)',background:'rgba(255,255,255,.03)',color:'#e2f0ff',fontSize:'.82rem',outline:'none'}} onFocus={e=>e.target.style.borderColor='rgba(255,107,157,.35)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.08)'}/>
                    <button className="btn-reject" style={{fontSize:'.78rem',padding:'8px 14px'}} onClick={()=>showToast('Keyword added to blocklist!')}>Add</button>
                  </div>
                </div>

                {/* AI detection categories */}
                <div style={{background:'rgba(5,8,20,.98)',borderRadius:18,border:'1px solid rgba(232,24,124,.15)',padding:20,animation:'cardIn .4s ease .05s'}}>
                  <div style={{marginBottom:16}}>
                    <div style={{fontWeight:700,fontSize:'.9rem',marginBottom:2}}>🤖 AI Detection Rules</div>
                    <div style={{fontSize:'.74rem',color:C.t2}}>Configure AI scan sensitivity per category</div>
                  </div>
                  {[
                    {cat:'Hate Speech',threshold:70,col:C.ro},
                    {cat:'Spam / Ads',threshold:60,col:C.am},
                    {cat:'Copyright',threshold:75,col:C.cy},
                    {cat:'Misinformation',threshold:65,col:C.vt},
                    {cat:'Quality Issues',threshold:50,col:C.t2},
                  ].map(({cat,threshold,col})=>(
                    <div key={cat} style={{marginBottom:14}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:5,fontSize:'.8rem'}}>
                        <span style={{fontWeight:500}}>{cat}</span>
                        <span style={{fontFamily:'DM Mono,monospace',fontSize:'.68rem',color:col,fontWeight:700}}>Flag at {threshold}%+</span>
                      </div>
                      <div className="prog-bar"><div className="prog-fill" style={{'--pw':`${threshold}%`,width:`${threshold}%`,background:`linear-gradient(90deg,${col},${col}aa)`}}/></div>
                    </div>
                  ))}
                  <button className="btn-em" style={{width:'100%',justifyContent:'center',marginTop:8,fontSize:'.8rem'}} onClick={()=>showToast('AI rules updated!')}>💾 Save Rules</button>
                </div>

                {/* Whitelist */}
                <div style={{background:'rgba(5,8,20,.98)',borderRadius:18,border:'1px solid rgba(124,47,255,.14)',padding:20,animation:'cardIn .4s ease .1s'}}>
                  <div style={{marginBottom:14}}>
                    <div style={{fontWeight:700,fontSize:'.9rem',marginBottom:2}}>✅ Whitelisted Instructors</div>
                    <div style={{fontSize:'.74rem',color:C.t2}}>These instructors bypass AI screening</div>
                  </div>
                  {['Vikram Iyer','Dr. Priya Nair','Sneha Kulkarni','Arjun Mehta'].map(n=>(
                    <div key={n} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.04)'}}>
                      <div style={{width:28,height:28,borderRadius:8,background:GR.em,display:'grid',placeItems:'center',fontFamily:'Clash Display,sans-serif',fontSize:'.6rem',fontWeight:900,color:'#050814'}}>{n.split(' ').map(x=>x[0]).join('')}</div>
                      <div style={{flex:1,fontSize:'.82rem',fontWeight:500}}>{n}</div>
                      <button style={{background:'none',border:'none',color:C.t3,fontSize:'.78rem',cursor:'pointer',fontFamily:'DM Mono,monospace',transition:'color .2s'}} onMouseEnter={e=>e.target.style.color=C.ro} onMouseLeave={e=>e.target.style.color=C.t3} onClick={()=>showToast(n+' removed from whitelist!')}>Remove</button>
                    </div>
                  ))}
                  <button className="btn-em" style={{width:'100%',justifyContent:'center',marginTop:12,fontSize:'.8rem',background:'rgba(124,47,255,.12)',color:C.em,border:'1px solid rgba(124,47,255,.25)',boxShadow:'none'}} onClick={()=>showToast('Instructor added to whitelist!')}>+ Add Instructor</button>
                </div>

                {/* Auto-actions */}
                <div style={{background:'rgba(5,8,20,.98)',borderRadius:18,border:'1px solid rgba(240,32,121,.14)',padding:20,animation:'cardIn .4s ease .15s'}}>
                  <div style={{marginBottom:14}}>
                    <div style={{fontWeight:700,fontSize:'.9rem',marginBottom:2}}>⚡ Auto-Actions</div>
                    <div style={{fontSize:'.74rem',color:C.t2}}>Automated responses when thresholds are exceeded</div>
                  </div>
                  {[
                    {l:'Auto-remove content at 95%+ AI score',v:true},
                    {l:'Auto-suspend user after 5 violations',v:true},
                    {l:'Auto-notify instructor on flag',v:true},
                    {l:'Auto-escalate critical flags',v:false},
                    {l:'Send weekly moderation digest',v:true},
                  ].map(({l,v},i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid rgba(255,255,255,.04)'}}>
                      <div style={{fontSize:'.82rem',color:v?C.text:C.t2}}>{l}</div>
                      <div style={{width:34,height:20,borderRadius:99,background:v?'#7c2fff':'rgba(255,255,255,.08)',border:`1px solid ${v?'#7c2fff':'rgba(255,255,255,.1)'}`,position:'relative',cursor:'pointer',transition:'all .25s',flexShrink:0}} onClick={()=>showToast('Auto-action updated!')}>
                        <div style={{position:'absolute',width:14,height:14,borderRadius:'50%',background:'#fff',top:2,left:v?16:2,transition:'left .25s',boxShadow:'0 1px 3px rgba(0,0,0,.4)'}}/>
                      </div>
                    </div>
                  ))}
                  <button className="btn-em" style={{width:'100%',justifyContent:'center',marginTop:12,fontSize:'.8rem'}} onClick={()=>showToast('Auto-actions saved!')}>💾 Save Configuration</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── DETAIL DRAWER ── */}
      {drawer&&<DetailDrawer flag={drawer} onClose={()=>setDrawer(null)} onAction={(res,msg)=>handleAction(drawer.id,res,msg)}/>}

      {/* ── TOAST ── */}
      {toast&&(
        <div className="toast" style={{borderColor:toast.type==='success'?'rgba(124,47,255,.22)':'rgba(255,107,157,.22)'}}>
          <div style={{width:26,height:26,borderRadius:8,background:toast.type==='success'?'rgba(124,47,255,.15)':'rgba(255,107,157,.14)',border:`1px solid ${toast.type==='success'?'rgba(124,47,255,.3)':'rgba(255,107,157,.28)'}`,display:'grid',placeItems:'center',fontSize:'.82rem',flexShrink:0}}>
            {toast.type==='success'?'✓':'⚠'}
          </div>
          <div>
            <div style={{fontWeight:600,fontSize:'.84rem',marginBottom:1}}>{toast.type==='success'?'Action Taken':'Warning'}</div>
            <div style={{fontSize:'.76rem',color:C.t2}}>{toast.msg}</div>
          </div>
        </div>
      )}
    </div>
  );
}
