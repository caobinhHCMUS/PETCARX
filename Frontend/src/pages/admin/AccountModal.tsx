// src/pages/admin/AccountModal.tsx
import { useEffect, useState } from "react";
import { AccountPayload } from "../../services/admin.service";

interface AccountModalProps {
  open: boolean;
  initialData: AccountPayload | null;
  onClose: () => void;
  onSubmit: (data: AccountPayload) => Promise<void>;
}

const roles = [
  { value: "KhachHang", label: "Khách hàng" },
  { value: "Bác sĩ", label: "Bác sĩ" },
  { value: "Quản lý", label: "Quản lý" },
  { value: "Nhân viên", label: "Nhân viên" }
];

export default function AccountModal({ open, initialData, onClose, onSubmit }: AccountModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [maNV, setMaNV] = useState("");
  const [maKH, setMaKH] = useState("");
  const [maBS, setMaBS] = useState("");

  useEffect(() => {
    if (initialData) {
      setUsername(initialData.Ten_DangNhap || "");
      setRole(initialData.Vai_Tro || "");
      setMaNV(initialData.Ma_NV || "");
      setMaKH(initialData.Ma_KH || "");
      setMaBS(initialData.Ma_BS || "");
      setPassword(""); // password luôn trống khi edit
    } else {
      setUsername("");
      setPassword("");
      setRole("");
      setMaNV("");
      setMaKH("");
      setMaBS("");
    }
  }, [initialData]);

  const handleSubmit = async () => {
    if (!username || (!initialData && !password) || !role) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    const data: AccountPayload = {
      Ten_DangNhap: username,
      Mat_Khau: password,
      Vai_Tro: role,
      Ma_NV: maNV || undefined,
      Ma_KH: maKH || undefined,
      Ma_BS: maBS || undefined,
    };

    await onSubmit(data);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 w-96 space-y-4">
        <h3 className="text-lg font-bold text-blue-700">
          {initialData ? "Sửa tài khoản" : "Tạo tài khoản"}
        </h3>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Username *</label>
          <input
            className="border w-full px-3 py-1 rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {!initialData && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">Password *</label>
            <input
              type="password"
              className="border w-full px-3 py-1 rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium">Vai trò *</label>
          <select
            className="border w-full px-3 py-1 rounded"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">-- Chọn vai trò --</option>
            {roles.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        {role === "NhanVien" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">Mã NV</label>
            <input
              className="border w-full px-3 py-1 rounded"
              value={maNV}
              onChange={(e) => setMaNV(e.target.value)}
            />
          </div>
        )}

        {role === "KhachHang" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">Mã KH</label>
            <input
              className="border w-full px-3 py-1 rounded"
              value={maKH}
              onChange={(e) => setMaKH(e.target.value)}
            />
          </div>
        )}

        {role === "BacSi" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">Mã BS</label>
            <input
              className="border w-full px-3 py-1 rounded"
              value={maBS}
              onChange={(e) => setMaBS(e.target.value)}
            />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            className="bg-gray-300 px-4 py-1 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
            onClick={handleSubmit}
          >
            {initialData ? "Lưu" : "Tạo"}
          </button>
        </div>
      </div>
    </div>
  );
}
