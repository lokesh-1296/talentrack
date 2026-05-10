import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════
   DESIGN SYSTEM — Deep-space dark + India tricolor accents
   Aesthetic: Mission-control meets sports analytics
═══════════════════════════════════════════════════════════ */
const C = {
  bg:        "#060B14",
  panel:     "#0C1525",
  card:      "#111D32",
  cardHov:   "#162440",
  border:    "#1E3358",
  borderBri: "#2A4B80",
  saffron:   "#FF7D1A",
  saffronLo: "#FF7D1A18",
  saffronMd: "#FF7D1A44",
  green:     "#00C97B",
  greenLo:   "#00C97B18",
  greenMd:   "#00C97B44",
  sky:       "#38BFFF",
  skyLo:     "#38BFFF15",
  gold:      "#FFCC00",
  goldLo:    "#FFCC0018",
  red:       "#FF4D4D",
  redLo:     "#FF4D4D18",
  violet:    "#A78BFA",
  violetLo:  "#A78BFA18",
  text:      "#E8EDF5",
  textMid:   "#8A99B5",
  textDim:   "#465672",
  white:     "#FFFFFF",
};

const FONT_HEAD = "'Rajdhani', 'Bebas Neue', sans-serif";
const FONT_BODY = "'DM Sans', sans-serif";
const FONT_MONO = "'JetBrains Mono', 'Fira Code', monospace";

/* ═══════════════════════════════════════════════════════════
   DATA LAYER
═══════════════════════════════════════════════════════════ */
const TESTS = [
  { id:"height",    label:"Height",        icon:"↕", unit:"cm",   color:C.sky,     aiModule:"Body measurement AI",    min:130,max:220 },
  { id:"weight",    label:"Weight",        icon:"⊗", unit:"kg",   color:C.gold,    aiModule:"Mass estimation AI",     min:35, max:120 },
  { id:"vjump",     label:"Vertical Jump", icon:"↟", unit:"cm",   color:C.saffron, aiModule:"Pose + velocity AI",     min:10, max:100 },
  { id:"shuttle",   label:"Shuttle Run",   icon:"⇆", unit:"s",    color:C.green,   aiModule:"Motion tracking AI",     min:8,  max:22  },
  { id:"situps",    label:"Sit-ups / min", icon:"↻", unit:"reps", color:C.violet,  aiModule:"Rep counter AI",         min:5,  max:80  },
  { id:"run1600",   label:"1600m Run",     icon:"▶", unit:"min",  color:C.sky,     aiModule:"Gait + GPS AI",          min:4,  max:14  },
];

const BENCH = {
  male:   { height:172, weight:67, vjump:58, shuttle:11.2, situps:45, run1600:6.2 },
  female: { height:161, weight:56, vjump:44, shuttle:12.4, situps:37, run1600:7.1 },
};

const ATHLETES = [
  { id:1, name:"Vikram Patel",   age:17, state:"Gujarat",     gender:"male",   score:93, badge:"Elite",      xp:4820, coins:380, verified:true,  paraCategory:null,
    scores:{height:182,weight:75,vjump:79,shuttle:10.3,situps:62,run1600:5.4},
    flags:[], tags:["Sprinter","Jumper"] },
  { id:2, name:"Priya Sharma",   age:16, state:"Punjab",      gender:"female", score:84, badge:"Advanced",   xp:3210, coins:240, verified:true,  paraCategory:null,
    scores:{height:163,weight:54,vjump:53,shuttle:11.8,situps:49,run1600:6.7},
    flags:[], tags:["Endurance"] },
  { id:3, name:"Arjun Mehta",    age:18, state:"Rajasthan",   gender:"male",   score:78, badge:"Advanced",   xp:2640, coins:190, verified:true,  paraCategory:null,
    scores:{height:177,weight:70,vjump:65,shuttle:11.1,situps:55,run1600:5.9},
    flags:[], tags:["All-rounder"] },
  { id:4, name:"Anjali Singh",   age:15, state:"Uttar Pradesh",gender:"female",score:61, badge:"Developing", xp:980,  coins:80,  verified:false, paraCategory:null,
    scores:{height:159,weight:51,vjump:36,shuttle:13.1,situps:31,run1600:8.2},
    flags:["Shuttle run — frame discontinuity at 4.2s"], tags:[] },
  { id:5, name:"Ravi Kumar",     age:17, state:"Bihar",       gender:"male",   score:71, badge:"Advanced",   xp:1820, coins:145, verified:true,  paraCategory:null,
    scores:{height:174,weight:69,vjump:60,shuttle:11.6,situps:51,run1600:6.4},
    flags:[], tags:["Jumper"] },
  { id:6, name:"Deepa Nair",     age:16, state:"Kerala",      gender:"female", score:87, badge:"Elite",      xp:3780, coins:290, verified:true,  paraCategory:"T37 — Coordination",
    scores:{height:160,weight:52,vjump:49,shuttle:12.0,situps:44,run1600:6.9},
    flags:[], tags:["Para-athlete","Sprinter"] },
];

const BADGES_DEF = [
  { id:"first_jump",   label:"First Jump",    desc:"Vertical jump recorded",        icon:"↟", color:C.saffron, xpReq:0 },
  { id:"sprint_ace",   label:"Sprint Ace",    desc:"Shuttle run < 11s",             icon:"⚡", color:C.gold,    xpReq:500 },
  { id:"iron_core",    label:"Iron Core",     desc:"50+ sit-ups in 1 min",          icon:"⊕", color:C.violet,  xpReq:1000 },
  { id:"state_top10",  label:"State Top 10%", desc:"Ranked top 10 in your state",   icon:"★", color:C.gold,    xpReq:2000 },
  { id:"all_rounder",  label:"All Rounder",   desc:"All 6 tests completed",         icon:"◆", color:C.green,   xpReq:1500 },
  { id:"elite_flag",   label:"Elite Flag",    desc:"Talent score above 85",         icon:"🏅", color:C.saffron, xpReq:4000 },
];

/* ═══════════════════════════════════════════════════════════
   TINY PRIMITIVES
═══════════════════════════════════════════════════════════ */
const px = (n) => `${n}px`;

