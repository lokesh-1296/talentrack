import React, { useState, useEffect } from "react";
import { ScoreRing, StatBox, Tag } from "../components/ui";
import { BenchmarkBars } from "../components/charts";
import { getTests, getAthletes, getBenchmarks } from "../api";

export default function AdminDashboard() {
  const [selAthleteId, setSelAthleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterBadge, setFilterBadge] = useState("all");
  const [tab, setTab] = useState("athletes"); // athletes|analytics|flags
  
  const [athletes, setAthletes] = useState([]);
  const [tests, setTests] = useState([]);
  const [benchmarks, setBenchmarks] = useState(null);

  useEffect(() => {
    Promise.all([getAthletes(), getTests(), getBenchmarks()]).then(([aths, ts, bench]) => {
      setAthletes(aths);
      setTests(ts);
      setBenchmarks(bench);
    }).catch(err => console.error(err));
  }, []);

  if (!benchmarks) {
    return <div style={{padding: 40, textAlign: 'center'}}>Loading data...</div>;
  }

  const flagged = athletes.filter(a => !a.verified || a.flags.length > 0);
  const filtered = athletes.filter(a => {
    const ms = a.name.toLowerCase().includes(search.toLowerCase()) || a.state.toLowerCase().includes(search.toLowerCase());
    const mb = filterBadge === "all" || a.badge.toLowerCase() === filterBadge;
    return ms && mb;
  });

  const selAthlete = selAthleteId ? athletes.find(a => a.id === selAthleteId) : null;

  if(selAthlete){
    const scoresDict = {};
    selAthlete.scores.forEach(s => { scoresDict[s.test_id] = s.value; });

    return (
      <div className="card" style={{ maxWidth: 800, margin: '0 auto', padding: 0, overflow: 'hidden' }}>
        <div style={{padding:"24px",background:"var(--panel-bg)",borderBottom:`1px solid var(--border-color)`,display:"flex",alignItems:"center",gap:24}}>
          <button onClick={()=>setSelAthleteId(null)} style={{background:"none",border:"none",color:"var(--text-mid)",cursor:"pointer",fontSize:32,lineHeight:1}}>‹</button>
          <div style={{flex:1}}>
            <div style={{fontSize:24,fontWeight:700,color:"var(--text-main)",fontFamily:"var(--font-head)"}}>{selAthlete.name}</div>
            <div style={{fontSize:14,color:"var(--text-mid)"}}>{selAthlete.state} · {selAthlete.age}y · {selAthlete.gender}</div>
          </div>
          {selAthlete.verified
            ?<Tag label="VERIFIED" color="var(--success)"/>
            :<Tag label="PENDING" color="var(--warning)"/>}
        </div>
        
        <div style={{padding:24}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))",gap:16,marginBottom:24}}>
            <StatBox label="TALENT SCORE" value={selAthlete.score} color={selAthlete.score>=85?"var(--warning)":"var(--accent)"}/>
            <StatBox label="TIER BADGE" value={selAthlete.badge} color="var(--success)"/>
            <StatBox label="STATE" value={selAthlete.state} color="var(--text-mid)"/>
          </div>
          
          <div style={{background:"var(--bg-color)",borderRadius:8,padding:24,marginBottom:24,border:`1px solid var(--border-color)`}}>
            <div style={{fontSize:14,color:"var(--text-mid)",fontWeight:600,letterSpacing:1,marginBottom:20}}>TEST PERFORMANCE</div>
            <BenchmarkBars scores={scoresDict} gender={selAthlete.gender || 'male'} tests={tests} benchmarks={benchmarks}/>
          </div>
          
          {selAthlete.flags.length>0&&(
            <div style={{background:"var(--danger-lo)",border:`1px solid var(--danger)`,borderRadius:8,padding:16,marginBottom:24}}>
              <div style={{fontSize:14,color:"var(--danger)",fontWeight:600,marginBottom:8}}>⚠ ANOMALY FLAGS</div>
              {selAthlete.flags.map(f=><div key={f} style={{fontSize:13,color:"var(--text-main)",marginBottom:4}}>• {f}</div>)}
              <div style={{display:"flex",gap:16,marginTop:16}}>
                <button className="btn btn-primary" style={{flex:1, background: 'var(--success)'}}>Approve Results</button>
                <button className="btn btn-primary" style={{flex:1, background: 'var(--danger)'}}>Reject / Request Retest</button>
              </div>
            </div>
          )}
          
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(100px, 1fr))",gap:16}}>
            {tests.map(t=>(
              <div key={t.id} style={{background:"var(--bg-color)",border:`1px solid var(--border-color)`,borderRadius:8,padding:16,textAlign:"center"}}>
                <div style={{fontSize:24,fontWeight:700,color:"var(--accent)",fontFamily:"var(--font-mono)",marginBottom:4}}>{scoresDict[t.id] ?? '-'}</div>
                <div style={{fontSize:12,color:"var(--text-dim)",fontWeight:600}}>{t.unit}</div>
                <div style={{fontSize:13,color:"var(--text-main)",marginTop:4}}>{t.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{maxWidth: 1200, margin: '0 auto'}}>
      {/* Admin header */}
      <div className="card" style={{marginBottom: 24}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
          <div>
            <div style={{fontSize:12,color:"var(--accent)",fontWeight:600,letterSpacing:1,fontFamily:"var(--font-mono)",marginBottom:4}}>SAI ADMIN PORTAL</div>
            <div style={{fontSize:28,fontWeight:700,color:"var(--text-main)",fontFamily:"var(--font-head)"}}>National Dashboard</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:12,color:"var(--text-mid)",fontFamily:"var(--font-mono)",marginBottom:4}}>SYSTEM STATUS</div>
            <div style={{fontSize:14,color:"var(--success)",fontWeight:600}}>● LIVE SYNC</div>
          </div>
        </div>
        
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",gap:16}}>
          <StatBox label="TOTAL ATHLETES" value={athletes.length.toLocaleString()} color="var(--accent)"/>
          <StatBox label="VERIFIED" value={athletes.filter(a=>a.verified).length.toLocaleString()} color="var(--success)"/>
          <StatBox label="ELITE TIER" value={athletes.filter(a=>a.score>=85).length} color="var(--warning)"/>
          <StatBox label="ACTION REQUIRED" value={flagged.length} color="var(--danger)"/>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{display:"flex", gap: 8, marginBottom: 24}}>
        {["athletes","analytics","flags"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            padding:"8px 24px",background:tab===t?"var(--panel-bg)":"transparent",border:"none",
            borderRadius: 24, color:tab===t?"var(--white)":"var(--text-mid)",cursor:"pointer",
            fontSize:14,fontWeight:600,textTransform:"capitalize", transition: "all .2s"
          }}>{t}{t==="flags"&&flagged.length?` (${flagged.length})`:""}</button>
        ))}
      </div>

      <div className="card" style={{padding: 24}}>
        {tab==="athletes"&&(
          <div>
            <div style={{display:"flex",gap:16, marginBottom: 24}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search athlete or state..."
                style={{flex:2}}/>
              <select value={filterBadge} onChange={e=>setFilterBadge(e.target.value)} style={{flex:1}}>
                <option value="all">All Tiers</option>
                <option value="elite">Elite Tier</option>
                <option value="advanced">Advanced Tier</option>
                <option value="developing">Developing Tier</option>
              </select>
            </div>
            
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {filtered.map(a=>(
                <div key={a.id} onClick={()=>setSelAthleteId(a.id)} style={{
                  background:"var(--bg-color)",
                  border:`1px solid ${a.flags.length?"var(--danger)":!a.verified?"var(--warning)":"var(--border-color)"}`,
                  borderRadius:8,padding:"16px",cursor:"pointer",display:"flex",alignItems:"center",gap:20,transition:"all .2s",
                }}>
                  <ScoreRing score={a.score} size={56} stroke={5}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:4}}>
                      <span style={{fontWeight:600,fontSize:16,color:"var(--text-main)"}}>{a.name}</span>
                      {!a.verified&&<span style={{fontSize:11,color:"var(--warning)",fontWeight:600}}>PENDING</span>}
                      {a.flags.length>0&&<span style={{fontSize:11,color:"var(--danger)",fontWeight:600}}>⚠ REVIEW</span>}
                      {a.paraCategory&&<span style={{fontSize:11,color:"var(--accent)",fontWeight:600}}>♿ PARA</span>}
                    </div>
                    <div style={{fontSize:13,color:"var(--text-mid)"}}>{a.age}y · {a.state} · {a.badge} Tier</div>
                  </div>
                  <span style={{color:"var(--text-mid)",fontSize:24}}>→</span>
                </div>
              ))}
              {filtered.length === 0 && <div style={{textAlign: 'center', padding: 40, color: 'var(--text-mid)'}}>No athletes found matching criteria.</div>}
            </div>
          </div>
        )}

        {tab==="analytics"&&(
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24}}>
            <div style={{background:"var(--bg-color)",border:`1px solid var(--border-color)`,borderRadius:8,padding:24}}>
              <div style={{fontSize:14,color:"var(--text-mid)",fontWeight:600,letterSpacing:1,marginBottom:20}}>TOP STATES PARTICIPATION</div>
              {[{s:"Maharashtra",n:2140,pct:87},{s:"Uttar Pradesh",n:1980,pct:81},{s:"Tamil Nadu",n:1650,pct:68},{s:"Rajasthan",n:1420,pct:58},{s:"Bihar",n:1200,pct:49}].map(r=>(
                <div key={r.s} style={{marginBottom:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <span style={{fontSize:14,color:"var(--text-main)",fontWeight:500}}>{r.s}</span>
                    <span style={{fontSize:14,color:"var(--accent)",fontWeight:600,fontFamily:"var(--font-mono)"}}>{r.n.toLocaleString()}</span>
                  </div>
                  <div style={{height:8,background:"var(--border-color)",borderRadius:4}}>
                    <div style={{height:"100%",width:`${r.pct}%`,background:`var(--accent)`,borderRadius:4}}/>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{background:"var(--bg-color)",border:`1px solid var(--border-color)`,borderRadius:8,padding:24}}>
              <div style={{fontSize:14,color:"var(--text-mid)",fontWeight:600,letterSpacing:1,marginBottom:20}}>TALENT TIER DISTRIBUTION</div>
              {[{l:"Elite",pct:7.3,n:934,c:"var(--warning)"},{l:"Advanced",pct:31.2,n:4012,c:"var(--accent)"},{l:"Developing",pct:61.5,n:7901,c:"var(--success)"}].map(r=>(
                <div key={r.l} style={{display:"flex",alignItems:"center",gap:16,marginBottom:16}}>
                  <div style={{width:80,fontSize:14,color:r.c,fontWeight:600}}>{r.l}</div>
                  <div style={{flex:1,height:12,background:"var(--border-color)",borderRadius:6}}>
                    <div style={{height:"100%",width:`${r.pct}%`,background:r.c,borderRadius:6}}/>
                  </div>
                  <div style={{fontSize:14,color:"var(--text-mid)",fontWeight:600,fontFamily:"var(--font-mono)",width:60,textAlign:"right"}}>{r.pct}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="flags"&&(
          <div>
            <div style={{fontSize:14,color:"var(--text-mid)",marginBottom:20}}>AI-flagged submissions requiring human review</div>
            {flagged.length===0&&<div style={{textAlign:"center",color:"var(--success)",padding:40, fontSize: 16}}>✓ No pending flags to review</div>}
            
            <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
              {flagged.map(a=>(
                <div key={a.id} style={{background:"var(--bg-color)",border:`1px solid var(--danger)`,borderRadius:8,padding:24}}>
                  <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:16}}>
                    <ScoreRing score={a.score} size={48} stroke={4}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:18,fontWeight:700,color:"var(--text-main)",marginBottom:4}}>{a.name}</div>
                      <div style={{fontSize:13,color:"var(--text-mid)"}}>{a.state} · {a.age}y</div>
                    </div>
                    {!a.verified&&<Tag label="UNVERIFIED" color="var(--warning)"/>}
                  </div>
                  
                  <div style={{marginBottom: 20}}>
                    {a.flags.map(f=>(
                      <div key={f} style={{fontSize:13,color:"var(--danger)",background:"var(--danger-lo)",borderRadius:6,padding:"8px 12px",marginBottom:8,fontWeight:500}}>⚠ {f}</div>
                    ))}
                  </div>
                  
                  <div style={{display:"flex",gap:16}}>
                    <button onClick={()=>setSelAthleteId(a.id)} className="btn btn-outline" style={{flex:1}}>View Profile</button>
                    <button className="btn btn-primary" style={{flex:1, background: 'var(--success)'}}>Approve Data</button>
                    <button className="btn btn-primary" style={{flex:1, background: 'var(--danger)'}}>Reject Data</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
