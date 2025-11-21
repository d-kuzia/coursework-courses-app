import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../hooks/useI18n";
import {
  getCourses,
  createCourse,
  deleteCourse as apiDeleteCourse
} from "../api/courses";
import CourseForm from "./CourseForm";

export default function Courses() {
  const { user } = useAuth();
  const { t } = useI18n();
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

  async function handleDelete(id) {
    if (!window.confirm(t("courses.confirmDelete"))) return;
    await apiDeleteCourse(id);
    setCourses((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="stack-lg">
      <div className="flex-between">
        <div>
          <h1 className="title" style={{ marginBottom: 4 }}>
            {t("courses.title")}
          </h1>
          <p className="subtitle">{t("courses.subtitle")}</p>
        </div>
        {canCreateCourse && (
          <button className="button" onClick={() => setShowCreate((v) => !v)}>
            {showCreate ? t("common.cancel") : t("courses.createCourse")}
          </button>
        )}
      </div>

      {error && <div className="alert">{error}</div>}
      {loading && <div className="card">{t("common.loading")}</div>}

      {showCreate && <CourseForm submitLabel={t("courses.submitCreate")} onSubmit={handleCreate} />}

      <div className="grid-courses">
        {courses.map((course) => {
          const canEditCourse =
            user?.role === "ADMIN" ||
            (user?.role === "TEACHER" && course.teacher_id === user.id);

          return (
            <div key={course.id} className="card course-card">
              <div>
                <Link to={`/courses/${course.id}`} className="title" style={{ fontSize: 18 }}>
                  {course.title}
                </Link>
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
              {canEditCourse && (
                <div className="course-actions">
                  <Link to={`/courses/${course.id}`} className="button button-ghost">
                    {t("common.edit")}
                  </Link>
                  <button className="button button-danger" onClick={() => handleDelete(course.id)}>
                    {t("common.delete")}
                  </button>
                </div>
              )}
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
