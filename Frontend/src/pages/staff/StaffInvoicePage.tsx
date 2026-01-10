import { useState } from "react";
import { getStaffInvoiceInfo, addStaffExamDetail } from "../../services/staff.service";
 // Tạo file CSS riêng nếu cần

interface InvoiceData {
  invoice: any;
  pets: any[];
  doctors: any[];
  details: any[];
}

export default function StaffInvoicePage() {
  // State tìm kiếm
  const [searchId, setSearchId] = useState("");
  const [data, setData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State form thêm chi tiết
  const [formData, setFormData] = useState({
    maPet: "",
    bacSi: "",
    trieuChung: "",
    chuanDoan: "",
    ngayHenTaiKham: "",
    thanhTien: 0
  });

  // Xử lý tìm kiếm hóa đơn
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    
    setLoading(true);
    setError("");
    setData(null);

    try {
      const result = await getStaffInvoiceInfo(searchId.trim());
      setData(result);
      
      // Reset form khi tìm mới
      setFormData(prev => ({ ...prev, maPet: "", bacSi: "" }));
      
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Không tìm thấy hóa đơn hoặc lỗi server");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý submit thêm chi tiết
  const handleAddDetail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    if (!formData.maPet || !formData.bacSi || !formData.chuanDoan) {
      alert("Vui lòng nhập đủ Mã Pet, Bác sĩ và Chẩn đoán");
      return;
    }

    try {
      await addStaffExamDetail({
        maHD: data.invoice.Ma_HD,
        maPet: formData.maPet,
        bacSi: formData.bacSi,
        trieuChung: formData.trieuChung,
        chuanDoan: formData.chuanDoan,
        ngayHenTaiKham: formData.ngayHenTaiKham || null,
        thanhTien: Number(formData.thanhTien)
      });

      alert("Thêm chi tiết thành công!");
      // Reload lại dữ liệu để cập nhật danh sách và tổng tiền
      const updated = await getStaffInvoiceInfo(data.invoice.Ma_HD);
      setData(updated);
      
      // Reset các trường nhập liệu (giữ lại bác sĩ nếu muốn tiện)
      setFormData(prev => ({
        ...prev,
        trieuChung: "",
        chuanDoan: "",
        thanhTien: 0
      }));

    } catch (err: any) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="staff-page-container" style={{ padding: 20 }}>
      <h2>Chi tiết Hóa đơn Khám bệnh</h2>

      {/* KHUNG TÌM KIẾM */}
      <form onSubmit={handleSearch} style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
        <input 
          type="text" 
          placeholder="Nhập Mã Hóa Đơn (VD: HD001)..." 
          value={searchId}
          onChange={e => setSearchId(e.target.value)}
          style={{ padding: 8, width: 300 }}
        />
        <button type="submit" disabled={loading} style={{ padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 4 }}>
          {loading ? "Đang tìm..." : "Tìm kiếm"}
        </button>
      </form>

      {error && <div style={{ color: "red", marginBottom: 15 }}>{error}</div>}

      {/* HIỂN THỊ THÔNG TIN */}
      {data && (
        <div className="invoice-info-section">
          <div style={{ background: "#fff", padding: 15, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", marginBottom: 20 }}>
            <h3 style={{ marginTop: 0 }}>Thông tin chung</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <p><b>Mã HĐ:</b> {data.invoice.Ma_HD}</p>
                <p><b>Khách hàng:</b> {data.invoice.Ten_Khach_Hang} ({data.invoice.SDT})</p>
                <p><b>Ngày lập:</b> {new Date(data.invoice.Ngay_Lap).toLocaleString()}</p>
                <p><b>Loại:</b> {data.invoice.Loai_Nghiep_Vu}</p>
                <p><b>Trạng thái:</b> <span style={{color: 'green', fontWeight: 'bold'}}>{data.invoice.Trang_Thai}</span></p>
                <p><b>Tổng tiền hiện tại:</b> <span style={{color: 'red', fontWeight: 'bold', fontSize: '1.2em'}}>
                  {data.invoice.Tong_Tien?.toLocaleString()} VNĐ
                </span></p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {/* FORM THÊM CHI TIẾT */}
            <div style={{ flex: 1, minWidth: 300, background: "#fff", padding: 15, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <h3 style={{ marginTop: 0 }}>Thêm kết quả khám</h3>
              
              <form onSubmit={handleAddDetail} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                
                {/* Chọn Pet */}
                <div>
                    <label style={{display: 'block', fontWeight: 600}}>Thú cưng:</label>
                    <select 
                      style={{width: '100%', padding: 8}}
                      value={formData.maPet}
                      onChange={e => setFormData({...formData, maPet: e.target.value})}
                      required
                    >
                      <option value="">-- Chọn thú cưng --</option>
                      {data.pets.map(p => (
                        <option key={p.Ma_PET} value={p.Ma_PET}>{p.Ten_PET} - {p.Ten_Loai}</option>
                      ))}
                    </select>
                </div>

                {/* Chọn Bác Sĩ */}
                <div>
                    <label style={{display: 'block', fontWeight: 600}}>Bác sĩ phụ trách:</label>
                    <select 
                      style={{width: '100%', padding: 8}}
                      value={formData.bacSi}
                      onChange={e => setFormData({...formData, bacSi: e.target.value})}
                      required
                    >
                      <option value="">-- Chọn bác sĩ --</option>
                      {data.doctors.map(doc => (
                        <option key={doc.Ma_BS} value={doc.Ma_BS}>{doc.Ten_Bac_Si}</option>
                      ))}
                    </select>
                </div>

                <div>
                    <label style={{display: 'block', fontWeight: 600}}>Triệu chứng:</label>
                    <textarea 
                        style={{width: '100%', padding: 8}}
                        value={formData.trieuChung}
                        onChange={e => setFormData({...formData, trieuChung: e.target.value})}
                    />
                </div>

                <div>
                    <label style={{display: 'block', fontWeight: 600}}>Chẩn đoán:</label>
                    <textarea 
                        style={{width: '100%', padding: 8}}
                        value={formData.chuanDoan}
                        onChange={e => setFormData({...formData, chuanDoan: e.target.value})}
                        required
                    />
                </div>

                <div style={{ display: 'flex', gap: 10}}>
                    <div style={{flex: 1}}>
                        <label style={{display: 'block', fontWeight: 600}}>Thành tiền (Khám):</label>
                        <input 
                            type="number" 
                            style={{width: '100%', padding: 8}}
                            value={formData.thanhTien}
                            onChange={e => setFormData({...formData, thanhTien: Number(e.target.value)})}
                        />
                    </div>
                    <div style={{flex: 1}}>
                         <label style={{display: 'block', fontWeight: 600}}>Hẹn tái khám:</label>
                         <input 
                            type="date"
                            style={{width: '100%', padding: 8}}
                            value={formData.ngayHenTaiKham}
                            onChange={e => setFormData({...formData, ngayHenTaiKham: e.target.value})}
                         />
                    </div>
                </div>

                <button type="submit" style={{ marginTop: 10, padding: 10, background: "#10b981", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: "bold" }}>
                    Lưu kết quả khám
                </button>
              </form>
            </div>

            {/* DANH SÁCH ĐÃ THÊM */}
            <div style={{ flex: 1, minWidth: 300, background: "#fff", padding: 15, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                <h3 style={{ marginTop: 0 }}>Chi tiết hóa đơn</h3>
                {data.details.length === 0 ? (
                    <p>Chưa có chi tiết nào.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{background: '#f3f4f6', textAlign: 'left'}}>
                                <th style={{padding: 8}}>Thú cưng</th>
                                <th style={{padding: 8}}>Bác sĩ</th>
                                <th style={{padding: 8}}>Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.details.map((dt, idx) => (
                                <tr key={idx} style={{borderBottom: '1px solid #eee'}}>
                                    <td style={{padding: 8}}>
                                        <div><b>{dt.Ten_PET}</b></div>
                                        <small>{dt.Chuan_Doan}</small>
                                    </td>
                                    <td style={{padding: 8}}>{dt.Ten_Bac_Si}</td>
                                    <td style={{padding: 8}}>{dt.Thanh_Tien?.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}