import React from 'react';
import { useNavigate } from 'react-router-dom';
import { C, GR } from '../constants';

export default function Navbar({ scrolled, activeNav, setActiveNav }) {
  const navigate = useNavigate();
  return (
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
            <div className="logo-text">
              Learn<span style={{background:GR.v,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Verse</span>
            </div>
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
                {ico:'📊',label:'Analytics',   sub:'Real-time platform data',col:C.v},
                {ico:'👥',label:'User Mgmt',   sub:'52K+ learners',         col:C.c},
                {ico:'💰',label:'Revenue',     sub:'Billing & payouts',      col:C.am},
                {ico:'📚',label:'Courses',     sub:'1,284 active courses',   col:C.g},
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
          <div className="nav-search-btn">
            <span style={{fontSize:'.8rem',opacity:.5}}>⌕</span>
            <span>Search</span>
            <div className="search-kbd">
              <span>⌘</span>
              <span>K</span>
            </div>
          </div>

          <div className="nav-divider"/>

          <div className="nav-status">
            <div className="status-dot"/>
            <span>Operational</span>
          </div>

          <div className="nav-icon-btn" title="Notifications">
            🔔
            <div className="icon-badge" style={{background:C.r}}/>
          </div>

          <div className="nav-icon-btn" title="Settings">⚙</div>

          <div className="nav-divider"/>

          <button className="btn-nav-ghost" onClick={() => navigate('/auth')}>Sign In</button>

          <button className="btn-nav-cta" onClick={() => navigate('/auth')}>
            Dashboard
            <div className="cta-arrow">→</div>
          </button>

          <div className="nav-avatar-wrap" title="Super Admin">
            <div className="nav-avatar">SA</div>
            <div className="avatar-status"/>
          </div>
        </div>
      </div>
    </nav>
  );
}
