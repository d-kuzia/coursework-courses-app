import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getCourses,
  createCourse,
  deleteCourse as apiDeleteCourse
} from "../api/courses";
import CourseForm from "./CourseForm";

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const canEdit = user?.role === "ADMIN" || user?.role === "TEACHER";

  useEffect(() => {
    getCourses()
      .then((data) => setCourses(data.courses || []))
      .catch((err) => setError(err.message || "Не вдалося завантажити"))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(dto) {
    const created = await createCourse(dto);
    setCourses((prev) => [created.course, ...prev]);
    setShowCreate(false);
  }

  async function handleDelete(id) {
    if (!window.confirm("Видалити курс?")) return;
    await apiDeleteCourse(id);
    setCourses((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="stack-lg">
      <div className="flex-between">
        <div>
          <h1 className="title" style={{ marginBottom: 4 }}>
            Курси
          </h1>
          <p className="subtitle">Список доступних курсів</p>
        </div>
        {canEdit && (
          <button className="button" onClick={() => setShowCreate((v) => !v)}>
            {showCreate ? "Скасувати" : "Створити курс"}
          </button>
        )}
      </div>

      {error && <div className="alert">{error}</div>}
      {loading && <div className="card">Завантаження...</div>}

      {showCreate && <CourseForm submitLabel="Створити" onSubmit={handleCreate} />}

      <div className="grid-courses">
        {courses.map((course) => (
          <div key={course.id} className="card course-card">
            <div>
              <Link to={`/courses/${course.id}`} className="title" style={{ fontSize: 18 }}>
                {course.title}
              </Link>
              <p className="muted" style={{ marginTop: 6 }}>
                {course.description || "Без опису"}
              </p>
              <p className="muted" style={{ marginTop: 4, fontSize: 13 }}>
                Викладач: {course.teacher_name || "—"}
              </p>
              <p className="muted" style={{ marginTop: 4, fontSize: 13 }}>
                Модулі: {course.module_count ?? 0} · Уроки: {course.lesson_count ?? 0}
              </p>
            </div>
            {canEdit && (
              <div className="course-actions">
                <Link to={`/courses/${course.id}`} className="button button-ghost">
                  Редагувати
                </Link>
                <button className="button button-danger" onClick={() => handleDelete(course.id)}>
                  Видалити
                </button>
              </div>
            )}
          </div>
        ))}
        {!loading && !courses.length && (
          <div className="card text-center muted">Немає курсів.</div>
        )}
      </div>
    </div>
  );
}
