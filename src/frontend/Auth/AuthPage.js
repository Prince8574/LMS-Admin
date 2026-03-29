import { useState, useRef, useEffect } from "react";
import "./Auth.css";
import { C } from "./constants";
import { useBg } from "./hooks/useBg";
import { useGSAP } from "./hooks/useGSAP";
import { LeftPanel } from "./components/LeftPanel";
import { SuccessState } from "./components/SuccessState";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";
import { ForgotForm } from "./components/ForgotForm";

export default function AuthPage() {
  const bgRef = useRef(null);
  useBg(bgRef);
  const gsap = useGSAP();

  const [mode, setMode]               = useState("login"); // login | register | forgot | success
  const [successType, setSuccessType] = useState("");
  const [toast, setToast]             = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  // GSAP entrance
  useEffect(() => {
    if (!gsap) return;
    gsap.fromTo(".auth-card", { opacity:0, y:32, scale:.96 }, { opacity:1, y:0, scale:1, duration:.7, ease:"power3.out", delay:.2 });
    gsap.fromTo(".auth-left", { opacity:0, x:-30 },           { opacity:1, x:0, duration:.8, ease:"power3.out", delay:.1 });
  }, [gsap]);

  // Re-animate card on mode switch
  useEffect(() => {
    if (!gsap) return;
    gsap.fromTo(".auth-card", { opacity:0, y:16, scale:.97 }, { opacity:1, y:0, scale:1, duration:.45, ease:"power3.out" });
  }, [mode, gsap]);

  const handleSuccess = type => {
    setSuccessType(type);
    setMode("success");
    showToast(
      type === "login"    ? "Signed in successfully!" :
      type === "register" ? "Account created!"        : "Password reset!"
    );
  };

  return (
    <div style={{ minHeight:"100vh", position:"relative", background:C.bg }}>
      {/* Three.js canvas */}
      <canvas ref={bgRef} style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }}/>
      <div className="bg-grid"/>
      <div className="scan-line"/>

      {/* Ambient orbs */}
      <div className="orb" style={{ width:600, height:600, top:"-12%",  left:"-6%",  background:"radial-gradient(circle,rgba(124,47,255,.1),transparent 65%)",  position:"fixed", zIndex:0 }}/>
      <div className="orb" style={{ width:450, height:450, bottom:"5%", right:"-5%", background:"radial-gradient(circle,rgba(240,32,121,.07),transparent 65%)", position:"fixed", zIndex:0, animationDelay:"2s" }}/>
      <div className="orb" style={{ width:320, height:320, top:"40%",   left:"40%",  background:"radial-gradient(circle,rgba(139,92,246,.05),transparent 65%)", position:"fixed", zIndex:0, animationDelay:"1s" }}/>

      <div className="auth-root" style={{ position:"relative", zIndex:1 }}>
        {/* Left panel — hidden on success */}
        {mode !== "success" && <LeftPanel mode={mode}/>}

        {/* Right — card */}
        <div className="auth-right" style={mode === "success" ? { gridColumn:"1/-1" } : {}}>
          <div className="auth-card">
            {mode === "success" ? (
              <SuccessState type={successType} onContinue={() => { setMode("login"); showToast("Redirecting…"); }}/>
            ) : mode === "login" ? (
              <LoginForm
                onSuccess={handleSuccess}
                switchToRegister={() => setMode("register")}
                switchToForgot={() => setMode("forgot")}/>
            ) : mode === "register" ? (
              <RegisterForm
                onSuccess={handleSuccess}
                switchToLogin={() => setMode("login")}/>
            ) : (
              <ForgotForm
                onSuccess={handleSuccess}
                switchToLogin={() => setMode("login")}/>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={"toast" + (toast.type === "error" ? " error" : "")}>
          <div className="toast-icon" style={{
            background: toast.type === "success" ? "rgba(0,217,126,.14)" : "rgba(240,32,121,.12)",
            border: `1px solid ${toast.type === "success" ? "rgba(0,217,126,.28)" : "rgba(240,32,121,.25)"}`
          }}>
            {toast.type === "success" ? "✓" : "⚠"}
          </div>
          <div>
            <div style={{ fontWeight:600, fontSize:".84rem", marginBottom:1 }}>
              {toast.type === "success" ? "Success" : "Error"}
            </div>
            <div style={{ fontSize:".76rem", color:C.t2 }}>{toast.msg}</div>
          </div>
        </div>
      )}
    </div>
  );
}
