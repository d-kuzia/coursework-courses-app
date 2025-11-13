import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Server is running!"));

app.get("/api/health", (req, res) => res.json({ ok: true, time: new Date() }));

// тест підключення до БД
app.get("/api/dbcheck", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ connected: true, time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ connected: false });
  }
});

app.listen(5000, () => console.log("Server listening on port 5000"));
