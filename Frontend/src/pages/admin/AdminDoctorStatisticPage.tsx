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

interface DoctorRecord {
  Ma_CN: string;
  Ma_BacSi: string;
  Ten_BacSi: string;
  Loai_Dich_Vu: string;
  So_Luot: number;
  Doanh_Thu: number;
}

export default function AdminDoctorStatisticPage() {
  const [doctorStats, setDoctorStats] = useState<DoctorRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [branchFilter, setBranchFilter] = useState<string>("");
  const [doctorFilter, setDoctorFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(
    dayjs().subtract(6, "day").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState<string>(dayjs().format("YYYY-MM-DD"));

  // Tổng lượt và doanh thu
  const totalVisits = doctorStats.reduce((sum, r) => sum + (r.So_Luot || 0), 0);
  const totalRevenue = doctorStats.reduce((sum, r) => sum + (r.Doanh_Thu || 0), 0);

  const loadDoctorStats = async () => {
    setLoading(true);
    try {
      const res = await adminService.fetchDoctorStats({
        TuNgay: startDate,
        DenNgay: endDate,
        Ma_CN: branchFilter || undefined,
        Ma_BS: doctorFilter || undefined,
      });
      const records = Array.isArray(res) ? res : res.data || [];
      setDoctorStats(records);
    } catch (err) {
      console.error("❌ Lỗi tải dữ liệu thống kê bác sĩ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctorStats();
  }, [branchFilter, doctorFilter, startDate, endDate]);

  // Chuẩn hóa dữ liệu cho chart: mỗi bác sĩ + loại dịch vụ là một object
  const chartData = doctorStats.map((r) => ({
    Ten_BacSi: r.Ten_BacSi,
    Loai_Dich_Vu: r.Loai_Dich_Vu,
    So_Luot: r.So_Luot,
    Doanh_Thu: r.Doanh_Thu,
  }));

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-blue-700 mb-4">📊 Thống kê bác sĩ</h2>

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
              onChange={(e) => setBranchFilter(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium">Bác sĩ</label>
            <input
              type="text"
              placeholder="Tất cả bác sĩ"
              className="border px-2 py-1 rounded w-full"
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block font-medium">Từ ngày</label>
          <input
            type="date"
            className="border px-2 py-1 rounded"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium">Đến ngày</label>
          <input
            type="date"
            className="border px-2 py-1 rounded"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={loadDoctorStats}
          >
            Áp dụng
          </button>
        </div>
      </div>

      {/* Tổng lượt & doanh thu */}
      <div className="bg-white p-4 rounded shadow flex justify-between items-center">
        <div className="flex flex-col">
          <span className="font-bold text-lg">Tổng lượt khám:</span>
          <span className="text-xl font-bold text-purple-600">{totalVisits}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg">Tổng doanh thu:</span>
          <span className="text-xl font-bold text-green-600">{totalRevenue.toLocaleString()} ₫</span>
        </div>
      </div>

      {/* Bar Chart với 2 trục Y */}
      {chartData.length > 0 && (
        <div className="bg-white rounded shadow p-4">
          <h3 className="text-xl font-bold mb-2">Biểu đồ lượt khám & doanh thu theo bác sĩ</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 50, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Ten_BacSi" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip
                formatter={(value: any, name, props) => {
                  if (name === "Doanh_Thu") return `${value.toLocaleString()} ₫`;
                  return value;
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="So_Luot" name="Số lượt" fill="#9333ea" />
              <Bar yAxisId="right" dataKey="Doanh_Thu" name="Doanh thu" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bảng bác sĩ */}
      <div className="overflow-x-auto bg-white rounded shadow p-4">
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : doctorStats.length === 0 ? (
          <p className="text-center py-4">Không có dữ liệu</p>
        ) : (
          <table className="w-full border border-gray-300 table-fixed">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-4 py-2 border-b text-center" style={{ width: "15%" }}>
                  Chi nhánh
                </th>
                <th className="px-4 py-2 border-b text-center" style={{ width: "20%" }}>
                  Bác sĩ
                </th>
                <th className="px-4 py-2 border-b text-center" style={{ width: "15%" }}>
                  Loại dịch vụ
                </th>
                <th className="px-4 py-2 border-b text-center" style={{ width: "15%" }}>
                  Số lượt
                </th>
                <th className="px-4 py-2 border-b text-center" style={{ width: "20%" }}>
                  Doanh thu
                </th>
              </tr>
            </thead>
            <tbody>
              {doctorStats.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-2 text-center">{r.Ma_CN}</td>
                  <td className="px-4 py-2 text-left pl-4">{r.Ten_BacSi}</td>
                  <td className="px-4 py-2 text-left pl-4">{r.Loai_Dich_Vu}</td>
                  <td className="px-4 py-2 text-center">{r.So_Luot}</td>
                  <td className="px-4 py-2 text-left pl-4">{(r.Doanh_Thu ?? 0).toLocaleString()} ₫</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
