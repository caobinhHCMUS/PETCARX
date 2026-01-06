import { useEffect, useState } from "react";
import { bsSearchPets } from "../../services/doctor.service";

type Pet = any;

const pick = (obj: any, keys: string[], fallback = "") => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return fallback;
};

export default function DoctorPetsPage() {
  const [keyword, setKeyword] = useState("");
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selected, setSelected] = useState<Pet | null>(null);

  useEffect(() => {
    if (!keyword.trim()) {
      setPets([]);
      setSelected(null);
      setError("");
      return;
    }

    const t = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");
        const res = await bsSearchPets(keyword);

        if (!res.success) {
          setPets([]);
          setSelected(null);
          setError(res.message || "Không tìm thấy thú cưng");
          return;
        }

        const list = res.items || [];
        setPets(list);
        setSelected(list[0] || null);
      } catch (e: any) {
        setPets([]);
        setSelected(null);
        setError(e?.response?.data?.message || "Lỗi tìm kiếm thú cưng");
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(t);
  }, [keyword]);

  return (
    <div className="pets-page">
      {/* Nhúng toàn bộ mã CSS từ DoctorPetsPage.css */}
      <style>{`
        .pets-page { max-width: 1100px; }
        .pets-head { display:flex; justify-content:space-between; gap:12px; align-items:flex-end; margin-bottom:12px; }
        .pets-title { margin:0; font-size:28px; font-weight:800; }
        .pets-subtitle { margin:6px 0 0; opacity:.75; }
        .pets-search {
          width: 420px; max-width: 100%;
          padding: 10px 12px;
          border: 1px solid #d9d9d9;
          border-radius: 10px;
          outline: none;
        }
        .pets-search:focus { border-color:#7aa7ff; box-shadow:0 0 0 3px rgba(122,167,255,.25); }

        .pets-grid { display:grid; grid-template-columns: 360px 1fr; gap:16px; }
        @media (max-width: 960px){ .pets-grid{ grid-template-columns:1fr; } }

        .card { border:1px solid #eee; border-radius:14px; background:#fff; overflow:hidden; }
        .card-title { padding:12px 14px; font-weight:800; border-bottom:1px solid #f2f2f2; background:#fafafa; }

        .list { max-height: 640px; overflow:auto; }
        .row { width:100%; border:0; background:transparent; text-align:left; padding:0; cursor:pointer; }
        .row-main { padding:12px 14px; border-bottom:1px solid #f3f3f3; }
        .row:hover .row-main { background:#f5f9ff; }
        .row.active .row-main { background:#eef4ff; }
        .row-name { font-weight:800; margin-bottom:4px; }
        .row-meta { font-size:13px; opacity:.85; display:flex; gap:8px; flex-wrap:wrap; align-items:center; }

        .badge { padding:2px 8px; border-radius:999px; background:#eef4ff; border:1px solid #d9e6ff; font-size:12px; font-weight:700; }
        .muted { opacity:.7; }
        .err { color:crimson; font-weight:700; }

        .empty { padding:12px 14px; opacity:.75; }

        .detail { padding:14px; }
        .detail-name { font-size:18px; font-weight:900; margin-bottom:6px; }
        .detail-meta { display:flex; gap:8px; flex-wrap:wrap; align-items:center; opacity:.85; margin-bottom:12px; }

        .kv { border-top:1px solid #f2f2f2; padding-top:12px; display:grid; gap:10px; }
        .kv-row { display:grid; grid-template-columns: 140px 1fr; gap:10px; }
        .kv-k { font-weight:800; opacity:.8; }
        .kv-v { opacity:.95; }

        .hint { margin-top:12px; font-size:12px; opacity:.7; }
      `}</style>

      <div className="pets-head">
        <div>
          <h1 className="pets-title">Hồ sơ thú cưng</h1>
          <p className="pets-subtitle">Tra cứu và xem thông tin thú cưng</p>
        </div>

        <input
          className="pets-search"
          placeholder="Tìm theo mã / tên thú cưng / chủ nuôi..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      <div className="pets-grid">
        {/* LEFT: danh sách */}
        <div className="card">
          <div className="card-title">
            Danh sách ({pets.length})
            {loading && <span className="muted"> • Đang tìm...</span>}
            {!loading && error && <span className="err"> • {error}</span>}
          </div>

          <div className="list">
            {pets.map((p: any, i: number) => {
              const id = pick(p, ["Ma_PET", "ma_pet", "Ma_Pet", "id"], `row-${i}`);
              const name = pick(p, ["Ten_PET", "Ten_Pet", "TenThuCung", "Ten", "name"], "(Không tên)");
              const loai = pick(p, ["Loai", "Loai_PET", "LoaiPet", "Species"], "");
              const owner = pick(p, ["Ten_KH", "TenChu", "ChuNuoi", "OwnerName"], "");
              const active =
                selected && pick(selected, ["Ma_PET", "ma_pet", "id"], "") === id;

              return (
                <button
                  key={id}
                  className={`row ${active ? "active" : ""}`}
                  onClick={() => setSelected(p)}
                >
                  <div className="row-main">
                    <div className="row-name">{name}</div>
                    <div className="row-meta">
                      <span className="badge">{id}</span>
                      {loai && <span className="muted">• {loai}</span>}
                      {owner && <span className="muted">• {owner}</span>}
                    </div>
                  </div>
                </button>
              );
            })}

            {!loading && keyword.trim() && pets.length === 0 && !error && (
              <div className="empty">Không có kết quả</div>
            )}

            {!keyword.trim() && (
              <div className="empty">
                Nhập từ khóa để tìm thú cưng (vd: “milu”, “PET01”, “Nguyễn…”)
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: chi tiết */}
        <div className="card">
          <div className="card-title">Thông tin thú cưng</div>

          {!selected ? (
            <div className="empty">Chọn 1 thú cưng trong danh sách để xem</div>
          ) : (
            <div className="detail">
              <div className="detail-top">
                <div>
                  <div className="detail-name">
                    {pick(selected, ["Ten_PET", "Ten_Pet", "TenThuCung", "Ten", "name"], "(Không tên)")}
                  </div>
                  <div className="detail-meta">
                    <span className="badge">
                      {pick(selected, ["Ma_PET", "ma_pet", "id"], "-")}
                    </span>
                    <span className="muted">
                      • {pick(selected, ["Loai", "Loai_PET", "Species"], "Không rõ loài")}
                    </span>
                    <span className="muted">
                      • {pick(selected, ["Giong", "Giong_PET", "Breed"], "Không rõ giống")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="kv">
                <div className="kv-row">
                  <div className="kv-k">Chủ nuôi</div>
                  <div className="kv-v">{pick(selected, ["Ten_KH", "ChuNuoi", "OwnerName", "TenChu"], "-")}</div>
                </div>

                <div className="kv-row">
                  <div className="kv-k">Giới tính</div>
                  <div className="kv-v">{pick(selected, ["Gioi_Tinh", "Sex"], "-")}</div>
                </div>

                <div className="kv-row">
                  <div className="kv-k">Tuổi / năm sinh</div>
                  <div className="kv-v">{pick(selected, ["Tuoi", "Nam_Sinh", "BirthYear", "Ngay_Sinh"], "-")}</div>
                </div>

                <div className="kv-row">
                  <div className="kv-k">Cân nặng</div>
                  <div className="kv-v">{pick(selected, ["Can_Nang", "Weight"], "-")}</div>
                </div>

                <div className="kv-row">
                  <div className="kv-k">Ghi chú</div>
                  <div className="kv-v">{pick(selected, ["Ghi_Chu", "Note", "Mo_Ta"], "-")}</div>
                </div>
              </div>

              <div className="hint">
                * Lịch sử khám nằm ở màn hình “Lịch sử khám”.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}