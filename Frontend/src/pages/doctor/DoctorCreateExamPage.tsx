import { useState } from "react";
import { bsCreateExam } from "../../services/doctor.service";

export default function DoctorCreateExamPage() {
  const [maPet, setMaPet] = useState("");
  const [trieuChung, setTrieuChung] = useState("");
  const [chuanDoan, setChuanDoan] = useState("");
  const [ngayHen, setNgayHen] = useState("");
  const [thanhTien, setThanhTien] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const ma_pet = maPet.trim();
    const trieu_chung = trieuChung.trim() || null;
    const chuan_doan = chuanDoan.trim();
    const tt = Math.max(0, Math.round(Number(thanhTien || 0)));

    if (!ma_pet) return setError("Vui lòng nhập mã thú cưng.");
    if (!chuan_doan) return setError("Vui lòng nhập chuẩn đoán.");
    if (Number.isNaN(tt)) return setError("Thành tiền không hợp lệ.");

    try {
      setLoading(true);

      const res = await bsCreateExam({
        ma_pet,
        trieu_chung,
        chuan_doan,
        ngay_hen_tai_kham: ngayHen ? new Date(ngayHen).toISOString() : null,
        thanh_tien: tt,
      });

      if (!res.success) {
        setError(res.message || "Tạo bệnh án thất bại");
        return;
      }

      setSuccess(`✅ Tạo bệnh án thành công (Mã: ${res.ma_hd || "-"})`);
      setMaPet("");
      setTrieuChung("");
      setChuanDoan("");
      setNgayHen("");
      setThanhTien("");
    } catch (e: any) {
      setError(e?.response?.data?.message || "Lỗi tạo bệnh án");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Tạo bệnh án mới</h1>
      <p style={styles.subtitle}>
        Nhập thông tin bệnh án. <b>Mã bác sĩ</b> tự lấy từ tài khoản đăng nhập.
      </p>

      <form onSubmit={onSubmit} style={styles.card}>
        {/* Mã thú cưng */}
        <div style={styles.row}>
          <label style={styles.label}>Mã thú cưng</label>
          <input
            style={styles.input}
            placeholder="VD: PET01"
            value={maPet}
            onChange={(e) => setMaPet(e.target.value)}
          />
        </div>

        {/* Triệu chứng */}
        <div style={styles.row}>
          <label style={styles.label}>Triệu chứng</label>
          <textarea
            style={{ ...styles.input, minHeight: 90 }}
            placeholder="Nhập triệu chứng... (vd: bỏ ăn, nôn, tiêu chảy...)"
            value={trieuChung}
            onChange={(e) => setTrieuChung(e.target.value)}
          />
        </div>

        {/* Chuẩn đoán */}
        <div style={styles.row}>
          <label style={styles.label}>Chuẩn đoán</label>
          <textarea
            style={{ ...styles.input, minHeight: 90 }}
            placeholder="Nhập chuẩn đoán..."
            value={chuanDoan}
            onChange={(e) => setChuanDoan(e.target.value)}
          />
        </div>

        {/* Ngày hẹn tái khám */}
        <div style={styles.row}>
          <label style={styles.label}>Ngày hẹn tái khám</label>
          <input
            type="datetime-local"
            style={styles.input}
            value={ngayHen}
            onChange={(e) => setNgayHen(e.target.value)}
          />
        </div>

        {/* Thành tiền */}
        <div style={styles.row}>
          <label style={styles.label}>Thành tiền</label>
          <input
            inputMode="numeric"
            style={styles.input}
            placeholder="VD: 150000"
            value={thanhTien}
            onChange={(e) => setThanhTien(e.target.value)}
          />
          <div style={styles.moneyHint}>
            Hiển thị:{" "}
            <b>{Math.round(Number(thanhTien || 0)).toLocaleString("vi-VN")} đ</b>
          </div>
        </div>

        {error && <div style={{ ...styles.msg, ...styles.err }}>{error}</div>}
        {success && <div style={{ ...styles.msg, ...styles.ok }}>{success}</div>}

        <button style={styles.btn} disabled={loading}>
          {loading ? "Đang tạo..." : "Tạo bệnh án"}
        </button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 760 },
  title: { margin: "0 0 6px", fontSize: 28, fontWeight: 900 },
  subtitle: { margin: "0 0 14px", opacity: 0.75 },
  card: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 14,
    padding: 16,
  },
  row: { display: "grid", gap: 8, marginBottom: 14 },
  label: { fontWeight: 800, opacity: 0.85 },
  input: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #d9d9d9",
    outline: "none",
    fontSize: 14,
  },
  btn: {
    marginTop: 6,
    padding: "10px 16px",
    borderRadius: 10,
    border: 0,
    background: "#2563eb",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },
  msg: { padding: "10px 12px", borderRadius: 10, marginBottom: 10, fontWeight: 700 },
  err: { background: "#fff0f0", border: "1px solid #ffd2d2", color: "#b10000" },
  ok: { background: "#effaf2", border: "1px solid #cdeed6", color: "#116b2d" },
  moneyHint: { fontSize: 13, opacity: 0.75 },
};
