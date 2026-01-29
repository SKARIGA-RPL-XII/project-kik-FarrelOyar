import db from "../config/db.js";

// Dummy data (sementara, nanti ganti DB)

const isValidDate = (dateString) => {
  // Format YYYY-MM-DD
  const regex = /^\d{4}-\d{2}-\d{2}$/;

  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return false;

  // Cocokkan lagi (hindari 2025-02-30 dll)
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

    // ===============================
    // Validasi
    // ===============================
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID wajib diisi",
      });
    }

    // ===============================
    // Cek patient ada?
    // ===============================
    const [patient] = await db.query("SELECT id FROM patients WHERE id = ?", [
      id,
    ]);

    if (patient.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient tidak ditemukan",
      });
    }

    // ===============================
    // Hapus data
    // ===============================
    await db.query("DELETE FROM patients WHERE id = ?", [id]);

    // ===============================
    // Response
    // ===============================
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

    // ===============================
    // Parsing number
    // ===============================
    page = parseInt(page);
    limit = parseInt(limit);

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    const offset = (page - 1) * limit;

    const keyword = `%${search}%`;

    // ===============================
    // Hitung total data
    // ===============================
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

    // ===============================
    // Ambil data
    // ===============================
    const [rows] = await db.query(
      `
      SELECT *
      FROM patients
      WHERE name LIKE ?
      ORDER BY id ASC
      LIMIT ? OFFSET ?
      `,
      [keyword, limit, offset],
    );

    // ===============================
    // Response
    // ===============================
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
