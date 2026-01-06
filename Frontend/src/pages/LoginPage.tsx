import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Chuẩn hoá role từ CSDL
 */
function normalizeRole(role: string) {
  return (role || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .trim();
}

const ROLE_ROUTE_MAP: Record<string, string> = {
  bacsi: "/doctor",
  khachhang: "/customer",
  quanly: "/admin",
  nhanvien: "/staff",
};

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Đảm bảo AuthContext của bạn có hàm login

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Ngăn trang bị load lại
    console.log("Đang nhấn đăng nhập với:", { username, password }); // Kiểm tra xem hàm có chạy không
    
    setLoading(true);
    setError("");

    try {
      // 1. Gọi hàm login từ AuthContext của bạn
      // Bạn cần truyền username/password vào API thực tế ở đây
      const user = await login(username, password); 
      
      console.log("User nhận được từ API:", user);

      if (user && user.role) {
        const roleKey = normalizeRole(user.role);
        const targetRoute = ROLE_ROUTE_MAP[roleKey];

        if (targetRoute) {
          console.log("Đang chuyển hướng tới:", targetRoute);
          navigate(targetRoute);
        } else {
          setError("Vai trò người dùng không hợp lệ.");
        }
      } else {
        setError("Không tìm thấy thông tin vai trò.");
      }
    } catch (err: any) {
      console.error("Lỗi đăng nhập:", err);
      setError(err.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <style>{`
        .login-wrapper { min-height: 100vh; background: linear-gradient(135deg, #3b82f6, #06b6d4); display: flex; align-items: center; justify-content: center; font-family: sans-serif; }
        .login-card { background: #ffffff; width: 360px; padding: 28px 26px; border-radius: 12px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15); }
        .login-title { text-align: center; margin-bottom: 20px; color: #0f172a; }
        .login-title span { color: #3b82f6; }
        .login-input { width: 100%; padding: 12px; margin-bottom: 14px; border-radius: 8px; border: 1px solid #cbd5f5; font-size: 14px; box-sizing: border-box; }
        .login-button { width: 100%; padding: 12px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
        .login-button:disabled { background: #94a3b8; cursor: not-allowed; }
        .login-button:hover:not(:disabled) { background: #2563eb; }
        .login-error { color: #dc2626; font-size: 13px; margin-bottom: 10px; text-align: center; background: #fee2e2; padding: 8px; border-radius: 4px; }
        .login-footer { margin-top: 16px; text-align: center; font-size: 12px; color: #64748b; }
      `}</style>

      <div className="login-card">
        <h2 className="login-title">Pet<span>Care</span>X</h2>

        <form onSubmit={handleSubmit}>
          <input
            className="login-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Tên đăng nhập"
            required
          />

          <input
            className="login-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu"
            required
          />

          {error && <div className="login-error">{error}</div>}

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        <div className="login-footer">Hệ thống quản lý phòng khám thú cưng</div>
      </div>
    </div>
  );
}

export default LoginPage;