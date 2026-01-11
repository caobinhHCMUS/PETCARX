import React, { useState, useEffect } from "react";
// Hãy đảm bảo đường dẫn ../../ chính xác với cấu trúc thư mục của bạn
import { getMyPets, getAvailableDoctors, createBooking } from "../../services/customer.service";

const SHIFTS = [
  { id: 1, label: "Ca 1", time: "07:00 - 10:00" },
  { id: 2, label: "Ca 2", time: "10:00 - 13:00" },
  { id: 3, label: "Ca 3", time: "13:00 - 16:00" },
];

export default function CustomerBooking() {
  const [ngayKham, setNgayKham] = useState("");
  const [caSelected, setCaSelected] = useState<number | null>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  
  const [selectedBS, setSelectedBS] = useState("");
  const [selectedPet, setSelectedPet] = useState("");
  const [loading, setLoading] = useState(false);

  // Load danh sách thú cưng khi vào trang
  useEffect(() => {
    getMyPets()
      .then(res => setPets(res.data.items || []))
      .catch(err => console.error("Lỗi lấy danh sách pet:", err));
  }, []);

  // Tự động tìm bác sĩ khi thay đổi Ngày hoặc Ca
  useEffect(() => {
    if (ngayKham && caSelected) {
      getAvailableDoctors(ngayKham, caSelected)
        .then(res => {
          setDoctors(res.data || []);
          setSelectedBS(""); // Reset bác sĩ đã chọn khi đổi ca/ngày
        })
        .catch(() => alert("Không thể lấy danh sách bác sĩ trực ca này"));
    }
  }, [ngayKham, caSelected]);

  const handleConfirmBooking = async () => {
    // Kiểm tra dữ liệu đầu vào
    if (!selectedBS || !selectedPet || !ngayKham || !caSelected) {
      alert("Vui lòng điền đầy đủ thông tin: Ngày, Ca, Bác sĩ và Thú cưng");
      return;
    }

    try {
      setLoading(true);
      await createBooking({
        Ma_BS: selectedBS,
        Ma_PET: selectedPet,
        Ngay_Dat: ngayKham,
        Ca_lamviec: caSelected
      });
      
      alert("Đặt lịch thành công!");
      
      // Reset form sau khi thành công
      setSelectedBS("");
      setSelectedPet("");
    } catch (error) {
      console.error(error);
      alert("Đặt lịch thất bại, vui lòng thử lại sau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">ĐẶT LỊCH KHÁM</h2>

      {/* 1. Chọn Ngày */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">1. Chọn ngày khám:</label>
        <input 
          type="date" 
          className="w-full border p-2 rounded"
          min={new Date().toISOString().split("T")[0]} 
          value={ngayKham}
          onChange={(e) => setNgayKham(e.target.value)}
        />
      </div>

      {/* 2. Chọn Ca */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">2. Chọn khung giờ:</label>
        <div className="grid grid-cols-3 gap-4">
          {SHIFTS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setCaSelected(s.id)}
              className={`p-4 border rounded-lg transition-all ${
                caSelected === s.id 
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg" 
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700"
              }`}
            >
              <div className="font-bold">{s.label}</div>
              <div className="text-sm opacity-80">{s.time}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Chọn Bác sĩ */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">3. Chọn bác sĩ trực:</label>
        {doctors.length > 0 ? (
          <select 
            className="w-full border p-2 rounded bg-white"
            value={selectedBS}
            onChange={(e) => setSelectedBS(e.target.value)}
          >
            <option value="">-- Chọn bác sĩ --</option>
            {doctors.map(dr => (
              <option key={dr.Ma_BS} value={dr.Ma_BS}>
                BS. {dr.Ho_Ten} {dr.Bang_Cap ? `- ${dr.Bang_Cap}` : ""}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-orange-500 text-sm italic">
            {ngayKham && caSelected 
              ? "Không có bác sĩ nào trực vào thời gian này." 
              : "Vui lòng chọn ngày và ca để thấy danh sách bác sĩ."}
          </p>
        )}
      </div>

      {/* 4. Chọn Thú cưng */}
      <div className="mb-8">
        <label className="block font-semibold mb-2">4. Chọn thú cưng của bạn:</label>
        <select 
          className="w-full border p-2 rounded bg-white"
          value={selectedPet}
          onChange={(e) => setSelectedPet(e.target.value)}
        >
          <option value="">-- Chọn thú cưng --</option>
          {pets.map(p => (
            <option key={p.Ma_PET} value={p.Ma_PET}>
              {p.Ten_PET} {p.Ten_Loai ? `(${p.Ten_Loai})` : ""}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleConfirmBooking}
        disabled={loading || !selectedBS || !selectedPet}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 transition-colors"
      >
        {loading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT LỊCH"}
      </button>
    </div>
  );
}