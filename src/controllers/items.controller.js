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
