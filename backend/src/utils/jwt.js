import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "dev";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
