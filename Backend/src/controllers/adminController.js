import { sql, getPool } from "../config/database.js";

export const getStaffs = async (req, res) => {
    const poolPromise = getPool();
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute("sp_GetNhanVien");
    console.log(result.recordset);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addStaffWithAccount = async (req, res) => {
    const poolPromise = getPool();
  const {
    Ma_NV, Ho_Ten, Ngay_Sinh, Gioi_Tinh,
    Vai_Tro, Ngay_Vao, Luong_CB, Ma_CN
  } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("Ma_NV", sql.VarChar, Ma_NV)
      .input("Ho_Ten", sql.NVarChar, Ho_Ten)
      .input("Ngay_Sinh", sql.Date, Ngay_Sinh)
      .input("Gioi_Tinh", sql.NVarChar, Gioi_Tinh)
      .input("Vai_Tro", sql.NVarChar, Vai_Tro)
      .input("Ngay_Vao", sql.Date, Ngay_Vao)
      .input("Luong_CB", sql.Decimal(18, 2), Luong_CB)
      .input("Ma_CN", sql.VarChar, Ma_CN)
      .execute("sp_AddNhanVien_WithAccount");

    console.log(result.recordset);
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateStaff = async (req, res) => {
    const poolPromise = getPool();
  const { Ma_NV, Ho_Ten, Vai_Tro, Luong_CB, Ma_CN } = req.body;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input("Ma_NV", sql.VarChar, Ma_NV)
      .input("Ho_Ten", sql.NVarChar, Ho_Ten)
      .input("Vai_Tro", sql.NVarChar, Vai_Tro)
      .input("Luong_CB", sql.Decimal(18, 2), Luong_CB)
      .input("Ma_CN", sql.VarChar, Ma_CN)
      .execute("sp_UpdateNhanVien");
      
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteStaff = async (req, res) => {
    const poolPromise = getPool();
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("Ma_NV", sql.VarChar, req.params.ma_nv)
      .execute("sp_DeleteNhanVien");

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAccounts = async (req, res) => {
    const poolPromise = getPool();
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute("sp_GetTaiKhoan");
    console.log(result.recordset);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addAccount = async (req, res) => {
    const poolPromise = getPool();
  const { Ten_DangNhap, Mat_Khau, Vai_Tro, Ma_KH, Ma_NV, Ma_BS } = req.body;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input("Ten_DangNhap", sql.VarChar, Ten_DangNhap)
      .input("Mat_Khau", sql.VarChar, Mat_Khau)
      .input("Vai_Tro", sql.NVarChar, Vai_Tro)
      .input("Ma_KH", sql.VarChar, Ma_KH)
      .input("Ma_NV", sql.VarChar, Ma_NV)
      .input("Ma_BS", sql.VarChar, Ma_BS)
      .execute("sp_AddTaiKhoan");

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteAccount = async (req, res) => {
    const poolPromise = getPool();
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("Ten_DangNhap", sql.VarChar, req.params.username)
      .execute("sp_DeleteTaiKhoan");

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * THỐNG KÊ DOANH THU – SỐ LƯỢNG
 * Theo:
 *  - Toàn hệ thống
 *  - Chi nhánh
 *  - Loại dịch vụ
 *
 * Query params:
 *  - tu_ngay   (required)
 *  - den_ngay  (required)
 *  - ma_cn     (optional)
 *  - loai_dv   (optional)
 */
export const thongKeDoanhThu = async (req, res) => {
  try {
    const { tu_ngay, den_ngay, ma_cn, loai_dv } = req.query;

    if (!tu_ngay || !den_ngay) {
      return res.status(400).json({
        success: false,
        message: "Thiếu tham số từ ngày hoặc đến ngày",
      });
    }

    const pool =  getPool();

    const request = pool.request()
      .input("TuNgay", sql.DateTime, tu_ngay)
      .input("DenNgay", sql.DateTime, den_ngay)
      .input("Ma_CN", sql.VarChar(10), ma_cn || null)
      .input("Loai_Dich_Vu", sql.NVarChar(30), loai_dv || null);
    console.log("Executing stored procedure sp_TK_DoanhThu with params:", {
      TuNgay: tu_ngay,
      DenNgay: den_ngay,
      Ma_CN: ma_cn || null,
      Loai_Dich_Vu: loai_dv || null,
    });
    const result = await request.execute(
      "sp_TK_DoanhThu"
    );

    console.log("Stored procedure sp_TK_DoanhThu executed successfully. Records returned:", result.recordset);   

    return res.json({
      success: true,
      filters: {
        tu_ngay,
        den_ngay,
        ma_cn: ma_cn || "ALL",
        loai_dv: loai_dv || "ALL",
      },
      total_records: result.recordset.length,
      data: result.recordset,
    });
  } catch (err) {
    console.error("thongKeDoanhThu error:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi thống kê doanh thu",
    });
  }
};

export const getDoctorStats = async (req, res) => {
  try {
    const { Ma_CN, Ma_BS, TuNgay, DenNgay } = req.query;

    if (!TuNgay || !DenNgay) {
      return res.status(400).json({ message: "Vui lòng cung cấp TuNgay và DenNgay" });
    }

    const pool = getPool();

    const result = await pool.request()
      .input("Ma_CN", sql.VarChar(10), Ma_CN || null)
      .input("Ma_BS", sql.VarChar(10), Ma_BS || null)
      .input("TuNgay", sql.DateTime, TuNgay)
      .input("DenNgay", sql.DateTime, DenNgay)
      .execute("sp_TK_BacSi");

    console.log("Doctor statistic: ", result.recordset);

    return res.json({
      success: true,
      filters: {
        TuNgay,
        DenNgay,
        Ma_CN: Ma_CN || "ALL",
        Ma_BS: Ma_BS || "ALL",
      },
      total_records: result.recordset.length,
      data: result.recordset,
    });
  } catch (error) {
    console.error("❌ Lỗi thống kê bác sĩ:", error);
    res.status(500).json({ message: "Lỗi server khi thống kê bác sĩ", error });
  }
};

export const getDoctorStatistic = async (req, res) => {
  try {
    const {
      tuNgay,
      denNgay,
      Ma_CN,
      page = 1,
      pageSize = 20
    } = req.query;

    if (!tuNgay || !denNgay) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp tuNgay và denNgay"
      });
    }

    const pool = getPool();

    const result = await pool.request()
      .input("TuNgay", sql.DateTime, tuNgay)
      .input("DenNgay", sql.DateTime, denNgay)
      .input("Ma_CN", sql.VarChar, Ma_CN || null)
      .input("Page", sql.Int, Number(page))
      .input("PageSize", sql.Int, Number(pageSize))
      .execute("sp_TK_BacSi_Paging");

    console.log(result.recordset)
    return res.json({
      success: true,
      total: result.recordsets[0][0]?.TotalRows || 0,
      data: result.recordsets[1] || []
    });

  } catch (err) {
    console.error("DoctorStatistic error:", err);
    return res.status(500).json({ success: false });
  }
};

export const getDoctorStatisticTop10 = async (req, res) => {
  try {
    const {
      tuNgay,
      denNgay,
      Ma_CN,
      orderBy = "DOANH_THU"
    } = req.query;

    if (!tuNgay || !denNgay) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp tuNgay và denNgay"
      });
    }

    const pool = getPool();

    const result = await pool.request()
      .input("TuNgay", sql.DateTime, tuNgay)
      .input("DenNgay", sql.DateTime, denNgay)
      .input("Ma_CN", sql.VarChar, Ma_CN || null)
      .input("OrderBy", sql.NVarChar, orderBy)
      .execute("sp_TK_BacSi_Top10");

    return res.json({
      success: true,
      data: result.recordset || []
    });
    console.log()

  } catch (err) {
    console.error("DoctorStatisticTop10 error:", err);
    return res.status(500).json({ success: false });
  }
};

