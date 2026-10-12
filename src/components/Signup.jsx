import { useState } from "react";
import { errorMessage } from "../api";

export default function Signup({ onSignup, onShowLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await onSignup(username, email, password);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center">
      <form className="card login" onSubmit={submit}>
        <h1>Create account</h1>
        <p className="muted">Sign up to get started</p>

        {error && <div className="alert">{error}</div>}

        <label>
          Username
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            minLength={3}
            maxLength={100}
            pattern="[A-Za-z0-9_.-]+"
            autoComplete="username"
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            maxLength={255}
            autoComplete="email"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={12}
            maxLength={72}
            autoComplete="new-password"
            required
          />
        </label>
        <label>
          Confirm password
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={12}
            maxLength={72}
            autoComplete="new-password"
            required
          />
        </label>

        <button className="btn primary" disabled={loading}>
          {loading ? "Creating account…" : "Sign up"}
        </button>
        <p className="auth-switch">
          Already have an account? <button type="button" className="text-button" onClick={onShowLogin}>Log in</button>
        </p>
      </form>
    </div>
  );
}
