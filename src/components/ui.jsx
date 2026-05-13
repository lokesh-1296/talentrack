import React, { useState, useEffect, useRef } from "react";

export function Tag({label, color="var(--accent)"}){
  return <span style={{fontSize:12,padding:"4px 10px",borderRadius:20,background:`${color}22`,color,fontWeight:600,letterSpacing:.5}}>{label}</span>;
}

export function Pill({children, active, color="var(--accent)", onClick}){
  return (
    <button onClick={onClick} style={{
      padding:"6px 14px",borderRadius:20,border:`1px solid ${active?color:"var(--border-color)"}`,
      background:active?`${color}22`:"transparent",color:active?color:"var(--text-mid)",
      fontSize:12,fontWeight:600,cursor:"pointer",transition:"all .2s",letterSpacing:.5,
      fontFamily:"var(--font-body)",
    }}>{children}</button>
  );
}

export function ScoreRing({score, size=72, stroke=6, color}){
  const r = (size-stroke*2)/2;
  const circ = 2*Math.PI*r;
  const off = circ*(1-(score || 0)/100);
  const c = color || (score>=85?"var(--warning)":score>=70?"var(--accent)":score>=55?"var(--success)":"var(--text-mid)");
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)",flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--panel-bg)" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
        style={{transition:"stroke-dashoffset .9s cubic-bezier(.4,0,.2,1)"}}/>
      <text x={size/2} y={size/2+1} textAnchor="middle" dominantBaseline="central" fill={c}
        style={{fontSize:size*.22,fontWeight:700,fontFamily:"var(--font-mono)",
          transform:`rotate(90deg)`,transformOrigin:`${size/2}px ${size/2}px`}}>
        {score}
      </text>
    </svg>
  );
}

export function StatBox({label, value, color="var(--accent)", icon}){
  return (
    <div style={{background:"var(--bg-color)",border:`1px solid var(--border-color)`,borderRadius:8,padding:"16px",textAlign:"left"}}>
      {icon && <div style={{fontSize:20,marginBottom:8}}>{icon}</div>}
      <div style={{fontSize:12,color:"var(--text-dim)",fontWeight:600,marginBottom:4,letterSpacing:.5}}>{label}</div>
      <div style={{fontSize:24,fontWeight:700,color,fontFamily:"var(--font-mono)"}}>{value}</div>
    </div>
  );
}

