import { useEffect, useState } from "react";
import { staffService, ProductPayload } from "../../services/staff.service";

const StaffProductPage = () => {
  const [products, setProducts] = useState<ProductPayload[]>([]);

  const loadProducts = async () => {
    const data = await staffService.getProducts();
    setProducts(data);
    console.log(data);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (maSP: string) => {
    if (!confirm("Xoá sản phẩm này?")) return;
    await staffService.deleteProduct(maSP);
    loadProducts();
  };

  return (
    <div>
      <h2>📦 Quản lý sản phẩm</h2>

      <table border={1} cellPadding={8} width="100%">
        <thead>
          <tr>
            <th>Mã</th>
            <th>Tên</th>
            <th>Giá</th>
            <th>Số lượng</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.Ma_SP}>
              <td>{p.Ma_SP}</td>
              <td>{p.Ten_SP}</td>
              <td>{p.Gia}</td>
              <td>{p.So_Luong}</td>
              <td>
                <button onClick={() => handleDelete(p.Ma_SP)}>🗑️ Xoá</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StaffProductPage;
