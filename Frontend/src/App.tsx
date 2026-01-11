import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ReactNode } from "react";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { PetProvider } from "./context/PetContext";
import LoginPage from "./pages/LoginPage";

// CUSTOMER
import CustomerLayout from "./components/layout/CustomerLayout";
import CustomerHome from "./pages/customer/CustomerHome";
import ProductsPage from "./pages/customer/ProductsPage";
import CartPage from "./pages/customer/CartPage";
import OrdersPage from "./pages/customer/OrdersPage";
import PetsPage from "./pages/customer/PetsPage";
import Booking from "./pages/customer/CustomerBooking";
// DOCTOR
import DoctorLayout from "./components/layout/DoctorLayout";
import DoctorMedicinePage from "./pages/doctor/DoctorMedicinePage";
import DoctorPetsPage from "./pages/doctor/DoctorPetsPage";
import DoctorCreateExamPage from "./pages/doctor/DoctorCreateExamPage";
import DoctorPrescriptionPage from "./pages/doctor/DoctorPrescriptionPage";
import DoctorExamHistoryPage from "./pages/doctor/DoctorExamHistoryPage";

// ADMIN
import AdminLayout from "./components/layout/AdminLayout";
import RevenuePage from './pages/admin/RevenuePage';

// STAFF
import StaffLayout from "./components/layout/StaffLayout"; 
import StaffOrderApproval from "./pages/staff/StaffOrderApproval";
/* ================= ROLE NORMALIZE ================= */

function normalizeRole(role: string) {
  return (role || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");
}

/* ================= PROTECTED ROUTE ================= */

function RequireRole({
  allow,
  children,
}: {
  allow: string[];
  children: ReactNode;
}) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  const roleKey = normalizeRole(user.role);
  if (!allow.includes(roleKey)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

/* ================= ROUTES ================= */

function AppRoutes() {
  const { user } = useAuth();
  const roleKey = normalizeRole(user?.role || "");

  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route path="/login" element={<LoginPage />} />

        {/* CUSTOMER */}
        <Route
          path="/customer"
          element={
            <RequireRole allow={["khachhang"]}>
              <CartProvider>
                <PetProvider>
                  <CustomerLayout />
                </PetProvider>
              </CartProvider>
            </RequireRole>
          }
        >
          <Route index element={<CustomerHome />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="pets" element={<PetsPage />} />
          <Route path="booking" element={<Booking />} />
        </Route>

        {/* DOCTOR */}
        <Route
          path="/doctor"
          element={
            <RequireRole allow={["bacsi"]}>
              <DoctorLayout />
            </RequireRole>
          }
        >
          <Route index element={<Navigate to="pets" replace />} />
          <Route path="medicines" element={<DoctorMedicinePage />} />
          <Route path="pets" element={<DoctorPetsPage />} />
          <Route path="exams/new" element={<DoctorCreateExamPage />} />
          <Route path="prescriptions" element={<DoctorPrescriptionPage />} />
          <Route path="exam-history" element={<DoctorExamHistoryPage />} />
        </Route>
          

        {/* ADMIN - Đã đưa vào trong Routes */}
         <Route
          path="/staff"
          element={
            <RequireRole allow={["nhanvien"]}>
              <StaffLayout /> {/* Layout cho nhân viên */}
            </RequireRole>
          }
        >
          <Route index element={<div>Trang tổng quan nhân viên</div>} />
          <Route path="appointments" element={<div>Tạo lịch khám</div>} />
          <Route path="pets" element={<div>Tra cứu thú cưng</div>} />
          <Route path="orderapproval" element={<StaffOrderApproval />} />
        </Route>



        {/* ADMIN - Đã đưa vào trong Routes */}
        <Route
          path="/admin"
          element={
            <RequireRole allow={["quanly"]}>
              <AdminLayout />
            </RequireRole>
          }
        >
          <Route index element={<div>Trang tổng quan Admin</div>} />
          <Route path="revenue" element={<RevenuePage />} />
          <Route path="revenue/branches" element={<div>Thống kê doanh thu theo chi nhánh & bác sĩ</div>} />
          <Route path="revenue/sales" element={<div>Thống kê doanh thu bán hàng lẻ</div>} />
          <Route path="branches" element={<div>Quản lý danh sách chi nhánh</div>} />
          <Route path="staff" element={<div>Quản lý danh sách bác sĩ/nhân viên</div>} />
        </Route>

        {/* FALLBACK - Xử lý điều hướng khi gõ sai URL */}
        <Route
          path="*"
          element={
            roleKey === "bacsi" ? (
              <Navigate to="/doctor" replace />
            ) : 
            roleKey === "khachhang" ? (
              <Navigate to="/customer" replace />
            ) :
            roleKey === "quanly" ? (
              <Navigate to="/admin" replace />
            ) : 
            roleKey === "nhanvien" ? ( // THÊM DÒNG NÀY
              <Navigate to="/staff" replace />
            ) :
            (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

/* ================= ROOT ================= */

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}