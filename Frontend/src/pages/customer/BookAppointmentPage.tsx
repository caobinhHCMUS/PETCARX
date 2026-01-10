import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Đảm bảo đường dẫn import đúng tới file service của bạn
import { getPets, getDoctors, bookAppointment } from "../../services/customer.service";
import "./BookAppointmentPage.css"; 

/* ================= ĐỊNH NGHĨA KIỂU DỮ LIỆU (INTERFACE) ================= */
// Phải khớp chính xác với cột trong câu SELECT của Stored Procedure

// SQL: SELECT Ma_PET, Ten_PET, Ten_Loai, Giong FROM THU_CUNG ...
interface Pet {
  Ma_PET: string;
  Ten_PET: string;
  Ten_Loai: string;
  Giong: string;
}

// SQL (giả định từ sp_Khach_GetBacSi): Ma_BS, Ten_Bac_Si, Ten_CN...
interface Doctor {
  Ma_BS: string;
  Ten_Bac_Si: string;
  So_Nam_Kinh_Nghiem?: number; // Dấu ? nghĩa là có thể null
  Ten_CN?: string;
  Dia_Chi_Chi_Nhanh?: string;
}

export default function BookAppointmentPage() {
  const navigate = useNavigate();

  // --- STATE DỮ LIỆU ---
  const [pets, setPets] = useState<Pet[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  // --- STATE FORM ---
  const [selectedPet, setSelectedPet] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedShift, setSelectedShift] = useState<number>(1);

  // --- STATE UI ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --- LOAD DỮ LIỆU ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Gọi song song 2 API
        const [petsRes, doctorsRes] = await Promise.all([
          getPets(),
          getDoctors(),
        ]);

        console.log("API Pets:", petsRes.data);
        console.log("API Doctors:", doctorsRes.data);

        // [QUAN TRỌNG] Kiểm tra an toàn trước khi set state
        // Backend trả về: res.json(result.recordset || []) -> Luôn là mảng
        // Tuy nhiên, ta vẫn check Array.isArray để tránh crash nếu mạng lỗi
        const petsList = Array.isArray(petsRes.data) ? petsRes.data : [];
        const doctorsList = Array.isArray(doctorsRes.data) ? doctorsRes.data : [];

        setPets(petsList);
        setDoctors(doctorsList);

        // Tự động chọn mục đầu tiên nếu có dữ liệu
        if (petsList.length > 0) setSelectedPet(petsList[0].Ma_PET);
        if (doctorsList.length > 0) setSelectedDoctor(doctorsList[0].Ma_BS);

      } catch (err: any) {
        console.error("Lỗi tải trang:", err);
        setError("Không thể tải danh sách thú cưng hoặc bác sĩ.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- XỬ LÝ SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate
    if (!selectedPet) return setError("Vui lòng chọn thú cưng.");
    if (!selectedDoctor) return setError("Vui lòng chọn bác sĩ.");
    if (!selectedDate) return setError("Vui lòng chọn ngày.");

    try {
      setLoading(true);

      // Payload phải khớp với req.body trong controller bookAppointment
      // Controller: const { maPet, maBS, caLamViec, ngayDat } = req.body;
      const payload = {
        maPet: selectedPet,
        maBS: selectedDoctor,
        caLamViec: selectedShift, // int
        ngayDat: selectedDate,    // string "yyyy-mm-dd", backend sẽ new Date()
      };

      await bookAppointment(payload);

      setSuccess("Đặt lịch thành công!");
      // Chờ 1.5s rồi chuyển hướng về trang Lịch sử/Đơn hàng
      setTimeout(() => navigate("/customer/orders"), 1500);

    } catch (err: any) {
      console.error(err);
      // Lấy message lỗi từ Backend nếu có
      const msg = err.response?.data?.message || err.message || "Lỗi khi đặt lịch.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Ngày tối thiểu là hôm nay
  const today = new Date().toISOString().split("T")[0];

  // --- RENDER AN TOÀN (Tránh màn hình trắng) ---
  if (loading && pets.length === 0 && doctors.length === 0) {
    return <div className="loading-screen">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="booking-container">
      <h2 className="booking-title">Đăng Ký Lịch Khám</h2>

      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* 1. Chọn Thú Cưng */}
        <div className="form-group">
          <label className="form-label">Thú cưng:</label>
          
          {pets.length === 0 ? (
            <div className="empty-alert">
              Bạn chưa có thú cưng nào. 
              <br/>
              <span onClick={() => navigate("/customer/pets")} style={{color: 'blue', cursor: 'pointer', textDecoration: 'underline'}}>
                Thêm thú cưng ngay
              </span>
            </div>
          ) : (
            <select
              className="form-select"
              value={selectedPet}
              onChange={(e) => setSelectedPet(e.target.value)}
            >
              {pets.map((pet) => (
                // Key và Value phải dùng đúng tên cột SQL trả về: Ma_PET
                <option key={pet.Ma_PET} value={pet.Ma_PET}>
                  {pet.Ten_PET} ({pet.Ten_Loai} - {pet.Giong})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* 2. Chọn Bác Sĩ */}
        <div className="form-group">
          <label className="form-label">Bác sĩ phụ trách:</label>
          <select
            className="form-select"
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
          >
            {doctors.length === 0 && <option value="">Không có bác sĩ khả dụng</option>}
            {doctors.map((doc) => (
              // Key và Value dùng Ma_BS
              <option key={doc.Ma_BS} value={doc.Ma_BS}>
                BS. {doc.Ten_Bac_Si} {doc.Ten_CN ? `- ${doc.Ten_CN}` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Chọn Ngày */}
        <div className="form-group">
          <label className="form-label">Ngày khám:</label>
          <input
            type="date"
            className="form-input"
            min={today}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            required
          />
        </div>

        {/* 4. Chọn Ca */}
        <div className="form-group">
          <label className="form-label">Ca làm việc:</label>
          <div className="shift-options">
            {[1, 2, 3].map((shift) => (
              <label
                key={shift}
                className={`shift-label ${selectedShift === shift ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="shift"
                  className="shift-radio"
                  checked={selectedShift === shift}
                  onChange={() => setSelectedShift(shift)}
                />
                Ca {shift}
                <div style={{fontSize: '0.8em', fontWeight: 'normal'}}>
                    {shift === 1 ? "(Sáng)" : shift === 2 ? "(Chiều)" : "(Tối)"}
                </div>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="btn-submit"
          disabled={loading || pets.length === 0}
        >
          {loading ? "Đang xử lý..." : "Xác Nhận Đặt Lịch"}
        </button>
      </form>
    </div>
  );
}