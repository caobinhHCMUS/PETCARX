import { sql, getPool } from "../config/database.js";

// GET /api/customer/products?search=...
export async function searchProducts(req, res, next) {
  try {
    const search = (req.query.search || "").toString().trim();

    // không có search thì trả []
    if (!search) return res.json([]);

    const pool = getPool();

    const result = await pool
      .request()
      .input("Ten_SP", sql.NVarChar(100), search)
      .execute("TimKiemSanPham");

    return res.json(result.recordset || []);
  } catch (err) {
    next(err);
  }
}
