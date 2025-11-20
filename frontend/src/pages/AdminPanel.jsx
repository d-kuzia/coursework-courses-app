import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUsers, updateUser } from "../api/users";

const ROLE_OPTIONS = [
  { value: "USER", label: "USER" },
  { value: "TEACHER", label: "TEACHER" },
  { value: "ADMIN", label: "ADMIN" }
];

export default function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState("");

  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;

    setLoading(true);
    setError("");
    getUsers()
      .then((data) => setUsers(data.users || []))
      .catch(
        (err) =>
          setError(err.message || "Не вдалося завантажити користувачів")
      )
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "ADMIN") return <Navigate to="/" replace />;

  async function mutateUser(id, payload) {
    setError("");
    setUpdatingUserId(id);
    try {
      const result = await updateUser(id, payload);
      setUsers((prev) =>
        prev.map((account) => (account.id === id ? result.user : account))
      );
      return true;
    } catch (err) {
      setError(err.message || "Не вдалося оновити користувача");
      return false;
    } finally {
      setUpdatingUserId("");
    }
  }

  async function handleRoleChange(account, nextRole) {
    const previousRole = account.role;
    setUsers((prev) =>
      prev.map((item) =>
        item.id === account.id ? { ...item, role: nextRole } : item
      )
    );
    const ok = await mutateUser(account.id, { role: nextRole });
    if (!ok) {
      setUsers((prev) =>
        prev.map((item) =>
          item.id === account.id ? { ...item, role: previousRole } : item
        )
      );
    }
  }

  async function handleToggleActive(account) {
    const nextValue = !account.is_active;
    setUsers((prev) =>
      prev.map((item) =>
        item.id === account.id ? { ...item, is_active: nextValue } : item
      )
    );
    const ok = await mutateUser(account.id, { isActive: nextValue });
    if (!ok) {
      setUsers((prev) =>
        prev.map((item) =>
          item.id === account.id ? { ...item, is_active: !nextValue } : item
        )
      );
    }
  }

  return (
    <div className="stack-lg">
      <div>
        <h1 className="title">Admin Panel</h1>
        <p className="subtitle">Керування користувачами та ролями</p>
      </div>

      {error && <div className="alert">{error}</div>}
      {loading && <div className="card">Завантаження...</div>}

      {!loading && (
        <div className="stack">
          {users.map((account) => (
            <div
              key={account.id}
              className="card"
              style={{
                opacity: account.is_active ? 1 : 0.65,
                border: account.role === "ADMIN" ? "1px solid #4b73ff" : ""
              }}
            >
              <div className="flex-between" style={{ gap: 16 }}>
                <div>
                  <div className="title" style={{ fontSize: 18 }}>
                    {account.name}
                  </div>
                  <div className="muted" style={{ fontSize: 14 }}>
                    {account.email}
                  </div>
                </div>
                <div className="muted" style={{ fontSize: 14 }}>
                  {new Date(account.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="stack" style={{ marginTop: 12 }}>
                <label className="muted" style={{ fontSize: 13 }}>
                  Роль
                </label>
                <select
                  value={account.role}
                  onChange={(e) => handleRoleChange(account, e.target.value)}
                  disabled={updatingUserId === account.id}
                  className="input"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div
                className="flex-between"
                style={{ alignItems: "center", marginTop: 12, gap: 16 }}
              >
                <div className="muted" style={{ fontSize: 13 }}>
                  Статус: {account.is_active ? "Активний" : "Заблоковано"}
                </div>
                <button
                  className={
                    account.is_active ? "button button-danger" : "button"
                  }
                  disabled={updatingUserId === account.id}
                  onClick={() => handleToggleActive(account)}
                >
                  {account.is_active ? "Заблокувати" : "Активувати"}
                </button>
              </div>
            </div>
          ))}
          {!users.length && (
            <div className="card muted text-center">
              Ще немає користувачів.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
