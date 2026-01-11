import { sql, getPool } from "../config/database.js";

// 1. Lấy danh sách hóa đơn "Đang xử lý"
export async function getPendingOrders(req, res, next) {
  try {
    const pool = getPool();
    const result = await pool.request().execute("sp_getbill_processing");
    return res.json(result.recordset || []);
  } catch (err) {
    next(err);
  }
}

// 2. Duyệt hoặc Hủy hóa đơn và cập nhật NV_Lap
export async function updateOrderStatus(req, res, next) {
  try {
    const { maHD } = req.params;
    const { Trang_Thai } = req.body;
    
    // Lấy Ma_NV từ token đã được verifyToken giải mã
    const maNV = req.user.ma_nv;

    if (!maNV) {
      return res.status(400).json({ message: "Không tìm thấy thông tin nhân viên duyệt" });
    }

    const pool = getPool();
    const result = await pool
      .request()
      .input("Ma_HD", sql.VarChar(10), maHD)
      .input("Ma_NV", sql.VarChar(10), maNV)
      .input("Trang_Thai_Moi", sql.NVarChar(50), Trang_Thai)
      .execute("sp_DuyetHoaDon"); // Gọi Procedure đã tạo ở bước trước

    const statusResult = result.recordset[0];
    if (statusResult && statusResult.Success) {
      return res.json({ success: true, message: statusResult.Message });
    } else {
      return res.status(400).json({ 
        success: false, 
        message: statusResult?.Message || "Cập nhật thất bại" 
      });
    }
  } catch (err) {
    next(err);
  }
}

// 1. Tra cứu thú cưng.
export async function searchPets(req, res, next) {
  try {
    const keyword = (req.query.keyword || "").toString().trim();
    const pool = getPool();

    const result = await pool
      .request()
      .input("Keyword", sql.NVarChar(100), keyword)
      .execute("dbo.sp_SearchPets");

    return res.json(result.recordset || []);
  } catch (err) {
    next(err);
  }
}

// 2. Thêm mới thú cưng (Dành cho Nhân viên)
export async function addPet(req, res, next) {
  try {
    const { 
      Ma_PET, Ma_KH, Ten_PET, Ten_Loai, 
      Giong, Gioi_Tinh, Ngay_Sinh, Mau_Sac 
    } = req.body;

    const pool = getPool();
    
    // Thực hiện Insert trực tiếp hoặc bạn có thể viết thêm Proc sp_AddPet
    await pool.request()
      .input("Ma_KH", sql.VarChar(10), Ma_KH)
      .input("Ten_PET", sql.NVarChar(50), Ten_PET)
      .input("Ten_Loai", sql.NVarChar(50), Ten_Loai)
      .input("Giong", sql.NVarChar(50), Giong)
      .input("Gioi_Tinh", sql.NVarChar(10), Gioi_Tinh)
      .input("Ngay_Sinh", sql.Date, Ngay_Sinh)
      .input("Mau_Sac", sql.NVarChar(50), Mau_Sac)
      .exective(dbo.sp_AddPetWithAutoID);

    return res.status(201).json({ success: true, message: "Thêm thú cưng thành công!" });
  } catch (err) {
    // Nếu trùng khóa chính Ma_PET, SQL sẽ báo lỗi và đi vào đây
    next(err);
  }
}
