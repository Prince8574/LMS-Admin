export const COLORS = {
  bg: "#050814", b1: "#080d1e",
  em: "#7c2fff", em2: "#b47eff",
  am: "#f02079", am2: "#fa7db8",
  ro: "#ff6b9d", ro2: "#ffacc7",
  cy: "#8b5cf6", cy2: "#c4b5fd",
  vt: "#e8187c", vt2: "#ff85c0",
  text: "#ede8ff", t2: "#6b5b8e", t3: "#1a1540",
  bord: "rgba(255,255,255,0.07)",
};

export const GR = {
  em: "linear-gradient(135deg,#7c2fff,#8b5cf6)",
  am: "linear-gradient(135deg,#f02079,#ff6b9d)",
  cy: "linear-gradient(135deg,#8b5cf6,#e8187c)",
  ro: "linear-gradient(135deg,#ff6b9d,#f02079)",
  vt: "linear-gradient(135deg,#e8187c,#8b5cf6)",
  danger: "linear-gradient(135deg,#ff6b9d,#f02079)",
};

export const FLAGS = [
  { id:1, type:'Inappropriate Content', course:'React & Next.js Pro', lesson:'Lesson 14: State Management', reporter:'Kiran Patel', reporterEmail:'kiran.patel@gmail.com', severity:'critical', aiScore:94, time:'8 min ago', status:'pending', content:'This lesson contains several links to external sites with adult content disguised as "reference materials". The instructor appears to be monetising through affiliate spam. I have screenshots as evidence.', category:'spam', reports:7, urgent:true, aiTags:['External Links','Affiliate Spam','Policy Violation'], resolution:null },
  { id:2, type:'Copyright Violation', course:'UI/UX Design Mastery', lesson:'Lesson 8: Typography', reporter:'Meera Iyer', reporterEmail:'meera.iyer@gmail.com', severity:'high', aiScore:87, time:'42 min ago', status:'pending', content:'The instructor has used paid stock photos from Shutterstock without a valid license. I recognise specific images from their paid subscription that are being distributed freely in course downloads.', category:'copyright', reports:3, urgent:false, aiTags:['Unlicensed Assets','DMCA Risk','Copyright'], resolution:null },
  { id:3, type:'Misleading Information', course:'Machine Learning A-Z', lesson:'Lesson 22: Neural Networks', reporter:'Rahul Verma', reporterEmail:'rahul.v@yahoo.com', severity:'medium', aiScore:61, time:'2h ago', status:'under_review', content:'The instructor claims you can train a production-grade model on a laptop CPU in under 5 minutes. This is factually incorrect and misleading. Several students including myself have wasted hours following this advice.', category:'misinformation', reports:12, urgent:false, aiTags:['Factual Error','Misleading Claims'], resolution:null },
  { id:4, type:'Hate Speech', course:'Digital Marketing 2026', lesson:'Lesson 3: Targeting Audiences', reporter:'Divya Nair', reporterEmail:'divya.nair@gmail.com', severity:'critical', aiScore:98, time:'15 min ago', status:'pending', content:'The instructor made derogatory comments about a specific regional demographic while discussing marketing strategies. This violates community guidelines and made multiple students uncomfortable.', category:'hate_speech', reports:19, urgent:true, aiTags:['Hate Speech','Discrimination','Community Guidelines'], resolution:null },
  { id:5, type:'Plagiarism', course:'Python for Beginners', lesson:'Lesson 5: Functions', reporter:'Aryan Sharma', reporterEmail:'aryan.sharma@gmail.com', severity:'high', aiScore:79, time:'5h ago', status:'resolved', content:'The entire lesson is copy-pasted from a free YouTube tutorial by "TechWithTim". The code examples are identical, even including the same variable names and comments.', category:'plagiarism', reports:4, urgent:false, aiTags:['Plagiarism','Duplicate Content'], resolution:'approved' },
  { id:6, type:'Spam / Self Promotion', course:'AWS Solutions Architect', lesson:'Lesson 1: Introduction', reporter:'Suresh Kumar', reporterEmail:'suresh.k@gmail.com', severity:'low', aiScore:42, time:'1 day ago', status:'resolved', content:"The intro video spends 8 minutes promoting the instructor's paid consultancy services before any actual content begins.", category:'spam', reports:2, urgent:false, aiTags:['Self Promotion','Excessive Ads'], resolution:'dismissed' },
];

