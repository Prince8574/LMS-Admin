import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../constants";
import { getPwdStrength } from "../constants";
import { Field } from "./Field";
import { authService } from "../services/authService";

export function RegisterForm({ onSuccess, switchToLogin }) {
  const [step, setStep]           = useState(1);
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [phone, setPhone]         = useState("");
  const [pwd, setPwd]             = useState("");
  const [confirm, setConfirm]     = useState("");
  const [agreed, setAgreed]       = useState(false);
  const [otp, setOtp]             = useState(["","","","","",""]);
  const [loading, setLoading]     = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors]       = useState({});
  const otpRefs                   = useRef([]);
  const timerRef                  = useRef(null);
  const strength                  = getPwdStrength(pwd);
  const navigate                  = useNavigate();

  useEffect(() => {
    if (countdown <= 0) return;
    timerRef.current = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [countdown]);

  const validate1 = () => {
    const e = {};
    if (!name.trim())         e.name  = "Full name is required";
    if (!email.includes("@")) e.email = "Enter a valid email";
    return e;
  };
  const validate2 = () => {
    const e = {};
    if (pwd.length < 8)  e.pwd     = "At least 8 characters required";
    if (pwd !== confirm) e.confirm = "Passwords don't match";
    if (!agreed)         e.agreed  = "Please accept the terms";
    return e;
  };

  const nextStep = async () => {
    setErrors({});

    if (step === 1) {
      const e = validate1();
      if (Object.keys(e).length) { setErrors(e); return; }
      setStep(2);

    } else if (step === 2) {
      const e = validate2();
      if (Object.keys(e).length) { setErrors(e); return; }
      setLoading(true);
      try {
        // Register account
        const data = await authService.register(name, email, pwd);
        if (!data.success) { setErrors({ pwd: data.message || "Registration failed" }); return; }

        // Send OTP for email verification
        await authService.sendOtp(email);
        setStep(3);
        setCountdown(60);
      } catch {
        setErrors({ pwd: "Server error. Please try again." });
      } finally {
        setLoading(false);
      }

    } else if (step === 3) {
      const code = otp.join("");
      if (code.length < 6) { setErrors({ otp: "Enter the 6-digit code" }); return; }
      setLoading(true);
      try {
        const data = await authService.verifyOtp(email, code);
        if (data.success) {
          onSuccess("register");
          navigate("/");
        } else {
          setErrors({ otp: data.message || "Invalid or expired OTP" });
        }
      } catch {
        setErrors({ otp: "Server error. Please try again." });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setErrors({});
    try {
      await authService.sendOtp(email);
      setOtp(["","","","","",""]);
      otpRefs.current[0]?.focus();
      setCountdown(60);
    } catch {
      setErrors({ otp: "Failed to resend. Try again." });
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

  const STEPS = ["Account Info","Security","Verify Email"];

  return (
    <div>
      <div className="step-bar" style={{animation:"fadeUp .3s ease both",opacity:0}}>
        {STEPS.map((_,i) => (<div key={i} className={"step-seg"+(i+1===step?" active":i+1<step?" done":"")}/>))}
      </div>
      <div className="card-eyebrow" style={{animation:"fadeUp .3s .05s ease both",opacity:0}}>
        <div className="eyebrow-dot"/> STEP {step} OF 3 — {STEPS[step-1].toUpperCase()}
      </div>
      <div className="card-title" style={{animation:"fadeUp .3s .1s ease both",opacity:0}}>
        {step===1 ? "Create your account" : step===2 ? "Secure your account" : "Verify your email"}
      </div>
      <div className="card-sub" style={{animation:"fadeUp .3s .14s ease both",opacity:0}}>
        {step===1 ? "Join 52,000+ learners on LearnVerse"
          : step===2 ? "Set a strong password to protect your account"
          : `We sent a 6-digit code to ${email}`}
      </div>

      {/* ── Step 1: Info ── */}
      {step===1 && (
        <div style={{animation:"slideR .35s ease both",opacity:0}}>
          <Field label="Full Name" icon="👤" placeholder="Your full name"
            value={name} onChange={setName} autoComplete="name"
            error={!!errors.name} hint={errors.name} success={name.length>2&&!errors.name}/>
          <Field label="Email Address" icon="✉" type="email" placeholder="you@example.com"
            value={email} onChange={setEmail} autoComplete="email"
            error={!!errors.email} hint={errors.email} success={email.includes("@")&&!errors.email}/>
          <Field label="Phone (Optional)" icon="📱" placeholder="+91 98765 43210"
            value={phone} onChange={setPhone}/>
          <div style={{display:"flex",gap:10,marginBottom:20}}>
            <button className="social-btn" style={{flex:1}}>
              <div className="social-icon" style={{background:"rgba(219,68,55,.15)",color:"#EA4335",fontWeight:700,fontSize:".85rem"}}>G</div>Google
            </button>
            <button className="social-btn" style={{flex:1}}>
              <div className="social-icon" style={{background:"rgba(10,102,194,.15)",color:"#0A66C2",fontWeight:700,fontSize:".75rem"}}>in</div>LinkedIn
            </button>
          </div>
          <button className="btn-cta" onClick={nextStep}>Continue →</button>
        </div>
      )}

      {/* ── Step 2: Password ── */}
      {step===2 && (
        <div style={{animation:"slideR .35s ease both",opacity:0}}>
          <Field label="Password" icon="🔒" type="password" placeholder="Min. 8 characters"
            value={pwd} onChange={setPwd} autoComplete="new-password"
            error={!!errors.pwd} hint={errors.pwd}/>
          {pwd && (
            <div className="pwd-strength" style={{marginTop:-8,marginBottom:16}}>
              <div className="pwd-bars">
                {[1,2,3,4,5].map(n => (
                  <div key={n} className="pwd-bar" style={{background:n<=strength.score?strength.color:"rgba(255,255,255,.08)"}}/>
                ))}
              </div>
              <div className="pwd-label" style={{color:strength.color}}>{strength.label} password</div>
            </div>
          )}
          <Field label="Confirm Password" icon="🔒" type="password" placeholder="Repeat your password"
            value={confirm} onChange={setConfirm} autoComplete="new-password"
            error={!!errors.confirm} hint={errors.confirm}
            success={!!confirm && confirm===pwd && !errors.confirm}/>
          <div style={{padding:"12px 14px",borderRadius:12,background:"rgba(124,47,255,.06)",border:"1px solid rgba(124,47,255,.14)",marginBottom:16,fontSize:".8rem"}}>
            {[
              {t:"At least 8 characters", ok:pwd.length>=8},
              {t:"Uppercase letter",       ok:/[A-Z]/.test(pwd)},
              {t:"Number",                 ok:/[0-9]/.test(pwd)},
              {t:"Special character",      ok:/[^A-Za-z0-9]/.test(pwd)},
            ].map(({t,ok}) => (
              <div key={t} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5,color:ok?C.em:C.t2}}>
                <span style={{fontSize:".75rem"}}>{ok?"✓":"○"}</span>{t}
              </div>
            ))}
          </div>
          <div className="agree-row">
            <div className={"checkbox"+(agreed?" checked":"")} onClick={() => setAgreed(a => !a)}/>
            <div className="agree-text">
              I agree to LearnVerse's <a>Terms of Service</a> and <a>Privacy Policy</a>. I'm 13 years or older.
              {errors.agreed && <div style={{color:C.pk,marginTop:4,fontSize:".74rem"}}>⚠ {errors.agreed}</div>}
            </div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button className="btn-outline" onClick={() => setStep(1)} style={{width:"auto",flexShrink:0,padding:"12px 20px"}}>← Back</button>
            <button className="btn-cta" onClick={nextStep} disabled={loading} style={{flex:1}}>
              {loading
                ? <><span style={{width:16,height:16,border:"2.5px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .65s linear infinite",display:"inline-block"}}/> Sending code…</>
                : "Create Account →"}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: OTP ── */}
      {step===3 && (
        <div style={{animation:"slideR .35s ease both",opacity:0}}>
          <div style={{textAlign:"center",marginBottom:24}}>
            <div style={{width:64,height:64,borderRadius:18,background:"rgba(124,47,255,.12)",border:"1px solid rgba(124,47,255,.25)",display:"grid",placeItems:"center",margin:"0 auto 16px",fontSize:"1.6rem"}}>📧</div>
            <div style={{fontSize:".84rem",color:C.t2,lineHeight:1.65}}>
              Check <span style={{color:C.text,fontWeight:600}}>{email}</span> for your verification code.<br/>
              It expires in <span style={{color:C.pk,fontWeight:700}}>10 minutes</span>.
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
          {errors.otp && <div style={{textAlign:"center",fontSize:".8rem",color:C.pk,marginBottom:12}}>⚠ {errors.otp}</div>}
          <button className="btn-cta" onClick={nextStep} disabled={loading} style={{marginBottom:14}}>
            {loading
              ? <><span style={{width:18,height:18,border:"2.5px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .65s linear infinite",display:"inline-block"}}/> Verifying…</>
              : "Verify & Complete Setup ✓"}
          </button>

          {/* Resend */}
          <div style={{textAlign:"center",fontSize:".8rem",color:C.t2}}>
            Didn't receive it?{" "}
            {countdown > 0 ? (
              <span>Resend in <strong style={{color:C.vi}}>{countdown}s</strong></span>
            ) : (
              <a style={{color:resending?C.t2:C.vi,cursor:resending?"default":"pointer",fontWeight:600}} onClick={handleResend}>
                {resending
                  ? <><span style={{width:10,height:10,border:"2px solid rgba(255,255,255,.3)",borderTopColor:C.vi,borderRadius:"50%",animation:"spin .65s linear infinite",display:"inline-block",marginRight:4}}/> Sending…</>
                  : "Resend OTP"}
              </a>
            )}
            <span style={{margin:"0 8px",color:C.t3}}>·</span>
            <a style={{color:C.vi,cursor:"pointer"}} onClick={() => { setStep(1); setOtp(["","","","","",""]); }}>Wrong email?</a>
          </div>
          <button className="btn-outline" onClick={() => setStep(2)} style={{marginTop:12}}>← Change Password</button>
        </div>
      )}

      <div className="card-footer">Already have an account? <a onClick={switchToLogin}>Sign in</a></div>
    </div>
  );
}
