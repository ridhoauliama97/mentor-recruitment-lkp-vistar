import { Router } from "express";
import bcrypt from "bcryptjs";
import { exec, run, saveDb } from "../db/database.js";
import { signToken, verifyToken } from "../middleware/auth.js";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ message: "Username dan password wajib diisi" });
      return;
    }

    const rows = exec(`SELECT * FROM users WHERE username = '${username.replace(/'/g, "''")}'`);
    if (rows.length === 0) {
      res.status(401).json({ message: "Username atau password salah" });
      return;
    }

    const user = rows[0] as Record<string, unknown>;
    const valid = await bcrypt.compare(password, user.passwordHash as string);
    if (!valid) {
      res.status(401).json({ message: "Username atau password salah" });
      return;
    }

    const token = signToken({ id: user.id as number, username: user.username as string });

    res.json({
      token,
      user: { id: user.id, username: user.username },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Gagal login" });
  }
});

router.get("/me", verifyToken, (req, res) => {
  const user = (req as unknown as Record<string, unknown>).user as { id: number; username: string };
  res.json({ id: user.id, username: user.username });
});

router.put("/password", verifyToken, async (req, res) => {
  try {
    const user = (req as unknown as Record<string, unknown>).user as { id: number; username: string };
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: "Password lama dan baru wajib diisi" });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ message: "Password minimal 6 karakter" });
      return;
    }

    const rows = exec(`SELECT * FROM users WHERE id = ${user.id}`);
    if (rows.length === 0) {
      res.status(404).json({ message: "User tidak ditemukan" });
      return;
    }

    const record = rows[0] as Record<string, unknown>;
    const valid = await bcrypt.compare(currentPassword, record.passwordHash as string);
    if (!valid) {
      res.status(400).json({ message: "Password lama salah" });
      return;
    }

    const hash = await bcrypt.hash(newPassword, 10);
    run(`UPDATE users SET password_hash = '${hash}' WHERE id = ${user.id}`);
    saveDb();
    res.json({ success: true });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Gagal mengubah password" });
  }
});

export default router;
