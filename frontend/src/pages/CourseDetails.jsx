import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getCourse,
  updateCourse,
  deleteCourse as apiDeleteCourse
} from "../api/courses";
import CourseForm from "./CourseForm";

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  const canEdit =
    user?.role === "ADMIN" ||
    (user?.role === "TEACHER" && course && course.teacher_id === user.id);

  useEffect(() => {
    setLoading(true);
    getCourse(id)
      .then((data) => setCourse(data.course))
      .catch((err) => setError(err.message || "Не вдалося завантажити"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleUpdate(dto) {
    const updated = await updateCourse(id, dto);
    setCourse(updated.course);
    setEditing(false);
  }

  async function handleDelete() {
    if (!window.confirm("Видалити курс?")) return;
    await apiDeleteCourse(id);
    navigate("/courses");
  }

  if (loading) return <div className="card">Завантаження...</div>;
  if (error) return <div className="card alert">{error}</div>;
  if (!course) return <div className="card">Не знайдено</div>;

  return (
    <div className="stack-lg">
      <div className="card">
        <div className="flex-between">
          <div>
            <h1 className="title" style={{ marginBottom: 4 }}>
              {course.title}
            </h1>
            <p className="muted">Викладач: {course.teacher_name || "—"}</p>
          </div>
          {canEdit && (
            <div className="course-actions">
              <button className="button button-ghost" onClick={() => setEditing((v) => !v)}>
                {editing ? "Скасувати" : "Редагувати"}
              </button>
              <button className="button button-danger" onClick={handleDelete}>
                Видалити
              </button>
            </div>
          )}
        </div>
        <p className="subtitle" style={{ marginTop: 12, whiteSpace: "pre-line" }}>
          {course.description || "Без опису"}
        </p>
      </div>

      {editing && (
        <CourseForm
          initialData={course}
          submitLabel="Оновити"
          onSubmit={handleUpdate}
        />
      )}
    </div>
  );
}
