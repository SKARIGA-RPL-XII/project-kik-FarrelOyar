import db from "../config/db.js";

export const createItem = async (req, res) => {
  try {
    const { name, price, stock } = req.body;

    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, price, dan stock wajib diisi",
      });
    }

    if (isNaN(price) || Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Harga harus berupa angka dan lebih dari 0",
      });
    }

    if (isNaN(stock) || Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock harus berupa angka dan tidak boleh negatif",
      });
    }

    const [check] = await db.query("SELECT id FROM m_items WHERE name = ?", [
      name,
    ]);

    if (check.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Nama item sudah terdaftar",
      });
    }
    const query = `
      INSERT INTO m_items
      (name, price, stock, created_at)
      VALUES (?, ?, ?, NOW())
    `;

    const [result] = await db.query(query, [
      name.trim(),
      Number(price),
      Number(stock),
    ]);

    return res.status(201).json({
      success: true,
      message: "Item berhasil dibuat",
      data: {
        id: result.insertId,
        name: name.trim(),
        price: Number(price),
        stock: Number(stock),
      },
    });
  } catch (error) {
    console.error("Create Item Error:", error);

    return res.status(500).json({
      success: false,
      message: error.sqlMessage || error.message || "Terjadi kesalahan server",
    });
  }
};

export const editItem = async (req, res) => {
  try {
    let { id, name, price, stock } = req.body;

    if (!id || !name || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Semua field wajib diisi",
      });
    }

    const itemId = Number(id);
    const itemName = name.trim();

    if (isNaN(itemId)) {
      return res.status(400).json({
        success: false,
        message: "ID tidak valid",
      });
    }

    if (Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Harga harus lebih dari 0",
      });
    }

    if (Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock tidak boleh negatif",
      });
    }

    // Cek item ada
    const [check] = await db.query("SELECT id FROM m_items WHERE id = ?", [
      itemId,
    ]);

    if (check.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Item tidak ditemukan",
      });
    }

    // Cek duplicate name
    const [checkname] = await db.query(
      "SELECT id FROM m_items WHERE name = ? AND id <> ?",
      [itemName, itemId],
    );

    if (checkname.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Nama item sudah digunakan",
      });
    }

    // Update
    await db.query(
      `
      UPDATE m_items
      SET name = ?, price = ?, stock = ?, updated_at = NOW()
      WHERE id = ?
      `,
      [itemName, Number(price), Number(stock), itemId],
    );

    return res.json({
      success: true,
      message: "Item berhasil diperbarui",
    });
  } catch (error) {
    console.error("Edit Item Error:", error);

    return res.status(500).json({
      success: false,
      message: error.sqlMessage || error.message,
    });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { id } = req.body || {};

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID wajib diisi",
      });
    }

    const [patient] = await db.query("SELECT id FROM m_items WHERE id = ?", [
      id,
    ]);

    if (patient.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Item tidak ditemukan",
      });
    }

    await db.query("DELETE FROM m_items WHERE id = ?", [id]);

    return res.status(200).json({
      success: true,
      message: "Items berhasil dihapus",
      data: {
        id,
      },
    });
  } catch (error) {
    console.error("Delete Items Error:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export const getItems = async (req, res) => {
  try {
    let { search = "", page = 1, limit } = req.body;

    page = Number(page) || 1;
    limit = Number(limit);

    const offset = (page - 1) * limit;
    const searchTerm = `%${search}%`;

    let query = `
      SELECT 
        id,
        name,
        price,
        stock
        FROM m_items 
        WHERE name LIKE ?
        ORDER BY id ASC
    `;

    const params = [searchTerm];

    // ✅ Tambah LIMIT hanya kalau limit valid
    if (!isNaN(limit) && limit > 0) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);
    }

    const [rows] = await db.query(query, params);

    const data = rows.map((row) => ({
      id: row.id,
      name: row.name,
      price: row.price,
      stock: row.stock,
    }));

    // Total data
    const [totalRows] = await db.query(
      `SELECT COUNT(*) AS total
       FROM m_items
       WHERE name LIKE ?`,
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
    console.error("Get Items Error:", error);

    return res.status(500).json({
      success: false,
      message: error.sqlMessage || error.message || "Terjadi kesalahan server",
    });
  }
};
