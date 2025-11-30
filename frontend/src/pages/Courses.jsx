import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../hooks/useI18n";
import { getCourses, createCourse } from "../api/courses";
import CourseForm from "./CourseForm";

const LIMIT = 12;

export default function Courses() {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const canCreateCourse = user?.role === "ADMIN" || user?.role === "TEACHER";

  const loadCourses = useCallback(() => {
    setLoading(true);
    setError("");
    getCourses({ page, limit: LIMIT, search })
      .then((data) => {
        setCourses(data.courses || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      })
      .catch((err) => setError(err.message || t("courses.loadError")))
      .finally(() => setLoading(false));
  }, [page, search, t]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  function handleClearSearch() {
    setSearchInput("");
    setSearch("");
    setPage(1);
  }

  async function handleCreate(dto) {
    const created = await createCourse(dto);
    setShowCreate(false);
    setPage(1);
    setSearch("");
    setSearchInput("");
    loadCourses();
  }

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
      <div className="card">
        <div className="flex-between">
          <div>
            <h1 className="title" style={{ marginBottom: 4 }}>
              {t("courses.title")}
            </h1>
            <p className="subtitle">{t("courses.subtitle")}</p>
          </div>
          {canCreateCourse && (
            <button className="button button-wide" onClick={() => setShowCreate((v) => !v)}>
              {showCreate ? t("common.cancel") : t("courses.createCourse")}
            </button>
          )}
        </div>
      </div>

      {showCreate && <CourseForm submitLabel={t("courses.submitCreate")} onSubmit={handleCreate} />}

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          className="input search-input"
          placeholder={t("courses.searchPlaceholder")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit" className="button">
          {t("courses.searchButton")}
        </button>
        {search && (
          <button type="button" className="button button-ghost" onClick={handleClearSearch}>
            {t("courses.clearSearch")}
          </button>
        )}
      </form>

      {search && (
        <div className="search-results-info">
          {t("courses.searchResults", { count: total, query: search })}
        </div>
      )}

      {error && <div className="alert">{error}</div>}
      {loading && <div className="card">{t("common.loading")}</div>}

      <div className="grid-courses">
        {courses.map((course) => (
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
              <span className="course-card-meta-item">
                {course.quiz_count ?? 0} {t("courses.quizzes")}
              </span>
            </div>
          </div>
        ))}
      </div>

      {!loading && !courses.length && (
        <div className="card empty-state">
          <div className="empty-state-title">
            {search ? t("courses.noSearchResults") : t("courses.empty")}
          </div>
          <div className="empty-state-text">
            {search ? t("courses.tryAnotherSearch") : t("courses.emptyHint")}
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="button button-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            {t("courses.prevPage")}
          </button>
          <span className="pagination-info">
            {t("courses.pageInfo", { page, totalPages })}
          </span>
          <button
            className="button button-sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            {t("courses.nextPage")}
          </button>
        </div>
      )}
    </div>
  );
}
