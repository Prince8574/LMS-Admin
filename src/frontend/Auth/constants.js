export const C = {
  bg:"#050814",  b1:"#080d1e",  b2:"#0c1228",
  p:"#7c2fff",   p2:"#b47eff",  pD:"#4f15a8",
  pk:"#f02079",  pk2:"#ff6b9d", pkD:"#8a1249",
  vi:"#8b5cf6",  vi2:"#c4b5fd",
  mg:"#e8187c",  mg2:"#ff85c0",
  tl:"#22d3ee",  tl2:"#67e8f9",
  em:"#00d97e",
  text:"#ede8ff", t2:"#6b5b8e", t3:"#1a1540",
  bord:"rgba(255,255,255,0.06)",
};

export const GR = {
  main:"linear-gradient(135deg,#7c2fff,#8b5cf6)",
  hot: "linear-gradient(135deg,#f02079,#ff6b9d)",
  full:"linear-gradient(135deg,#7c2fff,#f02079)",
  cy:  "linear-gradient(135deg,#8b5cf6,#e8187c)",
  tl:  "linear-gradient(135deg,#22d3ee,#7c2fff)",
};

export function getPwdStrength(pwd) {
  if (!pwd) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pwd.length >= 8)           score++;
  if (pwd.length >= 12)          score++;
  if (/[A-Z]/.test(pwd))         score++;
  if (/[0-9]/.test(pwd))         score++;
  if (/[^A-Za-z0-9]/.test(pwd))  score++;
  if (score <= 1) return { score, label: "Weak",   color: "#f02079" };
  if (score <= 3) return { score, label: "Fair",   color: "#f59e0b" };
  if (score <= 4) return { score, label: "Good",   color: "#8b5cf6" };
  return               { score, label: "Strong", color: "#00d97e" };
}
