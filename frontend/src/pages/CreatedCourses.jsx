import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCourses } from "../api/courses";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../hooks/useI18n";

export default function CreatedCourses() {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const isTeacher = user?.role === "TEACHER";

  useEffect(() => {
    if (!user || !isTeacher) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    getCourses()
      .then((data) => {
        const ownCourses =
          (data.courses || []).filter((course) => course.teacher_id === user.id) || [];
        setCourses(ownCourses);
      })
      .catch((err) => setError(err.message || t("createdCourses.loadError")))
      .finally(() => setLoading(false));
  }, [user, isTeacher, t, refreshKey]);

  function handleCardNavigate(courseId) {
    navigate(`/courses/${courseId}`);
  }

  function handleCardKeyDown(event, courseId) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardNavigate(courseId);
    }
  }

  if (!user) {
    return <div className="card">{t("createdCourses.loginPrompt")}</div>;
  }

  if (!isTeacher) {
    return <div className="card">{t("createdCourses.notTeacher")}</div>;
  }

  if (loading) return <div className="card">{t("common.loading")}</div>;

  if (error) {
    return (
      <div className="card stack">
        <div className="alert">{error}</div>
        <button className="button button-ghost" onClick={() => setRefreshKey((key) => key + 1)}>
          {t("common.retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      <div className="card">
        <h1 className="title" style={{ marginBottom: 4 }}>
          {t("createdCourses.title")}
        </h1>
        <p className="subtitle">{t("createdCourses.subtitle")}</p>
      </div>

      <div className="grid-courses">
        {courses.map((course) => (
          <div
            key={course.id}
            className="card card-pressable card-link course-card"
            onClick={() => handleCardNavigate(course.id)}
            onKeyDown={(event) => handleCardKeyDown(event, course.id)}
            tabIndex={0}
          >
            <div>
              <p className="title" style={{ fontSize: 18, margin: 0 }}>
                {course.title}
              </p>
              <p className="muted" style={{ marginTop: 6 }}>
                {course.description || t("common.noDescription")}
              </p>
              <p className="muted" style={{ marginTop: 4, fontSize: 13 }}>
                {t("common.modulesLessons", {
                  modules: course.module_count ?? 0,
                  lessons: course.lesson_count ?? 0
                })}
              </p>
            </div>
          </div>
        ))}
        {!courses.length && (
          <div className="card text-center muted">{t("createdCourses.empty")}</div>
        )}
      </div>
    </div>
  );
}
