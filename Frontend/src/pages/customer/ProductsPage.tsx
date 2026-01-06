import { useEffect, useState } from "react";
import { searchProducts } from "../../services/product.service";
import { cartAdd } from "../../services/cart.service";
import { useAuth } from "../../context/AuthContext";

export default function ProductsPage() {
  const [keyword, setKeyword] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState<Record<string, boolean>>({});

  // demo – sau này lấy từ AuthContext
  const { user } = useAuth();
const ma_kh = user?.ma_kh; 

  useEffect(() => {
    const k = keyword.trim();
    if (!k) {
      setItems([]);
      setError("");
      return;
    }

    const t = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await searchProducts(k);
        setItems(data);
      } catch (e: any) {
        setError("Không tìm được sản phẩm");
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [keyword]);

  const handleAdd = async (p: any) => {
    const ma_sp = p.Ma_SP || p.ma_sp;
    if (!ma_sp) {
      alert("Thiếu mã sản phẩm");
      return;
    }

    // ✅ CHỐT: không có ma_kh thì không cho add
    if (!ma_kh) {
      alert("Bạn cần đăng nhập bằng tài khoản Khách hàng để thêm vào giỏ.");
      return;
    }

    try {
      setAdding((prev) => ({ ...prev, [ma_sp]: true }));

      const res = await cartAdd(ma_kh, ma_sp, 1);

      const ok =
        res?.data?.success === true ||
        res?.data?.Status === "Success" ||
        res?.data?.status === "Success";

      if (!ok) {
        alert(res?.data?.message || "Thêm giỏ hàng thất bại");
        return;
      }

      alert("Đã thêm vào giỏ hàng");
    } catch (e: any) {
      alert(e?.response?.data?.message || "Lỗi thêm giỏ hàng");
    } finally {
      setAdding((prev) => ({ ...prev, [ma_sp]: false }));
    }
  };

  
  return (
    <div style={{ maxWidth: 800 }}>
      <h2>Tìm kiếm sản phẩm</h2>

      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Nhập tên sản phẩm..."
        style={{ width: "100%", padding: 12, marginBottom: 12 }}
      />

      {loading && <div>Đang tìm...</div>}
      {error && <div style={{ color: "crimson" }}>{error}</div>}

      {items.map((p) => (
        <div
          key={p.Ma_SP || p.ma_sp}
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            padding: 12,
            marginBottom: 10,
          }}
        >
          <div style={{ fontWeight: 700 }}>{p.Ten_SP || p.ten_sp}</div>
          <div>{Number(p.Gia || p.gia).toLocaleString()}đ</div>

          <button
            onClick={() => handleAdd(p)}
            disabled={adding[p.Ma_SP || p.ma_sp]}
            style={{ marginTop: 8 }}
          >
            {adding[p.Ma_SP || p.ma_sp] ? "Đang thêm..." : "Thêm vào giỏ"}
          </button>
        </div>
      ))}
    </div>
  );
}
