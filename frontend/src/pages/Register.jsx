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
    <div className="max-w-sm mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Реєстрація</h1>
      {err && <div className="text-red-600 text-sm">{err}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="border rounded w-full p-2"
          placeholder="Ім'я"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border rounded w-full p-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border rounded w-full p-2"
          type="password"
          placeholder="Пароль (мін. 8 символів)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded w-full">
          Створити акаунт
        </button>
      </form>
    </div>
  );
}
