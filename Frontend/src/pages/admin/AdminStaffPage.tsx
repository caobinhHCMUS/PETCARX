import { useEffect, useMemo, useState } from "react";
import { adminService, StaffPayload, AccountPayload } from "../../services/admin.service";
import StaffModal from "./StaffModal";

/* ===== bỏ dấu tiếng Việt ===== */
const normalize = (str: string) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export default function AdminProductPage() {
  const [staffs, setStaffs] = useState<StaffPayload[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StaffPayload | null>(null);
  const [newAccount, setNewAccount] = useState<AccountPayload | null>(null);

  /* ===== load nhân viên ===== */
  const loadStaffs = async () => {
    const data = await adminService.getStaffs();
    setStaffs(data);
  };

  useEffect(() => {
    loadStaffs();
  }, []);

  /* ===== danh sách vai trò động ===== */
  const roles = useMemo(() => {
    return Array.from(new Set(staffs.map((s) => s.Vai_Tro))).filter(Boolean);
  }, [staffs]);

  /* ===== search + filter ===== */
  const filteredStaffs = useMemo(() => {
    return staffs.filter((s) => {
      const keyword =
        normalize(s.Ho_Ten).includes(normalize(search)) ||
        normalize(s.Ma_NV).includes(normalize(search));
      const roleOk = role ? s.Vai_Tro === role : true;
      return keyword && roleOk;
    });
  }, [staffs, search, role]);

  /* ===== actions ===== */
  const handleDelete = async (maNV: string) => {
    if (!confirm("Bạn có chắc muốn xóa nhân viên này?")) return;

    try {
      const res = await adminService.deleteStaff(maNV);
      if (res?.success) {
        alert("Xóa thành công");
        await loadStaffs();
      }
    } catch (err: any) {
      console.error(err);
      alert("Xóa thất bại: " + (err.response?.data?.message || err.message));
    }
  };

  const handleSave = async (data: StaffPayload) => {
    try {
      if (editing) {
        const res = await adminService.updateStaff(data.Ma_NV, data);
        if (res?.success) {
          setModalOpen(false);
          setEditing(null);
          await loadStaffs();
          alert("Cập nhật thành công");
          
        }
      } else {
        // Thêm nhân viên → backend trả luôn account
        const res = await adminService.createStaff(data);
        //alert("Thêm nhân viên thành công");
        // Nếu backend trả account, hiển thị popup mini
        setNewAccount(res);
        setModalOpen(false);
        setEditing(null);

      // load lại danh sách nhân viên
      await loadStaffs();
      }
    } catch (err: any) {
      console.error(err);
      alert("Lỗi khi lưu nhân viên: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-blue-700">👥 Quản lý nhân viên</h2>

      {/* Search + Filter + Add */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          className="border px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tìm mã / tên"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Tất cả vai trò</option>
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <button
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
          onClick={() => setModalOpen(true)}
        >
          ➕ Thêm
        </button>
      </div>

      {/* Staff Table */}
      <table className="w-full border border-gray-300 rounded text-left">
        <thead className="bg-blue-100">
          <tr>
            <th className="px-4 py-2">Mã NV</th>
            <th className="px-4 py-2">Họ tên</th>
            <th className="px-4 py-2">Vai trò</th>
            <th className="px-4 py-2">Lương</th>
            <th className="px-4 py-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredStaffs.map((s) => (
            <tr key={s.Ma_NV}>
              <td className="px-4 py-2">{s.Ma_NV}</td>
              <td className="px-4 py-2">{s.Ho_Ten}</td>
              <td className="px-4 py-2">{s.Vai_Tro}</td>
              <td className="px-4 py-2">{s.Luong_CB?.toLocaleString()}</td>
              <td className="px-4 py-2 space-x-2">
                <button
                  className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                  onClick={() => { setEditing(s); setModalOpen(true); }}
                >
                  Sửa
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  onClick={() => handleDelete(s.Ma_NV)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Staff Modal */}
      {modalOpen && (
        <StaffModal
          open={modalOpen}
          initialData={editing}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSubmit={handleSave}
        />
      )}

      {/* Popup mini account vừa tạo */}
      {newAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-80 space-y-3">
            <h3 className="text-lg font-bold text-blue-700">Tài khoản mới tạo</h3>
            <div className="space-y-1">
              <p><strong>Username:</strong> {newAccount.Ten_DangNhap}</p>
              <p><strong>Password:</strong> {newAccount.Mat_Khau}</p>
              <p><strong>Role:</strong> {newAccount.Vai_Tro}</p>
              <p><strong>Mã NV:</strong> {newAccount.Ma_NV}</p>

            </div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
              onClick={() => setNewAccount(null)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
