import { useEffect, useState } from "react";
import { getHealth, getDbCheck } from "./api";

export default function App() {
  const [status, setStatus] = useState("loading...");
  const [dbStatus, setDbStatus] = useState("loading...");

  useEffect(() => {
    getHealth()
      .then((d) => setStatus(d.ok ? "backend: OK" : "backend: FAIL"))
      .catch(() => setStatus("backend: FAIL"));

    getDbCheck()
      .then((d) => setDbStatus(d.connected ? `db: OK(${d.time})` : "db: FAIL"))
      .catch(() => setDbStatus("db: FAIL"));
  }, []);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <h1>Online Courses — MVP</h1>
      <p>{status}</p>
      <p>{dbStatus}</p>
    </div>
  );
}
