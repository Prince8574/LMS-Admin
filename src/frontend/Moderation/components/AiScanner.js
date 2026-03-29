import { COLORS as C } from '../constants';

export function AiScanner({ aiRunning, aiProgress, onScan }) {
  return (
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

      {aiRunning && (
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

      {!aiRunning && (
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
  );
}
