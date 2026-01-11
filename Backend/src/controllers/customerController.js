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


//xem lịch sử mua hàng 
export async function getMyOrderHistory(req, res) {
  try {
    const maKH = req.user?.ma_kh; // ✅ đúng theo payload hiện tại

    if (!maKH) {
      return res.status(401).json({
        message: "Token không có mã khách hàng (ma_kh). Vui lòng đăng nhập lại.",
      });
    }

    const pool = getPool();
    const result = await pool
      .request()
      .input("Ma_KH", sql.VarChar(10), maKH)
      .execute("dbo.sp_KH_GetOrderHistory");

    return res.json({
      ma_kh: maKH,
      orders: result.recordset || [],
    });
  } catch (err) {
    console.error("Lỗi getMyOrderHistory:", err);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
}

// ===== PETS CRUD =====

// GET /api/customer/pets
export async function getMyPets(req, res) {
  try {
    const maKH = req.user?.ma_kh; // giữ đúng như getMyOrderHistory

    if (!maKH) {
      return res.status(401).json({
        message: "Token không có mã khách hàng (ma_kh). Vui lòng đăng nhập lại.",
      });
    }

    const pool = getPool();
    const result = await pool
      .request()
      .input("Ma_KH", sql.VarChar(10), maKH)
      .execute("dbo.sp_KH_GetPets");

    return res.json({ ma_kh: maKH, items: result.recordset || [] });
  } catch (err) {
    console.error("Lỗi getMyPets:", err);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
}

// POST /api/customer/pets
export async function createMyPet(req, res) {
  try {
    const maKH = req.user?.ma_kh;
    if (!maKH) return res.status(401).json({ message: "Unauthenticated" });

    const {
      Ten_PET,
      Ten_Loai = null,
      Giong = null,
      Gioi_Tinh = null,
      Ngay_Sinh = null,
      Tinh_Trang_Suc_Khoe = null,
      Mau_Sac = null,
    } = req.body;

    if (!Ten_PET || !Ten_PET.toString().trim()) {
      return res.status(400).json({ message: "Ten_PET là bắt buộc" });
    }

    const pool = getPool();
    const result = await pool
      .request()
      .input("Ma_KH", sql.VarChar(10), maKH)
      .input("Ten_PET", sql.NVarChar(50), Ten_PET)
      .input("Ten_Loai", sql.NVarChar(50), Ten_Loai)
      .input("Giong", sql.NVarChar(50), Giong)
      .input("Gioi_Tinh", sql.NVarChar(10), Gioi_Tinh)
      .input("Ngay_Sinh", sql.Date, Ngay_Sinh)
      .input("Tinh_Trang_Suc_Khoe", sql.NVarChar(255), Tinh_Trang_Suc_Khoe)
      .input("Mau_Sac", sql.NVarChar(50), Mau_Sac)
      .execute("dbo.sp_KH_CreatePet");

    return res.status(201).json({ item: result.recordset?.[0] });
  } catch (err) {
    console.error("Lỗi createMyPet:", err);
    return res.status(400).json({ message: err.message || "Lỗi hệ thống" });
  }
}

// PUT /api/customer/pets/:ma_pet
export async function updateMyPet(req, res) {
  try {
    const maKH = req.user?.ma_kh;
    if (!maKH) return res.status(401).json({ message: "Unauthenticated" });

    const { ma_pet } = req.params;

    const {
      Ten_PET = null,
      Ten_Loai = null,
      Giong = null,
      Gioi_Tinh = null,
      Ngay_Sinh = null,
      Tinh_Trang_Suc_Khoe = null,
      Mau_Sac = null,
    } = req.body;

    const pool = getPool();
    const result = await pool
      .request()
      .input("Ma_KH", sql.VarChar(10), maKH)
      .input("Ma_PET", sql.VarChar(10), ma_pet)
      .input("Ten_PET", sql.NVarChar(50), Ten_PET)
      .input("Ten_Loai", sql.NVarChar(50), Ten_Loai)
      .input("Giong", sql.NVarChar(50), Giong)
      .input("Gioi_Tinh", sql.NVarChar(10), Gioi_Tinh)
      .input("Ngay_Sinh", sql.Date, Ngay_Sinh)
      .input("Tinh_Trang_Suc_Khoe", sql.NVarChar(255), Tinh_Trang_Suc_Khoe)
      .input("Mau_Sac", sql.NVarChar(50), Mau_Sac)
      .execute("dbo.sp_KH_UpdatePet");

    return res.json({ item: result.recordset?.[0] });
  } catch (err) {
    console.error("Lỗi updateMyPet:", err);
    return res.status(400).json({ message: err.message || "Lỗi hệ thống" });
  }
}

// DELETE /api/customer/pets/:ma_pet
export async function deleteMyPet(req, res) {
  try {
    const maKH = req.user?.ma_kh;
    if (!maKH) return res.status(401).json({ message: "Unauthenticated" });

    const { ma_pet } = req.params;

    const pool = getPool();
    await pool
      .request()
      .input("Ma_KH", sql.VarChar(10), maKH)
      .input("Ma_PET", sql.VarChar(10), ma_pet)
      .execute("dbo.sp_KH_DeletePet");

    return res.json({ deleted: true });
  } catch (err) {
    console.error("Lỗi deleteMyPet:", err);
    return res.status(400).json({ message: err.message || "Lỗi hệ thống" });
  }
}


// Lấy danh sách bác sĩ dựa trên ngày và ca khách chọn
export async function getAvailableDoctors(req, res) {
  try {
    const { ngay, ca } = req.query; // Ví dụ: ?ngay=2023-10-25&ca=2

    if (!ngay || !ca) {
      return res.status(400).json({ message: "Vui lòng chọn ngày và ca khám" });
    }

    const pool = getPool();
    const result = await pool
      .request()
      .input("Ngay_Kham", sql.Date, ngay)
      .input("Ca_lamviec", sql.Int, ca)
      .execute("dbo.sp_KH_GetAvailableDoctors");

    return res.json(result.recordset || []);
  } catch (err) {
    console.error("Lỗi getAvailableDoctors:", err);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
}

// Tạo phiếu đặt lịch khám
export async function createBooking(req, res) {
  try {
    const maKH = req.user?.ma_kh;
    const { Ma_PET, Ma_BS, Ca_lamviec, Ngay_Dat } = req.body;

    if (!maKH) return res.status(401).json({ message: "Unauthenticated" });

    const pool = getPool();
    await pool
      .request()
      .input("Ma_KH", sql.VarChar(10), maKH)
      .input("Ma_PET", sql.VarChar(10), Ma_PET)
      .input("Ma_BS", sql.VarChar(10), Ma_BS)
      .input("Ca_lamviec", sql.Int, Ca_lamviec)
      .input("Ngay_Dat", sql.Date, Ngay_Dat)
      .execute("dbo.sp_KH_CreateBooking");

    return res.status(201).json({ success: true, message: "Đặt lịch thành công!" });
  } catch (err) {
    console.error("Lỗi createBooking:", err);
    return res.status(400).json({ message: "Không thể đặt lịch. Vui lòng thử lại." });
  }
}