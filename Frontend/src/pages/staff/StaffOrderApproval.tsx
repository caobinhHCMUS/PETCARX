import React, { useEffect, useState } from 'react';
import { getPendingOrders, updateOrderStatus } from "../../services/staff.service";
import { Order } from "../../types/order";

const StaffOrderApproval: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getPendingOrders();
      setOrders(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleApprove = async (maHD: string) => {
    const success = await updateOrderStatus(maHD, 'Hoàn thành');
    if (success) {
      fetchOrders();
    }
  };


  const handleCancel = async (maHD: string) => {
    const confirmCancel = window.confirm(`Xác nhận HỦY hóa đơn ${maHD}?`);
    if (!confirmCancel) return;

    const success = await updateOrderStatus(maHD, 'Đã hủy');
    if (success) {
      fetchOrders();
    }
  };
  const formatDate = (value: string) => {
  if (!value) return "";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value; // nếu backend trả "2026-01-07" thì vẫn ok

  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};


  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>DANH SÁCH DUYỆT HÓA ĐƠN</h2>
        <p style={styles.subtitle}>Danh sách hóa đơn đang ở trạng thái <b>Đang xử lý</b></p>
      </div>

      <div style={styles.card}>
        {loading ? (
          <div style={styles.loadingArea}>Đang tải dữ liệu, vui lòng đợi...</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Mã HD</th>
                <th style={styles.th}>Ngày lập</th>
                <th style={styles.th}>Khách Hàng</th>
                <th style={styles.th}>Nghiệp Vụ</th>
                <th style={styles.th}>Tổng Tiền</th>
                <th style={styles.th}>Hình Thức TT</th>
                <th style={styles.th}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.Ma_HD} style={styles.tr}>
                    <td style={styles.td}><strong>{order.Ma_HD}</strong></td>
                    <td style={styles.td}>{formatDate(order.Ngay_Lap)}</td>
                    <td style={styles.td}>{order.Ho_Ten}</td>
                    <td style={styles.td}>{order.Loai_Nghiep_Vu || 'mua sản phẩm'}</td>
                    <td style={styles.td}>
                      <span style={styles.amount}>
                        {Number(order.Tong_Tien).toLocaleString()} đ
                      </span>
                    </td>
                    <td style={styles.td}>{order.HinhThuc_TT}</td>
                    <td style={styles.td}>
                      <div style={styles.btnGroup}>
                        <button 
                          onClick={() => handleApprove(order.Ma_HD)} 
                          style={{ ...styles.button, ...styles.btnApprove }}
                        >
                          Duyệt
                        </button>
                        <button 
                          onClick={() => handleCancel(order.Ma_HD)} 
                          style={{ ...styles.button, ...styles.btnCancel }}
                        >
                          Hủy
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={styles.emptyCell}>
                    Hiện không có hóa đơn nào chờ duyệt.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: { padding: '30px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: 'Arial, sans-serif' },
  header: { marginBottom: '25px', textAlign: 'center' },
  title: { color: '#2c3e50', margin: 0, fontSize: '24px' },
  subtitle: { color: '#7f8c8d', fontSize: '14px' },
  card: { backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', overflow: 'hidden' },
  loadingArea: { textAlign: 'center', padding: '40px', fontWeight: 'bold', color: '#3498db' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { backgroundColor: '#3498db', color: '#fff', padding: '15px', textAlign: 'left', fontSize: '14px' },
  td: { padding: '15px', borderBottom: '1px solid #eee', fontSize: '14px' },
  tr: { transition: '0.3s' },
  amount: { color: '#e74c3c', fontWeight: 'bold' },
  emptyCell: { textAlign: 'center', padding: '40px', color: '#95a5a6' },
  btnGroup: { display: 'flex', gap: '8px' },
  button: { border: 'none', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' },
  btnApprove: { backgroundColor: '#2ecc71', color: '#fff' },
  btnCancel: { backgroundColor: '#e74c3c', color: '#fff' }
};

export default StaffOrderApproval;