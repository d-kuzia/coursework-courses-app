import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../hooks/useI18n";
import {
  getCourse,
  updateCourse,
  deleteCourse as apiDeleteCourse,
} from "../api/courses";
import { createModule } from "../api/modules";
import { createLesson } from "../api/lessons";
import {
  enrollInCourse,
  getMyCourses,
  getCourseEnrollments,
} from "../api/enrollments";
import CourseForm from "./CourseForm";

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const userId = user?.id;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("modules");

  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleError, setModuleError] = useState("");
  const [moduleLoading, setModuleLoading] = useState(false);

  const [lessonDrafts, setLessonDrafts] = useState({});

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollError, setEnrollError] = useState("");

  const [enrollments, setEnrollments] = useState([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [enrollmentsError, setEnrollmentsError] = useState("");

  useEffect(() => {
    setLoading(true);
    getCourse(id)
      .then((data) => setCourse(data.course))
      .catch((err) => setError(err.message || t("common.loadFailed")))
      .finally(() => setLoading(false));
  }, [id, t]);

  useEffect(() => {
    if (!user) {
      setIsEnrolled(false);
      return;
    }
    let cancelled = false;
    getMyCourses()
      .then((data) => {
        if (!cancelled) {
          const enrolled =
            data.courses?.some((item) => item.course_id === id) ?? false;
          setIsEnrolled(enrolled);
        }
      })
      .catch(() => {
        if (!cancelled) setIsEnrolled(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, id]);

  const isOwner = userId && course && course.teacher_id === userId;
  const canEdit =
    user?.role === "ADMIN" || (user?.role === "TEACHER" && isOwner);
  const canViewEnrollments = canEdit;

  async function handleUpdate(dto) {
    const updated = await updateCourse(id, dto);
    setCourse(updated.course);
    setEditing(false);
  }

  async function handleDelete() {
    if (!window.confirm(t("courses.confirmDelete"))) return;
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
              modules: [
                ...(prev.modules || []),
                { ...result.module, lessons: [] },
              ],
            }
          : prev
      );
      setModuleTitle("");
    } catch (err) {
      setModuleError(err.message || t("courseDetails.moduleCreateError"));
    } finally {
      setModuleLoading(false);
    }
  }

  function updateLessonDraft(moduleId, field, value) {
    setLessonDrafts((prev) => ({
      ...prev,
      [moduleId]: { ...(prev[moduleId] || {}), [field]: value },
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
        position: nextPosition,
      };
      const result = await createLesson(moduleId, payload);
      setCourse((prev) => {
        if (!prev) return prev;
        const modules = (prev.modules || []).map((m) =>
          m.id === moduleId
            ? { ...m, lessons: [...(m.lessons || []), result.lesson] }
            : m
        );
        return { ...prev, modules };
      });
      setLessonDrafts((prev) => ({
        ...prev,
        [moduleId]: { title: "", content: "", videoUrl: "" },
      }));
    } catch (err) {
      updateLessonDraft(
        moduleId,
        "error",
        err.message || t("courseDetails.lessonCreateError")
      );
    } finally {
      updateLessonDraft(moduleId, "loading", false);
    }
  }

  async function handleEnroll() {
    setEnrollError("");
    setEnrollLoading(true);
    try {
      await enrollInCourse(id);
      setIsEnrolled(true);
    } catch (err) {
      setEnrollError(err.message || t("courseDetails.enrollError"));
    } finally {
      setEnrollLoading(false);
    }
  }

  const loadEnrollments = useCallback(() => {
    if (!canViewEnrollments) return;

    setEnrollmentsLoading(true);
    setEnrollmentsError("");
    getCourseEnrollments(id)
      .then((data) => setEnrollments(data.enrollments || []))
      .catch((err) =>
        setEnrollmentsError(err.message || t("courseDetails.enrollmentsError"))
      )
      .finally(() => setEnrollmentsLoading(false));
  }, [canViewEnrollments, id, t]);

  useEffect(() => {
    if (activeTab === "students") {
      loadEnrollments();
    }
  }, [activeTab, loadEnrollments]);

  useEffect(() => {
    if (activeTab === "students" && !canViewEnrollments) {
      setActiveTab("modules");
    }
  }, [activeTab, canViewEnrollments]);

  if (loading) return <div className="card">{t("common.loading")}</div>;
  if (error) return <div className="card alert">{error}</div>;
  if (!course) return <div className="card">{t("common.notFound")}</div>;

  return (
    <div className="stack-lg">
      <div className="card">
        <div className="flex-between">
          <div>
            <h1 className="title" style={{ marginBottom: 4 }}>
              {course.title}
            </h1>
            <p className="muted">
              {t("common.teacherLine", { name: course.teacher_name || "—" })}
            </p>
          </div>
          {canEdit && (
            <div className="course-actions">
              <button
                className="button button-ghost"
                onClick={() => setEditing((v) => !v)}
              >
                {editing ? t("common.cancel") : t("common.edit")}
              </button>
              <button className="button button-danger" onClick={handleDelete}>
                {t("common.delete")}
              </button>
            </div>
          )}
        </div>
        <p
          className="subtitle"
          style={{ marginTop: 12, whiteSpace: "pre-line" }}
        >
          {course.description || t("common.noDescription")}
        </p>

        {user && (
          <div className="stack" style={{ marginTop: 16 }}>
            {isOwner && (
              <div className="pill pill-flat">
                {t("courseDetails.youTeach")}
              </div>
            )}
            {!isOwner && isEnrolled && (
              <div className="pill pill-flat">
                {t("courseDetails.alreadyEnrolled")}
              </div>
            )}
            {!isOwner && !isEnrolled && (
              <button
                className="button"
                onClick={handleEnroll}
                disabled={enrollLoading}
              >
                {enrollLoading
                  ? t("courseDetails.enrollLoading")
                  : t("courseDetails.enrollAction")}
              </button>
            )}
            {enrollError && <div className="alert">{enrollError}</div>}
          </div>
        )}

        {canViewEnrollments && (
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <button
              className={`button button-ghost${
                activeTab === "modules" ? " active" : ""
              }`}
              onClick={() => setActiveTab("modules")}
            >
              {t("courseDetails.tabStructure")}
            </button>
            <button
              className={`button button-ghost${
                activeTab === "students" ? " active" : ""
              }`}
              onClick={() => setActiveTab("students")}
            >
              {t("courseDetails.tabStudents")}
            </button>
          </div>
        )}

        {activeTab === "students" && canViewEnrollments && (
          <div className="card stack" style={{ marginTop: 16 }}>
            <h2 className="title" style={{ fontSize: 20 }}>
              {t("courseDetails.studentsTitle")}
            </h2>
            {enrollmentsLoading && <div>{t("common.loading")}</div>}
            {enrollmentsError && (
              <div className="alert">{enrollmentsError}</div>
            )}
            {!enrollmentsLoading && !enrollments.length && (
              <div className="muted">{t("courseDetails.noEnrollments")}</div>
            )}
            {enrollments.map((enrollment) => {
              const progressValue = Math.min(Math.max(enrollment.progress ?? 0, 0), 100);
              const isCompleted = progressValue >= 100;
              
              return (
                <div key={enrollment.id} className="card stack-sm">
                  <div className="flex-between">
                    <div>
                      <div className="title-sm">{enrollment.name}</div>
                      <div className="muted">{enrollment.email}</div>
                    </div>
                    <span className={`status-badge ${enrollment.status?.toLowerCase()}`}>
                      {enrollment.status}
                    </span>
                  </div>
                  <div className="progress-bar sm">
                    <div 
                      className={`progress-bar-fill ${isCompleted ? "success" : ""}`}
                      style={{ width: `${progressValue}%` }}
                    />
                  </div>
                  <div className="flex-between">
                    <span className="muted">{enrollment.role}</span>
                    <span className={`progress-value ${isCompleted ? "completed" : ""}`} style={{ fontSize: 14 }}>
                      {progressValue}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editing && (
        <CourseForm
          initialData={course}
          submitLabel={t("courseDetails.updateCourse")}
          onSubmit={handleUpdate}
        />
      )}

      {activeTab === "modules" && (
        <div className="card stack">
          {!user ? (
            <div
              className="stack"
              style={{ textAlign: "center", padding: "2rem 0" }}
            >
              <h2 className="title" style={{ fontSize: 20, marginBottom: 8 }}>
                {t("courseDetails.authRequired")}
              </h2>
              <p className="muted" style={{ marginBottom: 24 }}>
                {t("courseDetails.authRequiredDescription")}
              </p>
              <div
                style={{ display: "flex", gap: 12, justifyContent: "center" }}
              >
                <Link to="/login" className="button">
                  {t("nav.login")}
                </Link>
                <Link to="/register" className="button button-ghost">
                  {t("nav.register")}
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-between">
                <h2 className="title" style={{ fontSize: 20 }}>
                  {t("courseDetails.modulesTitle")}
                </h2>
                {canEdit && (
                  <form
                    style={{ display: "flex", gap: 8 }}
                    onSubmit={handleCreateModule}
                  >
                    <input
                      className="input"
                      placeholder={t("courseDetails.modulePlaceholder")}
                      value={moduleTitle}
                      onChange={(e) => setModuleTitle(e.target.value)}
                      required
                    />
                    <button className="button" disabled={moduleLoading}>
                      {moduleLoading
                        ? t("courseDetails.moduleCreating")
                        : t("courseDetails.addModule")}
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
                            {t("courseDetails.lessonsCount", {
                              count: module.lessons?.length || 0,
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="stack">
                        {(module.lessons || []).map((lesson) => (
                          <Link
                            key={lesson.id}
                            to={`/lessons/${lesson.id}`}
                            className="card card-pressable"
                          >
                            <div className="title" style={{ fontSize: 16 }}>
                              {lesson.title}
                            </div>
                          </Link>
                        ))}
                        {!module.lessons?.length && (
                          <div className="muted" style={{ fontSize: 14 }}>
                            {t("courseDetails.noLessons")}
                          </div>
                        )}
                      </div>

                      {canEdit && (
                        <form
                          className="stack"
                          onSubmit={(e) => handleCreateLesson(e, module.id)}
                        >
                          {draft.error && (
                            <div className="alert">{draft.error}</div>
                          )}
                          <input
                            className="input"
                            placeholder={t(
                              "courseDetails.lessonTitlePlaceholder"
                            )}
                            value={draft.title || ""}
                            onChange={(e) =>
                              updateLessonDraft(
                                module.id,
                                "title",
                                e.target.value
                              )
                            }
                            required
                          />
                          <input
                            className="input"
                            placeholder={t(
                              "courseDetails.lessonVideoPlaceholder"
                            )}
                            value={draft.videoUrl || ""}
                            onChange={(e) =>
                              updateLessonDraft(
                                module.id,
                                "videoUrl",
                                e.target.value
                              )
                            }
                          />
                          <textarea
                            className="input textarea"
                            rows={3}
                            placeholder={t(
                              "courseDetails.lessonDescriptionPlaceholder"
                            )}
                            value={draft.content || ""}
                            onChange={(e) =>
                              updateLessonDraft(
                                module.id,
                                "content",
                                e.target.value
                              )
                            }
                          />
                          <button className="button" disabled={draft.loading}>
                            {draft.loading
                              ? t("courseDetails.lessonSaving")
                              : t("courseDetails.addLesson")}
                          </button>
                        </form>
                      )}
                    </div>
                  );
                })}

                {!course.modules?.length && (
                  <div className="muted" style={{ fontSize: 14 }}>
                    {t("courseDetails.noModules")}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
