import { sql, getPool } from "../config/database.js";

/* ================= PRODUCTS ================= */

export async function getProducts(req, res, next) {
  try {
    const pool = getPool();
    const result = await pool.request().execute("sp_GetSanPham");
    console.log(result.recordset);
    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
}

export async function searchProducts(req, res, next) {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json([]);

    const pool = getPool();
    const result = await pool
      .request()
      .input("Ten_SP", sql.NVarChar(100), q)
      .execute("TimKiemSanPham");

    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const { Ma_SP, Ten_SP, Loai_SP, Gia, Don_Vi_Tinh, So_Luong } = req.body;

    const pool = getPool();
    await pool
      .request()
      .input("Ma_SP", sql.VarChar, Ma_SP)
      .input("Ten_SP", sql.NVarChar, Ten_SP)
      .input("Loai_SP", sql.NVarChar, Loai_SP)
      .input("Gia", sql.Decimal(18, 2), Gia)
      .input("Don_Vi_Tinh", sql.NVarChar, Don_Vi_Tinh)
      .input("So_Luong", sql.Int, So_Luong)
      .execute("sp_AddSanPham");

    res.status(201).json({ message: "Product created" });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const { ma_sp } = req.params;
    const { Ten_SP, Gia, So_Luong } = req.body;

    const pool = getPool();
    await pool
      .request()
      .input("Ma_SP", sql.VarChar, ma_sp)
      .input("Ten_SP", sql.NVarChar, Ten_SP)
      .input("Gia", sql.Decimal(18, 2), Gia)
      .input("So_Luong", sql.Int, So_Luong)
      .execute("sp_UpdateSanPham");

    res.json({ message: "Product updated" });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const pool = getPool();
    await pool
      .request()
      .input("Ma_SP", sql.VarChar, req.params.ma_sp)
      .execute("sp_DeleteSanPham");

    res.json({ message: "Product deleted" });
  } catch (err) {
    next(err);
  }
}

/* ================= PETS ================= */

export async function getPetsByCustomer(req, res, next) {
  try {
    const pool = getPool();
    const result = await pool
      .request()
      .input("Ma_KH", sql.VarChar, req.params.ma_kh)
      .execute("sp_GetThuCungByKhach");

    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
}

export async function createPet(req, res, next) {
  try {
    const pool = getPool();
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

    res.status(201).json({ message: "Pet created" });
  } catch (err) {
    next(err);
  }
}

export async function updatePet(req, res, next) {
  try {
    const pool = getPool();
    await pool
      .request()
      .input("Ma_PET", sql.VarChar, req.params.ma_pet)
      .input("Ten_PET", sql.NVarChar, req.body.Ten_PET)
      .input("Tinh_Trang_Suc_Khoe", sql.NVarChar, req.body.Tinh_Trang_Suc_Khoe)
      .execute("sp_UpdateThuCung");

    res.json({ message: "Pet updated" });
  } catch (err) {
    next(err);
  }
}

export async function deletePet(req, res, next) {
  try {
    const pool = getPool();
    await pool
      .request()
      .input("Ma_PET", sql.VarChar, req.params.ma_pet)
      .execute("sp_DeleteThuCung");

    res.json({ message: "Pet deleted" });
  } catch (err) {
    next(err);
  }
}
