import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const result = await login(form.email, form.password);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-card">
      <h2>Login</h2>
      <p>Welcome back to TruthShield AI.</p>
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={handleSubmit} className="form">
        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} required />
        <label>Password</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} required />
        <button className="btn btn-primary full" disabled={loading}>{loading ? "Please wait..." : "Login"}</button>
      </form>
      <p className="muted center">New user? <Link to="/register">Create account</Link></p>
    </div>
  );
}

export default Login;
