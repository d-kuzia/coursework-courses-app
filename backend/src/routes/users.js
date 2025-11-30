import express from "express";
import { z } from "zod";
import auth from "../middleware/auth.js";
import { query } from "../db.js";

const router = express.Router();

const roleEnum = z.enum(["USER", "TEACHER", "ADMIN"]);

const userUpdateSchema = z
  .object({
    role: roleEnum.optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => data.role !== undefined || data.isActive !== undefined,
    "Nothing to update"
  );

router.use(auth);
router.use((req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
});

// GET /api/users
router.get("/users", async (_req, res) => {
  try {
    const result = await query(
      `select id,
              email,
              name,
              role,
              is_active,
              created_at,
              updated_at
       from users
       order by created_at desc`
    );
    res.json({ users: result.rows });
  } catch (err) {
    console.error("users list error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/users/:id
router.patch("/users/:id", async (req, res) => {
  const parsed = userUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid data", issues: parsed.error.issues });
  }

  if (req.params.id === req.user.id && parsed.data.isActive === false) {
    return res
      .status(400)
      .json({ message: "Cannot deactivate your own account" });
  }

  try {
    const fields = [];
    const values = [];
    let idx = 1;

    if (parsed.data.role !== undefined) {
      fields.push(`role = $${idx++}`);
      values.push(parsed.data.role);
    }

    if (parsed.data.isActive !== undefined) {
      fields.push(`is_active = $${idx++}`);
      values.push(parsed.data.isActive);
    }

    values.push(req.params.id);
    const sql = `update users
                 set ${fields.join(", ")}, updated_at = now()
                 where id = $${idx}
                 returning id, email, name, role, is_active, created_at, updated_at`;
    const result = await query(sql, values);
    if (!result.rowCount) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("user update error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/users/:id
router.delete("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    if (userId === req.user.id) {
      return res
        .status(400)
        .json({ message: "Cannot delete your own account" });
    }

    const existing = await query("select id, role from users where id = $1", [
      userId,
    ]);
    if (!existing.rowCount) {
      return res.status(404).json({ message: "User not found" });
    }

    await query("delete from users where id = $1", [userId]);

    res.status(204).send();
  } catch (err) {
    console.error("user delete error", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
