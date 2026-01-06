import { useEffect, useMemo, useRef, useState } from "react";
import {
  bsSearchMedicines,
  bsSearchPets,
  bsIssuePrescription,
  type MedicineItem,
  type PetItem,
} from "../../services/doctor.service";




type RxLine = {
  ma_sp: string;
  ten_sp?: string;
  so_luong: number;
  lieu_dung: string;
  tan_suat: string;
  so_ngay: number | "";
  cach_dung: string;
};

export default function PrescriptionCreatePage() {
  // chọn pet
  const [petKeyword, setPetKeyword] = useState("");
  const [petResults, setPetResults] = useState<PetItem[]>([]);
  const [petLoading, setPetLoading] = useState(false);
  const [selectedPet, setSelectedPet] = useState<PetItem | null>(null);

  // tìm thuốc
  const [medKeyword, setMedKeyword] = useState("");
  const [medResults, setMedResults] = useState<MedicineItem[]>([]);
  const [medLoading, setMedLoading] = useState(false);

  // request id để tránh response cũ ghi đè (race condition / StrictMode dev)
  const petReqId = useRef(0);
  const medReqId = useRef(0);

  // danh sách dòng kê (ban đầu rỗng)
  const [lines, setLines] = useState<RxLine[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  // debounce search pet
  useEffect(() => {
    const k = petKeyword.trim();
    if (!k) {
      setPetResults([]);
      return;
    }

    const t = setTimeout(async () => {
      const reqId = ++petReqId.current;
      try {
        setPetLoading(true);
        const rs = await bsSearchPets(k);

        // bỏ kết quả cũ nếu đã có request mới hơn
        if (reqId !== petReqId.current) return;

        const items = (rs.items || [])
          .map((x: any) => ({
            ma_pet: (x.ma_pet ?? x.Ma_PET ?? x.Ma_Pet ?? "").toString(),
            ten_pet: (x.ten_pet ?? x.Ten_PET ?? x.Ten_Pet ?? "").toString(),
            ten_kh: (x.ten_kh ?? x.Ten_KH ?? x.Ten_Kh ?? "").toString(),
          }))
          .filter((p: any) => p.ma_pet);

        setPetResults(items);
      } finally {
        if (reqId === petReqId.current) setPetLoading(false);
      }
    }, 350);

    return () => clearTimeout(t);
  }, [petKeyword]);

  // debounce search medicines
  useEffect(() => {
    const k = medKeyword.trim();
    if (!k) {
      setMedResults([]);
      return;
    }

    const t = setTimeout(async () => {
      const reqId = ++medReqId.current;
      try {
        setMedLoading(true);
        const rs = await bsSearchMedicines(k);

        // bỏ kết quả cũ nếu đã có request mới hơn
        if (reqId !== medReqId.current) return;

        const items = (rs.items || [])
          .map((x: any) => ({
            ma_sp: (x.ma_sp ?? x.Ma_SP ?? x.Ma_Sp ?? "").toString(),
            ten_sp: (x.ten_sp ?? x.Ten_SP ?? x.Ten_Sp ?? "").toString(),
          }))
          .filter((m: any) => m.ma_sp);

        setMedResults(items);
      } finally {
        if (reqId === medReqId.current) setMedLoading(false);
      }
    }, 350);

    return () => clearTimeout(t);
  }, [medKeyword]);

  const canSubmit = useMemo(() => {
    // Pet selection hiện tại chỉ để UX (backend chưa dùng ma_pet khi kê theo ma_hd),
    // nhưng bạn có thể giữ để đúng flow kê đơn.
    if (!selectedPet) return false;

    const validLines = lines.filter((x) => x.ma_sp.trim());
    if (validLines.length === 0) return false;
    if (validLines.some((x) => !x.so_luong || x.so_luong <= 0)) return false;
    return true;
  }, [selectedPet, lines]);

  function addLine() {
    setLines((prev) => [
      ...prev,
      { ma_sp: "", so_luong: 1, lieu_dung: "", tan_suat: "", so_ngay: "", cach_dung: "" },
    ]);
  }

  // ✅ bấm xóa là xóa hẳn dòng (kể cả dòng cuối cùng)
  function removeLine(idx: number) {
    setLines((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateLine(idx: number, patch: Partial<RxLine>) {
    setLines((prev) => prev.map((x, i) => (i === idx ? { ...x, ...patch } : x)));
  }

  // ✅ bấm vào thuốc trong danh sách search => thêm vào danh sách kê đơn (1 click ăn ngay)
  function pickMedicine(m: MedicineItem) {
    // hủy mọi response search đang bay về để tránh dropdown bật lại / ghi đè UI
    medReqId.current++;

    setLines((prev) => {
      const ma = (m.ma_sp || "").trim();
      if (!ma) return prev;

      // 1) đã có thuốc => tăng số lượng
      const existed = prev.findIndex((x) => x.ma_sp?.trim() === ma);
      if (existed >= 0) {
        return prev.map((x, i) =>
          i === existed
            ? { ...x, so_luong: (x.so_luong || 0) + 1, ten_sp: x.ten_sp || m.ten_sp }
            : x
        );
      }

      // 2) có dòng trống => nhét vào dòng trống
      const emptyIdx = prev.findIndex((x) => !x.ma_sp?.trim());
      if (emptyIdx >= 0) {
        return prev.map((x, i) => (i === emptyIdx ? { ...x, ma_sp: ma, ten_sp: m.ten_sp } : x));
      }

      // 3) không có dòng trống => thêm dòng mới
      return [
        ...prev,
        { ma_sp: ma, ten_sp: m.ten_sp, so_luong: 1, lieu_dung: "", tan_suat: "", so_ngay: "", cach_dung: "" },
      ];
    });

    setMedResults([]);
    setMedKeyword("");
  }

  async function submit() {
    setErr("");
    if (!canSubmit) return;

    try {
      setSubmitting(true);

      // Gọi backend để tự tạo mã hóa đơn và mã đơn thuốc
      const rs = await bsIssuePrescription({
        ma_pet: selectedPet?.ma_pet || "",  // Mã pet từ người dùng chọn
        items: lines
          .filter((x) => x.ma_sp.trim())
          .map((it) => ({
            ma_sp: it.ma_sp.trim(),
            so_luong: Number(it.so_luong),
            lieu_dung: it.lieu_dung.trim() || null, // Chỉ null khi rỗng sau khi trim
            tan_suat: it.tan_suat.trim() || null,
            so_ngay: it.so_ngay === "" ? null : Number(it.so_ngay),
            cach_dung: it.cach_dung.trim() || null,
          }))
      });

      const { ma_hd, ma_dt } = rs;

      if (!rs?.success || !ma_dt) throw new Error(rs?.message || "Không tạo được đơn thuốc");

      alert(`✅ Kê đơn thành công. Mã hóa đơn: ${ma_hd}, Mã đơn thuốc: ${ma_dt}`);
    } catch (e: any) {
      setErr(e?.message || "Lỗi kê đơn");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 980, margin: "24px auto", padding: 16 }}>
      <h2>Kê đơn thuốc</h2>

      {err && <div style={{ color: "crimson", marginBottom: 12 }}>{err}</div>}

      <section style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, marginBottom: 16 }}>
        <h3>1) Chọn thú cưng</h3>
        <input
          value={petKeyword}
          onChange={(e) => setPetKeyword(e.target.value)}
          placeholder="Tìm pet theo tên / mã..."
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        {petLoading && <div>Đang tìm...</div>}

        {!selectedPet && petResults.length > 0 && (
          <div style={{ display: "grid", gap: 8 }}>
            {petResults.map((p: any) => (
              <button
                type="button"
                key={p.ma_pet}
                onMouseDown={(e) => {
                  e.preventDefault();
                  petReqId.current++;
                  setSelectedPet(p);
                  setPetResults([]);
                }}
                style={{ textAlign: "left", padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
              >
                <b>{p.ten_pet}</b> — {p.ma_pet} {p.ten_kh ? ` (KH: ${p.ten_kh})` : ""}
              </button>
            ))}
          </div>
        )}

        {selectedPet && (
          <div style={{ marginTop: 10, padding: 10, background: "#f6f6f6", borderRadius: 8 }}>
            Đã chọn: <b>{(selectedPet as any).ten_pet}</b> ({(selectedPet as any).ma_pet})
            <button type="button" onClick={() => setSelectedPet(null)} style={{ marginLeft: 12, padding: "6px 10px" }}>
              Đổi pet
            </button>
          </div>
        )}
      </section>

      <section style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
        <h3>2) Danh sách thuốc</h3>

        <div style={{ marginBottom: 10 }}>
          <input
            value={medKeyword}
            onChange={(e) => setMedKeyword(e.target.value)}
            onBlur={() => {
              // đóng dropdown sau 1 tick để vẫn cho pointerdown chạy
              setTimeout(() => setMedResults([]), 0);
            }}
            placeholder="Tìm thuốc theo tên/mã..."
            style={{ width: "100%", padding: 10 }}
          />

          {medLoading && <div>Đang tìm thuốc...</div>}

          {medResults.length > 0 && (
            <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
              {medResults.slice(0, 10).map((m) => (
                <div
                  key={m.ma_sp}
                  role="button"
                  tabIndex={0}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    pickMedicine(m);
                  }}
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid #ccc",
                    cursor: "pointer",
                    userSelect: "none",
                    textAlign: "left",
                  }}
                >
                  <b>{m.ten_sp}</b> — {m.ma_sp}
                </div>
              ))}
            </div>
          )}
        </div>

        {lines.length === 0 && (
          <div style={{ color: "#666", marginBottom: 10 }}>
            Chưa có thuốc nào. Bấm <b>+ Thêm thuốc</b> để bắt đầu.
          </div>
        )}

        {lines.map((ln, idx) => (
          <div key={idx} style={{ border: "1px solid #eee", borderRadius: 8, padding: 10, marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: "#666" }}>Mã thuốc</div>
                <input
                  value={ln.ma_sp}
                  onChange={(e) => updateLine(idx, { ma_sp: e.target.value })}
                  style={{ width: "100%", padding: 8 }}
                  placeholder="VD: SP001"
                />
              </div>

              <div style={{ width: 120 }}>
                <div style={{ fontSize: 12, color: "#666" }}>Số lượng</div>
                <input
                  type="number"
                  value={ln.so_luong}
                  onChange={(e) => updateLine(idx, { so_luong: Number(e.target.value) })}
                  style={{ width: "100%", padding: 8 }}
                />
              </div>

              <button type="button" onClick={() => removeLine(idx)} style={{ padding: "8px 10px" }}>
                Xóa
              </button>
            </div>

            {ln.ten_sp && (
              <div style={{ marginBottom: 8 }}>
                Tên thuốc: <b>{ln.ten_sp}</b>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 140px", gap: 10 }}>
              <div>
                <div style={{ fontSize: 12, color: "#666" }}>Liều dùng</div>
                <input
                  value={ln.lieu_dung}
                  onChange={(e) => updateLine(idx, { lieu_dung: e.target.value })}
                  style={{ width: "100%", padding: 8 }}
                />
              </div>

              <div>
                <div style={{ fontSize: 12, color: "#666" }}>Tần suất</div>
                <input
                  value={ln.tan_suat}
                  onChange={(e) => updateLine(idx, { tan_suat: e.target.value })}
                  style={{ width: "100%", padding: 8 }}
                />
              </div>

              <div>
                <div style={{ fontSize: 12, color: "#666" }}>Số ngày</div>
                <input
                  type="number"
                  value={ln.so_ngay}
                  onChange={(e) => updateLine(idx, { so_ngay: e.target.value === "" ? "" : Number(e.target.value) })}
                  style={{ width: "100%", padding: 8 }}
                />
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 12, color: "#666" }}>Cách dùng</div>
              <input
                value={ln.cach_dung}
                onChange={(e) => updateLine(idx, { cach_dung: e.target.value })}
                style={{ width: "100%", padding: 8 }}
              />
            </div>
          </div>
        ))}

        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={addLine} style={{ padding: "10px 14px" }}>
            + Thêm thuốc
          </button>
          <button type="button" onClick={submit} disabled={!canSubmit || submitting} style={{ padding: "10px 14px" }}>
            {submitting ? "Đang kê..." : "Kê đơn"}
          </button>
        </div>

        {!selectedPet && <div style={{ marginTop: 10, color: "#666" }}>Chọn pet trước khi kê đơn.</div>}
      </section>
    </div>
  );
}
