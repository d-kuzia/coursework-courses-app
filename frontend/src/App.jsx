import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";

// сторінки
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import Courses from "./pages/Courses.jsx";
import CourseDetails from "./pages/CourseDetails.jsx";
import Lesson from "./pages/Lesson.jsx";
import MyCourses from "./pages/MyCourses.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";

// старі API
import { getHealth, getDbCheck } from "./api";

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
    <div className="card stack">
      <h1 className="title">Online Courses — MVP</h1>
      <p className="subtitle">{status}</p>
      <p className="subtitle">{dbStatus}</p>
    </div>
  );
}

function NavBar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className={location.pathname === "/" ? "active" : ""}>
        Головна
      </Link>
      <Link
        to="/courses"
        className={location.pathname.startsWith("/courses") ? "active" : ""}
      >
        Курси
      </Link>
      {user && (
        <Link
          to="/my-courses"
          className={location.pathname.startsWith("/my-courses") ? "active" : ""}
        >
          Мої курси
        </Link>
      )}
      {user?.role === "ADMIN" && (
        <Link
          to="/admin"
          className={location.pathname.startsWith("/admin") ? "active" : ""}
        >
          Admin Panel
        </Link>
      )}
      <div className="navbar-spacer" />

      {!user && (
        <>
          <Link to="/login">Вхід</Link>
          <Link to="/register">Реєстрація</Link>
        </>
      )}

      {user && (
        <>
          <Link to="/profile">Профіль</Link>
          <button className="button button-ghost" onClick={logout}>
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

      <div className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/lessons/:id" element={<Lesson />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

