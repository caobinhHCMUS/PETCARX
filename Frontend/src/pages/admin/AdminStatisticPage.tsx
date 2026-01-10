import { useEffect, useState } from "react";
import { adminService } from "../../services/admin.service";
import dayjs from "dayjs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface RevenueRecord {
  Ma_CN: string;
  Loai_Nghiep_Vu: string;
  SoLuongHoaDon: number;
  TongDoanhThu: number;
}

export default function AdminStatisticPage() {
  const [revenue, setRevenue] = useState<RevenueRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [branchFilter, setBranchFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(dayjs().subtract(6, "day").format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState<string>(dayjs().format("YYYY-MM-DD"));

  const totalRevenue = revenue.reduce((sum, r) => sum + (r.TongDoanhThu || 0), 0);

  const loadRevenue = async () => {
    setLoading(true);
    try {
      const res = await adminService.getRevenueStatistics({
        tu_ngay: startDate,
        den_ngay: endDate,
        ma_cn: branchFilter || undefined,
        loai_dv: typeFilter || undefined,
      });
      const records = Array.isArray(res) ? res : res.data || [];
      setRevenue(records);
    } catch (err) {
      console.error("❌ Lỗi tải dữ liệu thống kê", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRevenue();
  }, [branchFilter, typeFilter, startDate, endDate]);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-blue-700 mb-4">📊 Thống kê doanh thu</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-gray-100 p-4 rounded shadow-sm items-end">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Chi nhánh</label>
            <input
              type="text"
              placeholder="Tất cả chi nhánh"
              className="border px-2 py-1 rounded w-full"
              value={branchFilter}
              onChange={e => setBranchFilter(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium">Loại nghiệp vụ</label>
            <select
              className="border px-2 py-1 rounded w-full"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="Khám bệnh">Khám bệnh</option>
              <option value="Đơn thuốc">Đơn thuốc</option>
              <option value="Mua sản phẩm">Mua sản phẩm</option>
              <option value="Tiêm chủng">Tiêm chủng</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-medium">Từ ngày</label>
          <input
            type="date"
            className="border px-2 py-1 rounded"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium">Đến ngày</label>
          <input
            type="date"
            className="border px-2 py-1 rounded"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>

        <div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={loadRevenue}
          >
            Áp dụng
          </button>
        </div>
      </div>

      {/* Tổng doanh thu */}
      <div className="bg-white p-4 rounded shadow flex justify-between items-center">
        <span className="font-bold text-lg">Tổng doanh thu:</span>
        <span className="text-xl font-bold text-green-600">{totalRevenue.toLocaleString()} ₫</span>
      </div>

      {/* Bar Chart */}
      {revenue.length > 0 && (
        <div className="bg-white rounded shadow p-4">
          <h3 className="text-xl font-bold mb-2">Biểu đồ doanh thu theo loại nghiệp vụ</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenue} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Loai_Nghiep_Vu" />
              <YAxis />
              <Tooltip formatter={(value: any) => `${value.toLocaleString()} ₫`} />
              <Legend />
              <Bar dataKey="TongDoanhThu" name="Doanh thu" fill="#1d4ed8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Revenue Table */}
      <div className="overflow-x-auto bg-white rounded shadow p-4">
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : revenue.length === 0 ? (
          <p className="text-center py-4">Không có dữ liệu</p>
        ) : (
          <table className="w-full border border-gray-300 table-fixed">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-4 py-2 border-b text-center" style={{ width: "20%" }}>
                  Chi nhánh
                </th>
                <th className="px-4 py-2 border-b text-center" style={{ width: "30%" }}>
                  Loại nghiệp vụ
                </th>
                <th className="px-4 py-2 border-b text-center" style={{ width: "20%" }}>
                  Số lượng hóa đơn
                </th>
                <th className="px-4 py-2 border-b text-center" style={{ width: "30%" }}>
                  Tổng doanh thu
                </th>
              </tr>
            </thead>
            <tbody>
              {revenue.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-2 text-center">{r.Ma_CN}</td>
                  <td className="px-4 py-2 text-left pl-20">{r.Loai_Nghiep_Vu}</td>
                  <td className="px-4 py-2 text-center">{r.SoLuongHoaDon}</td>
                  <td className="px-4 py-2 text-left pl-20">{r.TongDoanhThu.toLocaleString()} ₫</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
