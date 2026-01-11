import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function CustomerLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="customer-layout">
      {/* Nhúng toàn bộ CSS đồng bộ với phong cách DoctorLayout */}
      <style>{`
        .customer-layout {
          display: flex;
          min-height: 100vh;
          width: 100%;
          background: #f5f7fb;
        }

        .customer-sidebar {
          width: 240px;
          background: #0f172a; /* Màu đậm đặc trưng cho Customer hoặc giữ #2563eb nếu muốn giống hệt */
          color: white;
          padding: 16px;
          display: flex;
          flex-direction: column;
        }

        .logo {
          font-size: 22px;
          font-weight: bold;
          margin-bottom: 16px;
        }

        .user-info {
          margin-bottom: 24px;
          font-size: 14px;
        }

        .user-info .role {
          font-size: 12px;
          opacity: 0.85;
          text-transform: capitalize;
        }

        .menu {
          flex: 1;
        }

        .menu-item {
          display: block;
          padding: 12px 14px;
          margin-bottom: 8px;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-size: 15px;
          transition: background 0.2s;
        }

        .menu-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .menu-item.active {
          background: #3b82f6;
          font-weight: bold;
        }

        .logout-btn {
          margin-top: auto;
          padding: 10px;
          border: none;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          cursor: pointer;
          transition: background 0.2s;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
        }

        .customer-content {
          flex: 1;
          padding: 24px;
          background: #f9fafb;
          overflow-y: auto;
        }
      `}</style>

      <aside className="customer-sidebar">
        <h2 className="logo">PetCareX</h2>

        <div className="user-info">
          <div className="name">{user?.username}</div>
          <div className="role">{user?.role || 'Khách hàng'}</div>
        </div>

        <nav className="menu">
          <NavLink to="/customer" end className="menu-item">
            Trang chủ
          </NavLink>
          <NavLink to="/customer/products" className="menu-item">
            Sản phẩm
          </NavLink>
          <NavLink to="/customer/cart" className="menu-item">
            Giỏ hàng
          </NavLink>
          <NavLink to="/customer/orders" className="menu-item">
            Lịch sử mua
          </NavLink>
          <NavLink to="/customer/booking" className="menu-item">
            Đặt lịch khám
          </NavLink>
          <NavLink to="/customer/pets" className="menu-item">
            Thú cưng
          </NavLink>
        </nav>

        <button className="logout-btn" onClick={logout}>
          Đăng xuất
        </button>
      </aside>

      <main className="customer-content">
        <Outlet />
      </main>
    </div>
  );
}