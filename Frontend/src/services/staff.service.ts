import { api } from "./api";
import { Order } from "../types/order";

export async function getPendingOrders(): Promise<Order[]> {
  try {
    const res = await api.get<Order[]>("/staff/orders", {
      params: { status: "Đang xử lý" },
    });
    return res.data;
  } catch (error) {
    return [];
  }
}

export async function updateOrderStatus(maHD: string, status: string): Promise<boolean> {
  try {
    // Truyền Ma_HD vào URL hoặc Body tùy theo thiết kế Backend của bạn
    await api.put(`/staff/orders/${maHD}`, { 
      Trang_Thai: status  // Gửi đúng tên cột Trang_Thai
    });
    return true;
  } catch (error) {
    console.error("Lỗi cập nhật:", error);
    return false;
  }
}

// export async function getMyOrders() {
//   const res = await api.get("/customer/orders/history");
//   return res.data; 
//   // { ma_kh, orders }
// }