import { useState, useRef, useEffect } from "react";

export function AvatarCropModal({ onClose, onSave }) {
  const [imgSrc, setImgSrc] = useState(null);
  const [drag, setDrag] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const startRef = useRef(null);
  const fileRef = useRef(null);
  const SIZE = 280;

  function onFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        const s = Math.max(SIZE / img.width, SIZE / img.height);
        setScale(s);
        setPos({ x: (SIZE - img.width * s) / 2, y: (SIZE - img.height * s) / 2 });
        setImgSrc(ev.target.result);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(f);
  }

  useEffect(() => {
    if (!imgSrc || !canvasRef.current || !imgRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.drawImage(imgRef.current, pos.x, pos.y, imgRef.current.width * scale, imgRef.current.height * scale);
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = "#7c2fff";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.stroke();
  }, [imgSrc, pos, scale]);

  function onMouseDown(e) {
    setDrag(true);
    startRef.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
  }
  function onMouseMove(e) {
    if (!drag || !startRef.current) return;
    setPos({ x: startRef.current.px + e.clientX - startRef.current.mx, y: startRef.current.py + e.clientY - startRef.current.my });
  }
  function onMouseUp() { setDrag(false); }
  function onWheel(e) {
    e.preventDefault();
    setScale(s => Math.min(5, Math.max(0.3, s - e.deltaY * 0.001)));
  }

  function handleSave() {
    if (!imgRef.current) return;
    setSaving(true);
    const out = document.createElement("canvas");
    out.width = SIZE; out.height = SIZE;
    const ctx = out.getContext("2d");
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(imgRef.current, pos.x, pos.y, imgRef.current.width * scale, imgRef.current.height * scale);
    out.toBlob((blob) => {
      onSave(blob);
      setSaving(false);
    }, "image/jpeg", 0.92);
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.8)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(8px)" }}>
      <div style={{ background:"#080d1a", border:"1px solid rgba(124,47,255,.25)", borderRadius:20, padding:28, width:360, boxShadow:"0 24px 64px rgba(0,0,0,.7)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <span style={{ fontSize:"1rem", fontWeight:700, color:"#ede8ff", fontFamily:"'Clash Display',sans-serif" }}>Update Profile Photo</span>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#6b5b8e", fontSize:"1.2rem", lineHeight:1 }}>✕</button>
        </div>

        {!imgSrc ? (
          <div onClick={() => fileRef.current.click()}
            style={{ width:SIZE, height:SIZE, borderRadius:"50%", border:"2px dashed rgba(124,47,255,.4)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", background:"rgba(124,47,255,.04)", margin:"0 auto 20px", transition:"all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(124,47,255,.8)"; e.currentTarget.style.background="rgba(124,47,255,.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(124,47,255,.4)"; e.currentTarget.style.background="rgba(124,47,255,.04)"; }}>
            <span style={{ fontSize:"2.5rem", marginBottom:10 }}>📷</span>
            <span style={{ fontSize:".82rem", color:"#6b5b8e" }}>Click to upload photo</span>
            <span style={{ fontSize:".72rem", color:"#3d2d5e", marginTop:4 }}>JPG, PNG, WEBP · Max 5MB</span>
          </div>
        ) : (
          <div style={{ position:"relative", width:SIZE, height:SIZE, margin:"0 auto 16px", cursor:drag?"grabbing":"grab", userSelect:"none" }}
            onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
            onWheel={onWheel}>
            <canvas ref={canvasRef} width={SIZE} height={SIZE} style={{ borderRadius:"50%", display:"block" }}/>
          </div>
        )}

        <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={onFile}/>

        {imgSrc && (
          <>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <span style={{ fontSize:".75rem", color:"#6b5b8e", flexShrink:0 }}>🔍 Zoom</span>
              <input type="range" min={0.3} max={5} step={0.01} value={scale}
                onChange={e => setScale(parseFloat(e.target.value))}
                style={{ flex:1, accentColor:"#7c2fff" }}/>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => fileRef.current.click()}
                style={{ flex:1, padding:"9px", borderRadius:10, border:"1px solid rgba(255,255,255,.08)", background:"rgba(255,255,255,.04)", color:"#6b5b8e", fontSize:".8rem", fontWeight:600, cursor:"pointer" }}>
                Change
              </button>
              <button onClick={handleSave} disabled={saving}
                style={{ flex:2, padding:"9px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#7c2fff,#8b5cf6)", color:"#fff", fontSize:".85rem", fontWeight:800, cursor:"pointer", opacity:saving?0.7:1 }}>
                {saving ? "Saving..." : "Save Photo"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
