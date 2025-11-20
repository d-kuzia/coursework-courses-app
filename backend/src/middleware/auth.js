import { verifyToken } from "../utils/jwt.js";
import { query } from "../db.js";

export default async function auth(req, res, next) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = h.slice(7);
  let payload;
  try {
    payload = verifyToken(token); // { sub, role }
  } catch (e) {
    console.error("JWT error", e.message);
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    const result = await query(
      "select id, role, is_active from users where id = $1",
      [payload.sub]
    );
    if (!result.rowCount) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!result.rows[0].is_active) {
      return res.status(403).json({ message: "Account disabled" });
    }
    req.user = { id: result.rows[0].id, role: result.rows[0].role };
    next();
  } catch (err) {
    console.error("auth middleware error", err);
    res.status(500).json({ message: "Server error" });
  }
}
