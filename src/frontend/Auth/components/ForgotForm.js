import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../constants";
import { getPwdStrength } from "../constants";
import { Field } from "./Field";
import { authService } from "../services/authService";

export function ForgotForm({ onSuccess, switchToLogin }) {
  const [step, setStep]           = useState(1);
  const [email, setEmail]         = useState("");
  const [otp, setOtp]             = useState(["","","","","",""]);
  const [otpToken, setOtpToken]   = useState(""); // JWT from verify-otp
  const [pwd, setPwd]             = useState("");
  const [confirm, setConfirm]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [resending, setResending] = useState(false);
  const [err, setErr]             = useState("");
  const [countdown, setCountdown] = useState(0); // resend cooldown
  const otpRefs                   = useRef([]);
  const timerRef                  = useRef(null);
  const strength                  = getPwdStrength(pwd);
  const navigate                  = useNavigate();

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    timerRef.current = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [countdown]);

  const sendOtp = async (emailVal) => {
    const data = await authService.sendOtp(emailVal);
    if (!data.success) throw new Error(data.message || "Failed to send OTP");
  };

  const nextStep = async () => {
    setErr("");

    // Step 1 — send OTP
    if (step === 1) {
      if (!email.includes("@")) { setErr("Enter a valid email address"); return; }
      setLoading(true);
      try {
        await sendOtp(email);
        setStep(2);
        setCountdown(60); // 60s cooldown before resend
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }

    // Step 2 — verify OTP
    } else if (step === 2) {
      const code = otp.join("");
      if (code.length < 6) { setErr("Enter the complete 6-digit code"); return; }
      setLoading(true);
      try {
        const data = await authService.verifyOtp(email, code);
        if (data.success) {
          setOtpToken(data.token); // save JWT for reset step
          setStep(3);
        } else {
          setErr(data.message || "Invalid or expired OTP");
        }
      } catch {
        setErr("Server error. Please try again.");
      } finally {
        setLoading(false);
      }

    // Step 3 — reset password
    } else {
      if (pwd.length < 8)  { setErr("Password must be at least 8 characters"); return; }
      if (pwd !== confirm) { setErr("Passwords don't match"); return; }
      setLoading(true);
      try {
        const data = await authService.resetPassword(otpToken, pwd);
        if (data.success) {
          onSuccess("forgot");
          navigate("/auth");
        } else {
          setErr(data.message || "Reset failed");
        }
      } catch {
        setErr("Server error. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setErr("");
    setResending(true);
    try {
      await sendOtp(email);
      setOtp(["","","","","",""]);
      otpRefs.current[0]?.focus();
      setCountdown(60);
    } catch (e) {
      setErr(e.message);
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
      <div className="step-bar" style={{animation:"fadeUp .3s ease both",opacity:0}}>
        {["Email","Verify","New Password"].map((_,i) => (
          <div key={i} className={"step-seg"+(i+1===step?" active":i+1<step?" done":"")}/>
        ))}
      </div>
      <div className="card-eyebrow" style={{animation:"fadeUp .3s .05s ease both",opacity:0}}>
        <div className="eyebrow-dot"/> PASSWORD RESET
      </div>
      <div className="card-title" style={{animation:"fadeUp .3s .1s ease both",opacity:0}}>
        {step===1 ? "Forgot your password?" : step===2 ? "Enter verification code" : "Set new password"}
      </div>
      <div className="card-sub" style={{animation:"fadeUp .3s .14s ease both",opacity:0}}>
        {step===1 ? "No worries — we'll send you a reset code instantly"
          : step===2 ? `Check ${email} for the 6-digit code`
          : "Choose a strong new password"}
      </div>

      {/* ── Step 1: Email ── */}
      {step===1 && (
        <div style={{animation:"slideR .3s ease both",opacity:0}}>
          <Field label="Email Address" icon="✉" type="email" placeholder="your@email.com"
            value={email} onChange={setEmail} error={!!err} hint={err}/>
          <button className="btn-cta" onClick={nextStep} disabled={loading} style={{marginBottom:12}}>
            {loading
              ? <><span style={{width:18,height:18,border:"2.5px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .65s linear infinite",display:"inline-block"}}/> Sending…</>
              : "Send Reset Code →"}
          </button>
          <button className="btn-outline" onClick={switchToLogin} style={{width:"100%"}}>← Back to Sign In</button>
        </div>
      )}

      {/* ── Step 2: OTP ── */}
      {step===2 && (
        <div style={{animation:"slideR .3s ease both",opacity:0}}>
          <div style={{textAlign:"center",marginBottom:20,fontSize:".84rem",color:C.t2}}>
            Code sent to <strong style={{color:C.text}}>{email}</strong>
          </div>
          <div className="otp-row">
            {otp.map((v,i) => (
              <input key={i} ref={el=>otpRefs.current[i]=el}
                className="otp-input" type="text" inputMode="numeric"
                maxLength={1} value={v}
                onChange={e=>handleOtp(e.target.value,i)}
                onKeyDown={e=>{if(e.key==="Backspace"&&!v&&i>0)otpRefs.current[i-1]?.focus()}}
                style={{borderColor:v?`${C.p}66`:"rgba(255,255,255,.1)"}}/>
            ))}
          </div>
          {err && <div style={{textAlign:"center",fontSize:".8rem",color:C.pk,marginBottom:12}}>⚠ {err}</div>}
          <button className="btn-cta" onClick={nextStep} disabled={loading} style={{marginBottom:12}}>
            {loading
              ? <><span style={{width:16,height:16,border:"2.5px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .65s linear infinite",display:"inline-block"}}/> Verifying…</>
              : "Verify Code →"}
          </button>

          {/* Resend button with cooldown */}
          <div style={{textAlign:"center",fontSize:".8rem",color:C.t2}}>
            Didn't get it?{" "}
            {countdown > 0 ? (
              <span style={{color:C.t2}}>Resend in <strong style={{color:C.vi}}>{countdown}s</strong></span>
            ) : (
              <a
                style={{color: resending ? C.t2 : C.vi, cursor: resending ? "default" : "pointer", fontWeight:600}}
                onClick={handleResend}
              >
                {resending
                  ? <><span style={{width:10,height:10,border:"2px solid rgba(255,255,255,.3)",borderTopColor:C.vi,borderRadius:"50%",animation:"spin .65s linear infinite",display:"inline-block",marginRight:4}}/> Sending…</>
                  : "Resend OTP"}
              </a>
            )}
          </div>
          <div style={{textAlign:"center",marginTop:10,fontSize:".8rem"}}>
            <a style={{color:C.t2,cursor:"pointer"}} onClick={()=>{setStep(1);setOtp(["","","","","",""]);setErr("");}}>← Change email</a>
          </div>
        </div>
      )}

      {/* ── Step 3: New Password ── */}
      {step===3 && (
        <div style={{animation:"slideR .3s ease both",opacity:0}}>
          <Field label="New Password" icon="🔒" type="password" placeholder="Min. 8 characters"
            value={pwd} onChange={setPwd} error={!!err&&pwd!==confirm} hint={err&&pwd!==confirm?err:""}/>
          {pwd && (
            <div className="pwd-strength" style={{marginTop:-8,marginBottom:14}}>
              <div className="pwd-bars">
                {[1,2,3,4,5].map(n=>(
                  <div key={n} className="pwd-bar" style={{background:n<=strength.score?strength.color:"rgba(255,255,255,.08)"}}/>
                ))}
              </div>
              <div className="pwd-label" style={{color:strength.color}}>{strength.label}</div>
            </div>
          )}
          <Field label="Confirm Password" icon="🔒" type="password" placeholder="Repeat password"
            value={confirm} onChange={setConfirm}
            error={!!err&&pwd!==confirm}
            success={!!confirm&&confirm===pwd}
            hint={err&&pwd===confirm?"":err&&pwd!==confirm?err:""}/>
          {err && pwd===confirm && (
            <div style={{padding:"10px 14px",borderRadius:10,background:"rgba(240,32,121,.08)",border:"1px solid rgba(240,32,121,.2)",fontSize:".8rem",color:C.pk,marginBottom:14}}>⚠ {err}</div>
          )}
          <button className="btn-cta" onClick={nextStep} disabled={loading} style={{marginBottom:12}}>
            {loading
              ? <><span style={{width:16,height:16,border:"2.5px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .65s linear infinite",display:"inline-block"}}/> Updating…</>
              : "Reset Password ✓"}
          </button>
        </div>
      )}

      <div className="card-footer">Remembered it? <a onClick={switchToLogin}>Back to Sign In</a></div>
    </div>
  );
}