// export const getRevenueByBusinessType = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;
//     const pool = await getPool();
    
//     const request = pool.request();
    
//     // Sử dụng sql.Date từ mssql đã import
//     request.input('startDate', sql.Date, startDate || null);
//     request.input('endDate', sql.Date, endDate || null);

//     const result = await request.execute('Get_DoanhThu_TheoLoaiNghiepVu');

//     res.status(200).json({
//       success: true,
//       data: result.recordset,
//     });
//   } catch (err) {
//     // In lỗi ra terminal để bạn dễ theo dõi nếu vẫn còn lỗi khác
//     console.error("SQL Error:", err); 
//     res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
//   }
// };
// // export const getRevenueByDateRange = async (req, res, next) => {
// //   try {
// //     // Lấy startDate và endDate từ query params
// //     const { startDate, endDate } = req.query;

// //     // Kiểm tra nếu không có startDate hoặc endDate
// //     if (!startDate || !endDate) {
// //       return res.status(400).json({ success: false, message: "Missing date range parameters" });
// //     }

// //     // Tạo kết nối với database
// //     const pool = getPool();

// //     // Thực thi stored procedure với startDate và endDate
// //     const result = await pool.request()
// //       .input("startDate", sql.Date, startDate)
// //       .input("endDate", sql.Date, endDate)
// //       .execute("GetRevenueByDateRange");

// //     // Trả về kết quả doanh thu
// //     res.json({ success: true, totalRevenue: result.recordset[0].TotalRevenue });

// //   } catch (error) {
// //     next(error); // Gửi lỗi đến error handler
// //   }
// // };
