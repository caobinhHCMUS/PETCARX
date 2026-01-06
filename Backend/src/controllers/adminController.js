import { getPool } from "../config/database.js";
import sql from 'mssql'; // THÊM DÒNG NÀY

export const getRevenueByBusinessType = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const pool = await getPool();
    
    const request = pool.request();
    
    // Sử dụng sql.Date từ mssql đã import
    request.input('startDate', sql.Date, startDate || null);
    request.input('endDate', sql.Date, endDate || null);

    const result = await request.execute('Get_DoanhThu_TheoLoaiNghiepVu');

    res.status(200).json({
      success: true,
      data: result.recordset,
    });
  } catch (err) {
    // In lỗi ra terminal để bạn dễ theo dõi nếu vẫn còn lỗi khác
    console.error("SQL Error:", err); 
    res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
  }
};
// export const getRevenueByDateRange = async (req, res, next) => {
//   try {
//     // Lấy startDate và endDate từ query params
//     const { startDate, endDate } = req.query;

//     // Kiểm tra nếu không có startDate hoặc endDate
//     if (!startDate || !endDate) {
//       return res.status(400).json({ success: false, message: "Missing date range parameters" });
//     }

//     // Tạo kết nối với database
//     const pool = getPool();

//     // Thực thi stored procedure với startDate và endDate
//     const result = await pool.request()
//       .input("startDate", sql.Date, startDate)
//       .input("endDate", sql.Date, endDate)
//       .execute("GetRevenueByDateRange");

//     // Trả về kết quả doanh thu
//     res.json({ success: true, totalRevenue: result.recordset[0].TotalRevenue });

//   } catch (error) {
//     next(error); // Gửi lỗi đến error handler
//   }
// };
