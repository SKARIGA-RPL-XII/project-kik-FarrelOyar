import db from "../config/db.js";
import bcrypt from "bcrypt";

const isValidDate = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;

  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return false;

  const [year, month, day] = dateString.split("-");

  return (
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() + 1 === Number(month) &&
    date.getUTCDate() === Number(day)
  );
};

export const getRoles = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM roles");

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
export const createPatient = async (req, res) => {
  try {
    const { name, gender, phone, email, birth, address } = req.body;
    if (!name || !gender || !phone || !email || !birth || !address) {
      return res.status(400).json({
        success: false,
        message: "Semua field wajib diisi",
      });
    }
    if (!["male", "female"].includes(gender)) {
      return res.status(400).json({
        success: false,
        message: "Gender harus male atau female",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,15}$/;

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Format nomor HP tidak valid",
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Format email tidak valid",
      });
    }

    if (!isValidDate(birth)) {
      return res.status(400).json({
        success: false,
        message: "Format tanggal lahir harus YYYY-MM-DD dan valid",
      });
    }

    const [check] = await db.query("SELECT id FROM patients WHERE email = ?", [
      email,
    ]);

    if (check.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email sudah terdaftar",
      });
    }

    const query = `
      INSERT INTO patients
      (name, gender, phone_number, email, date_of_birth , address, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;

    const [result] = await db.query(query, [
      name,
      gender,
      phone,
      email,
      birth,
      address,
    ]);

    return res.status(201).json({
      success: true,
      message: "Patient berhasil dibuat",
      data: {
        id: result.insertId,
        name,
        gender,
        phone,
        email,
        birth,
        address,
      },
    });
  } catch (error) {
    console.error("Create Patient Error:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};
export const editPatient = async (req, res) => {
  try {
    const { id, name, gender, phone, email, birth, address } = req.body;
    if (!id || !name || !gender || !phone || !email || !birth || !address) {
      return res.status(400).json({
        success: false,
        message: "Semua field wajib diisi",
      });
    }
    if (!["male", "female"].includes(gender)) {
      return res.status(400).json({
        success: false,
        message: "Gender harus male atau female",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,15}$/;

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Format nomor HP tidak valid",
      });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Format email tidak valid",
      });
    }

    if (!isValidDate(birth)) {
      return res.status(400).json({
        success: false,
        message: "Format tanggal lahir harus YYYY-MM-DD dan valid",
      });
    }

    const [patient] = await db.query("SELECT id FROM patients WHERE id = ?", [
      id,
    ]);

    if (patient.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient tidak ditemukan",
      });
    }

    const [checkEmail] = await db.query(
      "SELECT id FROM patients WHERE email = ? AND id != ?",
      [email, id],
    );

    if (checkEmail.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email sudah digunakan patient lain",
      });
    }

    const query = `
      UPDATE patients
      SET 
        name = ?,
        gender = ?,
        phone_number = ?,
        email = ?,
        date_of_birth = ?,
        address = ?,
        updated_at = NOW()
      WHERE id = ?
    `;

    await db.query(query, [name, gender, phone, email, birth, address, id]);

    return res.status(200).json({
      success: true,
      message: "Patient berhasil diperbarui",
      data: {
        id,
        name,
        gender,
        phone,
        email,
        birth,
        address,
      },
    });
  } catch (error) {
    console.error("Edit Patient Error:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};
export const deletePatient = async (req, res) => {
  try {
    const { id } = req.body || {};

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID wajib diisi",
      });
    }

    const [patient] = await db.query("SELECT id FROM patients WHERE id = ?", [
      id,
    ]);

    if (patient.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient tidak ditemukan",
      });
    }

    await db.query("DELETE FROM patients WHERE id = ?", [id]);

    return res.status(200).json({
      success: true,
      message: "Patient berhasil dihapus",
      data: {
        id,
      },
    });
  } catch (error) {
    console.error("Delete Patient Error:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export const getPatients = async (req, res) => {
  try {
    let { search = "", page = 1, limit = 10 } = req.body;

    page = parseInt(page);
    limit = parseInt(limit);

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    const offset = (page - 1) * limit;

    const keyword = `%${search}%`;

    const [countResult] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM patients
      WHERE name LIKE ?
      `,
      [keyword],
    );

    const totalData = countResult[0].total;
    const totalPage = Math.ceil(totalData / limit);

    const [rows] = await db.query(
      `
  SELECT 
    id,
    name,
    gender,
    phone_number,
    email,
    address,
    DATE_FORMAT(date_of_birth, '%Y-%m-%d') AS date_of_birth,
    created_at,
    updated_at
  FROM patients
  WHERE name LIKE ?
  ORDER BY id ASC
  LIMIT ? OFFSET ?
  `,

      [keyword, limit, offset],
    );

    return res.status(200).json({
      success: true,
      message: "Data patients berhasil diambil",
      pagination: {
        page,
        limit,
        totalData,
        totalPage,
      },
      data: rows,
    });
  } catch (error) {
    console.error("Get Patients Error:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export const createDoctor = async (req, res) => {
  try {
    const {
      name,
      gender,
      phone,
      email,
      birth,
      address,
      password,
      action_commission,
    } = req.body;
    if (
      !name ||
      !gender ||
      !phone ||
      !email ||
      !birth ||
      !address ||
      !password ||
      !action_commission
    ) {
      return res.status(400).json({
        success: false,
        message: "Semua field wajib diisi",
      });
    }
    if (!["male", "female"].includes(gender)) {
      return res.status(400).json({
        success: false,
        message: "Gender harus male atau female",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,15}$/;
    const passwordRegex = /^.{8,}$/;
    const commissionRegex = /^(100|[1-9][0-9]?|0?[1-9])$/;

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Format nomor HP tidak valid",
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Format email tidak valid",
      });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password minimal 8 karakter",
      });
    }

    if (!commissionRegex.test(action_commission)) {
      return res.status(400).json({
        success: false,
        message: "Commission harus antara 1 sampai 100",
      });
    }

    if (!isValidDate(birth)) {
      return res.status(400).json({
        success: false,
        message: "Format tanggal lahir harus YYYY-MM-DD dan valid",
      });
    }

    const [check] = await db.query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);

    if (check.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email sudah terdaftar",
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const queryUser = `
      INSERT INTO users
      (name, gender, phone_number, email, date_of_birth, address, password, role_id, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 3, 1, NOW())
    `;

    const [resultUser] = await db.query(queryUser, [
      name,
      gender,
      phone,
      email,
      birth,
      address,
      hashedPassword,
    ]);

    const userId = resultUser.insertId;

    const queryCommission = `
        INSERT INTO contract_doctors
        (user_id, action_commission, total_commission, is_active, created_at, updated_at)
        VALUES (?, ?, 0, 1, NOW(), NOW())
    `;
    const actionCommissionInt = parseInt(action_commission);

    await db.query(queryCommission, [userId, actionCommissionInt]);

    return res.status(201).json({
      success: true,
      message: "Doctor berhasil dibuat",
      data: {
        id: userId,
        name,
        gender,
        phone,
        email,
        birth,
        address,
        action_commission,
      },
    });
  } catch (error) {
    console.error("Create Doctor Error:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export const editDoctor = async (req, res) => {
  try {
    const {
      id,
      name,
      gender,
      phone,
      email,
      birth,
      address,
      action_commission,
    } = req.body;

    if (
      !id ||
      !name ||
      !gender ||
      !phone ||
      !email ||
      !birth ||
      !address ||
      !action_commission
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Semua field wajib diisi" });
    }

    if (!["male", "female"].includes(gender)) {
      return res
        .status(400)
        .json({ success: false, message: "Gender harus male atau female" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,15}$/;
    const commissionRegex = /^(100|[1-9][0-9]?|0?[1-9])$/;

    if (!phoneRegex.test(phone))
      return res
        .status(400)
        .json({ success: false, message: "Format nomor HP tidak valid" });
    if (!emailRegex.test(email))
      return res
        .status(400)
        .json({ success: false, message: "Format email tidak valid" });
    if (!commissionRegex.test(action_commission))
      return res.status(400).json({
        success: false,
        message: "Commission harus antara 1 sampai 100",
      });
    if (!isValidDate(birth))
      return res.status(400).json({
        success: false,
        message: "Format tanggal lahir harus YYYY-MM-DD dan valid",
      });

    const [doctor] = await db.query(
      "SELECT id FROM users WHERE id = ? AND role_id = 3",
      [id],
    );
    if (doctor.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Doctor tidak ditemukan" });

    const [checkEmail] = await db.query(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [email, id],
    );
    if (checkEmail.length > 0)
      return res
        .status(409)
        .json({ success: false, message: "Email sudah digunakan user lain" });

    await db.query(
      `UPDATE users SET name = ?, gender = ?, phone_number = ?, email = ?, date_of_birth = ?, address = ?, updated_at = NOW() WHERE id = ?`,
      [name, gender, phone, email, birth, address, id],
    );

    const actionCommissionInt = parseInt(action_commission);
    await db.query(
      `UPDATE contract_doctors SET action_commission = ?, updated_at = NOW() WHERE user_id = ?`,
      [actionCommissionInt, id],
    );

    return res.status(200).json({
      success: true,
      message: "Doctor berhasil diperbarui",
      data: {
        id,
        name,
        gender,
        phone,
        email,
        birth,
        address,
        action_commission,
      },
    });
  } catch (error) {
    console.error("Edit Doctor Error:", error.sqlMessage || error.message);
    return res.status(500).json({
      success: false,
      message: error.sqlMessage || error.message || "Terjadi kesalahan server",
    });
  }
};

export const resetDoctorPassword = async (req, res) => {
  try {
    const { id, password } = req.body;

    if (!id || !password) {
      return res
        .status(400)
        .json({ success: false, message: "ID dan password baru wajib diisi" });
    }

    const passwordRegex = /^.{8,}$/;
    if (!passwordRegex.test(password)) {
      return res
        .status(400)
        .json({ success: false, message: "Password minimal 8 karakter" });
    }

    const [doctor] = await db.query(
      "SELECT id FROM users WHERE id = ? AND role_id = 3",
      [id],
    );
    if (doctor.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Doctor tidak ditemukan" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `UPDATE users SET password = ?, updated_at = NOW() WHERE id = ? `,
      [hashedPassword, id],
    );

    return res.status(200).json({
      success: true,
      message: "Password doctor berhasil direset",
    });
  } catch (error) {
    console.error(
      "Reset Doctor Password Error:",
      error.sqlMessage || error.message,
    );
    return res.status(500).json({
      success: false,
      message: error.sqlMessage || error.message || "Terjadi kesalahan server",
    });
  }
};

export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.body || {};

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID wajib diisi",
      });
    }

    const [doctor] = await db.query(
      "SELECT id FROM users WHERE id = ? AND role_id = 3",
      [id],
    );
    if (doctor.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor tidak ditemukan",
      });
    }

    await db.query("DELETE FROM contract_doctors WHERE user_id = ?", [id]);

    await db.query("DELETE FROM users WHERE id = ?", [id]);

    return res.status(200).json({
      success: true,
      message: "Doctor beserta kontraknya berhasil dihapus",
      data: { id },
    });
  } catch (error) {
    console.error("Delete Doctor Error:", error.sqlMessage || error.message);
    return res.status(500).json({
      success: false,
      message: error.sqlMessage || error.message || "Terjadi kesalahan server",
    });
  }
};

