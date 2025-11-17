import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// сторінки
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";

// старі API
import { getHealth, getDbCheck } from "./api";
import { useEffect, useState } from "react";

function Home() {
  const [status, setStatus] = useState("loading...");
  const [dbStatus, setDbStatus] = useState("loading...");

  useEffect(() => {
    getHealth()
      .then((d) => setStatus(d.ok ? "backend: OK" : "backend: FAIL"))
      .catch(() => setStatus("backend: FAIL"));

    getDbCheck()
      .then((d) => setDbStatus(d.connected ? `db: OK(${d.time})` : "db: FAIL"))
      .catch(() => setDbStatus("db: FAIL"));
  }, []);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <h1>Online Courses — MVP</h1>
      <p>{status}</p>
      <p>{dbStatus}</p>
    </div>
  );
}

function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav
      style={{
        padding: "10px 20px",
        borderBottom: "1px solid #ddd",
        marginBottom: 20,
        display: "flex",
        gap: 20,
        fontSize: 18
      }}
    >
      <Link to="/">Головна</Link>

      {!user && (
        <>
          <Link to="/login">Вхід</Link>
          <Link to="/register">Реєстрація</Link>
        </>
      )}

      {user && (
        <>
          <Link to="/profile">Профіль</Link>
          <button
            onClick={logout}
            style={{
              background: "transparent",
              border: "none",
              color: "red",
              cursor: "pointer",
              fontSize: 16
            }}
          >
            Вийти
          </button>
        </>
      )}
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}
