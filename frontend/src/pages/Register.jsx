import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
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
      setErr(e.message || "Помилка реєстрації");
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
      <div className="stack">
        <h1 className="title">Реєстрація</h1>
        {err && <div className="alert">{err}</div>}
        <form className="stack" onSubmit={handleSubmit}>
          <div className="stack">
            <label className="label">Ім'я</label>
            <input
              className="input"
              placeholder="Ваше ім'я"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="stack">
            <label className="label">Email</label>
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
            <label className="label">Пароль (мін. 8 символів)</label>
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
            Створити акаунт
          </button>
        </form>
      </div>
    </div>
  );
}