export const getDoctors = async (req, res) => {
  try {
    let { search = "", page = 1, limit } = req.body;

    page = Number(page) || 1;
    limit = Number(limit);

    const offset = (page - 1) * limit;
    const searchTerm = `%${search}%`;

    // ✅ Pakai let
    let query = `
      SELECT 
        u.id AS user_id,
        u.name,
        u.gender,
        u.phone_number AS phone,
        u.email,

        DATE_FORMAT(u.date_of_birth, '%Y-%m-%d') AS birth,

        u.address,

        c.id AS contract_id,
        c.action_commission,
        c.total_commission,
        c.is_active AS contract_active

      FROM users u
      LEFT JOIN contract_doctors c ON u.id = c.user_id

      WHERE u.role_id = 3
        AND u.name LIKE ?

      ORDER BY u.id ASC
    `;

    const params = [searchTerm];

    // ✅ Tambah LIMIT kalau perlu
    if (!isNaN(limit) && limit > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);
    }

    const [rows] = await db.query(query, params);

    // Format response
    const data = rows.map((row) => ({
      id: row.user_id,
      name: row.name,
      gender: row.gender,
      phone: row.phone,
      email: row.email,
      birth: row.birth,
      address: row.address,

      contract: row.contract_id
        ? {
            id: row.contract_id,
            action_commission: row.action_commission,
            total_commission: row.total_commission,
            is_active: row.contract_active,
          }
        : null,
    }));

    // Total count
    const [totalRows] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM users
      WHERE role_id = 3
        AND name LIKE ?
      `,
      [searchTerm],
    );

    const total = totalRows[0].total;

    return res.status(200).json({
      success: true,
      data,
      message: "Data Doctors berhasil diambil",
      pagination: {
        total,
        page,
        limit: !isNaN(limit) && limit > 0 ? limit : total,
        totalPages: !isNaN(limit) && limit > 0 ? Math.ceil(total / limit) : 1,
      },
    });
  } catch (error) {
    console.error("Get Doctors Error:", error);

    return res.status(500).json({
      success: false,
      message: error.sqlMessage || error.message || "Terjadi kesalahan server",
    });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { name, gender, phone, email, birth, address, password } = req.body;
    if (
      !name ||
      !gender ||
      !phone ||
      !email ||
      !birth ||
      !address ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Semua field wajib diisi",
      });
    }
    if (!["male", "female"].includes(gender)) {
      return res.status(400).json({
        success: false,
        message: "Gender harus male atau female",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,15}$/;
    const passwordRegex = /^.{8,}$/;

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Format nomor HP tidak valid",
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Format email tidak valid",
      });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password minimal 8 karakter",
      });
    }

    if (!isValidDate(birth)) {
      return res.status(400).json({
        success: false,
        message: "Format tanggal lahir harus YYYY-MM-DD dan valid",
      });
    }

    const [check] = await db.query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);

    if (check.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email sudah terdaftar",
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const queryUser = `
      INSERT INTO users
      (name, gender, phone_number, email, date_of_birth, address, password, role_id, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 2, 1, NOW())
    `;

    const [resultUser] = await db.query(queryUser, [
      name,
      gender,
      phone,
      email,
      birth,
      address,
      hashedPassword,
    ]);

    return res.status(201).json({
      success: true,
      message: "Admin berhasil dibuat",
      data: {
        id: resultUser.id,
        name,
        gender,
        phone,
        email,
        birth,
        address,
      },
    });
  } catch (error) {
    console.error("Create Admin Error:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export const editAdmin = async (req, res) => {
  try {
    const { id, name, gender, phone, email, birth, address } = req.body;

    if (!id || !name || !gender || !phone || !email || !birth || !address) {
      return res
        .status(400)
        .json({ success: false, message: "Semua field wajib diisi" });
    }

    if (!["male", "female"].includes(gender)) {
      return res
        .status(400)
        .json({ success: false, message: "Gender harus male atau female" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,15}$/;

    if (!phoneRegex.test(phone))
      return res
        .status(400)
        .json({ success: false, message: "Format nomor HP tidak valid" });
    if (!emailRegex.test(email))
      return res
        .status(400)
        .json({ success: false, message: "Format email tidak valid" });

    if (!isValidDate(birth))
      return res.status(400).json({
        success: false,
        message: "Format tanggal lahir harus YYYY-MM-DD dan valid",
      });

    const [admin] = await db.query(
      "SELECT id FROM users WHERE id = ? AND role_id = 2",
      [id],
    );
    if (admin.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Admin tidak ditemukan" });

    const [checkEmail] = await db.query(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [email, id],
    );
    if (checkEmail.length > 0)
      return res
        .status(409)
        .json({ success: false, message: "Email sudah digunakan user lain" });

    await db.query(
      `UPDATE users SET name = ?, gender = ?, phone_number = ?, email = ?, date_of_birth = ?, address = ?, updated_at = NOW() WHERE id = ?`,
      [name, gender, phone, email, birth, address, id],
    );

    return res.status(200).json({
      success: true,
      message: "Admin berhasil diperbarui",
      data: {
        id,
        name,
        gender,
        phone,
        email,
        birth,
        address,
      },
    });
  } catch (error) {
    console.error("Edit Admin Error:", error.sqlMessage || error.message);
    return res.status(500).json({
      success: false,
      message: error.sqlMessage || error.message || "Terjadi kesalahan server",
    });
  }
};

export const resetAdminPassword = async (req, res) => {
  try {
    const { id, password } = req.body;

    if (!id || !password) {
      return res
        .status(400)
        .json({ success: false, message: "ID dan password baru wajib diisi" });
    }

    const passwordRegex = /^.{8,}$/;
    if (!passwordRegex.test(password)) {
      return res
        .status(400)
        .json({ success: false, message: "Password minimal 8 karakter" });
    }

    const [doctor] = await db.query(
      "SELECT id FROM users WHERE id = ? AND role_id = 2",
      [id],
    );
    if (doctor.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Admin tidak ditemukan" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?`,
      [hashedPassword, id],
    );

    return res.status(200).json({
      success: true,
      message: "Password admin berhasil direset",
    });
  } catch (error) {
    console.error(
      "Reset Admin Password Error:",
      error.sqlMessage || error.message,
    );
    return res.status(500).json({
      success: false,
      message: error.sqlMessage || error.message || "Terjadi kesalahan server",
    });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.body || {};

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID wajib diisi",
      });
    }

    const [doctor] = await db.query(
      "SELECT id FROM users WHERE id = ? AND role_id = 2",
      [id],
    );
    if (doctor.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin tidak ditemukan",
      });
    }

    await db.query("DELETE FROM users WHERE id = ?", [id]);

    return res.status(200).json({
      success: true,
      message: "Admin berhasil dihapus",
      data: { id },
    });
  } catch (error) {
    console.error("Delete Admin Error:", error.sqlMessage || error.message);
    return res.status(500).json({
      success: false,
      message: error.sqlMessage || error.message || "Terjadi kesalahan server",
    });
  }
};

