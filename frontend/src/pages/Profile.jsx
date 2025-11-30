import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../hooks/useI18n";
import { getProfileStats } from "../api/enrollments";

export default function Profile() {
  const { user, logout, loading, updateProfile } = useAuth();
  const { t } = useI18n();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [nameError, setNameError] = useState("");
  const [nameSaving, setNameSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setNameValue(user.name || "");
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

  function handleStartEditName() {
    setEditingName(true);
    setNameValue(user?.name || "");
    setNameError("");
  }

  function handleCancelEditName() {
    setEditingName(false);
    setNameValue(user?.name || "");
    setNameError("");
  }

  async function handleSaveName(e) {
    e?.preventDefault();
    if (!nameValue.trim() || nameValue.trim().length < 2) {
      setNameError(t("profile.nameMinLength"));
      return;
    }

    setNameError("");
    setNameSaving(true);

    try {
      await updateProfile(nameValue.trim());
      setEditingName(false);
    } catch (err) {
      setNameError(err.message || t("profile.updateError"));
    } finally {
      setNameSaving(false);
    }
  }

  if (loading) return <div className="card">{t("common.loading")}</div>;
  if (!user) return <div className="card">{t("profile.notAuthenticated")}</div>;

  return (
    <div className="stack-lg">
      <div className="card profile-card">
        <div className="stack-lg">
          <div className="profile-header">
            <div>
              <h1 className="title">{t("profile.title")}</h1>
              <div className="profile-info">
                <div className="profile-info-item">
                  <span className="profile-info-label">{t("profile.name")}:</span>
                  {editingName ? (
                    <form className="profile-name-edit" onSubmit={handleSaveName}>
                      <input
                        type="text"
                        className="input"
                        value={nameValue}
                        onChange={(e) => setNameValue(e.target.value)}
                        placeholder={t("profile.namePlaceholder")}
                        disabled={nameSaving}
                        autoFocus
                        style={{ minWidth: "200px" }}
                      />
                      <div className="profile-name-actions">
                        <button
                          type="submit"
                          className="button button-sm"
                          disabled={nameSaving || !nameValue.trim()}
                        >
                          {nameSaving ? t("common.saving") : t("profile.saveName")}
                        </button>
                        <button
                          type="button"
                          className="button button-ghost button-sm"
                          onClick={handleCancelEditName}
                          disabled={nameSaving}
                        >
                          {t("profile.cancel")}
                        </button>
                      </div>
                      {nameError && <div className="alert alert-sm">{nameError}</div>}
                    </form>
                  ) : (
                    <>
                      <span className="profile-info-value">{user.name}</span>
                      <button
                        type="button"
                        className="button button-ghost button-sm"
                        onClick={handleStartEditName}
                        style={{ marginLeft: "12px" }}
                      >
                        {t("profile.editName")}
                      </button>
                    </>
                  )}
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

          <div className="profile-divider"></div>

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
