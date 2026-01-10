// src/pages/admin/DoctorStatistic.tsx
import { useEffect, useState, useMemo } from "react";
import { DoctorStatisticService, DoctorStatistic } from "../../services/admin.service";
import { Input, DatePicker, Select, Table, Spin } from "antd";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function DoctorStatisticPage() {

  /* ================= FILTER ================= */
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(6, "day"),
    dayjs()
  ]);
  const [keyword, setKeyword] = useState("");
  const [maCN, setMaCN] = useState<string>();

  /* ================= DATA ================= */
  const [tableData, setTableData] = useState<DoctorStatistic[]>([]);
  const [chartData, setChartData] = useState<DoctorStatistic[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= PAGING ================= */
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);

  /* ================= API ================= */
  const fetchPaging = async () => {
    setLoading(true);
    try {
      const res = await DoctorStatisticService.getPaging({
        tuNgay: dateRange[0].format("YYYY-MM-DD"),
        denNgay: dateRange[1].format("YYYY-MM-DD"),
        maCN,
        page,
        pageSize
      });

      setTableData(res.data);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  };

  const fetchTop10 = async () => {
    const data = await DoctorStatisticService.getTop10({
      tuNgay: dateRange[0].format("YYYY-MM-DD"),
      denNgay: dateRange[1].format("YYYY-MM-DD"),
      maCN
    });

    // đảm bảo không undefined
    setChartData(
      data.map(x => ({
        ...x,
        Tong_Doanh_Thu: x.Tong_Doanh_Thu ?? 0
      }))
    );
  };

  useEffect(() => {
    fetchPaging();
    fetchTop10();
  }, [page, dateRange, maCN]);

  /* ================= SEARCH ================= */
  const filteredTableData = useMemo(() => {
    if (!keyword) return tableData;
    const k = keyword.toLowerCase();
    return tableData.filter(x =>
      x.Ten_BacSi.toLowerCase().includes(k) ||
      x.Ma_BacSi.toLowerCase().includes(k)
    );
  }, [tableData, keyword]);

  /* ================= TABLE ================= */
  const columns: ColumnsType<DoctorStatistic> = [
    {
      title: "Mã BS",
      dataIndex: "Ma_BacSi"
    },
    {
      title: "Tên bác sĩ",
      dataIndex: "Ten_BacSi"
    },
    {
      title: "Chi nhánh",
      dataIndex: "Ma_CN"
    },
    {
      title: "Số lượt khám",
      dataIndex: "Tong_Luot",
      align: "right",
      render: (v?: number) => v ?? 0
    },
    {
      title: "Doanh thu (VNĐ)",
      dataIndex: "Tong_Doanh_Thu",
      align: "right",
      render: (v?: number) =>
        (v ?? 0).toLocaleString("vi-VN")
    }
  ];

  /* ================= RENDER ================= */
  return (
    <div style={{ padding: 24 }}>
      <h2>📊 Thống kê bác sĩ</h2>

      {/* FILTER */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <RangePicker
          value={dateRange}
          onChange={(v) => {
            if (v) {
              setPage(1);
              setDateRange(v as any);
            }
          }}
        />

        <Select
          allowClear
          placeholder="Chi nhánh"
          style={{ width: 160 }}
          onChange={(v) => {
            setPage(1);
            setMaCN(v);
          }}
        >
          <Option value="CN01">CN01</Option>
          <Option value="CN02">CN02</Option>
          <Option value="CN03">CN03</Option>
        </Select>

        <Input.Search
          placeholder="Tìm bác sĩ..."
          style={{ width: 220 }}
          allowClear
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* CHART */}
      {chartData.length > 0 && (
        <div style={{ width: "100%", height: 360, marginBottom: 24 }}>
          <h4>TOP 10 doanh thu bác sĩ</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="Ten_BacSi" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Tong_Doanh_Thu" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* TABLE */}
      <Spin spinning={loading}>
        <Table
          rowKey="Ma_BacSi"
          columns={columns}
          dataSource={filteredTableData}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: setPage
          }}
        />
      </Spin>
    </div>
  );
}
