import { useState } from "react";
import { usePets } from "../../context/PetContext";
import type { Pet, PetForm } from "../../types/pet";

const STYLES = `
  .pet-manager {
    max-width: 1000px;
    margin: 40px auto;
    font-family: 'Inter', system-ui, sans-serif;
    padding: 20px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  }

  .pet-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }

  .pet-table th {
    text-align: left;
    padding: 12px 16px;
    background: #f8f9fa;
    color: #5f6368;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #eee;
  }

  /* Dòng nhập mới (Dòng đầu tiên) */
  .row-input {
    background: #f1f8ff !important;
  }

  .pet-table td {
    padding: 12px 16px;
    border-bottom: 1px solid #eee;
    vertical-align: middle;
  }

  .table-input {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid #dadce0;
    border-radius: 6px;
    font-size: 14px;
    outline: none;
    box-sizing: border-box;
  }

  .table-input:focus {
    border-color: #1a73e8;
    ring: 2px rgba(26, 115, 232, 0.2);
  }

  /* Nút bấm */
  .btn-save {
    background: #1a73e8;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
  }

  .btn-cancel {
    background: #dadce0;
    color: #3c4043;
    border: none;
    padding: 8px 12px;
    border-radius: 6px;
    margin-left: 5px;
    cursor: pointer;
  }

  .action-group {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .btn-icon {
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
    border: 1px solid transparent;
    transition: 0.2s;
  }

  .btn-edit { background: #e8f0fe; color: #1a73e8; }
  .btn-edit:hover { background: #d2e3fc; }

  .btn-delete { background: #fce8e6; color: #d93025; }
  .btn-delete:hover { background: #fad2cf; }

  .badge-type {
    padding: 4px 8px;
    background: #eee;
    border-radius: 4px;
    font-size: 12px;
  }
`;

const emptyForm: PetForm = {
  ten_tc: "",
  loai: "Chó",
  giong: "",
  // dùng tạm field `tuoi` để chứa "Sức khỏe" (string) để khỏi sửa types/backend
  tuoi: undefined as any,
  gioi_tinh: "Đực",
  can_nang: undefined,
};

export default function PetsPage() {
  const { pets, loading, error, addPet, editPet, removePet } = usePets();
  const [form, setForm] = useState<PetForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.ten_tc?.trim()) return alert("Nhập tên thú cưng");
    setSubmitting(true);
    try {
      if (editingId) await editPet(editingId, form);
      else await addPet(form);
      resetForm();
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (p: Pet) => {
    setEditingId(p.ma_tc);
    setForm({
      ten_tc: p.ten_tc,
      loai: p.loai,
      giong: p.giong,
      // map tạm tuổi -> sức khỏe
      tuoi: (p.tuoi as any) ?? "",
      gioi_tinh: p.gioi_tinh as any,
      can_nang: p.can_nang,
    });
  };

  const renderHealth = (tuoiValue: any) => {
    // Nếu `tuoi` đang là string (Sức khỏe) -> hiển thị trực tiếp
    if (typeof tuoiValue === "string") return tuoiValue || "—";
    // Nếu vẫn là number (dữ liệu cũ) -> hiển thị fallback
    if (typeof tuoiValue === "number") return `${tuoiValue} tuổi`;
    return "—";
  };

  return (
    <div className="pet-manager">
      <style>{STYLES}</style>

      <h2 style={{ marginBottom: 20 }}>🐾 Quản lý danh sách thú cưng</h2>

      {error && (
        <p style={{ color: "crimson", marginTop: 8 }}>
          {String(error)}
        </p>
      )}

      <table className="pet-table">
        <thead>
          <tr>
            <th style={{ width: "20%" }}>Tên thú cưng</th>
            <th style={{ width: "15%" }}>Loại</th>
            <th style={{ width: "15%" }}>Giống</th>
            <th style={{ width: "15%" }}>Sức khỏe</th>
            <th style={{ width: "15%" }}>Giới tính</th>
            <th style={{ width: "20%", textAlign: "right" }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {/* DÒNG ĐẦU TIÊN: NHẬP MỚI HOẶC ĐANG SỬA */}
          <tr className="row-input">
            <td>
              <input
                className="table-input"
                placeholder="Tên pet..."
                value={form.ten_tc}
                onChange={(e) => setForm({ ...form, ten_tc: e.target.value })}
              />
            </td>
            <td>
              <input
                    className="table-input"
                    placeholder="Loại (vd: Chó/Mèo/...)"
                    value={form.loai ?? ""}
                    onChange={(e) => setForm({ ...form, loai: e.target.value })}
                />
            </td>
            <td>
              <input
                className="table-input"
                placeholder="Giống..."
                value={form.giong ?? ""}
                onChange={(e) => setForm({ ...form, giong: e.target.value })}
              />
            </td>

            {/* ✅ CỘT SỨC KHỎE (thay cho tuổi) */}
            <td>
              <select
                className="table-input"
                value={(form.tuoi as any) ?? ""}
                onChange={(e) => setForm({ ...form, tuoi: (e.target.value as any) })}
              >
                <option value="">-- Chọn --</option>
                <option value="Tốt">Tốt</option>
                <option value="Bình thường">Bình thường</option>
                <option value="Yếu">Yếu</option>
                <option value="Đang điều trị">Đang điều trị</option>
              </select>
            </td>

            <td>
              <select
                className="table-input"
                value={form.gioi_tinh}
                onChange={(e) => setForm({ ...form, gioi_tinh: e.target.value as any })}
              >
                <option value="Đực">Đực</option>
                <option value="Cái">Cái</option>
              </select>
            </td>
            <td className="action-group">
              <button className="btn-save" onClick={handleSubmit} disabled={submitting}>
                {editingId ? "Cập nhật" : "Thêm mới"}
              </button>
              {editingId && (
                <button className="btn-cancel" onClick={resetForm}>
                  Hủy
                </button>
              )}
            </td>
          </tr>

          {/* CÁC DÒNG TIẾP THEO: HIỂN THỊ DANH SÁCH */}
          {pets.map((p) => (
            <tr key={p.ma_tc}>
              <td><strong>{p.ten_tc}</strong></td>
              <td><span className="badge-type">{p.loai}</span></td>
              <td>{p.giong || "—"}</td>

              {/* ✅ hiển thị sức khỏe */}
              <td>{renderHealth((p as any).tuoi)}</td>

              <td>{p.gioi_tinh}</td>
              <td className="action-group">
                <button className="btn-icon btn-edit" onClick={() => handleEdit(p)}>
                  Sửa
                </button>
                <button
                  className="btn-icon btn-delete"
                  onClick={() => window.confirm("Xóa pet này?") && removePet(p.ma_tc)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {loading && <p style={{ textAlign: "center", padding: 20 }}>Đang tải...</p>}
      {!loading && pets.length === 0 && (
        <p style={{ textAlign: "center", padding: 20, color: "#999" }}>
          Chưa có dữ liệu.
        </p>
      )}
    </div>
  );
}
