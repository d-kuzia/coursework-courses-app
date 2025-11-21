import { useAuth } from "../context/AuthContext";
import { useI18n } from "../hooks/useI18n";

export default function Profile() {
  const { user, logout, loading } = useAuth();
  const { t } = useI18n();

  if (loading) return <div className="card">{t("common.loading")}</div>;
  if (!user) return <div className="card">{t("profile.notAuthenticated")}</div>;

  return (
    <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
      <div className="stack">
        <h1 className="title">{t("profile.title")}</h1>
        <div className="stack">
          <div>
            <strong>{t("profile.name")}:</strong> {user.name}
          </div>
          <div>
            <strong>{t("profile.email")}:</strong> {user.email}
          </div>
          <div>
            <strong>{t("profile.role")}:</strong> {user.role}
          </div>
        </div>
        <button className="button button-ghost" onClick={logout}>
          {t("nav.logout")}
        </button>
      </div>
    </div>
  );
}
