import { useEffect, useMemo, useState } from "react";
import { adminService, AccountPayload } from "../../services/admin.service";

const normalize = (str: string) =>
  str?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export default function AdminAccountPage() {
  const [accounts, setAccounts] = useState<AccountPayload[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AccountPayload | null>(null);
  const [newAccount, setNewAccount] = useState<AccountPayload | null>(null);

  /* ===== Load data ===== */
  const loadAccounts = async () => {
    try {
      const data = await adminService.getAccounts();
      setAccounts(data);
    } catch (err) {
      console.error("❌ Lỗi tải tài khoản", err);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  /* ===== Lấy danh sách role động ===== */
  const roles = useMemo(() => {
    return Array.from(new Set(accounts.map((a) => a.Vai_Tro))).filter(Boolean);
  }, [accounts]);

  /* ===== Filter + Search ===== */
  const filteredAccounts = useMemo(() => {
    return accounts.filter((a) => {
      const keyword =
        normalize(a.Ten_DangNhap).includes(normalize(search)) ||
        normalize(a.Ma_NV || "").includes(normalize(search));
      const roleOk = roleFilter ? a.Vai_Tro === roleFilter : true;
      return keyword && roleOk;
    });
  }, [accounts, search, roleFilter]);

  /* ===== Actions ===== */
  const handleDelete = async (username: string) => {
    if (!confirm(`Bạn có chắc muốn xóa tài khoản ${username}?`)) return;
    try {
      const res = await adminService.deleteAccount(username);
      if (res?.success) {
        alert("Xóa thành công");
        await loadAccounts();
      }
    } catch (err: any) {
      console.error(err);
      alert("Xóa thất bại: " + (err.response?.data?.message || err.message));
    }
  };

  const handleSave = async (data: AccountPayload) => {
  try {
    const res = await adminService.createAccount(data);
    alert("Tạo tài khoản thành công");
    setModalOpen(false);
    setEditing(null);
    loadAccounts();
  } catch (err: any) {
    console.error(err);
    alert("Lỗi khi tạo tài khoản: " + (err.response?.data?.message || err.message));
  }
};


  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-blue-700">👤 Quản lý tài khoản</h2>

      {/* Search + Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          className="border px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tìm username / Mã NV"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">Tất cả vai trò</option>
          <option value="N">Nhân viên</option>
          <option value="C">Khách hàng</option>
          <option value="B">Bác sĩ</option>

          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
      <button
        className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
        onClick={() => { setEditing(null); setModalOpen(true); }}
      >
        ➕ Tạo tài khoản
      </button>

      {/* Account Table */}
      <table className="w-full border border-gray-300 rounded text-left">
        <thead className="bg-blue-100">
          <tr>
            <th className="px-4 py-2">Tên đăng nhập</th>
            <th className="px-4 py-2">Vai trò</th>
            <th className="px-4 py-2">Mã NV</th>
            <th className="px-4 py-2">Mã KH</th>
            <th className="px-4 py-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredAccounts.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-2 text-center">
                Không có dữ liệu
              </td>
            </tr>
          )}

          {filteredAccounts.map((a) => (
            <tr key={a.Ten_DangNhap}>
              <td className="px-4 py-2">{a.Ten_DangNhap}</td>
              <td className="px-4 py-2">{a.Vai_Tro}</td>
              <td className="px-4 py-2">{a.Ma_NV || "-"}</td>
              <td className="px-4 py-2">{a.Ma_KH || "-"}</td>
              <td className="px-4 py-2 space-x-2">
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  onClick={() => handleDelete(a.Ten_DangNhap)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {newAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-80 space-y-3">
            <h3 className="text-lg font-bold text-blue-700">Tài khoản mới tạo</h3>
            <p><strong>Username:</strong> {newAccount.Ten_DangNhap}</p>
            <p><strong>Role:</strong> {newAccount.Vai_Tro}</p>
            <p><strong>Mã NV:</strong> {newAccount.Ma_NV || "-"}</p>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
