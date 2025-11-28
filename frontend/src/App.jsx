import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "./context/AuthContext";
import { useI18n } from "./hooks/useI18n";
import { useTheme } from "./context/ThemeContext";
import { LANG_OPTIONS } from "./i18n/config";

// сторінки
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import Courses from "./pages/Courses.jsx";
import CourseDetails from "./pages/CourseDetails.jsx";
import Lesson from "./pages/Lesson.jsx";
import MyCourses from "./pages/MyCourses.jsx";
import CreatedCourses from "./pages/CreatedCourses.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";

// старі API
import { getHealth, getDbCheck } from "./api";

function Home() {
  const { t } = useI18n();
  const [backendStatus, setBackendStatus] = useState("loading");
  const [dbStatus, setDbStatus] = useState({ state: "loading", time: "" });

  useEffect(() => {
    let cancelled = false;
    getHealth()
      .then((d) => {
        if (!cancelled) setBackendStatus(d.ok ? "ok" : "fail");
      })
      .catch(() => {
        if (!cancelled) setBackendStatus("fail");
      });

    getDbCheck()
      .then((d) => {
        if (!cancelled) {
          setDbStatus(d.connected ? { state: "ok", time: d.time } : { state: "fail", time: "" });
        }
      })
      .catch(() => {
        if (!cancelled) setDbStatus({ state: "fail", time: "" });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const backendText = useMemo(() => {
    if (backendStatus === "loading") return t("common.loading");
    return backendStatus === "ok" ? t("home.backendOk") : t("home.backendFail");
  }, [backendStatus, t]);

  const databaseText = useMemo(() => {
    if (dbStatus.state === "loading") return t("common.loading");
    return dbStatus.state === "ok" ? t("home.dbOk", { time: dbStatus.time }) : t("home.dbFail");
  }, [dbStatus, t]);

  return (
    <div className="card stack">
      <h1 className="title">{t("home.title")}</h1>
      <p className="subtitle">{backendText}</p>
      <p className="subtitle">{databaseText}</p>
    </div>
  );
}

function NavBar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const languageOptions = LANG_OPTIONS;
  const safeIndex = languageOptions.findIndex((option) => option.value === lang);
  const hasOptions = languageOptions.length > 0;
  const currentLangIndex = safeIndex >= 0 ? safeIndex : 0;
  const nextLang = hasOptions
    ? languageOptions[(currentLangIndex + 1) % languageOptions.length]
    : { value: lang, label: lang?.toUpperCase?.() ?? "??" };

  function handleToggleLanguage() {
    if (!hasOptions) return;
    setLang(nextLang.value);
  }

  return (
    <nav className="navbar">
      <div className="neo-brand">
        <div>
          <p className="neo-brand-title">Coursecraft</p>
          <p className="neo-brand-subtitle">{t("nav.courses")}</p>
        </div>
      </div>

      <div className="navbar-links">
        <Link to="/" className={location.pathname === "/" ? "active" : ""}>
          {t("nav.home")}
        </Link>
        <Link
          to="/courses"
          className={location.pathname.startsWith("/courses") ? "active" : ""}
        >
          {t("nav.courses")}
        </Link>
        {user?.role === "TEACHER" && (
          <Link
            to="/created-courses"
            className={location.pathname.startsWith("/created-courses") ? "active" : ""}
          >
            {t("nav.createdCourses")}
          </Link>
        )}
        {user && (
          <Link
            to="/my-courses"
            className={location.pathname.startsWith("/my-courses") ? "active" : ""}
          >
            {t("nav.myCourses")}
          </Link>
        )}
        {user?.role === "ADMIN" && (
          <Link
            to="/admin"
            className={location.pathname.startsWith("/admin") ? "active" : ""}
          >
            {t("nav.admin")}
          </Link>
        )}
      </div>
      <div className="navbar-spacer" />

      <div className="navbar-actions">
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={t("nav.theme")}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          {theme === "dark" ? "Light" : "Dark"}
        </button>

        <button
          type="button"
          className="button button-ghost"
          onClick={handleToggleLanguage}
          aria-label={t("nav.language")}
        >
          {lang.toUpperCase()}
        </button>

        {!user && (
          <div className="navbar-auth">
            <Link to="/login" className="button button-ghost">
              {t("nav.login")}
            </Link>
            <Link to="/register" className="button">
              {t("nav.register")}
            </Link>
          </div>
        )}

        {user && (
          <div className="navbar-auth">
            <Link to="/profile" className="button button-ghost button-wide">
              {t("nav.profile")}
            </Link>
            <button className="button button-danger button-wide" onClick={logout}>
              {t("nav.logout")}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
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
            <Route path="/created-courses" element={<CreatedCourses />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
