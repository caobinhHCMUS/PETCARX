import { useEffect, useState } from "react";
import { getMyOrders } from "../../services/customer.service";
import { useAuth } from "../../context/AuthContext";

export default function OrdersPage() {
  const { user } = useAuth();
  const ma_kh = user?.ma_kh;

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ma_kh) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await getMyOrders();
        setOrders(res.data?.orders || res.data || []);
      } catch (e: any) {
        setError(e?.response?.data?.message || "Không tải được lịch sử mua hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [ma_kh]);

  return (
    <div style={{ maxWidth: 900 }}>
      <h2>Lịch sử mua hàng</h2>

      <div style={{ marginBottom: 12 }}>
        Mã khách hàng: <b>{ma_kh}</b>
      </div>

      {loading && <div>Đang tải...</div>}
      {error && <div style={{ color: "crimson" }}>{error}</div>}

      {!loading && orders.length === 0 && (
        <div>Bạn chưa có hóa đơn nào.</div>
      )}

      {orders.map((o) => (
        <div
          key={o.Ma_HD}
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: 14,
            marginBottom: 12,
          }}
        >
          <div style={{ fontWeight: 700 }}>
            Hóa đơn #{o.Ma_HD}
          </div>

          <div>Ngày lập: {new Date(o.Ngay_Lap).toLocaleString("vi-VN")}</div>
          <div>Hình thức thanh toán: {o.HinhThuc_TT}</div>
          <div>Khuyến mãi: {o.Khuyen_Mai ?? 0}%</div>
          <div>
            Tổng tiền:{" "}
            <b>{Number(o.Tong_Tien).toLocaleString()}đ</b>
          </div>
          <div>Trạng thái: {o.Trang_Thai}</div>
          <div>Loại nghiệp vụ: {o.Loai_Nghiep_Vu}</div>
        </div>
      ))}
    </div>
  );
}
