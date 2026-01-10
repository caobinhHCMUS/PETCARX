import { useContext, useState } from "react";
import { CartContext } from "../../context/CartContext";

export default function CartPage() {
  const cartCtx = useContext(CartContext);

  if (!cartCtx) {
    return <div style={{ color: "crimson" }}>CartProvider chưa được bọc</div>;
  }

  const {
    cart,
    updateQty,
    removeItem,
    toggleSelect,
    checkoutSelected,
    subtotal,
    totalSelected,
  } = cartCtx;

  const [payMethod, setPayMethod] = useState<string>("Tiền mặt"); // optional
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState("");
  

  const onCheckout = async () => {
    setError("");

    if (totalSelected <= 0) {
      setError("Bạn chưa chọn sản phẩm để thanh toán.");
      return;
    }

    try {
      setCheckingOut(true);
      const r = await checkoutSelected(payMethod); // nếu không muốn truyền thì dùng checkoutSelected()
      alert(`Đã tạo hóa đơn ${r.ma_hd} (Đang xử lý)`);
    } catch (e: any) {
      setError(e?.message || "Thanh toán thất bại");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <h2>Giỏ hàng</h2>
      <div style={{ color: "#64748b" }}>Tổng sản phẩm: {cart.length}</div>

      {cart.length === 0 ? (
        <p style={{ color: "#64748b" }}>Giỏ hàng trống</p>
      ) : (
        <>
          {cart.map((item) => (
            <div
              key={item.Ma_SP}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: 12,
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                marginTop: 10,
              }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={!!(item as any).Selected}
                  onChange={(e) => toggleSelect(item.Ma_SP, e.target.checked)}
                />

                <div>
                  <div style={{ fontWeight: 700 }}>{item.Ten_SP}</div>
                  <div style={{ color: "#64748b" }}>
                    {Number(item.Gia).toLocaleString("vi-VN")}đ
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <button
                  onClick={() => updateQty(item.Ma_SP, item.So_Luong - 1)}
                  disabled={checkingOut}
                >
                  −
                </button>

                <input
                  value={item.So_Luong}
                  readOnly
                  style={{ width: 50, textAlign: "center" }}
                />

                <button
                  onClick={() => updateQty(item.Ma_SP, item.So_Luong + 1)}
                  disabled={checkingOut}
                >
                  +
                </button>

                <strong>
                  {(Number(item.Gia) * Number(item.So_Luong)).toLocaleString("vi-VN")}đ
                </strong>

                <button onClick={() => removeItem(item.Ma_SP)} disabled={checkingOut}>
                  Xóa
                </button>
              </div>
            </div>
          ))}

          <div
            style={{
              marginTop: 16,
              padding: 16,
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div style={{ minWidth: 320 }}>
              <div style={{ color: "#64748b" }}>Tạm tính:</div>
              <strong>{subtotal.toLocaleString("vi-VN")}đ</strong>

              <div style={{ marginTop: 8, color: "#64748b" }}>Tổng tiền (đã chọn):</div>
              <strong>{totalSelected.toLocaleString("vi-VN")}đ</strong>

              {error && (
                <div style={{ marginTop: 10, color: "crimson" }}>
                  {error}
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 260 }}>
              <div>
                <div style={{ color: "#64748b", marginBottom: 6 }}>
                  Hình thức thanh toán
                </div>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  disabled={checkingOut}
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <option value="Tiền mặt">Tiền mặt</option>
                  <option value="Chuyển khoản">Chuyển khoản</option>
                  <option value="COD">COD</option>
                </select>
              </div>

              <button
                disabled={totalSelected === 0 || checkingOut}
                onClick={onCheckout}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid #0f172a",
                  background: totalSelected === 0 || checkingOut ? "#e2e8f0" : "#0f172a",
                  color: totalSelected === 0 || checkingOut ? "#64748b" : "white",
                  cursor: totalSelected === 0 || checkingOut ? "not-allowed" : "pointer",
                  fontWeight: 700,
                }}
              >
                {checkingOut ? "Đang thanh toán..." : "Thanh toán"}
              </button>

              <div style={{ color: "#64748b", fontSize: 12 }}>
                * Đơn sẽ được tạo ở trạng thái <b>Đang xử lý</b>.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
