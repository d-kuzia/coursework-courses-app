import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyCourses, downloadCertificate } from "../api/enrollments";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../hooks/useI18n";

export default function MyCourses() {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [certificateError, setCertificateError] = useState("");
  const [downloadingCourseId, setDownloadingCourseId] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    getMyCourses()
      .then((data) => setCourses(data.courses || []))
      .catch((err) => setError(err.message || t("myCourses.loadError")))
      .finally(() => setLoading(false));
  }, [user, t]);

  if (!user) {
    return <div className="card">{t("myCourses.loginPrompt")}</div>;
  }

  if (loading) return <div className="card">{t("common.loading")}</div>;
  if (error) return <div className="card alert">{error}</div>;

  function handleCardNavigate(courseId) {
    navigate(`/courses/${courseId}`);
  }

  function handleCardKeyDown(event, courseId) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardNavigate(courseId);
    }
  }

  function buildFileName(title) {
    const safe = (title || "course")
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/(^-|-$)/g, "");
    return `certificate-${safe || "course"}.pdf`;
  }

  async function handleCertificateDownload(event, course) {
    event.preventDefault();
    event.stopPropagation();
    setCertificateError("");
    setDownloadingCourseId(course.course_id);
    try {
      const blob = await downloadCertificate(course.course_id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = buildFileName(course.title);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setCertificateError(err.message || t("myCourses.certificateError"));
    } finally {
      setDownloadingCourseId(null);
    }
  }

  return (
    <div className="stack-lg">
      <div className="card">
        <h1 className="title" style={{ marginBottom: 4 }}>
          {t("myCourses.title")}
        </h1>
        <p className="subtitle">{t("myCourses.subtitle")}</p>
      </div>

      {certificateError && <div className="card alert">{certificateError}</div>}

      <div className="grid-courses">
        {courses.map((course) => {
          const progressValue = Math.min(Math.max(course.progress || 0, 0), 100);
          const isCompleted = progressValue >= 100;
          
          return (
            <div
              key={course.enrollment_id}
              className="card card-pressable card-link course-card"
              onClick={() => handleCardNavigate(course.course_id)}
              onKeyDown={(event) => handleCardKeyDown(event, course.course_id)}
              tabIndex={0}
            >
              <h3 className="course-card-title">{course.title}</h3>
              <p className="course-card-description">
                {course.description || t("common.noDescription")}
              </p>
              
              <div className="progress-bar">
                <div 
                  className={`progress-bar-fill ${isCompleted ? "success" : ""}`}
                  style={{ width: `${progressValue}%` }}
                />
              </div>

              <div className="course-card-meta">
                <span className="course-card-meta-item">
                  {course.teacher_name || "—"}
                </span>
                <span className="course-card-meta-item">
                  {progressValue}%
                </span>
                <span className={`status-badge ${course.status?.toLowerCase()}`}>
                  {course.status}
                </span>
              </div>

              {isCompleted && (
                <button
                  type="button"
                  className="button button-success certificate-btn"
                  onClick={(event) => handleCertificateDownload(event, course)}
                  onKeyDown={(event) => event.stopPropagation()}
                  disabled={downloadingCourseId === course.course_id}
                >
                  {downloadingCourseId === course.course_id
                    ? t("myCourses.certificateLoading")
                    : t("myCourses.certificateAction")}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {!courses.length && (
        <div className="card empty-state">
          <div className="empty-state-title">{t("myCourses.empty")}</div>
          <div className="empty-state-text">{t("myCourses.emptyHint")}</div>
        </div>
      )}
    </div>
  );
}
