export const C = {
  bg:"#04070f", b1:"#07101c", b2:"#0b1628",
  gd:"#f5c842", gd2:"#ffe085", gdD:"#b8941e",
  tl:"#0dd9c4", tl2:"#6ef5e8", tlD:"#089984",
  cr:"#ff6154", cr2:"#ff9e96", crD:"#c03020",
  ind:"#6979f8", ind2:"#a5b0ff", indD:"#3a4bc0",
  vt:"#b47eff", vt2:"#d8b4ff",
  text:"#eef2ff", t2:"#5a6e9a", t3:"#1c2540",
  bord:"rgba(255,255,255,0.06)",
};

export const GR = {
  gd:  "linear-gradient(135deg,#f5c842,#ff9e96)",
  tl:  "linear-gradient(135deg,#0dd9c4,#6979f8)",
  cr:  "linear-gradient(135deg,#ff6154,#f5c842)",
  ind: "linear-gradient(135deg,#6979f8,#b47eff)",
  vt:  "linear-gradient(135deg,#b47eff,#6979f8)",
  main:"linear-gradient(135deg,#f5c842,#0dd9c4,#6979f8)",
};

export const ACOLS = [C.gd, C.tl, C.ind, C.vt, C.cr, C.gd2];

export const MONTHS = ['Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'];
export const REV_DATA = [320,380,290,430,510,620,580,740];
export const EXP_DATA = [95, 110,88, 125,142,178,165,210];

export const TRANSACTIONS = [
  {id:'TXN-28401',student:'Aryan Sharma',   course:'AWS Solutions Architect',amount:4999,fee:1000,net:3999,method:'UPI',       status:'success',   time:'2 min ago',  type:'enrollment'},
  {id:'TXN-28399',student:'Priya Mehta',    course:'Machine Learning A–Z',   amount:5999,fee:1200,net:4799,method:'Card',      status:'success',   time:'18 min ago', type:'enrollment'},
  {id:'TXN-28395',student:'Kiran Patel',    course:'React & Next.js Pro',    amount:4499,fee:900, net:3599,method:'UPI',       status:'pending',   time:'1h ago',     type:'enrollment'},
  {id:'TXN-28390',student:'Sneha Kulkarni', course:'UI/UX Design Mastery',   amount:3499,fee:700, net:2799,method:'NetBanking',status:'success',   time:'3h ago',     type:'enrollment'},
  {id:'TXN-28385',student:'Riya Singh',     course:'Kubernetes & Docker',    amount:5499,fee:1100,net:4399,method:'Card',      status:'success',   time:'5h ago',     type:'enrollment'},
  {id:'TXN-28380',student:'Rahul Verma',    course:'Python for Beginners',   amount:4999,fee:0,   net:4999,method:'Wallet',    status:'refunded',  time:'1 day ago',  type:'refund'},
  {id:'TXN-28370',student:'Divya Nair',     course:'Figma Advanced',         amount:3999,fee:800, net:3199,method:'UPI',       status:'success',   time:'1 day ago',  type:'enrollment'},
  {id:'TXN-28360',student:'Vikram Rao',     course:'AWS Solutions Architect',amount:4999,fee:1000,net:3999,method:'Card',      status:'failed',    time:'2 days ago', type:'enrollment'},
  {id:'TXN-28350',student:'Meera Iyer',     course:'Data Engineering',       amount:6999,fee:1400,net:5599,method:'UPI',       status:'success',   time:'2 days ago', type:'enrollment'},
  {id:'TXN-28340',student:'Amit Joshi',     course:'Digital Marketing',      amount:2999,fee:600, net:2399,method:'Card',      status:'processing',time:'3 days ago', type:'enrollment'},
];

export const PAYOUTS = [
  {name:'Vikram Iyer',     role:'AWS Instructor',    amount:'₹1,24,800',courses:3,students:4820,av:'VI',col:'linear-gradient(135deg,#f5c842,#0dd9c4)',status:'scheduled',date:'Mar 15'},
  {name:'Dr. Priya Nair',  role:'ML Instructor',     amount:'₹98,400',  courses:2,students:6240,av:'PN',col:'linear-gradient(135deg,#6979f8,#b47eff)',status:'paid',     date:'Mar 1'},
  {name:'Sneha Kulkarni',  role:'Design Instructor', amount:'₹62,200',  courses:2,students:4820,av:'SK',col:'linear-gradient(135deg,#0dd9c4,#6979f8)',status:'scheduled',date:'Mar 15'},
  {name:'Arjun Mehta',     role:'Dev Instructor',    amount:'₹87,600',  courses:1,students:5120,av:'AM',col:'linear-gradient(135deg,#f5c842,#ff6154)',status:'paid',     date:'Mar 1'},
  {name:'Suresh Patel',    role:'DevOps Instructor', amount:'₹44,800',  courses:1,students:2240,av:'SP',col:'linear-gradient(135deg,#b47eff,#f5c842)',status:'pending',  date:'Mar 20'},
  {name:'Ananya Roy',      role:'Design Instructor', amount:'₹32,000',  courses:1,students:1640,av:'AR',col:'linear-gradient(135deg,#0dd9c4,#f5c842)',status:'paid',     date:'Mar 1'},
];

export const COURSES_REV = [
  {title:'Machine Learning A–Z',      instructor:'Dr. Priya Nair', emoji:'🤖',rev:'₹3.7L',revNum:370000,students:6240,rating:4.8,growth:'+22%',share:37,col:C.ind, g:GR.ind},
  {title:'AWS Solutions Architect',   instructor:'Vikram Iyer',    emoji:'☁️',rev:'₹2.4L',revNum:240000,students:4820,rating:4.9,growth:'+15%',share:24,col:C.gd,  g:GR.gd},
  {title:'React & Next.js Pro',       instructor:'Arjun Mehta',    emoji:'⚛️',rev:'₹2.3L',revNum:230000,students:5120,rating:4.9,growth:'+18%',share:23,col:C.tl,  g:GR.tl},
  {title:'Kubernetes & Docker',       instructor:'Suresh Patel',   emoji:'🐳',rev:'₹1.2L',revNum:120000,students:2240,rating:4.8,growth:'+31%',share:12,col:C.vt,  g:GR.vt},
  {title:'UI/UX Design Mastery',      instructor:'Sneha Kulkarni', emoji:'🎨',rev:'₹1.1L',revNum:110000,students:3180,rating:4.7,growth:'+8%', share:11,col:C.gd2, g:GR.cr},
  {title:'Figma Advanced Prototyping',instructor:'Ananya Roy',     emoji:'✏️',rev:'₹65K', revNum:65000, students:1640,rating:4.7,growth:'+12%',share:6, col:C.cr,  g:GR.cr},
];

export const PAYMENT_METHODS = [
  {method:'UPI',        pct:48,col:C.gd},
  {method:'Credit Card',pct:28,col:C.tl},
  {method:'Debit Card', pct:14,col:C.ind},
  {method:'Net Banking',pct:7, col:C.vt},
  {method:'Wallet',     pct:3, col:C.cr},
];

export const STATUS_MAP = {
  success:    {cls:'badge-success',   dot:C.tl},
  pending:    {cls:'badge-pending',   dot:C.gd},
  failed:     {cls:'badge-failed',    dot:C.cr},
  refunded:   {cls:'badge-refunded',  dot:C.ind},
  processing: {cls:'badge-processing',dot:C.vt},
};
