import { useEffect, useState, useMemo } from "react";
import { adminService, ProductPayload } from "../../services/admin.service";

export default function AdminProductPage() {
  const [products, setProducts] = useState<ProductPayload[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | "Phụ kiện" | "Thuốc" | "Thức ăn">("");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductPayload | null>(null);
  const [form, setForm] = useState<Partial<ProductPayload>>({});

  /* ===== Load products ===== */
  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await adminService.getProducts();
      setProducts(data);
    } catch (err) {
      console.error("❌ Lỗi tải sản phẩm", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  /* ===== Filtered products ===== */
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchName = p.Ten_SP.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter ? p.Loai_SP === typeFilter : true;
      return matchName && matchType;
    });
  }, [products, search, typeFilter]);

  /* ===== Actions ===== */
  const handleDelete = async (maSP: string) => {
    if (!confirm(`Bạn có chắc muốn xoá sản phẩm ${maSP}?`)) return;
    try {
      await adminService.deleteProduct(maSP);
      alert("Xoá thành công");
      loadProducts();
    } catch (err) {
      console.error(err);
      alert("Xoá thất bại");
    }
  };

  const handleSave = async () => {
    if (!form.Ma_SP || !form.Ten_SP || !form.Loai_SP || form.Gia === undefined || form.So_Luong === undefined) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      if (editing) {
        // Cập nhật
        await adminService.updateProduct(editing.Ma_SP, form as ProductPayload);
        alert("Cập nhật thành công");
      } else {
        // Tạo mới
        await adminService.createProduct(form as ProductPayload);
        alert("Tạo sản phẩm thành công");
      }
      setModalOpen(false);
      setEditing(null);
      setForm({});
      loadProducts();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu sản phẩm");
    }
  };

  const openModal = (product?: ProductPayload) => {
    if (product) {
      setEditing(product);
      setForm(product);
    } else {
      setEditing(null);
      setForm({});
    }
    setModalOpen(true);
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-blue-700">🛒 Quản lý sản phẩm</h2>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Tìm theo tên sản phẩm"
          className="border px-2 py-1 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border px-2 py-1 rounded"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
        >
          <option value="">Tất cả loại sản phẩm</option>
          <option value="Phụ kiện">Phụ kiện</option>
          <option value="Thuốc">Thuốc</option>
          <option value="Thức ăn">Thức ăn</option>
        </select>

        <button
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
          onClick={() => openModal()}
        >
          ➕ Thêm sản phẩm
        </button>
      </div>

      {loading && <p>Đang tải dữ liệu...</p>}

      {/* Product Table */}
      <table className="w-full border border-gray-300 mt-4">
        <thead className="bg-blue-100">
          <tr>
            <th className="px-4 py-2">Mã SP</th>
            <th className="px-4 py-2">Tên SP</th>
            <th className="px-4 py-2">Loại SP</th>
            <th className="px-4 py-2">Giá</th>
            <th className="px-4 py-2">Đơn vị</th>
            <th className="px-4 py-2">Số lượng</th>
            <th className="px-4 py-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-2 text-center">
                Không có dữ liệu
              </td>
            </tr>
          )}
          {filteredProducts.map((p) => (
            <tr key={p.Ma_SP} className="border-t">
              <td className="px-4 py-2">{p.Ma_SP}</td>
              <td className="px-4 py-2">{p.Ten_SP}</td>
              <td className="px-4 py-2">{p.Loai_SP}</td>
              <td className="px-4 py-2">{p.Gia.toLocaleString()} ₫</td>
              <td className="px-4 py-2">{p.Don_Vi_Tinh || "-"}</td>
              <td className="px-4 py-2">{p.So_Luong}</td>
              <td className="px-4 py-2 space-x-2">
                <button
                  className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                  onClick={() => openModal(p)}
                >
                  ✏️
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  onClick={() => handleDelete(p.Ma_SP)}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-96 space-y-3">
            <h3 className="text-lg font-bold text-blue-700">
              {editing ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
            </h3>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Mã SP"
                className="border px-2 py-1 rounded w-full"
                value={form.Ma_SP || ""}
                onChange={(e) => setForm({ ...form, Ma_SP: e.target.value })}
                disabled={!!editing} // không đổi mã khi cập nhật
              />
              <input
                type="text"
                placeholder="Tên SP"
                className="border px-2 py-1 rounded w-full"
                value={form.Ten_SP || ""}
                onChange={(e) => setForm({ ...form, Ten_SP: e.target.value })}
              />
              <select
                className="border px-2 py-1 rounded w-full"
                value={form.Loai_SP || ""}
                onChange={(e) => setForm({ ...form, Loai_SP: e.target.value as any })}
              >
                <option value="">Chọn loại sản phẩm</option>
                <option value="Phụ kiện">Phụ kiện</option>
                <option value="Thuốc">Thuốc</option>
                <option value="Thức ăn">Thức ăn</option>
              </select>
              <input
                type="number"
                placeholder="Giá"
                className="border px-2 py-1 rounded w-full"
                value={form.Gia ?? ""}
                onChange={(e) => setForm({ ...form, Gia: parseFloat(e.target.value) })}
              />
              <input
                type="text"
                placeholder="Đơn vị tính"
                className="border px-2 py-1 rounded w-full"
                value={form.Don_Vi_Tinh || ""}
                onChange={(e) => setForm({ ...form, Don_Vi_Tinh: e.target.value })}
              />
              <input
                type="number"
                placeholder="Số lượng"
                className="border px-2 py-1 rounded w-full"
                value={form.So_Luong ?? ""}
                onChange={(e) => setForm({ ...form, So_Luong: parseInt(e.target.value) })}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-400 text-white px-4 py-1 rounded hover:bg-gray-500"
                onClick={() => setModalOpen(false)}
              >
                Hủy
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                onClick={handleSave}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
