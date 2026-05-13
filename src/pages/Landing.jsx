import { Link } from "react-router-dom";


export default function Landing() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 64, alignItems: 'center', textAlign: 'center', paddingTop: 64 }}>
      <div style={{ maxWidth: 800 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'var(--accent-lo)', color: 'var(--accent)', borderRadius: 24, fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
          <span style={{ width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%' }}></span>
          Next-Gen Talent Discovery
        </div>
        
        <h1 style={{ fontSize: 64, lineHeight: 1.1, marginBottom: 24, color: 'var(--text-main)' }}>
          Identify <span className="title-gradient">Elite Potential</span><br/>Before Anyone Else.
        </h1>
        
        <p style={{ fontSize: 18, color: 'var(--text-mid)', marginBottom: 40, lineHeight: 1.6, maxWidth: 600, margin: '0 auto 40px' }}>
          AI-powered sports talent assessment platform. Measure performance, track metrics, and uncover the athletes of tomorrow with unparalleled precision.
        </p>
        
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Link to="/signup" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: 16, textDecoration: 'none' }}>
            Get Started Free
          </Link>
          <Link to="/login" className="btn btn-outline" style={{ padding: '16px 32px', fontSize: 16, textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, width: '100%', marginTop: 32 }}>
        {[
          { title: "For Athletes", desc: "Build your digital profile, submit verified performance metrics, and get noticed by top coaches.", icon: "🏃" },
          { title: "For Coaches", desc: "Filter and discover talent using AI-validated data. Build your ultimate roster with confidence.", icon: "📋" },
          { title: "For SAI Officials", desc: "Oversee national athletic development with macro-level analytics and benchmark tracking.", icon: "🏛" },
        ].map(feat => (
          <div key={feat.title} className="card" style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>{feat.icon}</div>
            <h3 style={{ fontSize: 20, marginBottom: 8 }}>{feat.title}</h3>
            <p style={{ color: 'var(--text-mid)', lineHeight: 1.5 }}>{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
