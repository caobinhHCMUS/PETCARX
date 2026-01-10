import { sql, getPool } from "../config/database.js";

export async function searchPets(req, res, next) {
  try {
    const ma_bs = req.user?.ma_bs;
    if (!ma_bs) return res.status(403).json({ success: false, message: "Không phải tài khoản bác sĩ" });

    const keyword = req.query.keyword?.toString() || "";
    const pool = getPool();
    const rs = await pool.request()
      .input("Keyword", sql.NVarChar(100), keyword)
      .execute("dbo.sp_BS_SearchPets");

    res.json({ success: true, items: rs.recordset || [] });
  } catch (e) { next(e); }
}

export async function getPetExamHistory(req, res, next) {
  try {
    const ma_bs = req.user?.ma_bs;
    if (!ma_bs) return res.status(403).json({ success: false, message: "Không phải tài khoản bác sĩ" });

    const ma_pet = req.params.ma_pet;
    const pool = getPool();
    const rs = await pool.request()
      .input("Ma_PET", sql.VarChar(10), ma_pet)
      .execute("dbo.sp_BS_GetPetExamHistory");

    res.json({ success: true, items: rs.recordset || [] });
  } catch (e) { next(e); }
}

export async function searchMedicines(req, res, next) {
  try {
    const ma_bs = req.user?.ma_bs;
    if (!ma_bs) return res.status(403).json({ success: false, message: "Không phải tài khoản bác sĩ" });

    const keyword = req.query.keyword?.toString() || "";
    const pool = getPool();
    const rs = await pool.request()
      .input("Keyword", sql.NVarChar(100), keyword)
      .execute("dbo.sp_BS_SearchMedicines");

    res.json({ success: true, items: rs.recordset || [] });
  } catch (e) { next(e); }
}

export async function createExam(req, res, next) {
  try {
    const ma_bs = req.user?.ma_bs;
    if (!ma_bs) return res.status(403).json({ success: false, message: "Không phải tài khoản bác sĩ" });

    const { ma_pet, trieu_chung, chuan_doan, ngay_hen_tai_kham, thanh_tien } = req.body || {};
    if (!ma_pet) return res.status(400).json({ success: false, message: "Thiếu ma_pet" });

    const pool = getPool();
    const rs = await pool.request()
      .input("Ma_PET", sql.VarChar(10), ma_pet)
      .input("Ma_BS", sql.VarChar(10), ma_bs)
      .input("Trieu_Chung", sql.NVarChar(sql.MAX), trieu_chung ?? null)
      .input("Chuan_Doan", sql.NVarChar(sql.MAX), chuan_doan ?? null)
      .input("Ngay_Hen_Tai_Kham", sql.DateTime, ngay_hen_tai_kham ? new Date(ngay_hen_tai_kham) : null)
      .input("Thanh_Tien", sql.Decimal(18,2), thanh_tien ?? 0)
      .execute("dbo.sp_BS_CreateExam");

    const ma_hd = rs.recordset?.[0]?.Ma_HD;
    res.json({ success: true, ma_hd });
  } catch (e) { next(e); }
}


export async function issuePrescription(req, res, next) {
  try {
    // 1. Lấy Ma_BS từ token (đã qua middleware auth)
    const ma_bs = req.user?.ma_bs; 
    
    // Kiểm tra quyền bác sĩ
    if (!ma_bs) return res.status(403).json({ success: false, message: "Không phải bác sĩ" });

    const { ma_pet, items } = req.body;
    
    // Validate dữ liệu đầu vào
    if (!ma_pet || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Thiếu dữ liệu hoặc danh sách thuốc rỗng" });
    }

    const pool = getPool();
    
    // 2. Tạo Table-Valued Parameter (TVP)
    // Cấu trúc này PHẢI khớp với TYPE dbo.TVP_PrescriptionItems trong SQL
    const tvp = new sql.Table("dbo.TVP_PrescriptionItems"); 
    tvp.columns.add("ma_sp", sql.NVarChar(50), { nullable: false });
    tvp.columns.add("so_luong", sql.Int, { nullable: false });
    tvp.columns.add("lieu_dung", sql.NVarChar(255), { nullable: true });
    tvp.columns.add("tan_suat", sql.NVarChar(255), { nullable: true });
    tvp.columns.add("so_ngay", sql.Int, { nullable: true });
    tvp.columns.add("cach_dung", sql.NVarChar(255), { nullable: true });

    // Fill dữ liệu
    for (const it of items) {
      tvp.rows.add(
        it.ma_sp,
        it.so_luong,
        it.lieu_dung || null,
        it.tan_suat || null,
        it.so_ngay || null,
        it.cach_dung || null
      );
    }

    // 3. Gọi Stored Procedure
    const result = await pool.request()
      .input("ma_pet", sql.VarChar(10), ma_pet.trim())
      .input("ma_bs", sql.VarChar(10), ma_bs) // <--- THÊM DÒNG NÀY: Truyền mã bác sĩ vào
      .input("items", tvp)
      .output("ma_hd", sql.VarChar(10)) // Chỉnh lại length khớp DB
      .output("ma_dt", sql.VarChar(10)) // Chỉnh lại length khớp DB
      .execute("dbo.sp_BS_IssuePrescription");

    const row = result.recordset?.[0];
    
    res.json({
      success: true,
      ma_hd: result.output.ma_hd || row?.ma_hd,
      ma_dt: result.output.ma_dt || row?.ma_dt,
      tong_tien: row?.tong_tien
    });

  } catch (e) {
    next(e);
  }
}

export const getDoctorExamHistory = async (req, res, next) => {
  const { ma_bs } = req.params; // Lấy mã bác sĩ từ URL params

  try {
    // 1. Sử dụng getPool() thay vì poolPromise để tránh lỗi undefined
    const pool = getPool(); 
    
    // 2. Thực hiện truy vấn
    const result = await pool.request()
      .input('Ma_BS', sql.VarChar(10), ma_bs)
      .execute('sp_BS_GetDoctorExamHistory'); // Gọi stored procedure

    // 3. Trả về kết quả với cấu trúc 'items' để nhất quán
    res.json({
      success: true,
      items: result.recordset || [] 
    });

  } catch (err) {
    // 4. Sử dụng next(err) để đẩy lỗi qua middleware xử lý lỗi tập trung
    next(err); 
  }
};