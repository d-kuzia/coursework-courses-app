import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getCourse,
  updateCourse,
  deleteCourse as apiDeleteCourse
} from "../api/courses";
import { createModule } from "../api/modules";
import { createLesson } from "../api/lessons";
import CourseForm from "./CourseForm";

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleError, setModuleError] = useState("");
  const [moduleLoading, setModuleLoading] = useState(false);

  const [lessonDrafts, setLessonDrafts] = useState({});

  useEffect(() => {
    setLoading(true);
    getCourse(id)
      .then((data) => setCourse(data.course))
      .catch((err) => setError(err.message || "Не вдалося завантажити"))
      .finally(() => setLoading(false));
  }, [id]);

  const canEdit =
    user?.role === "ADMIN" ||
    (user?.role === "TEACHER" && course && course.teacher_id === user.id);

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

  async function handleCreateModule(e) {
    e.preventDefault();
    setModuleError("");
    setModuleLoading(true);
    try {
      const result = await createModule(id, { title: moduleTitle });
      setCourse((prev) =>
        prev
          ? {
              ...prev,
              modules: [...(prev.modules || []), { ...result.module, lessons: [] }]
            }
          : prev
      );
      setModuleTitle("");
    } catch (err) {
      setModuleError(err.message || "Не вдалося створити модуль");
    } finally {
      setModuleLoading(false);
    }
  }

  function updateLessonDraft(moduleId, field, value) {
    setLessonDrafts((prev) => ({
      ...prev,
      [moduleId]: { ...(prev[moduleId] || {}), [field]: value }
    }));
  }

  async function handleCreateLesson(e, moduleId) {
    e.preventDefault();
    const draft = lessonDrafts[moduleId] || {};
    if (!draft.title) return;
    updateLessonDraft(moduleId, "error", "");
    updateLessonDraft(moduleId, "loading", true);
    try {
      const module = course?.modules?.find((m) => m.id === moduleId);
      const nextPosition = (module?.lessons?.length || 0) + 1;
      const payload = {
        title: draft.title,
        content: draft.content || undefined,
        videoUrl: draft.videoUrl?.trim() || undefined,
        position: nextPosition
      };
      const result = await createLesson(moduleId, payload);
      setCourse((prev) => {
        if (!prev) return prev;
        const modules = (prev.modules || []).map((m) =>
          m.id === moduleId ? { ...m, lessons: [...(m.lessons || []), result.lesson] } : m
        );
        return { ...prev, modules };
      });
      setLessonDrafts((prev) => ({ ...prev, [moduleId]: { title: "", content: "", videoUrl: "" } }));
    } catch (err) {
      updateLessonDraft(moduleId, "error", err.message || "Не вдалося створити урок");
    } finally {
      updateLessonDraft(moduleId, "loading", false);
    }
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
        <CourseForm initialData={course} submitLabel="Оновити" onSubmit={handleUpdate} />
      )}

      <div className="card stack">
        <div className="flex-between">
          <h2 className="title" style={{ fontSize: 20 }}>
            Модулі
          </h2>
          {canEdit && (
            <form style={{ display: "flex", gap: 8 }} onSubmit={handleCreateModule}>
              <input
                className="input"
                placeholder="Назва модуля"
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                required
              />
              <button className="button" disabled={moduleLoading}>
                {moduleLoading ? "Створення..." : "Додати"}
              </button>
            </form>
          )}
        </div>
        {moduleError && <div className="alert">{moduleError}</div>}

        <div className="stack">
          {(course.modules || []).map((module) => {
            const draft = lessonDrafts[module.id] || {};
            return (
              <div key={module.id} className="card stack">
                <div className="flex-between">
                  <div>
                    <h3 className="title" style={{ fontSize: 18 }}>
                      {module.title}
                    </h3>
                    <p className="muted" style={{ fontSize: 13 }}>
                      Уроків: {module.lessons?.length || 0}
                    </p>
                  </div>
                </div>

                <div className="stack">
                  {(module.lessons || []).map((lesson) => (
                    <Link key={lesson.id} to={`/lessons/${lesson.id}`} className="card stack">
                      <div className="title" style={{ fontSize: 16 }}>
                        {lesson.title}
                      </div>
                      <div className="muted" style={{ fontSize: 13 }}>
                        Порядок: {lesson.position ?? 0}
                      </div>
                    </Link>
                  ))}
                  {!module.lessons?.length && (
                    <div className="muted" style={{ fontSize: 14 }}>
                      Уроків ще нема.
                    </div>
                  )}
                </div>

                {canEdit && (
                  <form className="stack" onSubmit={(e) => handleCreateLesson(e, module.id)}>
                    {draft.error && <div className="alert">{draft.error}</div>}
                    <input
                      className="input"
                      placeholder="Назва уроку"
                      value={draft.title || ""}
                      onChange={(e) => updateLessonDraft(module.id, "title", e.target.value)}
                      required
                    />
                    <input
                      className="input"
                      placeholder="YouTube URL (необов'язково)"
                      value={draft.videoUrl || ""}
                      onChange={(e) => updateLessonDraft(module.id, "videoUrl", e.target.value)}
                    />
                    <textarea
                      className="input textarea"
                      rows={3}
                      placeholder="Опис уроку"
                      value={draft.content || ""}
                      onChange={(e) => updateLessonDraft(module.id, "content", e.target.value)}
                    />
                    <button className="button" disabled={draft.loading}>
                      {draft.loading ? "Збереження..." : "Додати урок"}
                    </button>
                  </form>
                )}
              </div>
            );
          })}

          {!course.modules?.length && (
            <div className="muted" style={{ fontSize: 14 }}>
              Модулів ще нема.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
