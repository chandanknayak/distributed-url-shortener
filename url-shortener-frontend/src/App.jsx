import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { Link2, LayoutDashboard, LogOut, LogIn } from 'lucide-react';
import './index.css';

const Navigation = () => {
  const { user, logout } = useAuth();
  
  return (
    <nav>
      <Link to="/" className="brand">
        <Link2 size={24} color="#6366f1" />
        LinkSnap
      </Link>
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/dashboard" className="nav-link">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <LayoutDashboard size={18} /> Dashboard
              </span>
            </Link>
            <button onClick={logout} className="nav-btn">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <LogOut size={18} /> Logout
              </span>
            </button>
          </>
        ) : (
          <Link to="/login" className="nav-link">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LogIn size={18} /> Login
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navigation />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
