export async function getHealth() {
  const r = await fetch("/api/health");
  if (!r.ok) throw new Error("health failed");
  return r.json();
}

export async function getDbCheck() {
  const r = await fetch("/api/dbcheck");
  if (!r.ok) throw new Error("dbcheck failed");
  return r.json();
}
