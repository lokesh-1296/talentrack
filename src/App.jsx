import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { useContext } from "react";
import Landing from "./pages/Landing";
import AthleteDashboard from "./pages/AthleteDashboard";
import CoachDashboard from "./pages/CoachDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { AuthProvider, AuthContext } from "./context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
}

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  
  return (
    <nav className="navbar">
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>⚡</div>
        <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-head)', letterSpacing: 1, color: 'var(--text-main)' }}>
          TALENT<span style={{ color: 'var(--accent)' }}>TRACK</span>
        </span>
      </Link>
      
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {user ? (
          <>
            <span style={{ fontSize: 14, color: 'var(--text-mid)', fontFamily: 'var(--font-mono)' }}>{user.email}</span>
            <button onClick={logout} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: 13 }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline" style={{ padding: '8px 16px', textDecoration: 'none' }}>Log In</Link>
            <Link to="/signup" className="btn btn-primary" style={{ padding: '8px 16px', textDecoration: 'none' }}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/athlete/*" element={
                <ProtectedRoute allowedRoles={['athlete']}>
                  <AthleteDashboard />
                </ProtectedRoute>
              } />
              <Route path="/coach/*" element={
                <ProtectedRoute allowedRoles={['coach']}>
                  <CoachDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/*" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
