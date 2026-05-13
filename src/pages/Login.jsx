import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login({ email, password });
      if (user.role === 'athlete') navigate('/athlete');
      else if (user.role === 'coach') navigate('/coach');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setError('Invalid email or password.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <div className="card" style={{ width: '100%', maxWidth: 400 }}>
        <h2 className="title-gradient" style={{ textAlign: 'center', fontSize: 32, marginBottom: 8 }}>Welcome Back</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-mid)', marginBottom: 32, fontSize: 14 }}>Sign in to continue to TalentTrack</p>
        
        {error && <div style={{ background: 'var(--danger-lo)', color: 'var(--danger)', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-mid)' }}>Email Address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="athlete@example.com" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-mid)' }}>Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>Sign In</button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-dim)' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Create one</Link>
        </div>
      </div>
    </div>
  );
}
