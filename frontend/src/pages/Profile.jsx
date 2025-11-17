import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, logout, loading } = useAuth();

  if (loading) return <div className="p-6">Завантаження...</div>;
  if (!user) return <div className="p-6">Ви не увійшли в систему.</div>;

  return (
    <div className="max-w-md mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-2">Профіль</h1>
      <div>
        <b>Імʼя:</b> {user.name}
      </div>
      <div>
        <b>Email:</b> {user.email}
      </div>
      <div>
        <b>Роль:</b> {user.role}
      </div>
      <button className="mt-4 border px-4 py-2 rounded" onClick={logout}>
        Вийти
      </button>
    </div>
  );
}
