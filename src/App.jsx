import { useEffect, useState } from "react";
import { loadAuth, saveAuth, clearAuth, login, logout } from "./api";
import Login from "./components/Login.jsx";
import Products from "./components/Products.jsx";

export default function App() {
  const [auth, setAuth] = useState(loadAuth());

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

  return auth ? (
    <Products user={auth.user} onLogout={handleLogout} />
  ) : (
    <Login onLogin={handleLogin} />
  );
}
