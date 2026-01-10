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

export async function getDoctors(req, res, next) {
  try {
    const pool = getPool();
    const result = await pool.request().execute("sp_Khach_GetBacSi");
    res.json(result.recordset || []);
  } catch (err) {
    next(err);
  }
}

/* ====== GET thú cưng ====== */
export async function getPets(req, res, next) {
  try {
    const { user } = req; // lấy từ middleware auth
    const pool = getPool();

    const result = await pool
      .request()
      .input("Ma_KH", sql.VarChar(10), user.ma_kh)
      .execute("sp_Khach_GetThuCung");

    res.json(result.recordset || []);
  } catch (err) {
    next(err);
  }
}

/* ====== POST đặt lịch ====== */
export async function bookAppointment(req, res, next) {
  try {
    const { user } = req;
    const { maPet, maBS, caLamViec, ngayDat } = req.body;

    const pool = getPool();

    await pool
      .request()
      .input("Ma_KH", sql.VarChar(10), user.ma_kh)
      .input("Ma_PET", sql.VarChar(10), maPet)
      .input("Ma_BS", sql.VarChar(10), maBS)
      .input("Ca_LamViec", sql.Int, caLamViec)
      .input("Ngay_Dat", sql.DateTime, new Date(ngayDat))
      .execute("sp_Khach_DatLichKham");

    res.json({ status: "Success" });
  } catch (err) {
    next(err);
  }
}