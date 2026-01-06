import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // Đảm bảo đường dẫn đúng tới AuthContext của bạn
import { bsGetDoctorExamHistory, DoctorExamHistoryItem } from '../../services/doctor.service';

const DoctorExamHistoryPage: React.FC = () => {
  const { user } = useAuth(); // Lấy thông tin bác sĩ đang đăng nhập
  const [history, setHistory] = useState<DoctorExamHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.ma_bs) {
        setError("Không tìm thấy thông tin bác sĩ.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await bsGetDoctorExamHistory(user.ma_bs);
        if (res.success) {
          setHistory(res.items);
        } else {
          setError(res.message || "Không thể tải lịch sử khám.");
        }
      } catch (err) {
        setError("Đã có lỗi xảy ra khi kết nối đến máy chủ.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user?.ma_bs]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Lịch Sử Khám Bệnh</h1>
        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded">
          Bác sĩ: { user?.ma_bs}
        </span>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã Hóa Đơn</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thú Cưng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày Khám</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chẩn Đoán</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thành Tiền</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history.length > 0 ? (
              history.map((item) => (
                <tr key={item.Ma_HD} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                    {item.Ma_HD}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {item.Ten_Pet}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.Ngay_Lap).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {item.Chuan_Doan || "Chưa có chẩn đoán"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-green-600">
                    {item.Thanh_Tien?.toLocaleString('vi-VN')} đ
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                  Bạn chưa thực hiện ca khám nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DoctorExamHistoryPage;