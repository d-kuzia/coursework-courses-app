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
        {courses.map((course) => (
          <div
            key={course.enrollment_id}
            className="card card-pressable card-link course-card"
            onClick={() => handleCardNavigate(course.course_id)}
            onKeyDown={(event) => handleCardKeyDown(event, course.course_id)}
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
                {t("common.status")}: {course.status}
              </p>
            </div>
            <div style={{ marginTop: 8 }}>
              <div className="muted" style={{ fontSize: 13, marginBottom: 4 }}>
                {t("common.progressLine", { value: course.progress })}
              </div>
              <div
                style={{
                  height: 8,
                  borderRadius: 999,
                  background: "#e5e7eb",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(Math.max(course.progress, 0), 100)}%`,
                    background: "#2563eb",
                    height: "100%",
                  }}
                />
              </div>
            </div>
            {course.progress >= 100 && (
              <div style={{ marginTop: 12 }}>
                <button
                  type="button"
                  className="button"
                  onClick={(event) => handleCertificateDownload(event, course)}
                  onKeyDown={(event) => event.stopPropagation()}
                  disabled={downloadingCourseId === course.course_id}
                  style={{ width: "100%", marginTop: 8 }}
                >
                  {downloadingCourseId === course.course_id
                    ? t("myCourses.certificateLoading")
                    : t("myCourses.certificateAction")}
                </button>
              </div>
            )}
          </div>
        ))}
        {!courses.length && (
          <div className="card text-center muted">{t("myCourses.empty")}</div>
        )}
      </div>
    </div>
  );
}
