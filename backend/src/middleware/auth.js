import { verifyToken } from "../utils/jwt.js";

export default function auth(req, res, next) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = h.slice(7);
  try {
    const payload = verifyToken(token); // { sub, role }
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (e) {
    console.error("JWT error", e.message);
    res.status(401).json({ message: "Invalid token" });
  }
}
