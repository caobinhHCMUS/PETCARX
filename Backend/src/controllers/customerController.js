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

export const getPets = async (req, res) => {
  const poolPromise = getPool();
  const pool = await poolPromise;
  const { Ma_KH } = req.user;
  const result = await pool
    .request()
    .input("Ma_KH", sql.VarChar, Ma_KH)
    .execute("sp_GetThuCungByKhach");
  console.log(result.recordset);

  res.json(result.recordset);
};

export const addThuCung = async (req, res) => {
  const poolPromise = getPool();
  const pool = await poolPromise;
  await pool
    .request()
    .input("Ma_PET", sql.VarChar, req.body.Ma_PET)
    .input("Ma_KH", sql.VarChar, req.body.Ma_KH)
    .input("Ten_PET", sql.NVarChar, req.body.Ten_PET)
    .input("Ten_Loai", sql.NVarChar, req.body.Ten_Loai)
    .input("Giong", sql.NVarChar, req.body.Giong)
    .input("Gioi_Tinh", sql.NVarChar, req.body.Gioi_Tinh)
    .input("Ngay_Sinh", sql.Date, req.body.Ngay_Sinh)
    .input("Tinh_Trang_Suc_Khoe", sql.NVarChar, req.body.Tinh_Trang_Suc_Khoe)
    .input("Mau_Sac", sql.NVarChar, req.body.Mau_Sac)
    .execute("sp_AddThuCung");

  res.json({ success: true });
};

export const updateThuCung = async (req, res) => {
  const poolPromise = getPool();
  const pool = await poolPromise;
  await pool
    .request()
    .input("Ma_PET", sql.VarChar, req.body.Ma_PET)
    .input("Ten_PET", sql.NVarChar, req.body.Ten_PET)
    .input("Tinh_Trang_Suc_Khoe", sql.NVarChar, req.body.Tinh_Trang_Suc_Khoe)
    .execute("sp_UpdateThuCung");

  res.json({ success: true });
};

export const deleteThuCung = async (req, res) => {
  const poolPromise = getPool();
  const pool = await poolPromise;
  await pool
    .request()
    .input("Ma_PET", sql.VarChar, req.params.ma_pet)
    .execute("sp_DeleteThuCung");

  res.json({ success: true });
};