export const REPORTS = [
  { id:1, reporter:'Kiran Patel',  target:'React Course Lesson 14', type:'Spam',       status:'pending',  time:'8 min ago',  severity:'critical' },
  { id:2, reporter:'Meera Iyer',   target:'UI/UX Design Assets',    type:'Copyright',  status:'pending',  time:'42 min ago', severity:'high' },
  { id:3, reporter:'Rahul Verma',  target:'ML Course Lesson 22',    type:'Misleading', status:'review',   time:'2h ago',     severity:'medium' },
  { id:4, reporter:'Divya Nair',   target:'Marketing Course L3',    type:'Hate Speech',status:'pending',  time:'15 min ago', severity:'critical' },
  { id:5, reporter:'Aryan Sharma', target:'Python Course Lesson 5', type:'Plagiarism', status:'resolved', time:'5h ago',     severity:'high' },
  { id:6, reporter:'Suresh Kumar', target:'AWS Course Intro',       type:'Spam',       status:'dismissed',time:'1 day ago',  severity:'low' },
  { id:7, reporter:'Riya Singh',   target:'Figma Course L12',       type:'Quality',    status:'pending',  time:'3h ago',     severity:'medium' },
  { id:8, reporter:'Vikram Rao',   target:'K8s Course Lesson 9',    type:'Outdated',   status:'review',   time:'6h ago',     severity:'low' },
];

export const BANNED = [
  { name:'Rohit Mishra', email:'rohit.m@gmail.com',    reason:'Repeated spam & policy violations',        date:'Feb 14, 2026', duration:'Permanent', avatar:'RM', col:'linear-gradient(135deg,#ff6b9d,#f02079)' },
  { name:'Tarun Kapoor', email:'tarun.k@hotmail.com',  reason:'DMCA strike - copyright infringement',     date:'Mar 1, 2026',  duration:'90 days',   avatar:'TK', col:'linear-gradient(135deg,#f02079,#e8187c)' },
  { name:'Preet Kaur',   email:'preet.kaur@yahoo.com', reason:'Hate speech & harassment of other users',  date:'Mar 8, 2026',  duration:'Permanent', avatar:'PK', col:'linear-gradient(135deg,#ff6b9d,#e8187c)' },
  { name:'Nikhil Das',   email:'nikhil.das@gmail.com', reason:'Account fraud - multiple fake enrollments', date:'Mar 10, 2026', duration:'30 days',   avatar:'ND', col:'linear-gradient(135deg,#8b5cf6,#ff6b9d)' },
];

export const DMCA = [
  { id:'DMCA-2401', title:'Shutterstock images in UI/UX course',  claimant:'Shutterstock Inc.', course:'UI/UX Design Mastery',    instructor:'Sneha Kulkarni', status:'pending',      filed:'Feb 28, 2026', deadline:'Mar 28, 2026', severity:'high' },
  { id:'DMCA-2398', title:"O'Reilly Media book excerpts",         claimant:"O'Reilly Media",    course:'Python for Beginners',     instructor:'Riya Sharma',    status:'resolved',     filed:'Jan 15, 2026', deadline:'Feb 14, 2026', severity:'high' },
  { id:'DMCA-2391', title:'TechWithTim YouTube content',          claimant:'Tim Ruscica',        course:'React & Next.js Pro',      instructor:'Arjun Mehta',    status:'counter_filed',filed:'Jan 3, 2026',  deadline:'Mar 3, 2026',  severity:'medium' },
  { id:'DMCA-2385', title:'Udemy course content reproduction',    claimant:'Udemy Inc.',         course:'AWS Solutions Architect',  instructor:'Vikram Iyer',    status:'dismissed',    filed:'Dec 10, 2025', deadline:'Jan 9, 2026',  severity:'low' },
];

export const CATEGORIES = ['All','spam','copyright','hate_speech','misinformation','plagiarism','quality','harassment'];

export const SEV_MAP = {
  critical: { cls:'sev-critical', dot:'#ff6b9d', label:'CRITICAL' },
  high:     { cls:'sev-high',     dot:'#f02079', label:'HIGH' },
  medium:   { cls:'sev-medium',   dot:'#e8187c', label:'MEDIUM' },
  low:      { cls:'sev-low',      dot:'#4d7a9e', label:'LOW' },
};

export const STATUS_COLORS = {
  pending:      'rgba(240,32,121,.12)',
  resolved:     'rgba(124,47,255,.1)',
  under_review: 'rgba(232,24,124,.1)',
  dismissed:    'rgba(77,122,158,.08)',
  counter_filed:'rgba(139,92,246,.1)',
};

export const STATUS_BORDER = {
  pending:      'rgba(240,32,121,.25)',
  resolved:     'rgba(124,47,255,.22)',
  under_review: 'rgba(232,24,124,.22)',
  dismissed:    'rgba(77,122,158,.18)',
  counter_filed:'rgba(139,92,246,.22)',
};

export const STATUS_COLOR = {
  pending:      '#f02079',
  resolved:     '#7c2fff',
  under_review: '#e8187c',
  dismissed:    '#6b5b8e',
  counter_filed:'#8b5cf6',
};