export const getAdmin = async (req, res) => {
  try {
    let { search = "", page = 1, limit } = req.body;

    page = Number(page) || 1;
    limit = Number(limit);

    const offset = (page - 1) * limit;
    const searchTerm = `%${search}%`;

    // ✅ Pakai let (bukan const)
    let query = `
      SELECT 
        u.id AS user_id,
        u.name,
        u.gender,
        u.phone_number AS phone,
        u.email,
        u.date_of_birth AS birth,
        u.address
      FROM users u
      WHERE u.role_id = 2
        AND u.name LIKE ?
      ORDER BY u.id ASC
    `;

    const params = [searchTerm];

    // ✅ Tambah LIMIT hanya kalau limit valid
    if (!isNaN(limit) && limit > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);
    }

    const [rows] = await db.query(query, params);

    const data = rows.map((row) => ({
      id: row.user_id,
      name: row.name,
      gender: row.gender,
      phone: row.phone,
      email: row.email,
      birth: row.birth,
      address: row.address,
    }));

    // Total data
    const [totalRows] = await db.query(
      `SELECT COUNT(*) AS total
       FROM users
       WHERE role_id = 2
         AND name LIKE ?`,
      [searchTerm],
    );

    const total = totalRows[0].total;

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit: !isNaN(limit) && limit > 0 ? limit : total,
        totalPages: !isNaN(limit) && limit > 0 ? Math.ceil(total / limit) : 1,
      },
    });
  } catch (error) {
    console.error("Get Admin Error:", error);

    return res.status(500).json({
      success: false,
      message: error.sqlMessage || error.message || "Terjadi kesalahan server",
    });
  }
};
