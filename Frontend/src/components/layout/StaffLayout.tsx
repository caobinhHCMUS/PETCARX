import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function StaffLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="staff-layout">
      {/* Nhúng toàn bộ CSS vào đây */}
      <style>{`
        .staff-layout {
          display: flex;
          min-height: 100vh;
          width: 100%;
          background: #f5f7fb;
        }

        .staff-sidebar {
          width: 240px;
          background: #2563eb;
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
        }

        .menu-item:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        /* NavLink của react-router-dom sẽ tự thêm class .active khi khớp URL */
        .menu-item.active {
          background: rgba(255, 255, 255, 0.25);
          font-weight: bold;
        }

        .logout-btn {
          margin-top: auto;
          padding: 10px;
          border: none;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.25);
          color: white;
          cursor: pointer;
        }

        .staff-content {
          flex: 1;
          padding: 24px;
          background: #f9fafb;
        }
      `}</style>

      <aside className="staff-sidebar">
        <h2 className="logo">PetCareX</h2>

        <div className="user-info">
          <div className="name">{user?.ten_nv || user?.username}</div>
          <div className="role">Nhân viên</div>
        </div>

        <nav className="menu">
          <NavLink to="/staff" end className="menu-item">
            Trang chủ
          </NavLink>
          <NavLink to="/staff/appointments" className="menu-item">
            Tạo lịch khám
          </NavLink>
          <NavLink to="/staff/customers" className="menu-item">
            Quản lý khách hàng
          </NavLink>  
          <NavLink to="/staff/pets" className="menu-item">
            Tra cứu thú cưng
          </NavLink>
          <NavLink to="/staff/products" className="menu-item">
            Quản lý sản phẩm
          </NavLink>
          <NavLink to="/staff/invoices" className="menu-item">
            Duyệt hóa đơn
          </NavLink>
        </nav>

        <button className="logout-btn" onClick={logout}>
          Đăng xuất
        </button>
      </aside>

      <main className="staff-content">
        <Outlet />
      </main>
    </div>
  );
}