function TriBar() {
  return (
    <div style={{display:"flex",height:3,borderRadius:2,overflow:"hidden",width:"100%"}}>
      <div style={{flex:1,background:C.saffron}}/>
      <div style={{flex:1,background:"#F0F0F0"}}/>
      <div style={{flex:1,background:C.green}}/>
    </div>
  );
}

function Tag({label,color=C.sky}){
  return <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:`${color}22`,color,fontWeight:700,letterSpacing:.5}}>{label}</span>;
}

function Pill({children,active,color=C.saffron,onClick}){
  return (
    <button onClick={onClick} style={{
      padding:"6px 14px",borderRadius:20,border:`1px solid ${active?color:C.border}`,
      background:active?`${color}22`:"transparent",color:active?color:C.textMid,
      fontSize:11,fontWeight:700,cursor:"pointer",transition:"all .2s",letterSpacing:.5,
      fontFamily:FONT_BODY,
    }}>{children}</button>
  );
}

function ScoreRing({score,size=72,stroke=6,color}){
  const r=(size-stroke*2)/2;
  const circ=2*Math.PI*r;
  const off=circ*(1-score/100);
  const c=color||(score>=85?C.gold:score>=70?C.saffron:score>=55?C.sky:C.textMid);
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)",flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
        style={{transition:"stroke-dashoffset .9s cubic-bezier(.4,0,.2,1)"}}/>
      <text x={size/2} y={size/2+1} textAnchor="middle" dominantBaseline="central" fill={c}
        style={{fontSize:size*.22,fontWeight:800,fontFamily:FONT_MONO,
          transform:`rotate(90deg)`,transformOrigin:`${size/2}px ${size/2}px`}}>
        {score}
      </text>
    </svg>
  );
}

