import { useEffect, useState } from "react";
import { loadAuth, saveAuth, clearAuth, login, logout, register } from "./api";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import Products from "./components/Products.jsx";

export default function App() {
  const [auth, setAuth] = useState(loadAuth());
  const [screen, setScreen] = useState("login");
  const [signupMessage, setSignupMessage] = useState("");

  // If the refresh token fails inside api.js, drop back to the login screen
  useEffect(() => {
    const onLogout = () => setAuth(null);
    window.addEventListener("pms:logout", onLogout);
    return () => window.removeEventListener("pms:logout", onLogout);
  }, []);

  const handleLogin = async (email, password) => {
    const data = await login(email, password);
    saveAuth(data);
    setAuth(data);
  };

  const handleLogout = async () => {
    await logout();
    clearAuth();
    setAuth(null);
  };

  const handleSignup = async (username, email, password) => {
    const result = await register(username, email, password);
    setSignupMessage(result.message || "Account created. You can now log in.");
    setScreen("login");
  };

  return auth ? (
    <Products user={auth.user} onLogout={handleLogout} />
  ) : screen === "signup" ? (
    <Signup onSignup={handleSignup} onShowLogin={() => setScreen("login")} />
  ) : (
    <Login
      onLogin={handleLogin}
      onShowSignup={() => { setSignupMessage(""); setScreen("signup"); }}
      message={signupMessage}
    />
  );
}
