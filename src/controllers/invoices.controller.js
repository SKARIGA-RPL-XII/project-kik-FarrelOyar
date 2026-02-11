import db from "../config/db.js";

// ================= HELPER =================
const generateInvoiceCode = () => {
  const random = Math.floor(10000000 + Math.random() * 90000000);
  return `INV ${random}`;
};

export const createInvoice = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const {
      patient_id,
      doctor_id,
      discount = 0,
      obat = [],
      medical_records = [],
    } = req.body;

    // ================= BASIC VALIDATION =================
    if (!patient_id || !doctor_id) {
      return res.status(400).json({
        success: false,
        message: "patient_id dan doctor_id wajib diisi",
      });
    }

    if (isNaN(patient_id) || isNaN(doctor_id)) {
      return res.status(400).json({
        success: false,
        message: "patient_id dan doctor_id harus angka",
      });
    }

    if (discount < 0 || discount > 100) {
      return res.status(400).json({
        success: false,
        message: "discount harus antara 0 - 100",
      });
    }

    if (!Array.isArray(obat) || !Array.isArray(medical_records)) {
      return res.status(400).json({
        success: false,
        message: "obat dan medical_records harus berupa array",
      });
    }

    // ================= ROLE VALIDATION =================
    const [[patient]] = await connection.query(
      "SELECT id FROM patients WHERE id = ?",
      [patient_id],
    );
    if (!patient) throw new Error("Patient tidak ditemukan");

    const [[doctor]] = await connection.query(
      "SELECT id FROM users WHERE id = ? AND role_id = 3",
      [doctor_id],
    );
    if (!doctor) throw new Error("Doctor tidak ditemukan");

    await connection.beginTransaction();

    // ================= INVOICE CODE =================
    let invoiceCode;
    while (true) {
      invoiceCode = generateInvoiceCode();
      const [[exists]] = await connection.query(
        "SELECT invoice_id FROM invoices WHERE invoice_code = ?",
        [invoiceCode],
      );
      if (!exists) break;
    }

    // ================= HITUNG TOTAL =================
    let totalObat = 0;
    let totalMedical = 0;

    // ===== OBAT =====
    for (const item of obat) {
      if (!item.obat_id || !item.qty || item.qty <= 0) {
        throw new Error("obat_id dan qty wajib & qty > 0");
      }

      const [[obatData]] = await connection.query(
        "SELECT id, price, stock FROM m_items WHERE id = ?",
        [item.obat_id],
      );

      if (!obatData) throw new Error("Obat tidak ditemukan");
      if (obatData.stock < item.qty)
        throw new Error("Stok obat tidak mencukupi");

      totalObat += obatData.price * item.qty;
    }

    // ===== MEDICAL RECORD =====
    for (const record of medical_records) {
      if (!record.diagnosis || !record.price || record.price <= 0) {
        throw new Error("diagnosis dan price wajib & price > 0");
      }

      totalMedical += record.price;
    }

    const totalInvoice = totalObat + totalMedical;

    // ================= INSERT INVOICE =================
    const [invoiceResult] = await connection.query(
      `
      INSERT INTO invoices
      (
        patient_id,
        doctor_id,
        invoice_code,
        discount,
        total,
        payment_status,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, 'PENDING', NOW())
      `,
      [patient_id, doctor_id, invoiceCode, discount, totalInvoice],
    );

    const invoiceId = invoiceResult.insertId;

    for (const item of obat) {
      const [[obatData]] = await connection.query(
        "SELECT price, stock FROM m_items WHERE id = ?",
        [item.obat_id],
      );

      const total = obatData.price * item.qty;

      await connection.query(
        `
        INSERT INTO invoice_obat_details
        (
          invoices_id,
          obat_id,
          qty,
          total,
          created_at
        )
        VALUES (?, ?, ?, ?, NOW())
        `,
        [invoiceId, item.obat_id, item.qty, total],
      );

      // update stock
      await connection.query(
        `
        UPDATE m_items
        SET stock = stock - ?
        WHERE id = ?
        `,
        [item.qty, item.obat_id],
      );
    }

    // ================= INSERT MEDICAL RECORD =================
    for (const record of medical_records) {
      await connection.query(
        `
        INSERT INTO invoice_medical_records
        (
          invoices_id,
          doctor_id,
          diagnosis,
          descriptions,
          price,
          visit_date,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, CURDATE(), NOW())
        `,
        [
          invoiceId,
          doctor_id,
          record.diagnosis,
          record.descriptions || null,
          record.price,
        ],
      );
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Invoice berhasil dibuat",
      data: {
        invoice_id: invoiceId,
        invoice_code: invoiceCode,
        total: totalInvoice,
        payment_status: "PENDING",
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Create Invoice Error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || error.sqlMessage,
    });
  } finally {
    connection.release();
  }
};

