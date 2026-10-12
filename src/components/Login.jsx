import { useState } from "react";
import { errorMessage } from "../api";

export default function Login({ onLogin, onShowSignup, message }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(errorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="center">
      <form className="card login" onSubmit={submit}>
        <h1>Product Management</h1>
        <p className="muted">Sign in to manage your products</p>

        {message && <div className="alert ok">{message}</div>}
        {error && <div className="alert">{error}</div>}

        <label>
          Email
          <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" autoFocus required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        </label>

        <button className="btn primary" disabled={loading}>
          {loading ? "Signing in…" : "Login"}
        </button>
        <p className="auth-switch">
          Don’t have an account? <button type="button" className="text-button" onClick={onShowSignup}>Sign up</button>
        </p>
      </form>
    </div>
  );
}
