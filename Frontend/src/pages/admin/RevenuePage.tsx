import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

// Định nghĩa kiểu dữ liệu để tránh dùng 'any'
interface RevenueItem {
  Loai_Nghiep_Vu: string;
  So_Luong_Don: number;
  Doanh_Thu: number;
}

const RevenuePage = () => {
  const [data, setData] = useState<RevenueItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State cho bộ lọc thời gian
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: ''
  });

  // Sử dụng useCallback để hàm không bị khởi tạo lại vô ích
  const fetchRevenue = useCallback(async (currentFilter = filter) => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/admin/revenue-by-type', {
        params: {
          startDate: currentFilter.startDate || undefined,
          endDate: currentFilter.endDate || undefined
        }
      });

      // LOG DỮ LIỆU: Kiểm tra tại đây nếu giao diện vẫn trống
      console.log("Dữ liệu từ API:", response.data);

      // Kiểm tra nếu API trả về response.data.data hoặc trực tiếp response.data
      const result = response.data.data || response.data;
      setData(Array.isArray(result) ? result : []);
      
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      alert("Không thể kết nối đến server. Vui lòng kiểm tra API!");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Load dữ liệu lần đầu
  useEffect(() => {
    fetchRevenue();
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRevenue();
  };

  const handleReset = () => {
    const clearedFilter = { startDate: '', endDate: '' };
    setFilter(clearedFilter);
    fetchRevenue(clearedFilter); // Gọi API ngay lập tức với params rỗng
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Thống kê doanh thu hệ thống</h1>

      {/* Bộ lọc thời gian */}
      <Card className="p-4 mb-6">
        <form onSubmit={handleFilter} className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Từ ngày</label>
            <Input 
              type="date" 
              value={filter.startDate} 
              onChange={(e) => setFilter({...filter, startDate: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Đến ngày</label>
            <Input 
              type="date" 
              value={filter.endDate} 
              onChange={(e) => setFilter({...filter, endDate: e.target.value})} 
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang tải...' : 'Lọc dữ liệu'}
            </Button>
            <Button variant="outline" type="button" onClick={handleReset} disabled={loading}>
              Xóa lọc
            </Button>
          </div>
        </form>
      </Card>

      {/* Bảng hiển thị kết quả */}
      <Card>
        <Table>
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-left">Loại nghiệp vụ</th>
              <th className="p-3 text-left">Số lượng đơn</th>
              <th className="p-3 text-left">Tổng doanh thu</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3">{item.Loai_Nghiep_Vu}</td>
                  <td className="p-3">{item.So_Luong_Don}</td>
                  <td className="p-3 font-semibold text-blue-600">
                    {new Intl.NumberFormat('vi-VN').format(item.Doanh_Thu)} VNĐ
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-10 text-center text-gray-500">
                  {loading ? 'Đang tải dữ liệu...' : 'Không có dữ liệu hiển thị cho khoảng thời gian này.'}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

export default RevenuePage;