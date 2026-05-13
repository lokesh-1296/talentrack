import React, { useState, useEffect, useContext } from "react";
import { ScoreRing, StatBox, Tag } from "../components/ui";
import { AIVideoSim } from "../components/videoSim";
import { getTests, getAthleteMe, submitScore, getCoaches, getMessages, sendMessage } from "../api";
import { AuthContext } from "../context/AuthContext";

const BADGES_DEF = [
  { id:"first_jump",   label:"First Jump",    desc:"Vertical jump recorded",        icon:"↟", color:"var(--accent)", xpReq:0 },
  { id:"sprint_ace",   label:"Sprint Ace",    desc:"Shuttle run < 11s",             icon:"⚡", color:"var(--warning)",    xpReq:500 },
  { id:"iron_core",    label:"Iron Core",     desc:"50+ sit-ups in 1 min",          icon:"⊕", color:"var(--success)",  xpReq:1000 },
  { id:"all_rounder",  label:"All Rounder",   desc:"All 6 tests completed",         icon:"◆", color:"var(--accent)",   xpReq:1500 },
];

function ManualInput({ test, onComplete, onCancel }) {
  const [val, setVal] = useState("");
  return (
    <div style={{padding: 24, textAlign: "center"}}>
      <div style={{fontSize: 48, marginBottom: 16}}>{test.icon}</div>
      <h3 style={{marginBottom: 8}}>Enter {test.label}</h3>
      <div style={{display:"flex", justifyContent:"center", alignItems:"center", gap: 12, marginBottom: 24}}>
        <input 
          type="number" 
          value={val} 
          onChange={(e) => setVal(e.target.value)} 
          placeholder={`e.g. ${test.min_val}`}
          style={{padding: 12, borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-color)", color: "var(--text-main)", fontSize: 18, width: 120, textAlign: "center"}}
        />
        <span style={{color: "var(--text-mid)", fontSize: 18}}>{test.unit}</span>
      </div>
      <div style={{display:"flex", gap:12}}>
        <button onClick={() => onComplete(parseFloat(val))} style={{flex: 1, padding: 12, borderRadius: 8, background: "var(--accent)", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer"}}>Save</button>
        <button onClick={onCancel} style={{padding: 12, borderRadius: 8, background: "var(--card-bg)", color: "var(--text-main)", border: "1px solid var(--border-color)", cursor: "pointer"}}>Cancel</button>
      </div>
    </div>
  );
}

export default function AthleteDashboard() {
  const [tab, setTab] = useState("home");
  const [selTest, setSelTest] = useState(null);
  const [notif, setNotif] = useState(null);
  
  const [athlete, setAthlete] = useState(null);
  const [tests, setTests] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [selCoachId, setSelCoachId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgContent, setMsgContent] = useState("");
  const [loadError, setLoadError] = useState("");
  
  const { user } = useContext(AuthContext);

  useEffect(() => {
    Promise.all([getTests(), getAthleteMe(), getCoaches()]).then(([testsData, athleteData, coachesData]) => {
      setTests(testsData);
      setAthlete(athleteData);
      setCoaches(coachesData);
    }).catch(err => {
      console.error(err);
      setLoadError(err.message || "Failed to load dashboard data. Check backend connection.");
    });
  }, []);

  const loadMessages = (userId) => {
    if (!userId) return;
    getMessages(userId).then(setMessages);
  };

  const handleSendMessage = (userId) => {
    if (!msgContent.trim() || !userId) return;
    sendMessage(userId, msgContent).then(m => {
      setMessages([...messages, m]);
      setMsgContent("");
    });
  };

  if (loadError) {
    return <div style={{padding: 40, textAlign: 'center', color: 'var(--danger)'}}><b>Error:</b> {loadError}</div>;
  }

  if (!athlete || tests.length === 0) {
    return <div style={{padding: 40, textAlign: 'center'}}>Loading Dashboard...</div>;
  }

  const done = {};
  tests.forEach(t => {
    const s = athlete.scores.find(score => score.test_id === t.id);
    done[t.id] = s ? s.value : null;
  });

  const doneCount = Object.values(done).filter(v => v !== null).length;
  const earnedBadges = BADGES_DEF.filter(b => athlete.xp >= b.xpReq);

  const showNotif = (msg, color="var(--success)") => {
    setNotif({msg,color});
    setTimeout(() => setNotif(null), 3000);
  };

  const handleComplete = (testId, val) => {
    submitScore({ athlete_id: athlete.id, test_id: testId, value: val }).then(() => {
      getAthleteMe().then(setAthlete);
      setSelTest(null);
      showNotif(`${tests.find(t=>t.id===testId).label} saved successfully!`);
    }).catch(err => console.error(err));
  };

  if(selTest === "unified_upload") {
    return (
      <div className="card" style={{ maxWidth: 600, margin: '0 auto', overflow: 'hidden', padding: 0 }}>
        <div style={{padding:"20px",background:"var(--panel-bg)",borderBottom:`1px solid var(--border-color)`,display:"flex",alignItems:"center",gap:16}}>
          <button onClick={()=>setSelTest(null)} style={{background:"none",border:"none",color:"var(--text-mid)",cursor:"pointer",fontSize:28,lineHeight:1}}>‹</button>
          <div style={{fontSize:20,fontWeight:700,color:"var(--text-main)",fontFamily:"var(--font-head)"}}>Auto-Detect Workout</div>
          <Tag label="Pose + Classification AI" color="var(--accent)"/>
        </div>
        <div style={{padding:24}}>
          <AIVideoSim tests={tests} onComplete={(detectedId, val)=>handleComplete(detectedId, val)}/>
        </div>
      </div>
    );
  }

  if(selTest){
    const t = tests.find(x=>x.id===selTest);
    return (
      <div className="card" style={{ maxWidth: 600, margin: '0 auto', overflow: 'hidden', padding: 0 }}>
        <div style={{padding:"20px",background:"var(--panel-bg)",borderBottom:`1px solid var(--border-color)`,display:"flex",alignItems:"center",gap:16}}>
          <button onClick={()=>setSelTest(null)} style={{background:"none",border:"none",color:"var(--text-mid)",cursor:"pointer",fontSize:28,lineHeight:1}}>‹</button>
          <div style={{fontSize:20,fontWeight:700,color:"var(--text-main)",fontFamily:"var(--font-head)"}}>{t.label}</div>
          <Tag label={t.aiModule} color={t.color}/>
        </div>
        <div style={{padding:24}}>
          { (t.id === "height" || t.id === "weight") ? 
            <ManualInput test={t} onComplete={(val)=>handleComplete(t.id,val)} onCancel={()=>setSelTest(null)} />
          : 
            <AIVideoSim tests={tests} onComplete={(detectedId, val)=>handleComplete(detectedId, val)}/>
          }
        </div>
      </div>
    );
  }

  return (
    <div style={{maxWidth: 800, margin: '0 auto'}}>
      {notif&&(
        <div style={{position:"fixed",bottom:32,right:32,zIndex:99,background:notif.color,color:"#fff",padding:"12px 24px",borderRadius:8,fontSize:14,fontWeight:600,animation:"fadeIn .3s ease",boxShadow:`0 8px 30px rgba(0,0,0,0.3)`}}>
          {notif.msg}
        </div>
      )}

      {/* Header */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div>
            <div style={{fontSize:12,color:"var(--accent)",fontWeight:600,letterSpacing:1,fontFamily:"var(--font-mono)",marginBottom:4}}>ATHLETE DASHBOARD</div>
            <div style={{fontSize:28,fontWeight:700,color:"var(--text-main)",fontFamily:"var(--font-head)",marginBottom:4}}>{athlete.name}</div>
            <div style={{fontSize:14,color:"var(--text-mid)"}}>{athlete.state} · {athlete.age}y · {athlete.badge}</div>
          </div>
          <ScoreRing score={athlete.score} size={80} stroke={6}/>
        </div>
        
        {/* Quick Stats Grid */}
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))", gap:16}}>
          <div style={{background:"var(--bg-color)",borderRadius:8,padding:"12px 16px",border:`1px solid var(--border-color)`}}>
            <div style={{fontSize:12,color:"var(--text-dim)",marginBottom:4,fontWeight:600}}>XP POINTS</div>
            <div style={{fontSize:20,fontWeight:700,color:"var(--accent)",fontFamily:"var(--font-mono)"}}>{athlete.xp.toLocaleString()}</div>
          </div>
          <div style={{background:"var(--bg-color)",borderRadius:8,padding:"12px 16px",border:`1px solid var(--border-color)`}}>
            <div style={{fontSize:12,color:"var(--text-dim)",marginBottom:4,fontWeight:600}}>COINS</div>
            <div style={{fontSize:20,fontWeight:700,color:"var(--warning)",fontFamily:"var(--font-mono)"}}>{athlete.coins}</div>
          </div>
          <div style={{background:"var(--bg-color)",borderRadius:8,padding:"12px 16px",border:`1px solid var(--border-color)`}}>
            <div style={{fontSize:12,color:"var(--text-dim)",marginBottom:4,fontWeight:600}}>TESTS COMPLETED</div>
            <div style={{fontSize:20,fontWeight:700,color:"var(--success)",fontFamily:"var(--font-mono)"}}>{doneCount} / {tests.length}</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{display:"flex", gap: 8, marginBottom: 24}}>
        {["home","tests","badges","leaderboard","inbox"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            padding:"8px 16px",background:tab===t?"var(--panel-bg)":"transparent",border:"none",
            borderRadius: 20, color:tab===t?"var(--white)":"var(--text-mid)",cursor:"pointer",
            fontSize:14,fontWeight:600,textTransform:"capitalize", transition: "all .2s"
          }}>{t}</button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="card">
        {tab==="home"&&(
          <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
            {doneCount < tests.length && (
              <div style={{background:"var(--accent-lo)",border:`1px solid var(--accent)`,borderRadius:8,padding:16, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <div>
                  <div style={{fontSize:16,color:"var(--accent)",fontWeight:600,marginBottom:4}}>Complete Your Assessment</div>
                  <div style={{fontSize:14,color:"var(--text-main)"}}>You have {tests.length - doneCount} pending tests.</div>
                </div>
                <button onClick={() => setSelTest("unified_upload")} style={{padding: "10px 16px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer"}}>
                  Upload Video
                </button>
              </div>
            )}
            
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",gap:16}}>
              <StatBox label="STATE RANKING" value="#3" color="var(--accent)"/>
              <StatBox label="NATIONAL RANKING" value="#142" color="var(--success)"/>
            </div>

            {tests.filter(t=>done[t.id]===null)[0]&&(
              <div onClick={()=>setSelTest(tests.filter(t=>done[t.id]===null)[0].id)}
                style={{background:"var(--bg-color)",border:`1px solid var(--border-color)`,borderRadius:8,padding:20,cursor:"pointer",display:"flex",alignItems:"center",gap:16, transition: 'all .2s'}}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                <div style={{width:48,height:48,borderRadius:12,background:"var(--accent-lo)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,color:"var(--accent)"}}>
                  {tests.filter(t=>done[t.id]===null)[0].icon}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,color:"var(--accent)",fontWeight:700,letterSpacing:1,marginBottom:4}}>NEXT TEST</div>
                  <div style={{fontSize:18,fontWeight:600,color:"var(--text-main)",fontFamily:"var(--font-head)"}}>{tests.filter(t=>done[t.id]===null)[0].label}</div>
                </div>
                <span style={{color:"var(--accent)",fontSize:24}}>→</span>
              </div>
            )}
          </div>
        )}

        {tab==="tests"&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <h3 style={{fontSize: 18, marginBottom: 8}}>Available Tests</h3>
            {tests.map(t=>{
              const isDone=done[t.id]!==null;
              return (
                <div key={t.id} onClick={()=>setSelTest(t.id)} style={{
                  background:"var(--bg-color)",
                  border:`1px solid ${isDone?'var(--success)':'var(--border-color)'}`,
                  borderRadius:8,padding:"16px",cursor:"pointer",
                  display:"flex",alignItems:"center",gap:16,
                  transition:"all .2s",
                }}>
                  <div style={{width:48,height:48,borderRadius:12,background:`var(--panel-bg)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>
                    {t.icon}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:16,fontWeight:600,color:"var(--text-main)",marginBottom:4}}>{t.label}</div>
                    <div style={{fontSize:13,color:"var(--text-mid)",fontFamily:"var(--font-mono)"}}>
                      {isDone ? <span style={{color: 'var(--success)'}}>Score: {done[t.id]} {t.unit}</span> : t.aiModule}
                    </div>
                  </div>
                  <div>
                    {isDone ? <span style={{color:"var(--success)",fontSize:20}}>✓</span> : <span style={{color:"var(--text-mid)",fontSize:20}}>→</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab==="badges"&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))",gap:16}}>
            {BADGES_DEF.map(b=>{
              const earned=athlete.xp>=b.xpReq;
              return (
                <div key={b.id} style={{background:"var(--bg-color)",border:`1px solid ${earned?b.color:"var(--border-color)"}`,borderRadius:8,padding:"20px",textAlign:"center",opacity:earned?1:.5}}>
                  <div style={{fontSize:32,marginBottom:12,filter:earned?"none":"grayscale(1) brightness(0.6)"}}>{b.icon}</div>
                  <div style={{fontSize:16,fontWeight:600,color:earned?b.color:"var(--text-main)",marginBottom:8}}>{b.label}</div>
                  <div style={{fontSize:13,color:"var(--text-mid)",marginBottom:12}}>{b.desc}</div>
                  {!earned&&<div style={{fontSize:11,color:"var(--text-dim)",fontFamily:"var(--font-mono)"}}>Requires {b.xpReq} XP</div>}
                </div>
              );
            })}
          </div>
        )}

        {tab==="leaderboard"&&(
          <div>
            <h3 style={{fontSize: 18, marginBottom: 16}}>State Leaderboard</h3>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[
                {rank:1,name:"Vikram Patel",score:93,state:"GJ",badge:"Elite"},
                {rank:2,name:"Ravi Kumar",  score:87,state:"BR",badge:"Elite"},
                {rank:3,name:athlete.name, score:athlete.score,state:"RJ",badge:athlete.badge,isMe:true},
                {rank:4,name:"Suresh Yadav",score:72,state:"UP",badge:"Advanced"},
              ].map(p=>(
                <div key={p.rank} style={{display:"flex",alignItems:"center",gap:16,padding:"16px",background:"var(--bg-color)",border:`1px solid ${p.isMe?"var(--accent)":"var(--border-color)"}`,borderRadius:8}}>
                  <div style={{width:32,textAlign:"center",fontSize:16,fontWeight:700,color:p.rank===1?"var(--warning)":"var(--text-mid)",fontFamily:"var(--font-mono)"}}>
                    {p.rank===1?"#1":`#${p.rank}`}
                  </div>
                  <ScoreRing score={p.score} size={48} stroke={4}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:16,fontWeight:600,color:p.isMe?"var(--accent)":"var(--text-main)",marginBottom:4}}>{p.name}{p.isMe?" (You)":""}</div>
                    <div style={{fontSize:13,color:"var(--text-mid)"}}>{p.state} · {p.badge}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab==="inbox"&&(
          <div style={{display: "flex", gap: 16, height: 400}}>
            <div style={{width: 200, borderRight: "1px solid var(--border-color)", paddingRight: 16, overflowY: "auto"}}>
              <div style={{fontSize: 12, fontWeight: 700, color: "var(--text-dim)", marginBottom: 12}}>COACHES</div>
              {coaches.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => { setSelCoachId(c.id); loadMessages(c.id); }}
                  style={{padding: 12, background: selCoachId === c.id ? "var(--accent-lo)" : "transparent", color: selCoachId === c.id ? "var(--accent)" : "var(--text-main)", borderRadius: 8, cursor: "pointer", fontWeight: 600, marginBottom: 8}}
                >
                  {c.email.split("@")[0]}
                </div>
              ))}
            </div>
            <div style={{flex: 1, display: "flex", flexDirection: "column"}}>
              {!selCoachId ? (
                <div style={{margin: "auto", color: "var(--text-dim)"}}>Select a coach to view messages.</div>
              ) : (
                <>
                  <div style={{flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12}}>
                    {messages.length === 0 ? <div style={{textAlign: "center", color: "var(--text-dim)", marginTop: 40}}>No messages yet.</div> : messages.map(m => {
                      const isMe = m.sender_id === user?.id;
                      return (
                        <div key={m.id} style={{alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "80%"}}>
                          <div style={{fontSize: 10, color: "var(--text-dim)", marginBottom: 4, textAlign: isMe ? "right" : "left"}}>
                            {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                          <div style={{background: isMe ? "var(--accent)" : "var(--panel-bg)", color: isMe ? "#fff" : "var(--text-main)", padding: "8px 12px", borderRadius: 8, border: isMe ? "none" : "1px solid var(--border-color)", fontSize: 14}}>
                            {m.content}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{display: "flex", padding: 12, borderTop: "1px solid var(--border-color)"}}>
                    <input 
                      type="text" 
                      value={msgContent}
                      onChange={(e) => setMsgContent(e.target.value)}
                      placeholder="Reply to coach..."
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(selCoachId)}
                      style={{flex: 1, background: "transparent", border: "none", color: "var(--text-main)", padding: 8, outline: "none"}}
                    />
                    <button onClick={() => handleSendMessage(selCoachId)} style={{background: "var(--accent)", color: "#fff", border: "none", borderRadius: 4, padding: "8px 16px", cursor: "pointer", fontWeight: 600}}>Send</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
