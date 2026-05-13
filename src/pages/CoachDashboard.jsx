import React, { useState, useEffect, useContext } from "react";
import { ScoreRing, StatBox, Tag } from "../components/ui";
import { BenchmarkBars } from "../components/charts";
import { getTests, getAthletes, getBenchmarks, getShortlist, toggleShortlist, getMessages, sendMessage } from "../api";
import { AuthContext } from "../context/AuthContext";

export default function CoachDashboard() {
  const { user } = useContext(AuthContext);
  const [selAthleteId, setSelAthleteId] = useState(null);
  const [athletes, setAthletes] = useState([]);
  const [tests, setTests] = useState([]);
  const [benchmarks, setBenchmarks] = useState(null);
  
  const [shortlistedIds, setShortlistedIds] = useState([]);
  const [messages, setMessages] = useState([]);
  const [msgContent, setMsgContent] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    Promise.all([getAthletes(), getTests(), getBenchmarks(), getShortlist()]).then(([aths, ts, bench, sl]) => {
      setAthletes(aths);
      setTests(ts);
      setBenchmarks(bench);
      setShortlistedIds(sl || []);
    }).catch(err => {
      console.error(err);
      setLoadError(err.message || "Failed to load dashboard data. Check backend connection.");
    });
  }, []);

  if (loadError) {
    return <div style={{padding: 40, textAlign: 'center', color: 'var(--danger)'}}><b>Error:</b> {loadError}</div>;
  }

  if (!benchmarks) {
    return <div style={{padding: 40, textAlign: 'center'}}>Loading athletes...</div>;
  }

  const selAthlete = selAthleteId ? athletes.find(a => a.id === selAthleteId) : null;

  const handleToggleShortlist = (athleteId) => {
    toggleShortlist(athleteId).then(res => {
      if (res.status === "added") setShortlistedIds([...shortlistedIds, athleteId]);
      else setShortlistedIds(shortlistedIds.filter(id => id !== athleteId));
    });
  };

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

  if(selAthlete){
    const scoresDict = {};
    selAthlete.scores.forEach(s => { scoresDict[s.test_id] = s.value; });

    return (
      <div className="card" style={{ maxWidth: 800, margin: '0 auto', padding: 0, overflow: 'hidden' }}>
        <div style={{padding:"24px",background:"var(--panel-bg)",borderBottom:`1px solid var(--border-color)`,display:"flex",alignItems:"center",gap:24}}>
          <button onClick={()=>setSelAthleteId(null)} style={{background:"none",border:"none",color:"var(--text-mid)",cursor:"pointer",fontSize:32,lineHeight:1}}>‹</button>
          <div style={{flex:1}}>
            <div style={{fontSize:24,fontWeight:700,color:"var(--text-main)",fontFamily:"var(--font-head)",marginBottom:4}}>{selAthlete.name}</div>
            <div style={{fontSize:14,color:"var(--text-mid)"}}>{selAthlete.state} · {selAthlete.age}y · {selAthlete.gender}</div>
          </div>
          <ScoreRing score={selAthlete.score} size={64} stroke={6}/>
        </div>
        
        <div style={{padding:24}}>
          {selAthlete.paraCategory&&(
            <div style={{background:"var(--accent-lo)",border:`1px solid var(--accent)`,borderRadius:8,padding:16,marginBottom:24}}>
              <div style={{fontSize:14,color:"var(--accent)",fontWeight:600}}>♿ Para-athlete · {selAthlete.paraCategory}</div>
            </div>
          )}
          
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))",gap:16,marginBottom:24}}>
            <StatBox label="TALENT SCORE" value={selAthlete.score} color={selAthlete.score>=85?"var(--warning)":"var(--accent)"}/>
            <StatBox label="XP EARNED" value={selAthlete.xp.toLocaleString()} color="var(--accent)"/>
            <StatBox label="COINS" value={selAthlete.coins} color="var(--warning)"/>
          </div>
          
          <div style={{background:"var(--bg-color)",borderRadius:8,padding:24,marginBottom:24,border:`1px solid var(--border-color)`}}>
            <div style={{fontSize:14,color:"var(--text-mid)",fontWeight:600,letterSpacing:1,marginBottom:20}}>PERFORMANCE vs NATIONAL BENCHMARK</div>
            <BenchmarkBars scores={scoresDict} gender={selAthlete.gender || 'male'} tests={tests} benchmarks={benchmarks}/>
          </div>
          
          {selAthlete.flags.length>0&&(
            <div style={{background:"var(--danger-lo)",border:`1px solid var(--danger)`,borderRadius:8,padding:16,marginBottom:24}}>
              <div style={{fontSize:14,color:"var(--danger)",fontWeight:600,marginBottom:8}}>⚠ AI FLAGS DETECTED</div>
              {selAthlete.flags.map(f=><div key={f} style={{fontSize:13,color:"var(--text-main)", marginBottom:4}}>• {f}</div>)}
            </div>
          )}
          
          <div style={{display:"flex",gap:16}}>
            <button 
              onClick={() => handleToggleShortlist(selAthlete.id)}
              className={shortlistedIds.includes(selAthlete.id) ? "btn btn-outline" : "btn btn-primary"} 
              style={{flex:1, borderColor: shortlistedIds.includes(selAthlete.id) ? "var(--warning)" : "", color: shortlistedIds.includes(selAthlete.id) ? "var(--warning)" : ""}}
            >
              {shortlistedIds.includes(selAthlete.id) ? "★ Shortlisted" : "Shortlist Athlete"}
            </button>
            <button 
              onClick={() => {
                if(!showChat && selAthlete.user_id) loadMessages(selAthlete.user_id);
                setShowChat(!showChat);
              }}
              className="btn btn-outline" style={{flex:1}}
            >
              {showChat ? "Close Chat" : "Send Message"}
            </button>
          </div>
          
          {showChat && selAthlete.user_id && (
            <div style={{marginTop: 24, background: "var(--bg-color)", borderRadius: 8, border: "1px solid var(--border-color)", overflow: "hidden"}}>
              <div style={{padding: 16, background: "var(--panel-bg)", borderBottom: "1px solid var(--border-color)", fontWeight: 600}}>
                Chat with {selAthlete.name}
              </div>
              <div style={{height: 200, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12}}>
                {messages.length === 0 ? (
                  <div style={{textAlign: "center", color: "var(--text-dim)", marginTop: 40}}>No messages yet.</div>
                ) : messages.map(m => {
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
                  placeholder="Type a message..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(selAthlete.user_id)}
                  style={{flex: 1, background: "transparent", border: "none", color: "var(--text-main)", padding: 8, outline: "none"}}
                />
                <button onClick={() => handleSendMessage(selAthlete.user_id)} style={{background: "var(--accent)", color: "#fff", border: "none", borderRadius: 4, padding: "8px 16px", cursor: "pointer", fontWeight: 600}}>Send</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{maxWidth: 1000, margin: '0 auto'}}>
      <div className="card" style={{marginBottom: 24}}>
        <div style={{fontSize:12,color:"var(--success)",fontWeight:600,letterSpacing:1,fontFamily:"var(--font-mono)",marginBottom:4}}>COACH PORTAL</div>
        <div style={{fontSize:28,fontWeight:700,color:"var(--text-main)",fontFamily:"var(--font-head)",marginBottom:24}}>Athlete Roster</div>
        
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",gap:16}}>
          <div style={{background:"var(--bg-color)",borderRadius:8,padding:"16px",border:`1px solid var(--border-color)`}}>
            <div style={{fontSize:12,color:"var(--text-dim)",marginBottom:4,fontWeight:600}}>ASSIGNED ATHLETES</div>
            <div style={{fontSize:24,fontWeight:700,color:"var(--accent)",fontFamily:"var(--font-mono)"}}>{athletes.length}</div>
          </div>
          <div style={{background:"var(--bg-color)",borderRadius:8,padding:"16px",border:`1px solid var(--border-color)`}}>
            <div style={{fontSize:12,color:"var(--text-dim)",marginBottom:4,fontWeight:600}}>SHORTLISTED</div>
            <div style={{fontSize:24,fontWeight:700,color:"var(--success)",fontFamily:"var(--font-mono)"}}>{shortlistedIds.length}</div>
          </div>
          <div style={{background:"var(--bg-color)",borderRadius:8,padding:"16px",border:`1px solid var(--border-color)`}}>
            <div style={{fontSize:12,color:"var(--text-dim)",marginBottom:4,fontWeight:600}}>ELITE PROSPECTS</div>
            <div style={{fontSize:24,fontWeight:700,color:"var(--warning)",fontFamily:"var(--font-mono)"}}>{athletes.filter(a=>a.score>=85).length}</div>
          </div>
        </div>
      </div>

      <div style={{display:"grid", gap: 16}}>
        {athletes.map(a=>(
          <div key={a.id} onClick={()=>setSelAthleteId(a.id)} className="card" style={{
            cursor:"pointer", display:"flex", alignItems:"center", gap:20, padding: 20,
            borderColor: a.flags.length ? 'var(--danger)' : 'var(--border-color)',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => { if (!a.flags.length) e.currentTarget.style.borderColor = 'var(--accent)' }}
          onMouseOut={(e) => { if (!a.flags.length) e.currentTarget.style.borderColor = 'var(--border-color)' }}>
            <ScoreRing score={a.score} size={64} stroke={6}/>
            
            <div style={{flex:1, minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:6}}>
                <span style={{fontWeight:600,fontSize:18,color:"var(--text-main)"}}>{a.name}</span>
                {a.verified&&<span style={{padding: '2px 8px', background: 'var(--success-lo)', color: 'var(--success)', borderRadius: 12, fontSize:10, fontWeight: 600}}>✓ VERIFIED</span>}
                {a.flags.length>0&&<span style={{padding: '2px 8px', background: 'var(--danger-lo)', color: 'var(--danger)', borderRadius: 12, fontSize:10, fontWeight: 600}}>⚠ FLAGGED</span>}
              </div>
              <div style={{fontSize:14,color:"var(--text-mid)", marginBottom: 8}}>{a.age}y · {a.state} · {a.gender || 'unknown'}</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {a.tags.map(t=><Tag key={t} label={t} color={a.paraCategory?"var(--accent)":"var(--success)"}/>)}
                {a.paraCategory&&<Tag label="Para" color="var(--accent)"/>}
              </div>
            </div>
            <span style={{color:"var(--text-mid)",fontSize:24}}>→</span>
          </div>
        ))}
        {athletes.length === 0 && (
          <div style={{textAlign: 'center', padding: 40, color: 'var(--text-mid)'}}>No athletes found.</div>
        )}
      </div>
    </div>
  );
}
