import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../constants";
import { Field } from "./Field";
import { authService } from "../services/authService";

export function LoginForm({ onSuccess, switchToRegister, switchToForgot }) {
  const [step, setStep]           = useState(1); // 1=credentials, 2=otp
  const [email, setEmail]         = useState("");
  const [pwd, setPwd]             = useState("");
  const [otp, setOtp]             = useState(["","","","","",""]);
  const [loading, setLoading]     = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [err, setErr]             = useState("");
  const otpRefs                   = useRef([]);
  const timerRef                  = useRef(null);
  const navigate                  = useNavigate();

  useEffect(() => {
    if (countdown <= 0) return;
    timerRef.current = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [countdown]);

  // Step 1 — verify credentials then send OTP
  const submitCredentials = async () => {
    setErr("");
    if (!email || !pwd)          { setErr("Please fill in all fields."); return; }
    if (!email.includes("@"))    { setErr("Enter a valid email address."); return; }
    setLoading(true);
    try {
      const data = await authService.login(email, pwd);
      if (!data.success) { setErr(data.message || "Invalid credentials"); return; }

      // Credentials OK — send OTP
      await authService.sendOtp(email);
      setStep(2);
      setCountdown(60);
    } catch {
      setErr("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — verify OTP then go to dashboard
  const submitOtp = async () => {
    setErr("");
    const code = otp.join("");
    if (code.length < 6) { setErr("Enter the complete 6-digit code"); return; }
    setLoading(true);
    try {
      const data = await authService.verifyOtp(email, code);
      if (data.success) {
        onSuccess("login");
        navigate("/");
      } else {
        setErr(data.message || "Invalid or expired OTP");
      }
    } catch {
      setErr("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setErr("");
    setResending(true);
    try {
      await authService.sendOtp(email);
      setOtp(["","","","","",""]);
      otpRefs.current[0]?.focus();
      setCountdown(60);
    } catch {
      setErr("Failed to resend. Try again.");
    } finally {
      setResending(false);
    }
  };

  const handleOtp = (val, i) => {
    const v = val.replace(/\D/,"").slice(-1);
    const next = [...otp]; next[i] = v; setOtp(next);
    if (v && i < 5) otpRefs.current[i+1]?.focus();
    if (!v && i > 0) otpRefs.current[i-1]?.focus();
  };

  return (
    <div>
      <div className="card-eyebrow" style={{animation:"fadeUp .4s .1s ease both",opacity:0}}>
        <div className="eyebrow-dot"/> {step===1 ? "WELCOME BACK" : "VERIFY YOUR IDENTITY"}
      </div>
      <div className="card-title" style={{animation:"fadeUp .4s .15s ease both",opacity:0}}>
        {step===1 ? "Sign in to your account" : "Enter verification code"}
      </div>
      <div className="card-sub" style={{animation:"fadeUp .4s .2s ease both",opacity:0}}>
        {step===1 ? "Continue your learning journey" : `Code sent to ${email}`}
      </div>

      {/* ── Step 1: Credentials ── */}
      {step===1 && (
        <>
          <div className="social-row" style={{animation:"fadeUp .4s .25s ease both",opacity:0}}>
            <button className="social-btn" onClick={() => {}}>
              <div className="social-icon" style={{background:"rgba(219,68,55,.15)",color:"#EA4335",fontWeight:700,fontSize:".85rem"}}>G</div>Google
            </button>
            <button className="social-btn" onClick={() => {}}>
              <div className="social-icon" style={{background:"rgba(10,102,194,.15)",color:"#0A66C2",fontWeight:700,fontSize:".75rem"}}>in</div>LinkedIn
            </button>
          </div>
          <div className="or-divider" style={{animation:"fadeUp .4s .28s ease both",opacity:0}}>
            <div className="or-line"/><div className="or-text">OR CONTINUE WITH EMAIL</div><div className="or-line"/>
          </div>
          <div style={{animation:"fadeUp .4s .3s ease both",opacity:0}}>
            <Field label="Email Address" icon="✉" type="email" placeholder="you@example.com"
              value={email} onChange={setEmail} autoComplete="email"
              error={!!err && !email} hint={err && !email ? "Email is required" : ""}/>
            <Field label="Password" icon="🔒" type="password" placeholder="••••••••••"
              value={pwd} onChange={setPwd} autoComplete="current-password"
              rightLabel="Forgot password?" rightAction={switchToForgot}
              error={!!err && !pwd} hint={err && !pwd ? "Password is required" : ""}/>
          </div>
          {err && email && pwd && (
            <div style={{padding:"10px 14px",borderRadius:10,background:"rgba(240,32,121,.08)",border:"1px solid rgba(240,32,121,.2)",fontSize:".8rem",color:C.pk,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
              <span>⚠</span>{err}
            </div>
          )}
          <button className="btn-cta" onClick={submitCredentials} disabled={loading} style={{animation:"fadeUp .4s .35s ease both",opacity:0}}>
            {loading
              ? <><span style={{width:18,height:18,border:"2.5px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .65s linear infinite",display:"inline-block"}}/> Sending OTP…</>
              : "Continue →"}
          </button>
        </>
      )}

      {/* ── Step 2: OTP ── */}
      {step===2 && (
        <div style={{animation:"slideR .3s ease both",opacity:0}}>
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{width:56,height:56,borderRadius:16,background:"rgba(124,47,255,.12)",border:"1px solid rgba(124,47,255,.25)",display:"grid",placeItems:"center",margin:"0 auto 14px",fontSize:"1.4rem"}}>🔐</div>
            <div style={{fontSize:".84rem",color:C.t2}}>
              Check <strong style={{color:C.text}}>{email}</strong> for the code
            </div>
          </div>
          <div className="otp-row">
            {otp.map((v,i) => (
              <input key={i} ref={el => otpRefs.current[i]=el}
                className="otp-input" type="text" inputMode="numeric"
                maxLength={1} value={v}
                onChange={e => handleOtp(e.target.value, i)}
                onKeyDown={e => { if(e.key==="Backspace"&&!v&&i>0) otpRefs.current[i-1]?.focus(); }}
                style={{borderColor:v?`${C.p}66`:"rgba(255,255,255,.1)"}}/>
            ))}
          </div>
          {err && <div style={{textAlign:"center",fontSize:".8rem",color:C.pk,marginBottom:12}}>⚠ {err}</div>}
          <button className="btn-cta" onClick={submitOtp} disabled={loading} style={{marginBottom:12}}>
            {loading
              ? <><span style={{width:18,height:18,border:"2.5px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .65s linear infinite",display:"inline-block"}}/> Verifying…</>
              : "Sign In → Dashboard"}
          </button>

          {/* Resend */}
          <div style={{textAlign:"center",fontSize:".8rem",color:C.t2}}>
            Didn't get it?{" "}
            {countdown > 0 ? (
              <span>Resend in <strong style={{color:C.vi}}>{countdown}s</strong></span>
            ) : (
              <a style={{color:resending?C.t2:C.vi,cursor:resending?"default":"pointer",fontWeight:600}} onClick={handleResend}>
                {resending
                  ? <><span style={{width:10,height:10,border:"2px solid rgba(255,255,255,.3)",borderTopColor:C.vi,borderRadius:"50%",animation:"spin .65s linear infinite",display:"inline-block",marginRight:4}}/> Sending…</>
                  : "Resend OTP"}
              </a>
            )}
          </div>
          <div style={{textAlign:"center",marginTop:10,fontSize:".8rem"}}>
            <a style={{color:C.t2,cursor:"pointer"}} onClick={() => { setStep(1); setOtp(["","","","","",""]); setErr(""); }}>← Back to login</a>
          </div>
        </div>
      )}

      <div className="card-footer">Don't have an account? <a onClick={switchToRegister}>Create one free</a></div>
    </div>
  );
}
