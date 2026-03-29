// Color Palette - "Void Neon"
export const C = {
  bg:"#020407", 
  b1:"#06090f", 
  b2:"#0a0f1a",
  v:"#7c3aff",  
  v2:"#9d6bff", 
  vD:"#4a1fa8",
  c:"#00e5ff",  
  c2:"#66f4ff", 
  cD:"#009dba",
  g:"#00ff88",  
  gD:"#00b360",
  r:"#ff3366",  
  rD:"#b32247",
  am:"#ffaa00", 
  amD:"#b37800",
  text:"#dce8ff", 
  t2:"#5a6f8a", 
  t3:"#1e2d40",
  bord:"rgba(255,255,255,0.06)",
  bordV:"rgba(124,58,255,0.3)",
};

export const GR = {
  v: "linear-gradient(135deg,#7c3aff,#00e5ff)",
  vr:"linear-gradient(135deg,#9d6bff,#ff3366)",
  cg:"linear-gradient(135deg,#00e5ff,#00ff88)",
  am:"linear-gradient(135deg,#ffaa00,#ff3366)",
  dark:"linear-gradient(180deg,#030508,#06090f)",
};

// Features Data
export const FEATURES = [
  {
    icon:"⬡",
    title:"Real-Time Analytics",
    desc:"Monitor 50K+ learners live. Revenue dashboards, funnel analysis, cohort retention — all in one command centre.",
    col:C.v,
    g:GR.v,
    hc:"rgba(124,58,255,.08)",
    stats:["52K+ Users","99.98% Uptime"]
  },
  {
    icon:"◎",
    title:"Course Command",
    desc:"Review submissions, set curricula, manage pricing, push announcements — and go live in under 60 seconds.",
    col:C.c,
    g:GR.cg,
    hc:"rgba(0,229,255,.08)",
    stats:["1,284 Courses","97 New/Mo"]
  },
  {
    icon:"◈",
    title:"Revenue Engine",
    desc:"Track ₹8.4L+ monthly revenue, process instructor payouts, manage refunds and run promo campaigns.",
    col:C.am,
    g:GR.am,
    hc:"rgba(255,170,0,.08)",
    stats:["₹8.4L MoM","+18.7% Growth"]
  },
  {
    icon:"▦",
    title:"User Management",
    desc:"Batch-manage 52K+ accounts. Role assignments, suspensions, KYC verifications and learner analytics.",
    col:C.g,
    g:GR.cg,
    hc:"rgba(0,255,136,.08)",
    stats:["52.8K Users","+12.4% MoM"]
  },
  {
    icon:"◐",
    title:"Content Moderation",
    desc:"AI-assisted flagging, manual review queues, DMCA management and community guidelines enforcement.",
    col:C.r,
    g:GR.vr,
    hc:"rgba(255,51,102,.08)",
    stats:["99.2% Clean","<4h Response"]
  },
  {
    icon:"◇",
    title:"Instructor Portal",
    desc:"Onboard instructors, verify credentials, manage revenue splits, payouts and performance benchmarks.",
    col:C.v2,
    g:GR.v,
    hc:"rgba(157,107,255,.08)",
    stats:["186 Instructors","4.82 Avg ★"]
  },
];

// Stats Data
export const STATS = [
  {
    v:52840,
    label:"Total Learners",
    sub:"↑ 12.4% MoM",
    col:C.v, 
    gc:"rgba(124,58,255,.12)",
    g:GR.v, 
    prefix:"",
    dec:0
  },
  {
    v:8426, 
    label:"Monthly Revenue",
    sub:"₹84.3L total", 
    col:C.am,
    gc:"rgba(255,170,0,.12)", 
    g:GR.am,
    prefix:"₹",
    dec:0,
    suffix:"K"
  },
  {
    v:1284, 
    label:"Active Courses",
    sub:"Across 8 cats",
    col:C.c, 
    gc:"rgba(0,229,255,.12)", 
    g:GR.cg,
    prefix:"",
    dec:0
  },
  {
    v:4.82, 
    label:"Avg Course Rating",
    sub:"128K reviews", 
    col:C.g, 
    gc:"rgba(0,255,136,.12)", 
    g:GR.cg,
    prefix:"",
    dec:2
  },
];

// Testimonials Data
export const TESTIMONIALS = [
  {
    name:"Vikram Iyer",
    role:"AWS Instructor",
    text:"The analytics dashboard is incredible. I can see exactly which lessons cause drop-offs and fix them in real-time.",
    av:"VI",
    col:C.am,
    tc:"linear-gradient(90deg,#ffaa00,#ff3366)"
  },
  {
    name:"Dr. Priya Nair",
    role:"ML Course Author",
    text:"Revenue tracking is transparent and payouts are always on time. LearnVerse admin tools are industry-leading.",
    av:"PN",
    col:C.v,
    tc:"linear-gradient(90deg,#7c3aff,#00e5ff)"
  },
  {
    name:"Sneha Kulkarni",
    role:"Design Lead",
    text:"From course approval to student analytics — everything I need is three clicks away. Best LMS admin panel.",
    av:"SK",
    col:C.r,
    tc:"linear-gradient(90deg,#ff3366,#9d6bff)"
  },
];
