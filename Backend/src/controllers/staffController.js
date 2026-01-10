import { sql, getPool } from "../config/database.js";

// GET /api/staff/invoices/:id
export async function getInvoiceInfo(req, res, next) {
  try {
    const { id } = req.params;
    const pool = getPool();

    const result = await pool
      .request()
      .input("Ma_HD", sql.VarChar(10), id)
      .execute("sp_Staff_GetInvoiceInfo");

    // Kiểm tra nếu không tìm thấy
    if (result.recordsets[0] && result.recordsets[0][0]?.Status === 'NotFound') {
        return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
    }

    // Kết quả trả về gồm nhiều bảng (recordsets)
    return res.json({
      invoice: result.recordsets[0][0], // Thông tin chung
      pets: result.recordsets[1],       // Danh sách thú cưng của khách
      doctors: result.recordsets[2],    // Danh sách bác sĩ hệ thống
      details: result.recordsets[3]     // Chi tiết đã có
    });

  } catch (err) {
    next(err);
  }
}

// POST /api/staff/exam-details
export async function addExamDetail(req, res, next) {
  try {
    const { 
        maHD, maPet, bacSi, trieuChung, 
        chuanDoan, ngayHenTaiKham, thanhTien 
    } = req.body;

    const pool = getPool();

    await pool.request()
      .input("Ma_HD", sql.VarChar(10), maHD)
      .input("Ma_PET", sql.VarChar(10), maPet)
      .input("Bac_Si", sql.VarChar(10), bacSi)
      .input("Trieu_Chung", sql.NVarChar(sql.MAX), trieuChung)
      .input("Chuan_Doan", sql.NVarChar(sql.MAX), chuanDoan)
      .input("Ngay_Hen_Tai_Kham", sql.DateTime, ngayHenTaiKham ? new Date(ngayHenTaiKham) : null)
      .input("Thanh_Tien", sql.Decimal(18, 2), thanhTien)
      .execute("sp_Staff_AddExamDetail");

    res.json({ status: "Success", message: "Đã thêm chi tiết khám bệnh thành công" });
  } catch (err) {
    next(err);
  }
}