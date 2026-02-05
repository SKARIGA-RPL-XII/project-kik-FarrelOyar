import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email dan password wajib diisi",
        success:false

      });
    }

    const [rows] = await db.query(
      `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.password,
        r.id AS role_id,
        r.name AS role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.email = ?
      `,
      [email],
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: "Email atau password salah",
        success:false
      });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Email atau password salah",
        success:false

      });
    }

    // JWT pakai role dari tabel roles
    const token = jwt.sign(
      {
        id: user.id,
        role_id: user.role_id,
        role: user.role_name,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30m" },
    );

    res.json({
      success: true,
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: {
          id: user.role_id,
          name: user.role_name,
        },
      },
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message || "Server error",
    });
  }
};
export const getProfile = async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT 
        u.id,
        u.name,
        u.email,
        r.id AS role_id,
        r.name AS role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
      `,
      [req.user.id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = rows[0];

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: {
          id: user.role_id,
          name: user.role_name,
        },
      },
    });
  } catch (err) {
    console.error("Get Profile Error:", err);

    res.status(500).json({
      message: err.message || "Server error",
    });
  }
};
