import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../hooks/useI18n";
import { getCourses, createCourse } from "../api/courses";
import CourseForm from "./CourseForm";

export default function Courses() {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const canCreateCourse = user?.role === "ADMIN" || user?.role === "TEACHER";

  useEffect(() => {
    getCourses()
      .then((data) => setCourses(data.courses || []))
      .catch((err) => setError(err.message || t("courses.loadError")))
      .finally(() => setLoading(false));
  }, [t]);

  async function handleCreate(dto) {
    const created = await createCourse(dto);
    setCourses((prev) => [created.course, ...prev]);
    setShowCreate(false);
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

      {error && <div className="alert">{error}</div>}
      {loading && <div className="card">{t("common.loading")}</div>}

      {showCreate && <CourseForm submitLabel={t("courses.submitCreate")} onSubmit={handleCreate} />}

      <div className="grid-courses">
        {courses.map((course) => {
          return (
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
                  {t("common.teacherLine", { name: course.teacher_name || "—" })}
                </p>
                <p className="muted" style={{ marginTop: 4, fontSize: 13 }}>
                  {t("common.modulesLessons", {
                    modules: course.module_count ?? 0,
                    lessons: course.lesson_count ?? 0
                  })}
                </p>
              </div>
            </div>
          );
        })}
        {!loading && !courses.length && (
          <div className="card text-center muted">{t("courses.empty")}</div>
        )}
      </div>
    </div>
  );
}
