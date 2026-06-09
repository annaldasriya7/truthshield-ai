import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const result = await register(form.name, form.email, form.password);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-card">
      <h2>Create Account</h2>
      <p>The first registered user becomes admin automatically.</p>
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={handleSubmit} className="form">
        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />
        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} required />
        <label>Password</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} minLength="6" required />
        <button className="btn btn-primary full" disabled={loading}>{loading ? "Please wait..." : "Register"}</button>
      </form>
      <p className="muted center">Already have account? <Link to="/login">Login</Link></p>
    </div>
  );
}

export default Register;
