import jwt from "jsonwebtoken";
import { sql, getPool } from "../config/database.js";

/**
 * Hàm chuẩn hóa cực mạnh để xử lý lỗi font (Qu?n lý -> qunly)
 */
function perfectNormalize(str) {
  if (!str) return "";
  return str
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "") // Xóa ký tự lạ như ?
    .trim();
}

const ALLOWED_ROLES = ["khachhang", "bacsi", "quanly", "qunly", "nhanvien", "admin"];

export async function login(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: "Thiếu tên đăng nhập hoặc mật khẩu" });
  }

  try {
    const pool = getPool();
    const result = await pool.request()
      .input("TenDangNhap", sql.VarChar(50), username)
      .input("MatKhau", sql.VarChar(255), password)
      .execute("dbo.sp_DangNhap");

    const u = result.recordset?.[0];
    if (!u) {
      return res.status(401).json({ message: "Tên đăng nhập hoặc mật khẩu không đúng" });
    }

    // 1. Lấy vai trò và chuẩn hóa
    const rawRoleFromDB = u.vai_tro || "";
    const cleanRole = perfectNormalize(rawRoleFromDB);

    // 2. ÉP KIỂU ĐỂ KHỚP VỚI FRONTEND (Quan trọng nhất)
    // Nếu là "qunly" (lỗi font) thì phải biến thành "quanly" để Frontend cho qua cổng
    const finalRole = (cleanRole === "qunly" || cleanRole === "quanly" || cleanRole === "admin") ? "quanly" : cleanRole;

    if (!ALLOWED_ROLES.includes(finalRole)) {
      return res.status(403).json({ message: `Vai trò không hỗ trợ: ${rawRoleFromDB}` });
    }

    // 3. Tạo Payload (Sửa lỗi isManager và ma_ql)
    const userPayload = {
      username: u.Ten_DangNhap,
      role: finalRole,                // Trả về "quanly" (có chữ a)
      ma_kh: u.Ma_KH ?? null,
      ma_bs: u.Ma_BS ?? null,
      ma_nv: u.Ma_NV ?? null,
      ma_ql: u.Ma_QL ?? u.Ma_NV ?? null, // Ép mã NV sang mã QL nếu mã QL null
      isManager: finalRole === "quanly", // Sẽ là TRUE
    };

    // 4. Ký Token
    const token = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: "8h" });

    // 5. Trả về kết quả
    return res.json({
      token,
      user: {
        ...userPayload,
        ten_kh: u.Ten_KH ?? u.ten_kh ?? null,
        ten_bs: u.Ten_BS ?? u.ten_bs ?? null,
        ten_nv: u.Ten_NV ?? u.ten_nv ?? "Quản lý hệ thống",
        ten_ql: u.Ten_QL ?? u.ten_ql ?? u.Ten_NV ?? null,
        display_role: rawRoleFromDB
      },
    });

  } catch (err) {
    console.error("Lỗi Login:", err);
    return res.status(500).json({ message: "Lỗi kết nối hệ thống" });
  }
}

export async function me(req, res) {
  res.json(req.user);
}