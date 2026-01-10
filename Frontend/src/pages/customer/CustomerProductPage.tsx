import { useState } from "react";
import { customerService } from "../../services/customer.service";

interface Product {
  Ma_SP: string;
  Ten_SP: string;
  Gia: number;
  Don_Vi_Tinh: string;
}

export default function CustomerProductsPage() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!search.trim()) {
      setProducts([]);
      return;
    }

    try {
      setLoading(true);
      const data = await customerService.searchProducts(search);
      setProducts(data);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tìm kiếm sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h2>🛍️ Tìm kiếm sản phẩm</h2>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          placeholder="Nhập tên sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={handleSearch}>Tìm</button>
      </div>

      {loading && <p>Đang tải...</p>}

      <table border={1} cellPadding={8} style={{ marginTop: 16 }}>
        <thead>
          <tr>
            <th>Mã SP</th>
            <th>Tên</th>
            <th>Giá</th>
            <th>Đơn vị</th>
          </tr>
        </thead>
        <tbody>
          {products.map((sp) => (
            <tr key={sp.Ma_SP}>
              <td>{sp.Ma_SP}</td>
              <td>{sp.Ten_SP}</td>
              <td>{sp.Gia.toLocaleString()}đ</td>
              <td>{sp.Don_Vi_Tinh}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
