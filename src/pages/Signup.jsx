import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('athlete');
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await register({ email, password, role });
      if (user.role === 'athlete') navigate('/athlete');
      else if (user.role === 'coach') navigate('/coach');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Try again.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <div className="card" style={{ width: '100%', maxWidth: 400 }}>
        <h2 className="title-gradient" style={{ textAlign: 'center', fontSize: 32, marginBottom: 8 }}>Join TalentTrack</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-mid)', marginBottom: 32, fontSize: 14 }}>Create an account to get started</p>
        
        {error && <div style={{ background: 'var(--danger-lo)', color: 'var(--danger)', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-mid)' }}>Email Address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="athlete@example.com" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-mid)' }}>Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" minLength={6} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-mid)' }}>Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="athlete">Athlete</option>
              <option value="coach">Coach</option>
              <option value="admin">SAI Official (Admin)</option>
            </select>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>Create Account</button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-dim)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
