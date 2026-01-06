import { getPool, sql } from "../config/database.js";

/**
 * POST /api/cart/add
 */
export const addToCart = async (req, res) => {
  const { ma_kh, ma_sp, so_luong = 1 } = req.body;

  if (!ma_kh || !ma_sp) {
    return res.status(400).json({
      success: false,
      message: "Thiếu ma_kh hoặc ma_sp",
    });
  }

  try {
    const pool = getPool();

    await pool
      .request()
      .input("Ma_KH", sql.VarChar(10), ma_kh)
      .input("Ma_SP", sql.VarChar(10), ma_sp)
      .input("So_Luong", sql.Int, Number(so_luong) || 1)
      .execute("sp_GioHang_Add");

    return res.status(200).json({
      success: true,
      message: "Đã thêm vào giỏ hàng",
    });
  } catch (err) {
    console.error("❌ addToCart error:", err.message);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * GET /api/cart/:ma_kh
 */
export const getCart = async (req, res) => {
  const { ma_kh } = req.params;

  try {
    const pool = getPool();

    const result = await pool
      .request()
      .input("Ma_KH", sql.VarChar(10), ma_kh)
      .execute("sp_GioHang_Get");

    return res.status(200).json({
      success: true,
      items: result.recordset || [],
    });
  } catch (err) {
    console.error("❌ getCart error:", err.message);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * POST /api/cart/update-qty
 */
export const updateQty = async (req, res) => {
  const { ma_kh, ma_sp, so_luong } = req.body;

  try {
    const pool = getPool();

    await pool
      .request()
      .input("Ma_KH", sql.VarChar(10), ma_kh)
      .input("Ma_SP", sql.VarChar(10), ma_sp)
      .input("So_Luong", sql.Int, Number(so_luong))
      .execute("sp_GioHang_UpdateQty");

    return res.status(200).json({
      success: true,
      message: "Cập nhật số lượng thành công",
    });
  } catch (err) {
    console.error("❌ updateQty error:", err.message);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * POST /api/cart/remove
 */
export const removeItem = async (req, res) => {
  const { ma_kh, ma_sp } = req.body;

  try {
    const pool = getPool();

    await pool
      .request()
      .input("Ma_KH", sql.VarChar(10), ma_kh)
      .input("Ma_SP", sql.VarChar(10), ma_sp)
      .execute("sp_GioHang_Remove");

    return res.status(200).json({
      success: true,
      message: "Đã xóa sản phẩm khỏi giỏ",
    });
  } catch (err) {
    console.error("❌ removeItem error:", err.message);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * POST /api/cart/select
 */
export const toggleSelect = async (req, res) => {
  const { ma_kh, ma_sp, is_selected } = req.body;

  try {
    const pool = getPool();

    await pool
      .request()
      .input("Ma_KH", sql.VarChar(10), ma_kh)
      .input("Ma_SP", sql.VarChar(10), ma_sp)
      .input("Is_Selected", sql.Bit, is_selected ? 1 : 0)
      .execute("sp_GioHang_ToggleSelect");

    return res.status(200).json({
      success: true,
      message: "Đã cập nhật lựa chọn",
    });
  } catch (err) {
    console.error("❌ toggleSelect error:", err.message);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


export const checkoutSelected = async (req, res) => {
  const { ma_kh, hinhThuc_TT } = req.body;

  if (!ma_kh) {
    return res.status(400).json({ success: false, message: "Thiếu ma_kh" });
  }

  try {
    const pool = getPool();
    const result = await pool
      .request()
      .input("Ma_KH", sql.VarChar(10), ma_kh)
      .input("NV_Lap", sql.VarChar(10), null) // khách tự checkout => NV_Lap null
      .input("HinhThuc_TT", sql.NVarChar(50), hinhThuc_TT ?? "Tiền mặt")
      .execute("sp_GioHang_Checkout_Selected");

    const row = result.recordset?.[0];
    if (!row) {
      return res.status(500).json({ success: false, message: "Không nhận được phản hồi từ SQL" });
    }

    if (row.Status !== "Success") {
      return res.status(400).json({
        success: false,
        message: row.Message,
      });
    }

    return res.status(200).json({
      success: true,
      message: row.Message,
      ma_hd: row.Ma_HD,
      tong_tien: row.Tong_Tien,
    });
  } catch (err) {
    console.error("❌ checkoutSelected error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};
