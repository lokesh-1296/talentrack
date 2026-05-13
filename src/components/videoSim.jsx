import React, { useState, useRef } from "react";
import { analyzeVideo } from "../api";

export function AIVideoSim({ tests, onComplete }){
  const [phase, setPhase] = useState("select"); // select|preview|analyzing|done|error
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setPhase("preview");
    }
  };

  const startAnalysis = async () => {
    if (!file) return;
    setPhase("analyzing");
    try {
      const data = await analyzeVideo(file, "auto");
      setResult(data);
      setPhase("done");
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to analyze video. Ensure the backend is running and the video format is supported.");
      setPhase("error");
    }
  };

  const reset = () => {
    setPhase("select");
    setFile(null);
    if(previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setResult(null);
    setErrorMsg("");
  };

  const detectedTestDef = result && tests ? tests.find(t => t.id === result.test_id) : null;
  const tColor = detectedTestDef ? detectedTestDef.color : "var(--accent)";
  const tUnit = detectedTestDef ? detectedTestDef.unit : "";
  const tLabel = detectedTestDef ? detectedTestDef.label : (result ? result.test_id : "");

  return (
    <div style={{padding:"0 4px"}}>
      
      {phase === "select" && (
        <div 
          onClick={() => fileInputRef.current.click()}
          style={{
            border: "2px dashed var(--border-color)", 
            padding: "40px 20px", 
            borderRadius: 12, 
            textAlign: "center",
            cursor: "pointer",
            background: "var(--card-bg)"
          }}
        >
          <div style={{fontSize: 32, marginBottom: 12}}>📁</div>
          <div style={{color: "var(--text-main)", fontWeight: 600, marginBottom: 4}}>Upload Workout Video</div>
          <div style={{color: "var(--text-dim)", fontSize: 12}}>MP4, WebM, MOV up to 50MB</div>
          <input 
            type="file" 
            accept="video/*" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{display: "none"}} 
          />
        </div>
      )}

      {(phase === "preview" || phase === "analyzing") && (
        <div>
          <div style={{position:"relative", background:"#000", borderRadius:12, overflow:"hidden", marginBottom:12}}>
            <video src={previewUrl} style={{width:"100%", maxHeight: 300, objectFit: "contain", display:"block"}} controls={phase==="preview"} autoPlay muted loop />
            
            {phase === "analyzing" && (
              <div style={{position:"absolute", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center"}}>
                <div style={{fontSize:28, marginBottom:10, animation:"spin 1s linear infinite", color: "var(--accent)"}}>⚙</div>
                <div style={{color:"#fff", fontWeight:700, fontSize:14, letterSpacing: 1}}>ANALYZING EXERCISE...</div>
              </div>
            )}
          </div>
          
          {phase === "preview" && (
            <div style={{display:"flex", gap:10}}>
              <button onClick={startAnalysis} style={{flex: 1, padding:14, borderRadius:10, background:`linear-gradient(135deg,var(--accent),#0077ff)`, color:"#fff", border:"none", fontSize:14, fontWeight:800, cursor:"pointer", letterSpacing:1}}>
                ▶ AUTO-DETECT & ANALYZE
              </button>
              <button onClick={reset} style={{padding:14, borderRadius:10, background:"var(--card-bg)", color:"var(--text-main)", border:`1px solid var(--border-color)`, cursor:"pointer"}}>
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {phase === "error" && (
        <div style={{textAlign: "center", padding: "20px 0"}}>
          <div style={{fontSize: 24, color: "var(--danger)", marginBottom: 10}}>⚠</div>
          <div style={{color: "var(--danger)", fontSize: 14, marginBottom: 16}}>{errorMsg}</div>
          <button onClick={reset} style={{padding: "10px 20px", borderRadius: 8, background: "var(--card-bg)", color: "var(--text-main)", border: "1px solid var(--border-color)", cursor: "pointer"}}>Try Again</button>
        </div>
      )}

      {phase === "done" && result && (
        <div>
          <div style={{textAlign:"center", marginBottom:16}}>
            <div style={{fontSize:42, fontWeight:900, color:tColor, fontFamily:"var(--font-mono)"}}>
              {result.score}<span style={{fontSize:16, fontWeight:400, color:"var(--text-mid)"}}> {tUnit}</span>
            </div>
            <div style={{color:"var(--success)", fontSize:12, marginTop:4}}>✓ Detected: {tLabel}</div>
          </div>
          
          <div style={{background:"var(--card-bg)", borderRadius:10, padding:12, border:`1px solid var(--border-color)`, marginBottom:14}}>
            <div style={{fontSize:10, color:"var(--text-dim)", fontWeight:700, letterSpacing:1, marginBottom:8}}>ML PIPELINE RESULTS</div>
            {[
              ["Detected Reps", result.reps],
              ["Tracking Confidence", `${result.confidence}%`],
              ["Feedback", result.feedback],
              ["Model", "MediaPipe Pose"]
            ].map(([k,v])=>(
              <div key={k} style={{display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:6}}>
                <span style={{color:"var(--text-mid)"}}>{k}</span>
                <span style={{color:"var(--success)", fontFamily:"var(--font-mono)", textAlign:"right", maxWidth:"60%"}}>{v}</span>
              </div>
            ))}
          </div>
          
          <div style={{display:"flex", gap:8}}>
            <button onClick={()=>onComplete(result.test_id, result.score)} style={{flex:1, padding:12, borderRadius:10, background:"var(--success)", color:"#fff", border:"none", fontSize:13, fontWeight:800, cursor:"pointer", letterSpacing:1}}>
              SAVE RESULT
            </button>
            <button onClick={reset} style={{padding:"12px 16px", borderRadius:10, background:"transparent", color:"var(--text-mid)", border:`1px solid var(--border-color)`, fontSize:12, cursor:"pointer"}}>
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
