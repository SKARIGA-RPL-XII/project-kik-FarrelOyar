import db from "../config/db.js";

const isValidDate = (dateString) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;

  const date = new Date(dateString);
  return (
    !isNaN(date.getTime()) && date.toISOString().slice(0, 10) === dateString
  );
};

const isValidTime = (time) => {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
};

export const createAppointment = async (req, res) => {
  try {
    const {
      patient_id,
      doctor_id,
      admin_id,
      appointment_date,
      appointment_time,
      notes,
    } = req.body;

    // ================= BASIC VALIDATION =================
    if (
      !patient_id ||
      !doctor_id ||
      !admin_id ||
      !appointment_date ||
      !appointment_time
    ) {
      return res.status(400).json({
        success: false,
        message: "Semua field wajib diisi",
      });
    }

    if (isNaN(patient_id) || isNaN(doctor_id) || isNaN(admin_id)) {
      return res.status(400).json({
        success: false,
        message: "ID harus berupa angka",
      });
    }

    // ================= DATE & TIME VALIDATION =================
    if (!isValidDate(appointment_date)) {
      return res.status(400).json({
        success: false,
        message: "Format atau nilai appointment_date tidak valid (YYYY-MM-DD)",
      });
    }

    if (!isValidTime(appointment_time)) {
      return res.status(400).json({
        success: false,
        message: "Format appointment_time harus HH:mm (contoh: 09:00)",
      });
    }

    // ================= ROLE VALIDATION =================
    const [[patient]] = await db.query("SELECT id FROM patients WHERE id = ?", [
      patient_id,
    ]);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient tidak ditemukan",
      });
    }

    const [[doctor]] = await db.query(
      "SELECT id FROM users WHERE id = ? AND role_id = 3",
      [doctor_id],
    );
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor tidak ditemukan",
      });
    }

    const [[admin]] = await db.query(
      "SELECT id FROM users WHERE id = ? AND role_id = 2",
      [admin_id],
    );
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin tidak ditemukan",
      });
    }

    // ================= DOUBLE BOOKING =================
    const [existing] = await db.query(
      `
      SELECT id FROM appointments
      WHERE doctor_id = ?
        AND appointment_date = ?
        AND appointment_time = ?
      `,
      [doctor_id, appointment_date, appointment_time],
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Dokter sudah memiliki jadwal di waktu tersebut",
      });
    }

    // ================= INSERT =================
    const [result] = await db.query(
      `
      INSERT INTO appointments
      (
        patient_id,
        doctor_id,
        admin_id,
        appointment_date,
        appointment_time,
        notes,
        status,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, 'scheduled', NOW())
      `,
      [
        patient_id,
        doctor_id,
        admin_id,
        appointment_date,
        appointment_time,
        notes || null,
      ],
    );

    return res.status(201).json({
      success: true,
      message: "Appointment berhasil dibuat",
      data: {
        id: result.insertId,
        patient_id,
        doctor_id,
        admin_id,
        appointment_date,
        appointment_time,
        notes: notes || null,
        status: "scheduled",
      },
    });
  } catch (error) {
    console.error("Create Appointment Error:", error);
    return res.status(500).json({
      success: false,
      message: error.sqlMessage || error.message,
    });
  }
};
export const rescheduleAppointment = async (req, res) => {
  try {
    const { id, appointment_date, appointment_time, notes } = req.body;

    // ================= BASIC VALIDATION =================
    if (!id || !appointment_date || !appointment_time) {
      return res.status(400).json({
        success: false,
        message: "id, appointment_date, dan appointment_time wajib diisi",
      });
    }

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "id harus berupa angka",
      });
    }

    // ================= DATE & TIME VALIDATION =================
    if (!isValidDate(appointment_date)) {
      return res.status(400).json({
        success: false,
        message: "Format atau nilai appointment_date tidak valid (YYYY-MM-DD)",
      });
    }

    if (!isValidTime(appointment_time)) {
      return res.status(400).json({
        success: false,
        message: "Format appointment_time harus HH:mm (contoh: 09:00)",
      });
    }

    // ================= CHECK APPOINTMENT EXIST =================
    const [[appointment]] = await db.query(
      `
      SELECT id, doctor_id
      FROM appointments
      WHERE id = ?
      `,
      [id],
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment tidak ditemukan",
      });
    }

    // ================= DOUBLE BOOKING =================
    const [existing] = await db.query(
      `
      SELECT id FROM appointments
      WHERE doctor_id = ?
        AND appointment_date = ?
        AND appointment_time = ?
        AND id != ?
      `,
      [appointment.doctor_id, appointment_date, appointment_time, id],
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Dokter sudah memiliki jadwal di waktu tersebut",
      });
    }

    // ================= UPDATE =================
    await db.query(
      `
      UPDATE appointments
      SET
        appointment_date = ?,
        appointment_time = ?,
        notes = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [appointment_date, appointment_time, notes || null, id],
    );

    return res.status(200).json({
      success: true,
      message: "Appointment berhasil dijadwalkan ulang",
      data: {
        id,
        appointment_date,
        appointment_time,
        notes: notes || null,
        status: "rescheduled",
      },
    });
  } catch (error) {
    console.error("Reschedule Appointment Error:", error);
    return res.status(500).json({
      success: false,
      message: error.sqlMessage || error.message,
    });
  }
};

export const getAppointments = async (req, res) => {
  try {
    let { search = "", page = 1, limit = 10 } = req.body;

    page = Number(page);
    limit = Number(limit);
    const offset = (page - 1) * limit;

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return res.status(400).json({
        success: false,
        message: "page dan limit harus berupa angka dan lebih dari 0",
      });
    }

    const searchQuery = `%${search}%`;

    // ================= QUERY =================
    const [rows] = await db.query(
      `
      SELECT
        a.id,
        a.appointment_date,
        a.appointment_time,
        a.status,
        a.notes,
        a.created_at,

        p.id AS patient_id,
        p.name AS patient_name,

        d.id AS doctor_id,
        d.name AS doctor_name,

        ad.id AS admin_id,
        ad.name AS admin_name
      FROM appointments a
      JOIN patients p ON p.id = a.patient_id
      JOIN users d ON d.id = a.doctor_id AND d.role_id = 3
      JOIN users ad ON ad.id = a.admin_id AND ad.role_id = 2
      WHERE
        p.name LIKE ?
        OR d.name LIKE ?
        OR ad.name LIKE ?
        OR a.notes LIKE ?
        OR a.status LIKE ?
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        limit,
        offset,
      ],
    );

    // ================= MAPPING NESTED =================
    const data = rows.map((row) => ({
      id: row.id,
      appointment_date: row.appointment_date,
      appointment_time: row.appointment_time,
      status: row.status,
      notes: row.notes,
      created_at: row.created_at,
      patient: {
        id: row.patient_id,
        name: row.patient_name,
      },
      doctor: {
        id: row.doctor_id,
        name: row.doctor_name,
      },
      admin: {
        id: row.admin_id,
        name: row.admin_name,
      },
    }));

    // ================= TOTAL =================
    const [[total]] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM appointments a
      JOIN patients p ON p.id = a.patient_id
      JOIN users d ON d.id = a.doctor_id AND d.role_id = 3
      JOIN users ad ON ad.id = a.admin_id AND ad.role_id = 2
      WHERE
        p.name LIKE ?
        OR d.name LIKE ?
        OR ad.name LIKE ?
        OR a.notes LIKE ?
        OR a.status LIKE ?
      `,
      [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery],
    );

    return res.status(200).json({
      success: true,
      message: "List appointment berhasil diambil",
      data,
      pagination: {
        page,
        limit,
        total: total.total,
        totalPages: Math.ceil(total.total / limit),
      },
    });
  } catch (error) {
    console.error("Get Appointments Error:", error);
    return res.status(500).json({
      success: false,
      message: error.sqlMessage || error.message,
    });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.body;

    // ================= BASIC VALIDATION =================
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "id tidak valid",
      });
    }

    // ================= CHECK EXIST & STATUS =================
    const [[appointment]] = await db.query(
      `
      SELECT id, status
      FROM appointments
      WHERE id = ?
      `,
      [id],
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment tidak ditemukan",
      });
    }

    // ================= STATUS RULE =================
    if (appointment.status === "done") {
      return res.status(403).json({
        success: false,
        message: "Appointment yang sudah selesai tidak dapat dihapus",
      });
    }

    if (appointment.status !== "scheduled") {
      return res.status(400).json({
        success: false,
        message: `Appointment dengan status '${appointment.status}' tidak dapat dihapus`,
      });
    }

    // ================= HARD DELETE =================
    await db.query(
      `
      DELETE FROM appointments
      WHERE id = ?
      `,
      [id],
    );

    return res.status(200).json({
      success: true,
      message: "Appointment berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete Appointment Error:", error);
    return res.status(500).json({
      success: false,
      message: error.sqlMessage || error.message,
    });
  }
};
