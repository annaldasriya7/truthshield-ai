import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        <span className="brand-icon">🛡️</span>
        TruthShield AI
      </Link>

      <div className="nav-links">
        <NavLink to="/">Home</NavLink>
        {user && <NavLink to="/dashboard">Dashboard</NavLink>}
        {user && <NavLink to="/detect">Detect</NavLink>}
        {user && <NavLink to="/history">History</NavLink>}
        {user?.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
        {user?.role === "admin" && <NavLink to="/sources">Sources</NavLink>}
      </div>

      <div className="nav-actions">
        {user ? (
          <>
            <span className="user-pill">{user.name}</span>
            <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link className="btn btn-outline" to="/login">Login</Link>
            <Link className="btn btn-primary" to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