function StatBox({label,value,color=C.saffron,icon}){
  return (
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",textAlign:"center"}}>
      {icon&&<div style={{fontSize:16,marginBottom:4}}>{icon}</div>}
      <div style={{fontSize:18,fontWeight:800,color,fontFamily:FONT_MONO}}>{value}</div>
      <div style={{fontSize:10,color:C.textDim,marginTop:2,letterSpacing:.5}}>{label}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   AI VIDEO SIMULATOR
═══════════════════════════════════════════════════════════ */
function AIVideoSim({test,onComplete}){
  const [phase,setPhase]=useState("preflight"); // preflight|ready|rec|analyze|done
  const [progress,setProgress]=useState(0);
  const [reps,setReps]=useState(0);
  const [lightOk,setLightOk]=useState(null);
  const [qualityOk,setQualityOk]=useState(null);
  const [poseOk,setPoseOk]=useState(null);
  const iRef=useRef();

  const runPreflight=()=>{
    setPhase("preflight");
    setTimeout(()=>setLightOk(true),600);
    setTimeout(()=>setQualityOk(true),1100);
    setTimeout(()=>setPoseOk(true),1700);
    setTimeout(()=>setPhase("ready"),2100);
  };
  useEffect(()=>{runPreflight();},[]);

  const startRec=()=>{
    setPhase("rec"); setProgress(0); setReps(0);
    let p=0,r=0;
    iRef.current=setInterval(()=>{
      p+=1.6;
      if((test.id==="situps"||test.id==="vjump")&&Math.floor(p)%8===0&&p>4) r++;
      setProgress(Math.min(p,100)); setReps(r);
      if(p>=100){clearInterval(iRef.current);setPhase("analyze");
        setTimeout(()=>setPhase("done"),2400);}
    },60);
  };
  useEffect(()=>()=>clearInterval(iRef.current),[]);

  const isRep=test.id==="situps"||test.id==="vjump";
  const resultVal=test.id==="vjump"?67:test.id==="situps"?reps||51:test.id==="shuttle"?11.1:test.id==="run1600"?6.2:test.id==="height"?177:70;

  return (
    <div style={{padding:"0 4px"}}>
      {/* Preflight checks */}
      {(phase==="preflight"||phase==="ready")&&(
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:C.textDim,fontWeight:700,letterSpacing:1,marginBottom:8}}>AI PRE-FLIGHT CHECKS</div>
          {[
            {label:"Lighting quality",ok:lightOk,detail:"Lux: 480 · OK"},
            {label:"Video resolution",ok:qualityOk,detail:"720p · 30fps · OK"},
            {label:"Pose detected",ok:poseOk,detail:"17/17 keypoints · OK"},
          ].map(c=>(
            <div key={c.label} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 10px",background:c.ok===true?C.greenLo:c.ok===false?C.redLo:C.card,borderRadius:7,marginBottom:6,border:`1px solid ${c.ok===true?C.greenMd:C.border}`,transition:"all .3s"}}>
              <div style={{width:16,height:16,borderRadius:"50%",background:c.ok===true?C.green:c.ok===false?C.red:"transparent",border:`2px solid ${c.ok===null?C.border:c.ok?C.green:C.red}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff",flexShrink:0,transition:"all .3s"}}>
                {c.ok===true?"✓":c.ok===false?"✗":""}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,color:c.ok===true?C.green:C.text}}>{c.label}</div>
                {c.ok&&<div style={{fontSize:10,color:C.textDim}}>{c.detail}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {phase==="ready"&&(
        <button onClick={startRec} style={{width:"100%",padding:14,borderRadius:10,background:`linear-gradient(135deg,${C.saffron},${C.gold})`,color:"#000",border:"none",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:FONT_HEAD,letterSpacing:1}}>
          ▶ START RECORDING
        </button>
      )}

      {phase==="rec"&&(
        <div>
          <div style={{position:"relative",height:170,background:"#000",borderRadius:12,overflow:"hidden",marginBottom:12}}>
            {/* Fake viewfinder */}
            <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 80%,#1a2a0a,#000)"}}>
              {/* Skeleton dots */}
              {[{t:"20%",l:"45%"},{t:"35%",l:"38%"},{t:"35%",l:"52%"},{t:"50%",l:"45%"},{t:"65%",l:"40%"},{t:"65%",l:"50%"},{t:"80%",l:"43%"},{t:"80%",l:"47%"}].map((d,i)=>(
                <div key={i} style={{position:"absolute",top:d.t,left:d.l,width:5,height:5,borderRadius:"50%",background:C.green,opacity:.7,boxShadow:`0 0 6px ${C.green}`}}/>
              ))}
              {/* Skeleton lines */}
              <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.4}}>
                <line x1="47%" y1="22%" x2="40%" y2="37%" stroke={C.green} strokeWidth="1.5"/>
                <line x1="47%" y1="22%" x2="54%" y2="37%" stroke={C.green} strokeWidth="1.5"/>
                <line x1="47%" y1="22%" x2="47%" y2="52%" stroke={C.green} strokeWidth="1.5"/>
                <line x1="47%" y1="52%" x2="41%" y2="67%" stroke={C.green} strokeWidth="1.5"/>
                <line x1="47%" y1="52%" x2="53%" y2="67%" stroke={C.green} strokeWidth="1.5"/>
              </svg>
            </div>
            {/* REC indicator */}
            <div style={{position:"absolute",top:8,left:8,display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:C.red,animation:"pulse 1s infinite"}}/>
              <span style={{color:"#fff",fontSize:10,fontFamily:FONT_MONO}}>REC {Math.round(progress)}%</span>
            </div>
            {/* AI module label */}
            <div style={{position:"absolute",top:8,right:8,fontSize:9,color:C.green,background:"rgba(0,0,0,.6)",padding:"2px 7px",borderRadius:10,fontFamily:FONT_MONO}}>
              {test.aiModule}
            </div>
            {/* Rep counter */}
            {isRep&&(
              <div style={{position:"absolute",bottom:12,left:"50%",transform:"translateX(-50%)",textAlign:"center"}}>
                <div style={{fontSize:42,fontWeight:800,color:test.color,fontFamily:FONT_MONO,lineHeight:1}}>{reps}</div>
                <div style={{fontSize:10,color:C.textMid}}>REPS DETECTED</div>
              </div>
            )}
          </div>
          {/* Progress bar */}
          <div style={{height:6,background:C.border,borderRadius:3,overflow:"hidden",marginBottom:6}}>
            <div style={{height:"100%",width:`${progress}%`,background:`linear-gradient(90deg,${test.color},${C.gold})`,borderRadius:3,transition:"width .1s"}}/>
          </div>
          <div style={{fontSize:11,color:C.textDim,textAlign:"center"}}>MediaPipe pose stream · anomaly detection active</div>
        </div>
      )}

      {phase==="analyze"&&(
        <div style={{textAlign:"center",padding:"24px 0"}}>
          <div style={{fontSize:28,marginBottom:10,animation:"spin 1s linear infinite",display:"inline-block"}}>⚙</div>
          <div style={{color:C.saffron,fontWeight:700,fontSize:14}}>Running AI analysis pipeline...</div>
          <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:5}}>
            {["Pose estimation (MediaPipe)","Anomaly detection (OpenCV)","Metric extraction","Signing result hash"].map((s,i)=>(
              <div key={s} style={{fontSize:11,color:C.green,fontFamily:FONT_MONO,opacity:1,animation:`fadeIn .4s ease ${i*.3}s both`}}>✓ {s}</div>
            ))}
          </div>
        </div>
      )}

      {phase==="done"&&(
        <div>
          <div style={{textAlign:"center",marginBottom:16}}>
            <div style={{fontSize:42,fontWeight:900,color:test.color,fontFamily:FONT_MONO}}>{resultVal}<span style={{fontSize:16,fontWeight:400,color:C.textMid}}> {test.unit}</span></div>
            <div style={{color:C.green,fontSize:12,marginTop:4}}>✓ Verified · No anomalies detected</div>
          </div>
          <div style={{background:C.card,borderRadius:10,padding:12,border:`1px solid ${C.border}`,marginBottom:14}}>
            <div style={{fontSize:10,color:C.textDim,fontWeight:700,letterSpacing:1,marginBottom:8}}>AI ANALYSIS REPORT</div>
            {[
              ["Keypoints tracked","17 / 17"],["Motion integrity","PASS"],["Frame continuity","PASS"],
              ["Lighting score","94 / 100"],["Confidence","97%"],["Hash signed","SHA-256 ✓"],
            ].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4}}>
                <span style={{color:C.textMid}}>{k}</span>
                <span style={{color:C.green,fontFamily:FONT_MONO}}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>onComplete(resultVal)} style={{flex:1,padding:12,borderRadius:10,background:C.green,color:"#000",border:"none",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:FONT_HEAD,letterSpacing:1}}>
              SAVE +120 XP
            </button>
            <button onClick={runPreflight} style={{padding:"12px 16px",borderRadius:10,background:"transparent",color:C.textMid,border:`1px solid ${C.border}`,fontSize:12,cursor:"pointer"}}>
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   BENCHMARK BAR
═══════════════════════════════════════════════════════════ */
function BenchmarkBars({scores,gender}){
  const bench=BENCH[gender]||BENCH.male;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {TESTS.map(t=>{
        const v=scores[t.id],b=bench[t.id];
        if(v==null)return null;
        const isTime=t.id==="shuttle"||t.id==="run1600";
        const pct=Math.min(100,Math.max(0,isTime?((t.max-v)/(t.max-t.min))*100:((v-t.min)/(t.max-t.min))*100));
        const bpct=Math.min(100,Math.max(0,isTime?((t.max-b)/(t.max-t.min))*100:((b-t.min)/(t.max-t.min))*100));
        const better=isTime?v<b:v>b;
        return (
          <div key={t.id}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:11,color:C.textMid,fontFamily:FONT_MONO}}>{t.label}</span>
              <span style={{fontSize:11,color:better?C.green:C.saffron,fontFamily:FONT_MONO,fontWeight:700}}>{v} {t.unit}</span>
            </div>
            <div style={{position:"relative",height:8,background:C.border,borderRadius:4}}>
              <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${t.color}88,${t.color})`,borderRadius:4,transition:"width .7s"}}/>
              <div style={{position:"absolute",top:-3,left:`${bpct}%`,width:2,height:14,background:C.textDim,borderRadius:1,transform:"translateX(-50%)"}}/>
            </div>
          </div>
        );
      })}
      <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
        <div style={{width:14,height:2,background:C.textDim}}/>
        <span style={{fontSize:10,color:C.textDim}}>national benchmark</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ATHLETE APP VIEW
═══════════════════════════════════════════════════════════ */
function AthleteApp(){
  const [tab,setTab]=useState("home");
  const [selTest,setSelTest]=useState(null);
  const [done,setDone]=useState({height:177,weight:70,vjump:null,shuttle:null,situps:null,run1600:null});
  const [xp,setXp]=useState(2640);
  const [coins,setCoins]=useState(190);
  const [notif,setNotif]=useState(null);

  const athlete={name:"Arjun Mehta",age:18,state:"Rajasthan",gender:"male",score:78,badge:"Advanced"};
  const doneCount=Object.values(done).filter(v=>v!==null).length;
  const earnedBadges=BADGES_DEF.filter(b=>xp>=b.xpReq);

  const showNotif=(msg,color=C.green)=>{setNotif({msg,color});setTimeout(()=>setNotif(null),2800);};

  const handleComplete=(testId,val)=>{
    setDone(p=>({...p,[testId]:val}));
    setXp(p=>p+120); setCoins(p=>p+15);
    setSelTest(null);
    showNotif(`${TESTS.find(t=>t.id===testId).label} saved! +120 XP +15 coins`);
  };

  if(selTest){
    const t=TESTS.find(x=>x.id===selTest);
    return (
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"14px 18px",background:C.panel,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>setSelTest(null)} style={{background:"none",border:"none",color:C.textMid,cursor:"pointer",fontSize:22,lineHeight:1}}>‹</button>
          <div style={{fontSize:16,fontWeight:800,color:C.text,fontFamily:FONT_HEAD,letterSpacing:1}}>{t.label.toUpperCase()}</div>
          <Tag label={t.aiModule} color={t.color}/>
        </div>
        <div style={{flex:1,overflow:"auto",padding:18}}>
          <AIVideoSim test={t} onComplete={(val)=>handleComplete(t.id,val)}/>
        </div>
      </div>
    );
  }

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {/* Notification toast */}
      {notif&&(
        <div style={{position:"absolute",top:36,left:"50%",transform:"translateX(-50%)",zIndex:99,background:notif.color,color:"#000",padding:"8px 20px",borderRadius:20,fontSize:12,fontWeight:700,fontFamily:FONT_MONO,whiteSpace:"nowrap",animation:"slideDown .3s ease",boxShadow:`0 4px 20px ${notif.color}44`}}>
          {notif.msg}
        </div>
      )}

      {/* Header */}
      <div style={{background:C.panel,borderBottom:`1px solid ${C.border}`,padding:"14px 18px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div>
            <div style={{fontSize:10,color:C.saffron,fontWeight:700,letterSpacing:2,fontFamily:FONT_MONO}}>TALENTTRACK</div>
            <div style={{fontSize:18,fontWeight:800,color:C.text,fontFamily:FONT_HEAD,letterSpacing:.5}}>{athlete.name}</div>
            <div style={{fontSize:11,color:C.textMid}}>{athlete.state} · {athlete.age}y · {athlete.badge}</div>
          </div>
          <ScoreRing score={athlete.score} size={58} stroke={5}/>
        </div>
        {/* XP + Coins */}
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <div style={{flex:1,background:C.card,borderRadius:8,padding:"7px 10px",border:`1px solid ${C.border}`}}>
            <div style={{fontSize:10,color:C.textDim,marginBottom:2,letterSpacing:.5}}>XP POINTS</div>
            <div style={{fontSize:15,fontWeight:800,color:C.saffron,fontFamily:FONT_MONO}}>{xp.toLocaleString()}</div>
            <div style={{height:3,background:C.border,borderRadius:2,marginTop:4,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${Math.min((xp/5000)*100,100)}%`,background:C.saffron}}/>
            </div>
          </div>
          <div style={{flex:1,background:C.card,borderRadius:8,padding:"7px 10px",border:`1px solid ${C.border}`}}>
            <div style={{fontSize:10,color:C.textDim,marginBottom:2,letterSpacing:.5}}>COINS</div>
            <div style={{fontSize:15,fontWeight:800,color:C.gold,fontFamily:FONT_MONO}}>🪙 {coins}</div>
          </div>
          <div style={{flex:1,background:C.card,borderRadius:8,padding:"7px 10px",border:`1px solid ${C.border}`}}>
            <div style={{fontSize:10,color:C.textDim,marginBottom:2,letterSpacing:.5}}>TESTS DONE</div>
            <div style={{fontSize:15,fontWeight:800,color:C.sky,fontFamily:FONT_MONO}}>{doneCount}/6</div>
          </div>
        </div>
        <TriBar/>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",background:C.panel,borderBottom:`1px solid ${C.border}`}}>
        {["home","tests","badges","leaderboard"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            flex:1,padding:"10px 0",background:"none",border:"none",
            borderBottom:`2px solid ${tab===t?C.saffron:"transparent"}`,
            color:tab===t?C.white:C.textDim,cursor:"pointer",
            fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,fontFamily:FONT_MONO,
          }}>{t}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{flex:1,overflow:"auto",padding:16}}>

        {tab==="home"&&(
          <div>
            {/* Incomplete nudge */}
            {doneCount<6&&(
              <div style={{background:C.saffronLo,border:`1px solid ${C.saffronMd}`,borderRadius:10,padding:12,marginBottom:14}}>
                <div style={{fontSize:12,color:C.saffron,fontWeight:700}}>🏅 Complete all tests to unlock Elite assessment</div>
                <div style={{fontSize:11,color:C.textMid,marginTop:4}}>{6-doneCount} tests remaining · earn up to {(6-doneCount)*120} more XP</div>
              </div>
            )}
            {/* Quick stats */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
              <StatBox label="STATE RANK" value="#3" color={C.saffron}/>
              <StatBox label="NATIONAL" value="#142" color={C.sky}/>
              <StatBox label="BADGES" value={earnedBadges.length} color={C.gold}/>
            </div>
            {/* Next test suggestion */}
            {TESTS.filter(t=>done[t.id]===null)[0]&&(
              <div onClick={()=>setSelTest(TESTS.filter(t=>done[t.id]===null)[0].id)}
                style={{background:C.card,border:`1px solid ${C.saffronMd}`,borderRadius:12,padding:14,cursor:"pointer",marginBottom:14,display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:44,height:44,borderRadius:10,background:C.saffronLo,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:C.saffron}}>
                  {TESTS.filter(t=>done[t.id]===null)[0].icon}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:10,color:C.saffron,fontWeight:700,letterSpacing:1}}>NEXT SUGGESTED TEST</div>
                  <div style={{fontSize:14,fontWeight:700,color:C.text,fontFamily:FONT_HEAD}}>{TESTS.filter(t=>done[t.id]===null)[0].label}</div>
                  <div style={{fontSize:11,color:C.textMid}}>+120 XP · +15 coins</div>
                </div>
                <span style={{color:C.saffron,fontSize:20}}>›</span>
              </div>
            )}
            {/* Para-athlete note */}
            <div style={{background:C.violetLo,border:`1px solid ${C.violet}44`,borderRadius:10,padding:12}}>
              <div style={{fontSize:12,color:C.violet,fontWeight:700}}>♿ Para-athlete mode available</div>
              <div style={{fontSize:11,color:C.textMid,marginTop:3}}>Adapted scoring for T35–T54 classifications. Enable in profile settings.</div>
            </div>
          </div>
        )}

        {tab==="tests"&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div style={{fontSize:11,color:C.textDim,marginBottom:4}}>Tap to record · AI verifies in real-time</div>
            {TESTS.map(t=>{
              const isDone=done[t.id]!==null;
              return (
                <div key={t.id} onClick={()=>setSelTest(t.id)} style={{
                  background:isDone?`${t.color}0D`:C.card,
                  border:`1px solid ${isDone?t.color+"44":C.border}`,
                  borderRadius:12,padding:"13px 14px",cursor:"pointer",
                  display:"flex",alignItems:"center",gap:14,
                  transition:"all .2s",
                }}>
                  <div style={{width:44,height:44,borderRadius:10,background:`${t.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:t.color,border:isDone?`2px solid ${t.color}`:0}}>
                    {t.icon}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:C.text,fontFamily:FONT_HEAD,letterSpacing:.5}}>{t.label}</div>
                    <div style={{fontSize:10,color:isDone?t.color:C.textDim,marginTop:2,fontFamily:FONT_MONO}}>
                      {isDone?`${done[t.id]} ${t.unit} · verified ✓`:t.aiModule}
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:11,color:C.textDim}}>+120 XP</div>
                    <div style={{color:isDone?C.green:C.textDim,fontSize:18,marginTop:2}}>{isDone?"✓":"›"}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab==="badges"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              {BADGES_DEF.map(b=>{
                const earned=xp>=b.xpReq;
                return (
                  <div key={b.id} style={{background:earned?`${b.color}12`:C.card,border:`1px solid ${earned?b.color+"55":C.border}`,borderRadius:12,padding:"14px 12px",textAlign:"center",opacity:earned?1:.5,transition:"all .3s"}}>
                    <div style={{fontSize:26,marginBottom:6,filter:earned?"none":"grayscale(1) brightness(.4)"}}>{b.icon}</div>
                    <div style={{fontSize:12,fontWeight:800,color:earned?b.color:C.textDim,fontFamily:FONT_HEAD,letterSpacing:.5}}>{b.label}</div>
                    <div style={{fontSize:10,color:C.textDim,marginTop:4,lineHeight:1.3}}>{b.desc}</div>
                    {!earned&&<div style={{fontSize:9,color:C.textDim,marginTop:6,fontFamily:FONT_MONO}}>Need {b.xpReq} XP</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab==="leaderboard"&&(
          <div>
            <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
              {["Rajasthan","Age 15–18","Male"].map(f=><Tag key={f} label={f} color={C.sky}/>)}
            </div>
            {[
              {rank:1,name:"Vikram Patel",score:93,state:"GJ",badge:"Elite"},
              {rank:2,name:"Ravi Kumar",  score:87,state:"BR",badge:"Elite"},
              {rank:3,name:"Arjun Mehta", score:78,state:"RJ",badge:"Advanced",isMe:true},
              {rank:4,name:"Suresh Yadav",score:72,state:"UP",badge:"Advanced"},
              {rank:5,name:"Ajay Nair",   score:65,state:"KL",badge:"Developing"},
            ].map(p=>(
              <div key={p.rank} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",background:p.isMe?C.saffronLo:C.card,border:`1px solid ${p.isMe?C.saffronMd:C.border}`,borderRadius:10,marginBottom:8,transition:"all .2s"}}>
                <div style={{width:28,textAlign:"center",fontSize:14,fontWeight:800,color:p.rank===1?C.gold:p.rank===2?C.textMid:C.textDim,fontFamily:FONT_MONO}}>
                  {p.rank===1?"🥇":p.rank===2?"🥈":`#${p.rank}`}
                </div>
                <ScoreRing score={p.score} size={36} stroke={4}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:p.isMe?800:500,color:p.isMe?C.saffron:C.text}}>{p.name}{p.isMe?" (You)":""}</div>
                  <div style={{fontSize:10,color:C.textDim,fontFamily:FONT_MONO}}>{p.state} · {p.badge}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   COACH VIEW
═══════════════════════════════════════════════════════════ */
function CoachView(){
  const [selAthlete,setSelAthlete]=useState(null);

  if(selAthlete){
    const a=ATHLETES.find(x=>x.id===selAthlete);
    return (
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"14px 18px",background:C.panel,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>setSelAthlete(null)} style={{background:"none",border:"none",color:C.textMid,cursor:"pointer",fontSize:22}}>‹</button>
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontWeight:800,color:C.text,fontFamily:FONT_HEAD}}>{a.name}</div>
            <div style={{fontSize:11,color:C.textMid}}>{a.state} · {a.age}y · {a.gender}</div>
          </div>
          <ScoreRing score={a.score} size={48} stroke={4}/>
        </div>
        <div style={{flex:1,overflow:"auto",padding:18}}>
          {a.paraCategory&&(
            <div style={{background:C.violetLo,border:`1px solid ${C.violet}55`,borderRadius:10,padding:10,marginBottom:14}}>
              <div style={{fontSize:11,color:C.violet,fontWeight:700}}>♿ Para-athlete · {a.paraCategory}</div>
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
            <StatBox label="SCORE" value={a.score} color={a.score>=85?C.gold:C.saffron}/>
            <StatBox label="XP" value={a.xp.toLocaleString()} color={C.saffron}/>
            <StatBox label="COINS" value={a.coins} color={C.gold}/>
          </div>
          <div style={{background:C.card,borderRadius:12,padding:14,marginBottom:14,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:11,color:C.textDim,fontWeight:700,letterSpacing:1,marginBottom:12}}>PERFORMANCE vs NATIONAL BENCHMARK</div>
            <BenchmarkBars scores={a.scores} gender={a.gender}/>
          </div>
          {a.flags.length>0&&(
            <div style={{background:C.redLo,border:`1px solid ${C.red}55`,borderRadius:10,padding:12,marginBottom:14}}>
              <div style={{fontSize:11,color:C.red,fontWeight:700,marginBottom:6}}>⚠ AI FLAGS DETECTED</div>
              {a.flags.map(f=><div key={f} style={{fontSize:11,color:C.textMid}}>• {f}</div>)}
            </div>
          )}
          <div style={{display:"flex",gap:8}}>
            <button style={{flex:1,padding:11,borderRadius:9,background:C.green,color:"#000",border:"none",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:FONT_HEAD,letterSpacing:1}}>SHORTLIST</button>
            <button style={{flex:1,padding:11,borderRadius:9,background:"transparent",color:C.sky,border:`1px solid ${C.sky}55`,fontSize:12,fontWeight:700,cursor:"pointer"}}>MESSAGE</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{background:C.panel,borderBottom:`1px solid ${C.border}`,padding:"14px 18px"}}>
        <div style={{fontSize:10,color:C.green,fontWeight:700,letterSpacing:2,fontFamily:FONT_MONO}}>COACH PORTAL</div>
        <div style={{fontSize:20,fontWeight:800,color:C.text,fontFamily:FONT_HEAD,marginTop:2}}>My Athletes</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:12}}>
          <StatBox label="ASSIGNED" value="12" color={C.sky}/>
          <StatBox label="SHORTLISTED" value="4" color={C.saffron}/>
          <StatBox label="ELITE" value="2" color={C.gold}/>
        </div>
      </div>
      <div style={{flex:1,overflow:"auto",padding:16,display:"flex",flexDirection:"column",gap:10}}>
        {ATHLETES.map(a=>(
          <div key={a.id} onClick={()=>setSelAthlete(a.id)} style={{
            background:C.card,border:`1px solid ${a.flags.length?C.red+"44":C.border}`,
            borderRadius:12,padding:"13px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,
            transition:"all .2s",
          }}>
            <ScoreRing score={a.score} size={50} stroke={5}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:3}}>
                <span style={{fontWeight:700,fontSize:14,color:C.text}}>{a.name}</span>
                {a.verified&&<span style={{fontSize:9,color:C.green,fontFamily:FONT_MONO}}>✓ VERIFIED</span>}
                {a.flags.length>0&&<span style={{fontSize:9,color:C.red}}>⚠ FLAGGED</span>}
              </div>
              <div style={{fontSize:11,color:C.textDim}}>{a.age}y · {a.state} · {a.gender}</div>
              <div style={{display:"flex",gap:5,marginTop:5,flexWrap:"wrap"}}>
                {a.tags.map(t=><Tag key={t} label={t} color={a.paraCategory?C.violet:C.sky}/>)}
                {a.paraCategory&&<Tag label="Para" color={C.violet}/>}
              </div>
            </div>
            <span style={{color:C.textDim,fontSize:18}}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SAI ADMIN DASHBOARD
═══════════════════════════════════════════════════════════ */
function AdminDashboard(){
  const [selAthlete,setSelAthlete]=useState(null);
  const [search,setSearch]=useState("");
  const [filterBadge,setFilterBadge]=useState("all");
  const [tab,setTab]=useState("athletes"); // athletes|analytics|flags

  const flagged=ATHLETES.filter(a=>!a.verified||a.flags.length>0);
  const filtered=ATHLETES.filter(a=>{
    const ms=a.name.toLowerCase().includes(search.toLowerCase())||a.state.toLowerCase().includes(search.toLowerCase());
    const mb=filterBadge==="all"||a.badge.toLowerCase()===filterBadge;
    return ms&&mb;
  });

  if(selAthlete){
    const a=ATHLETES.find(x=>x.id===selAthlete);
    return (
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"14px 18px",background:C.panel,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>setSelAthlete(null)} style={{background:"none",border:"none",color:C.textMid,cursor:"pointer",fontSize:22}}>‹</button>
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontWeight:800,color:C.text,fontFamily:FONT_HEAD}}>{a.name}</div>
          </div>
          {a.verified
            ?<Tag label="VERIFIED" color={C.green}/>
            :<Tag label="PENDING" color={C.gold}/>}
        </div>
        <div style={{flex:1,overflow:"auto",padding:18}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
            <StatBox label="SCORE" value={a.score} color={a.score>=85?C.gold:C.saffron}/>
            <StatBox label="BADGE" value={a.badge} color={C.sky}/>
            <StatBox label="STATE" value={a.state} color={C.textMid}/>
          </div>
          <div style={{background:C.card,borderRadius:12,padding:14,marginBottom:14,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:11,color:C.textDim,fontWeight:700,letterSpacing:1,marginBottom:12}}>TEST PERFORMANCE</div>
            <BenchmarkBars scores={a.scores} gender={a.gender}/>
          </div>
          {a.flags.length>0&&(
            <div style={{background:C.redLo,border:`1px solid ${C.red}55`,borderRadius:10,padding:12,marginBottom:14}}>
              <div style={{fontSize:11,color:C.red,fontWeight:700,marginBottom:6}}>⚠ ANOMALY FLAGS</div>
              {a.flags.map(f=><div key={f} style={{fontSize:11,color:C.textMid,marginBottom:3}}>• {f}</div>)}
              <div style={{display:"flex",gap:8,marginTop:12}}>
                <button style={{flex:1,padding:10,borderRadius:8,background:C.green,color:"#000",border:"none",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:FONT_HEAD}}>APPROVE</button>
                <button style={{flex:1,padding:10,borderRadius:8,background:C.red,color:"#fff",border:"none",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:FONT_HEAD}}>REJECT</button>
              </div>
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {TESTS.map(t=>(
              <div key={t.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:10,textAlign:"center"}}>
                <div style={{fontSize:16,fontWeight:800,color:t.color,fontFamily:FONT_MONO}}>{a.scores[t.id]}</div>
                <div style={{fontSize:9,color:C.textDim}}>{t.unit}</div>
                <div style={{fontSize:10,color:C.textMid,marginTop:2}}>{t.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {/* Admin header */}
      <div style={{background:C.panel,borderBottom:`1px solid ${C.border}`,padding:"14px 18px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div>
            <div style={{fontSize:10,color:C.saffron,fontWeight:700,letterSpacing:2,fontFamily:FONT_MONO}}>SAI ADMIN PORTAL</div>
            <div style={{fontSize:20,fontWeight:800,color:C.text,fontFamily:FONT_HEAD}}>National Dashboard</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:10,color:C.textDim,fontFamily:FONT_MONO}}>SYNC</div>
            <div style={{fontSize:10,color:C.green,fontFamily:FONT_MONO}}>● LIVE</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
          <StatBox label="ATHLETES" value="12,847"/>
          <StatBox label="VERIFIED" value="10,943" color={C.green}/>
          <StatBox label="ELITE" value="934" color={C.gold}/>
          <StatBox label="FLAGGED" value={flagged.length} color={C.red}/>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{display:"flex",background:C.panel,borderBottom:`1px solid ${C.border}`}}>
        {["athletes","analytics","flags"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            flex:1,padding:"9px 0",background:"none",border:"none",
            borderBottom:`2px solid ${tab===t?C.saffron:"transparent"}`,
            color:tab===t?C.white:C.textDim,cursor:"pointer",
            fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,fontFamily:FONT_MONO,
          }}>{t}{t==="flags"&&flagged.length?` (${flagged.length})`:""}</button>
        ))}
      </div>

      <div style={{flex:1,overflow:"auto"}}>
        {tab==="athletes"&&(
          <div>
            {/* Search + filter */}
            <div style={{padding:"10px 14px",background:C.panel,borderBottom:`1px solid ${C.border}`,display:"flex",gap:8}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or state..."
                style={{flex:1,background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",color:C.text,fontSize:12,outline:"none",fontFamily:FONT_BODY}}/>
              <select value={filterBadge} onChange={e=>setFilterBadge(e.target.value)}
                style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",color:C.text,fontSize:12,fontFamily:FONT_BODY}}>
                <option value="all">All</option>
                <option value="elite">Elite</option>
                <option value="advanced">Advanced</option>
                <option value="developing">Developing</option>
              </select>
            </div>
            <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:9}}>
              {filtered.map(a=>(
                <div key={a.id} onClick={()=>setSelAthlete(a.id)} style={{
                  background:C.card,border:`1px solid ${a.flags.length?C.red+"44":!a.verified?C.gold+"33":C.border}`,
                  borderRadius:12,padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,transition:"all .2s",
                }}>
                  <ScoreRing score={a.score} size={48} stroke={4}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                      <span style={{fontWeight:700,fontSize:13,color:C.text}}>{a.name}</span>
                      {!a.verified&&<span style={{fontSize:9,color:C.gold}}>PENDING</span>}
                      {a.flags.length>0&&<span style={{fontSize:9,color:C.red}}>⚠</span>}
                      {a.paraCategory&&<span style={{fontSize:9,color:C.violet}}>♿</span>}
                    </div>
                    <div style={{fontSize:10,color:C.textDim}}>{a.age}y · {a.state} · {a.badge}</div>
                  </div>
                  <span style={{color:C.textDim,fontSize:18}}>›</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="analytics"&&(
          <div style={{padding:16}}>
            {/* State distribution */}
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:14,marginBottom:14}}>
              <div style={{fontSize:11,color:C.textDim,fontWeight:700,letterSpacing:1,marginBottom:12}}>TOP STATES BY PARTICIPATION</div>
              {[{s:"Maharashtra",n:2140,pct:87},{s:"Uttar Pradesh",n:1980,pct:81},{s:"Tamil Nadu",n:1650,pct:68},{s:"Rajasthan",n:1420,pct:58},{s:"Bihar",n:1200,pct:49}].map(r=>(
                <div key={r.s} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:12,color:C.text}}>{r.s}</span>
                    <span style={{fontSize:12,color:C.saffron,fontFamily:FONT_MONO}}>{r.n.toLocaleString()}</span>
                  </div>
                  <div style={{height:6,background:C.border,borderRadius:3}}>
                    <div style={{height:"100%",width:`${r.pct}%`,background:`linear-gradient(90deg,${C.saffron},${C.gold})`,borderRadius:3}}/>
                  </div>
                </div>
              ))}
            </div>
            {/* Badge distribution */}
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:14,marginBottom:14}}>
              <div style={{fontSize:11,color:C.textDim,fontWeight:700,letterSpacing:1,marginBottom:12}}>TALENT TIER DISTRIBUTION</div>
              {[{l:"Elite",pct:7.3,n:934,c:C.gold},{l:"Advanced",pct:31.2,n:4012,c:C.saffron},{l:"Developing",pct:61.5,n:7901,c:C.sky}].map(r=>(
                <div key={r.l} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <div style={{width:60,fontSize:11,color:r.c,fontWeight:700}}>{r.l}</div>
                  <div style={{flex:1,height:8,background:C.border,borderRadius:4}}>
                    <div style={{height:"100%",width:`${r.pct*10}%`,background:r.c,borderRadius:4}}/>
                  </div>
                  <div style={{fontSize:11,color:C.textMid,fontFamily:FONT_MONO,width:40,textAlign:"right"}}>{r.pct}%</div>
                </div>
              ))}
            </div>
            {/* Para-athlete stats */}
            <div style={{background:C.violetLo,border:`1px solid ${C.violet}44`,borderRadius:12,padding:14}}>
              <div style={{fontSize:11,color:C.violet,fontWeight:700,letterSpacing:1,marginBottom:8}}>♿ PARA-ATHLETE PROGRAM</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <StatBox label="ENROLLED" value="428" color={C.violet}/>
                <StatBox label="VERIFIED" value="381" color={C.green}/>
              </div>
            </div>
          </div>
        )}

        {tab==="flags"&&(
          <div style={{padding:16}}>
            <div style={{fontSize:11,color:C.textDim,marginBottom:12}}>AI-flagged submissions requiring human review</div>
            {flagged.length===0&&<div style={{textAlign:"center",color:C.green,padding:30}}>✓ No pending flags</div>}
            {flagged.map(a=>(
              <div key={a.id} style={{background:C.card,border:`1px solid ${C.red}44`,borderRadius:12,padding:14,marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <ScoreRing score={a.score} size={40} stroke={4}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:C.text}}>{a.name}</div>
                    <div style={{fontSize:10,color:C.textDim}}>{a.state} · {a.age}y</div>
                  </div>
                  {!a.verified&&<Tag label="UNVERIFIED" color={C.gold}/>}
                </div>
                {a.flags.map(f=>(
                  <div key={f} style={{fontSize:11,color:C.red,background:C.redLo,borderRadius:6,padding:"6px 10px",marginBottom:6}}>⚠ {f}</div>
                ))}
                <div style={{display:"flex",gap:8,marginTop:10}}>
                  <button onClick={()=>setSelAthlete(a.id)} style={{flex:1,padding:"9px",borderRadius:8,background:"transparent",color:C.sky,border:`1px solid ${C.sky}55`,fontSize:11,fontWeight:700,cursor:"pointer"}}>View Profile</button>
                  <button style={{flex:1,padding:"9px",borderRadius:8,background:C.green,color:"#000",border:"none",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:FONT_HEAD}}>APPROVE</button>
                  <button style={{flex:1,padding:"9px",borderRadius:8,background:C.red,color:"#fff",border:"none",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:FONT_HEAD}}>REJECT</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════ */
export default function TalentTrack(){
  const [role,setRole]=useState(null); // null | athlete | coach | admin

  return (
    <div style={{fontFamily:FONT_BODY,background:C.bg,minHeight:"100vh",display:"flex",justifyContent:"center",alignItems:"flex-start"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=DM+Sans:wght@400;500;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}
        select option{background:${C.card};color:${C.text};}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideDown{from{opacity:0;transform:translate(-50%,-10px)}to{opacity:1;transform:translate(-50%,0)}}
      `}</style>

      {/* Simulated phone shell */}
      <div style={{width:"100%",maxWidth:390,minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>

        {/* Status bar */}
        <div style={{height:30,background:C.panel,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 18px",flexShrink:0,borderBottom:`1px solid ${C.border}`}}>
          <span style={{fontSize:10,color:C.textDim,fontFamily:FONT_MONO}}>9:41</span>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontSize:9,color:C.textDim}}>●●●</span>
            <span style={{fontSize:9,color:C.green}}>● 4G</span>
            <span style={{fontSize:9,color:C.textDim,fontFamily:FONT_MONO}}>98%</span>
          </div>
        </div>

        {!role?(
          /* LANDING */
          <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"32px 24px",animation:"fadeIn .5s ease"}}>
            {/* Hero */}
            <div style={{textAlign:"center",marginBottom:36}}>
              <div style={{width:90,height:90,borderRadius:24,background:`linear-gradient(135deg,${C.saffron},${C.gold})`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",fontSize:40,boxShadow:`0 0 40px ${C.saffron}44`}}>
                ⚡
              </div>
              <div style={{fontSize:36,fontWeight:800,color:C.white,fontFamily:FONT_HEAD,letterSpacing:2,lineHeight:1}}>
                TALENT<span style={{color:C.saffron}}>TRACK</span>
              </div>
              <div style={{fontSize:10,color:C.textDim,letterSpacing:3,marginTop:6,fontFamily:FONT_MONO}}>SPORTS AUTHORITY OF INDIA</div>
              <div style={{marginTop:16}}>
                <TriBar/>
              </div>
              <p style={{fontSize:12,color:C.textMid,marginTop:14,lineHeight:1.6}}>
                AI-powered talent assessment · MediaPipe + OpenCV<br/>
                Works offline · Para-athlete inclusive · Cheat-proof
              </p>
            </div>

            {/* Role selection */}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[
                {r:"athlete",label:"I'm an Athlete",sub:"Record & submit your performance",icon:"🏃",color:C.saffron},
                {r:"coach", label:"I'm a Coach",   sub:"Monitor & shortlist athletes",     icon:"📋",color:C.green},
                {r:"admin",  label:"SAI Official",  sub:"National talent dashboard",        icon:"🏛",color:C.sky},
              ].map(({r,label,sub,icon,color})=>(
                <button key={r} onClick={()=>setRole(r)} style={{
                  width:"100%",padding:"14px 18px",borderRadius:12,
                  background:r==="athlete"?`linear-gradient(135deg,${C.saffron}22,${C.gold}11)`:`transparent`,
                  color:C.white,border:`1px solid ${r==="athlete"?C.saffronMd:C.border}`,
                  fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:14,
                  fontFamily:FONT_BODY,transition:"all .2s",textAlign:"left",
                }}>
                  <div style={{width:42,height:42,borderRadius:10,background:`${color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
                    {icon}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:800,color:C.white}}>{label}</div>
                    <div style={{fontSize:11,color:C.textDim,marginTop:2}}>{sub}</div>
                  </div>
                  <span style={{color:color,fontSize:18}}>›</span>
                </button>
              ))}
            </div>

            <p style={{fontSize:10,color:C.textDim,textAlign:"center",marginTop:24,fontFamily:FONT_MONO,letterSpacing:.5}}>
              SHA-256 SIGNED · DPDP COMPLIANT · OFFLINE-FIRST
            </p>
          </div>
        ):role==="athlete"?(
          <AthleteApp/>
        ):role==="coach"?(
          <CoachView/>
        ):(
          <AdminDashboard/>
        )}

        {/* Bottom bar */}
        {role&&(
          <div style={{height:50,background:C.panel,borderTop:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",flexShrink:0}}>
            <button onClick={()=>setRole(null)} style={{background:"none",border:"none",color:C.textDim,cursor:"pointer",fontSize:10,fontFamily:FONT_MONO,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
              <span style={{fontSize:16}}>⌂</span>HOME
            </button>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:C.green,boxShadow:`0 0 6px ${C.green}`}}/>
              <span style={{fontSize:9,color:C.green,fontFamily:FONT_MONO}}>OFFLINE READY</span>
            </div>
            <button style={{background:"none",border:"none",color:C.textDim,cursor:"pointer",fontSize:10,fontFamily:FONT_MONO,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
              <span style={{fontSize:16}}>⚙</span>CONFIG
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
