import { useState } from "react";
import { Sidebar } from "../../components/Sidebar";

const C = {
  bg:"#050814", card:"rgba(8,12,28,.97)", bord:"rgba(255,255,255,.06)",
  em:"#7c2fff", emL:"rgba(124,47,255,.1)", emB:"rgba(124,47,255,.22)",
  t0:"#ede8ff", t1:"#c8ddf0", t2:"#4d7a9e", t3:"#193348",
  green:"#4ade80", red:"#ef4444", amber:"#f59e0b", teal:"#00d4aa",
};

const MOCK_POSTS = [
  { id:1, author:"Priya K.",  course:"Machine Learning",    time:"2m ago",  content:"Can anyone explain L1 vs L2 regularization?", likes:14, replies:6,  tag:"Question",  flagged:false },
  { id:2, author:"Rahul M.",  cou