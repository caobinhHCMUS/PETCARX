import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function CustomerLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="customer-layout">
      {/* CSS nội bộ cho Layout */}
      <style>{`
        .customer-layout {
          display: flex;
          min-height: 100vh;
          width: 100%;
          background: #f5f7fb;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .customer-sidebar {
          width: 250px;
          background: #1e293b; /* Màu tối sang trọng (Slate-800) */
          color: white;
          display: flex;
          flex-direction: column;
          box-shadow: 2px 0 5px rgba(0,0,0,0.05);
          flex-shrink: 0;
        }

        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .logo {
          font-size: 24px;
          font-weight: 800;
          color: #38bdf8; /* Màu xanh sáng làm điểm nhấn */
          margin: 0;
        }

        .user-info {
          margin-top: 10px;
        }

        .user-name {
          font-weight: 600;
          font-size: 16px;
        }

        .user-role {
          font-size: 12px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .menu {
          flex: 1;
          padding: 20px 10px;
          overflow-y: auto;
        }

        .menu-label {
          font-size: 12px;
          text-transform: uppercase;
          color: #64748b;
          margin: 15px 10px 5px;
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
          font-size: 15px;
          transition: all 0.2s;
        }

        .menu-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
          transform: translateX(3px);
        }

        .menu-item.active {
          background: #0ea5e9; /* Sky-500 */
          color: white;
          font-weight: 600;
          box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.2);
        }

        .sidebar-footer {
          padding: 20px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .logout-btn {
          width: 100%;
          padding: 12px;
          border: 1px solid rgba(239, 68, 68, 0.5);
          border-radius: 8px;
          background: transparent;
          color: #fca5a5;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .logout-btn:hover {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
        }

        .customer-content {
          flex: 1;
          padding: 30px;
          overflow-y: auto;
          /* Tạo background pattern nhẹ nếu muốn */
          background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>

      <aside className="customer-sidebar">
        <div className="sidebar-header">
          <h1 className="logo">PetCareX</h1>
          <div className="user-info">
            <div className="user-name">{user?.username || 'Khách hàng'}</div>
            <div className="user-role">{user?.role || 'Member'}</div>
          </div>
        </div>

        <nav className="menu">
          {/* Nhóm chức năng chính */}
          <NavLink to="/customer" end className="menu-item">
            <span>🏠 Trang chủ</span>
          </NavLink>

          <div className="menu-label">Dịch vụ</div>
          
          <NavLink to="/customer/book-appointment" className="menu-item">
            <span>📅 Đặt lịch khám</span>
          </NavLink>
          
          <NavLink to="/customer/orders" className="menu-item">
            <span>📋 Lịch sử / Đơn hàng</span>
          </NavLink>

          {/* Nhóm mua sắm */}
          <div className="menu-label">Cửa hàng</div>
          
          <NavLink to="/customer/products" className="menu-item">
            <span>🛍️ Sản phẩm</span>
          </NavLink>
          
          <NavLink to="/customer/cart" className="menu-item">
            <span>🛒 Giỏ hàng</span>
          </NavLink>

          {/* Các tính năng chưa có trong Route (Tạm ẩn hoặc để chờ phát triển) */}
          {/* <div className="menu-label">Cá nhân</div>
          <NavLink to="/customer/pets" className="menu-item">
            <span>🐾 Thú cưng của tôi</span>
          </NavLink> 
          */}

        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={logout}>
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="customer-content">
        <Outlet />
      </main>
    </div>
  );
}