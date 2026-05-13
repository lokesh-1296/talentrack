import React from "react";

export function BenchmarkBars({scores, gender, tests, benchmarks}){
  const bench = benchmarks[gender] || benchmarks.male;
  if (!bench || !tests) return null;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {tests.map(t=>{
        // The API returns tests where min/max are mapped to min_val/max_val
        const minVal = t.min_val || t.min;
        const maxVal = t.max_val || t.max;
        const v = scores[t.id], b = bench[t.id];
        
        if(v==null) return null;
        
        const isTime = t.id==="shuttle" || t.id==="run1600";
        const pct = Math.min(100,Math.max(0,isTime?((maxVal-v)/(maxVal-minVal))*100:((v-minVal)/(maxVal-minVal))*100));
        const bpct = Math.min(100,Math.max(0,isTime?((maxVal-b)/(maxVal-minVal))*100:((b-minVal)/(maxVal-minVal))*100));
        const better = isTime?v<b:v>b;
        
        return (
          <div key={t.id}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:11,color:"var(--text-mid)",fontFamily:"var(--font-mono)"}}>{t.label}</span>
              <span style={{fontSize:11,color:better?"var(--success)":"var(--accent)",fontFamily:"var(--font-mono)",fontWeight:700}}>{v} {t.unit}</span>
            </div>
            <div style={{position:"relative",height:8,background:"var(--border-color)",borderRadius:4}}>
              <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${t.color}88,${t.color})`,borderRadius:4,transition:"width .7s"}}/>
              <div style={{position:"absolute",top:-3,left:`${bpct}%`,width:2,height:14,background:"var(--text-dim)",borderRadius:1,transform:"translateX(-50%)"}}/>
            </div>
          </div>
        );
      })}
      <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
        <div style={{width:14,height:2,background:"var(--text-dim)"}}/>
        <span style={{fontSize:10,color:"var(--text-dim)"}}>national benchmark</span>
      </div>
    </div>
  );
}