export const payInvoice = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { invoice_id } = req.body;

    if (!invoice_id || isNaN(invoice_id)) {
      return res.status(400).json({
        success: false,
        message: "invoice_id tidak valid",
      });
    }

    await connection.beginTransaction();

    // ================= GET INVOICE =================
    const [[invoice]] = await connection.query(
      `
      SELECT invoice_id, doctor_id, payment_status
      FROM invoices
      WHERE invoice_id = ?
      `,
      [invoice_id],
    );

    if (!invoice) {
      throw new Error("Invoice tidak ditemukan");
    }

    if (invoice.payment_status === "PAID") {
      throw new Error("Invoice sudah dibayar");
    }

    if (invoice.payment_status !== "PENDING") {
      throw new Error("Invoice tidak dapat dibayar");
    }

    // ================= GET TOTAL TINDAKAN =================
    const [[medicalTotal]] = await connection.query(
      `
      SELECT COALESCE(SUM(price), 0) AS total
      FROM invoice_medical_records
      WHERE invoices_id = ?
      `,
      [invoice_id],
    );

    // ================= GET CONTRACT DOCTOR =================
    const [[contract]] = await connection.query(
      `
      SELECT id, action_commission, total_commission
      FROM contract_doctors
      WHERE user_id = ?
        AND is_active = 1
      `,
      [invoice.doctor_id],
    );

    if (!contract) {
      throw new Error("Kontrak dokter tidak ditemukan atau tidak aktif");
    }

    const commission = medicalTotal.total * (contract.action_commission / 100);

    // ================= UPDATE CONTRACT =================
    await connection.query(
      `
      UPDATE contract_doctors
      SET total_commission = total_commission + ?
      WHERE id = ?
      `,
      [commission, contract.id],
    );

    // ================= UPDATE INVOICE =================
    await connection.query(
      `
      UPDATE invoices
      SET payment_status = 'PAID', updated_at = NOW()
      WHERE invoice_id = ?
      `,
      [invoice_id],
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Invoice berhasil dibayar",
      data: {
        invoice_id,
        commission_added: commission,
        payment_status: "PAID",
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Pay Invoice Error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || error.sqlMessage,
    });
  } finally {
    connection.release();
  }
};

export const getInvoices = async (req, res) => {
  try {
    let { search = "", page = 1, limit = 10 } = req.query;

    page = Number(page);
    limit = Number(limit);
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    const offset = (page - 1) * limit;
    const searchQuery = `%${search}%`;

    // ================= MAIN INVOICE =================
    const [invoices] = await db.query(
      `
      SELECT
        i.invoice_id,
        i.invoice_code,
        i.total,
        i.payment_status,
        i.created_at,

        p.id AS patient_id,
        p.name AS patient_name,
        p.gender AS patient_gender,
        p.phone_number AS patient_phone,

        u.id AS doctor_id,
        u.name AS doctor_name
      FROM invoices i
      JOIN patients p ON p.id = i.patient_id
      JOIN users u ON u.id = i.doctor_id
      WHERE i.invoice_code LIKE ?
      ORDER BY i.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [searchQuery, limit, offset],
    );

    // ================= COUNT =================
    const [[count]] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM invoices
      WHERE invoice_code LIKE ?
      `,
      [searchQuery],
    );

    // ================= CHILD DATA =================
    for (const invoice of invoices) {
      // OBAT
      const [obat] = await db.query(
        `
        SELECT
          iod.obat_id,
          mi.name,
          mi.price,
          iod.qty,
          iod.total
        FROM invoice_obat_details iod
        JOIN m_items mi ON mi.id = iod.obat_id
        WHERE iod.invoices_id = ?
        `,
        [invoice.invoice_id],
      );

      // MEDICAL RECORDS
      const [medical] = await db.query(
        `
        SELECT
          diagnosis,
          descriptions,
          price,
          visit_date
        FROM invoice_medical_records
        WHERE invoices_id = ?
        `,
        [invoice.invoice_id],
      );

      invoice.patient = {
        id: invoice.patient_id,
        name: invoice.patient_name,
        gender: invoice.patient_gender,
        phone_number: invoice.patient_phone,
      };

      invoice.doctor = {
        id: invoice.doctor_id,
        name: invoice.doctor_name,
      };

      invoice.obat = obat;
      invoice.medical_records = medical;

      // bersihin field mentah
      delete invoice.patient_id;
      delete invoice.patient_name;
      delete invoice.patient_gender;
      delete invoice.patient_phone;
      delete invoice.doctor_id;
      delete invoice.doctor_name;
    }

    return res.status(200).json({
      success: true,
      message: "List invoice berhasil diambil",
      data: invoices,
      pagination: {
        page,
        limit,
        total: count.total,
        total_pages: Math.ceil(count.total / limit),
      },
    });
  } catch (error) {
    console.error("Get Invoices Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Terjadi kesalahan server",
    });
  }
};
