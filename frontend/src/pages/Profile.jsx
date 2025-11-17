import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, logout, loading } = useAuth();

  if (loading) return <div className="card">Завантаження...</div>;
  if (!user) return <div className="card">Ви не увійшли в систему.</div>;

  return (
    <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
      <div className="stack">
        <h1 className="title">Профіль</h1>
        <div className="stack">
          <div><strong>Імʼя:</strong> {user.name}</div>
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Роль:</strong> {user.role}</div>
        </div>
        <button className="button button-ghost" onClick={logout}>
          Вийти
        </button>
      </div>
    </div>
  );
}
