import express from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { query } from "../db.js";
import { signToken } from "../utils/jwt.js";
import auth from "../middleware/auth.js";

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Invalid data", issues: parsed.error.issues });
    }

    const { email, password, name } = parsed.data;

    const exists = await query("select 1 from users where email = $1", [email]);
    if (exists.rowCount) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await query(
      `insert into users (email, password_hash, name)
       values ($1, $2, $3)
       returning id, email, name, role`,
      [email, passwordHash, name]
    );

    const user = result.rows[0];
    const token = signToken({ sub: user.id, role: user.role });

    res.status(201).json({ token, user });
  } catch (err) {
    console.error("register error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Invalid data", issues: parsed.error.issues });
    }

    const { email, password } = parsed.data;

    const result = await query(
      "select id, email, name, role, password_hash from users where email = $1",
      [email]
    );

    if (!result.rowCount) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const u = result.rows[0];
    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = { id: u.id, email: u.email, name: u.name, role: u.role };
    const token = signToken({ sub: u.id, role: u.role });

    res.json({ token, user });
  } catch (err) {
    console.error("login error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/auth/me
router.get("/me", auth, async (req, res) => {
  try {
    const result = await query(
      "select id, email, name, role, created_at from users where id = $1",
      [req.user.id]
    );
    res.json({ user: result.rows[0] || null });
  } catch (err) {
    console.error("/me error", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
