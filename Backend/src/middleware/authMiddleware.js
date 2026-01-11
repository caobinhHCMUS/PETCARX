import jwt from "jsonwebtoken";

/**
 * Hàm chuẩn hóa cực mạnh để đồng bộ với authController
 * Đảm bảo các vai trò như "Quản lý" hay "Nhân viên" đều về dạng chuẩn không dấu, không cách
 */
function perfectNormalize(str) {
  if (!str) return "";
  return str
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "") 
    .trim();
}

/**
 * Middleware xác thực Token (Dùng cả hai tên để tránh lỗi ở các file Routes khác nhau)
 */
export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Thiếu token xác thực" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
}

// Export thêm alias requireAuth để sửa lỗi ở authRoutes.js
export const requireAuth = verifyToken;

/**
 * Middleware kiểm tra quyền Nhân viên
 */
export function isStaff(req, res, next) {
  const role = perfectNormalize(req.user?.role || "");
  
  // Kiểm tra nếu role sau khi chuẩn hóa là 'nhanvien'
  if (role === "nhanvien") {
    next();
  } else {
    res.status(403).json({ 
      message: `Bạn không có quyền truy cập. Yêu cầu: nhanvien, Hiện tại: ${req.user?.role || "Không rõ"}` 
    });
  }
}

/**
 * Middleware kiểm tra quyền bất kỳ (Dùng cho các route cho phép nhiều nhóm quyền)
 */
export function allowRoles(roles = []) {
  const normalizedAllowedRoles = roles.map(perfectNormalize);

  return (req, res, next) => {
    const userRole = perfectNormalize(req.user?.role || "");

    if (normalizedAllowedRoles.includes(userRole)) {
      next();
    } else {
      res.status(403).json({ 
        message: `Quyền hạn không hợp lệ. Yêu cầu một trong: ${roles.join(", ")}` 
      });
    }
  };
}