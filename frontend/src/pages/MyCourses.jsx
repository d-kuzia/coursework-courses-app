import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyCourses } from "../api/enrollments";
import { useAuth } from "../context/AuthContext";

export default function MyCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    getMyCourses()
      .then((data) => setCourses(data.courses || []))
      .catch((err) => setError(err.message || "Не вдалося завантажити курси"))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return <div className="card">Будь ласка, увійдіть, щоб бачити свої курси.</div>;
  }

  if (loading) return <div className="card">Завантаження...</div>;
  if (error) return <div className="card alert">{error}</div>;

  return (
    <div className="stack-lg">
      <div className="card">
        <h1 className="title" style={{ marginBottom: 4 }}>
          Мої курси
        </h1>
        <p className="subtitle">Курси, на які ви записалися</p>
      </div>

      <div className="grid-courses">
        {courses.map((course) => (
          <div key={course.enrollment_id} className="card course-card">
            <div>
              <Link to={`/courses/${course.course_id}`} className="title" style={{ fontSize: 18 }}>
                {course.title}
              </Link>
              <p className="muted" style={{ marginTop: 6 }}>
                {course.description || "Без опису"}
              </p>
              <p className="muted" style={{ marginTop: 4, fontSize: 13 }}>
                Викладач: {course.teacher_name || "—"}
              </p>
              <p className="muted" style={{ marginTop: 4, fontSize: 13 }}>
                Статус: {course.status}
              </p>
            </div>
            <div style={{ marginTop: 8 }}>
              <div className="muted" style={{ fontSize: 13, marginBottom: 4 }}>
                Прогрес: {course.progress}%
              </div>
              <div
                style={{
                  height: 8,
                  borderRadius: 999,
                  background: "#e5e7eb",
                  overflow: "hidden"
                }}
              >
                <div
                  style={{
                    width: `${Math.min(Math.max(course.progress, 0), 100)}%`,
                    background: "#2563eb",
                    height: "100%"
                  }}
                />
              </div>
            </div>
          </div>
        ))}
        {!courses.length && (
          <div className="card text-center muted">Ви ще не записані на курси.</div>
        )}
      </div>
    </div>
  );
}
