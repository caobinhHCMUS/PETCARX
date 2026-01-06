import { useEffect, useState } from "react";
import { bsSearchMedicines } from "../../services/doctor.service";

type Medicine = {
  Ma_Thuoc?: string;
  Ten_Thuoc?: string;
  Don_Vi?: string;
  Gia?: number;
};

export default function DoctorMedicinePage() {
  const [keyword, setKeyword] = useState("");
  const [items, setItems] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!keyword.trim()) {
      setItems([]);
      setError("");
      return;
    }

    const t = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");
        const res = await bsSearchMedicines(keyword);

        if (!res.success) {
          setError(res.message || "Không tìm thấy thuốc");
          setItems([]);
          return;
        }

        const normalized = (res.items || []).map((r: any) => ({
          Ma_Thuoc: r.Ma_Thuoc ?? r.Ma_SP ?? r.MaThuoc ?? r.MaSP ?? r.id ?? "",
          Ten_Thuoc: r.Ten_Thuoc ?? r.Ten_SP ?? r.TenThuoc ?? r.TenSP ?? r.name ?? "",
          Don_Vi: r.Don_Vi ?? r.Don_Vi_Tinh ?? r.DonVi ?? r.DonViTinh ?? r.unit ?? "",
          Gia: Number(r.Gia ?? r.Don_Gia ?? r.DonGia ?? r.price ?? 0),
        }));

        setItems(normalized);
      } catch (e: any) {
        setError(e?.response?.data?.message || "Lỗi tìm kiếm thuốc");
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(t);
  }, [keyword]);

  return (
    <div className="medicine-page">
      {/* Nhúng toàn bộ nội dung từ DoctorMedicinePage.css */}
      <style>{`
        .medicine-page {
          max-width: 980px;
        }

        .medicine-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }

        .medicine-title {
          margin: 0;
          font-size: 28px;
          font-weight: 800;
        }

        .medicine-subtitle {
          margin: 6px 0 0;
          opacity: 0.75;
        }

        .search-wrap {
          display: flex;
          gap: 10px;
          align-items: center;
          margin: 12px 0 16px;
        }

        .search-input {
          width: 420px;
          max-width: 100%;
          padding: 10px 12px;
          border: 1px solid #d9d9d9;
          border-radius: 10px;
          outline: none;
        }

        .search-input:focus {
          border-color: #7aa7ff;
          box-shadow: 0 0 0 3px rgba(122, 167, 255, 0.25);
        }

        .medicine-card {
          border: 1px solid #eee;
          border-radius: 14px;
          background: #fff;
          overflow: hidden;
        }

        .table-wrap {
          overflow: auto;
          max-height: 560px;
        }

        .medicine-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 760px;
        }

        .medicine-table thead th {
          position: sticky;
          top: 0;
          background: #fafafa;
          z-index: 1;
          text-align: left;
          padding: 12px 14px;
          border-bottom: 1px solid #eee;
          font-weight: 800;
        }

        .medicine-table td {
          padding: 10px 14px;
          border-bottom: 1px solid #f2f2f2;
          vertical-align: top;
        }

        .medicine-table tbody tr:nth-child(odd) {
          background: #fcfcfc;
        }

        .medicine-table tbody tr:hover {
          background: #f5f9ff;
        }

        .col-code {
          width: 110px;
          white-space: nowrap;
          font-weight: 700;
        }

        .col-name {
          width: 520px;
        }

        .col-unit {
          width: 90px;
          white-space: nowrap;
        }

        .col-price {
          width: 140px;
          white-space: nowrap;
          text-align: right;
          font-variant-numeric: tabular-nums;
        }

        .ellipsis-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .meta-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 6px;
          font-size: 13px;
          opacity: 0.8;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 8px;
          border-radius: 999px;
          background: #eef4ff;
          border: 1px solid #d9e6ff;
          font-size: 12px;
          font-weight: 700;
        }

        .empty {
          padding: 40px;
          text-align: center;
          color: #999;
        }
      `}</style>

      <div className="medicine-head">
        <div>
          <h1 className="medicine-title">Tra cứu thuốc</h1>
          <p className="medicine-subtitle">
            Tìm kiếm thuốc để kê toa cho thú cưng
          </p>

          <div className="meta-row">
            <span className="badge">Kết quả: {items.length}</span>
            {loading && <span>Đang tìm...</span>}
            {!loading && error && (
              <span style={{ color: "crimson" }}>{error}</span>
            )}
          </div>
        </div>
      </div>

      <div className="search-wrap">
        <input
          className="search-input"
          placeholder="Nhập tên thuốc... (vd: amox, bổ gan, vitamin...)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      <div className="medicine-card">
        <div className="table-wrap">
          <table className="medicine-table">
            <thead>
              <tr>
                <th className="col-code">Mã thuốc</th>
                <th className="col-name">Tên thuốc</th>
                <th className="col-unit">Đơn vị</th>
                <th className="col-price">Giá</th>
              </tr>
            </thead>

            <tbody>
              {items.map((m, i) => (
                <tr key={`${m.Ma_Thuoc ?? "TH"}-${i}`}>
                  <td className="col-code">{m.Ma_Thuoc ?? "-"}</td>
                  <td className="col-name">
                    <div className="ellipsis-2" title={m.Ten_Thuoc}>
                      {m.Ten_Thuoc ?? "-"}
                    </div>
                  </td>
                  <td className="col-unit">{m.Don_Vi ?? "-"}</td>
                  <td className="col-price">
                    {Math.round(Number(m.Gia ?? 0)).toLocaleString("vi-VN")} đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && keyword.trim() && items.length === 0 && !error && (
          <div className="empty">Không có kết quả</div>
        )}
      </div>
    </div>
  );
}