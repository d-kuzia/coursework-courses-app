import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../hooks/useI18n";

export default function Register() {
  const { register } = useAuth();
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await register(name, email, password);
    } catch (e) {
      setErr(e.message || t("auth.registerError"));
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
      <div className="stack">
        <h1 className="title">{t("auth.registerTitle")}</h1>
        {err && <div className="alert">{err}</div>}
        <form className="stack" onSubmit={handleSubmit}>
          <div className="stack">
            <label className="label">{t("auth.nameLabel")}</label>
            <input
              className="input"
              placeholder={t("auth.namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
            <label className="label">{t("auth.passwordHint")}</label>
            <input
              className="input"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="button" style={{ width: "100%" }}>
            {t("auth.createAccount")}
          </button>
        </form>
      </div>
    </div>
  );
}
