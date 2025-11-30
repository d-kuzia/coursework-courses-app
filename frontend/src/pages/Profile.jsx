import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../hooks/useI18n";
import { getProfileStats } from "../api/enrollments";

export default function Profile() {
  const { user, logout, loading } = useAuth();
  const { t } = useI18n();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    if (user) {
      setStatsLoading(true);
      setStatsError("");
      getProfileStats()
        .then((data) => {
          setStats(data);
        })
        .catch((err) => {
          setStatsError(err.message || t("profile.statsError"));
        })
        .finally(() => {
          setStatsLoading(false);
        });
    }
  }, [user, t]);

  if (loading) return <div className="card">{t("common.loading")}</div>;
  if (!user) return <div className="card">{t("profile.notAuthenticated")}</div>;

  return (
    <div className="stack-lg">
      <div className="card profile-card">
        <div className="stack-lg">
          {/* Header з інформацією про користувача */}
          <div className="profile-header">
            <div>
              <h1 className="title">{t("profile.title")}</h1>
              <div className="profile-info">
                <div className="profile-info-item">
                  <span className="profile-info-label">{t("profile.name")}:</span>
                  <span className="profile-info-value">{user.name}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">{t("profile.email")}:</span>
                  <span className="profile-info-value">{user.email}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">{t("profile.role")}:</span>
                  <span className="profile-info-value">{user.role}</span>
                </div>
              </div>
            </div>
            <button className="button button-danger" onClick={logout}>
              {t("nav.logout")}
            </button>
          </div>

          {/* Розділювач */}
          <div className="profile-divider"></div>

          {/* Статистика */}
          {statsLoading && (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <p>{t("common.loading")}</p>
            </div>
          )}

          {statsError && (
            <div className="alert">{statsError}</div>
          )}

          {!statsLoading && !statsError && stats && (
            <div className="profile-stats">
              <h2 className="title-sm">{t("profile.statsTitle")}</h2>
              <div className="grid-stats">
                <div className="stat-card">
                  <div className="stat-value">{stats.totalCourses}</div>
                  <div className="stat-label">{t("profile.totalCourses")}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.completedCourses}</div>
                  <div className="stat-label">{t("profile.completedCourses")}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.totalLessons}</div>
                  <div className="stat-label">{t("profile.totalLessons")}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.completedLessons}</div>
                  <div className="stat-label">{t("profile.completedLessons")}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.avgProgress}%</div>
                  <div className="stat-label">{t("profile.avgProgress")}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
