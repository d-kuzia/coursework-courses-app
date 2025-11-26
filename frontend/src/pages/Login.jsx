import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../hooks/useI18n";

export default function Login() {
  const { login } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await login(email, password);
      navigate("/profile");
    } catch (e) {
      setErr(e.message || t("auth.loginError"));
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
      <div className="stack">
        <h1 className="title">{t("auth.loginTitle")}</h1>
        {err && <div className="alert">{err}</div>}
        <form className="stack" onSubmit={handleSubmit}>
          <div className="stack">
            <label className="label">{t("auth.emailLabel")}</label>
            <input
              className="input"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="stack">
            <label className="label">{t("auth.passwordLabel")}</label>
            <input
              className="input"
              type="password"
              placeholder={t("auth.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="button" style={{ width: "100%" }}>
            {t("auth.loginButton")}
          </button>
        </form>
      </div>
    </div>
  );
}
