import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="admin-layout">
      <style>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          width: 100%;
          background: #f0f2f5;
        }

        .admin-sidebar {
          width: 260px;
          background: #1e293b; /* Màu tối chuyên nghiệp cho Admin */
          color: white;
          padding: 20px;
          display: flex;
          flex-direction: column;
          box-shadow: 2px 0 5px rgba(0,0,0,0.1);
        }

        .logo {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #38bdf8;
          text-align: center;
        }

        .user-info {
          margin-bottom: 30px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          text-align: center;
        }

        .user-info .name {
          font-weight: 600;
          font-size: 16px;
          display: block;
        }

        .user-info .role {
          font-size: 12px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .menu {
          flex: 1;
        }

        .menu-label {
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          margin: 15px 0 8px 10px;
          font-weight: bold;
        }

        .menu-item {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          margin-bottom: 4px;
          color: #cbd5e1;
          text-decoration: none;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s;
        }

        .menu-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .menu-item.active {
          background: #3b82f6;
          color: white;
          font-weight: 600;
        }

        .logout-btn {
          margin-top: auto;
          padding: 12px;
          border: none;
          border-radius: 8px;
          background: #ef4444;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .logout-btn:hover {
          background: #dc2626;
        }

        .admin-content {
          flex: 1;
          padding: 30px;
          overflow-y: auto;
        }
      `}</style>

      <aside className="admin-sidebar">
        <h2 className="logo">PetCareX <small style={{ fontSize: '10px', display: 'block', color: '#94a3b8' }}>ADMIN PANEL</small></h2>

        <div className="user-info">
          <div className="name">{user?.username || "Quản trị viên"}</div>
          <div className="role">Tổng quản lý</div>
        </div>

        <nav className="menu">
          <div className="menu-label">Tổng quan</div>
          <NavLink to="/admin" end className="menu-item">Dashboard</NavLink>

          <div className="menu-label">Thống kê doanh thu</div>
          <NavLink to="/admin/revenue" className="menu-item">
            Tất cả chi nhánh
          </NavLink>
          <NavLink to="/admin/revenue/branches" className="menu-item">
            Chi nhánh & Bác sĩ
          </NavLink>
          <NavLink to="/admin/revenue/sales" className="menu-item">
            Doanh thu bán hàng
          </NavLink>

          <div className="menu-label">Danh mục</div>
          <NavLink to="/admin/products" className="menu-item">Quản lý sản phẩm</NavLink>
          <NavLink to="/admin/vaccines" className="menu-item">Quản lý vaccin</NavLink>
          <NavLink to="/admin/packages" className="menu-item">Quản lý gói vaccin</NavLink>

          <div className="menu-label">Hệ thống</div>
          <NavLink to="/admin/branches" className="menu-item">Quản lý chi nhánh</NavLink>
          <NavLink to="/admin/staff" className="menu-item">Quản lý nhân sự</NavLink>
        </nav>

        <button className="logout-btn" onClick={logout}>
          Đăng xuất
        </button>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}