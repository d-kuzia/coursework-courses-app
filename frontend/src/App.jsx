import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";
import { useI18n } from "./hooks/useI18n";
import { useTheme } from "./context/ThemeContext";
import { LANG_OPTIONS } from "./i18n/config";
import { getCourses } from "./api/courses";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import Courses from "./pages/Courses.jsx";
import CourseDetails from "./pages/CourseDetails.jsx";
import Lesson from "./pages/Lesson.jsx";
import MyCourses from "./pages/MyCourses.jsx";
import CreatedCourses from "./pages/CreatedCourses.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";

import Footer from "./components/Footer.jsx";

function Home() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [latestCourses, setLatestCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCourses({ page: 1, limit: 6 })
      .then((data) => {
        const courses = Array.isArray(data.courses) ? data.courses : [];
        setLatestCourses(courses.slice(0, 6));
      })
      .catch(() => {
        setLatestCourses([]);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleCardNavigate(courseId) {
    navigate(`/courses/${courseId}`);
  }

  function handleCardKeyDown(event, courseId) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardNavigate(courseId);
    }
  }

  return (
    <div className="stack-lg">
      <div className="card hero-section">
        <div className="hero-content">
          <h1 className="hero-title">{t("home.heroTitle")}</h1>
          <p className="hero-subtitle">{t("home.heroSubtitle")}</p>
          <div className="hero-actions">
            <Link to="/courses" className="button">
              {t("home.browseCourses")}
            </Link>
            {user && (
              <Link to="/my-courses" className="button button-ghost">
                {t("home.startLearning")}
              </Link>
            )}
            {!user && (
              <Link to="/register" className="button button-ghost">
                {t("nav.register")}
              </Link>
            )}
          </div>
        </div>
      </div>

      {loading && (
        <div className="card">
          <p className="text-center">{t("common.loading")}</p>
        </div>
      )}

      {!loading && latestCourses.length > 0 && (
        <div className="stack">
          <div className="flex-between">
            <h2 className="title">{t("home.latestCourses")}</h2>
            <Link to="/courses" className="button button-ghost button-sm">
              {t("home.viewAll")}
            </Link>
          </div>
          <div className="grid-courses">
            {latestCourses.map((course) => (
              <div
                key={course.id}
                className="card card-pressable card-link course-card"
                onClick={() => handleCardNavigate(course.id)}
                onKeyDown={(event) => handleCardKeyDown(event, course.id)}
                tabIndex={0}
              >
                <h3 className="course-card-title">{course.title}</h3>
                <p className="course-card-description">
                  {course.description || t("common.noDescription")}
                </p>
                <div className="course-card-meta">
                  <span className="course-card-meta-item">
                    {course.teacher_name || "—"}
                  </span>
                  <span className="course-card-meta-item">
                    {course.module_count ?? 0} {t("courses.modules")}
                  </span>
                  <span className="course-card-meta-item">
                    {course.lesson_count ?? 0} {t("courses.lessons")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && latestCourses.length === 0 && (
        <div className="card empty-state">
          <div className="empty-state-title">{t("home.noCourses")}</div>
        </div>
      )}
    </div>
  );
}

function NavBar() {
  const location = useLocation();
  const { user } = useAuth();
  const { t, lang, setLang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const languageOptions = LANG_OPTIONS;
  const safeIndex = languageOptions.findIndex(
    (option) => option.value === lang
  );
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
            className={
              location.pathname.startsWith("/created-courses") ? "active" : ""
            }
          >
            {t("nav.createdCourses")}
          </Link>
        )}
        {user && (
          <Link
            to="/my-courses"
            className={
              location.pathname.startsWith("/my-courses") ? "active" : ""
            }
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

        <Footer />
      </div>
    </BrowserRouter>
  );
}
