import React from "react";
import { StaffPayload } from "../../services/admin.service";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: StaffPayload) => void;
  initialData?: StaffPayload | null;
}

export default function StaffModal({
  open,
  onClose,
  onSubmit,
  initialData,
}: Props) {
  if (!open) return null;

  const [form, setForm] = React.useState<StaffPayload>(
    initialData ?? {
      Ma_NV: "",
      Ho_Ten: "",
      Vai_Tro: "",
      Luong_CB: 0,
      Ma_CN: "",
    }
  );

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>{initialData ? "✏️ Sửa nhân viên" : "➕ Thêm nhân viên"}</h3>

        <input
          placeholder="Mã NV"
          value={form.Ma_NV}
          disabled={!!initialData}
          onChange={(e) => setForm({ ...form, Ma_NV: e.target.value })}
        />
        <input
          placeholder="Họ tên"
          value={form.Ho_Ten}
          onChange={(e) => setForm({ ...form, Ho_Ten: e.target.value })}
        />
        <input
          placeholder="Vai trò"
          value={form.Vai_Tro}
          onChange={(e) => setForm({ ...form, Vai_Tro: e.target.value })}
        />
        <input
          type="number"
          placeholder="Lương"
          value={form.Luong_CB ?? ""}
          onChange={(e) =>
            setForm({ ...form, Luong_CB: Number(e.target.value) })
          }
        />

        <div style={{ marginTop: 16, textAlign: "right" }}>
          <button onClick={onClose}>Hủy</button>
          <button
            onClick={() => onSubmit(form)}
            style={{ marginLeft: 8 }}
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}


/* ===== styles ===== */
const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modal: React.CSSProperties = {
  background: "#fff",
  padding: 24,
  borderRadius: 12,
  width: 420,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};
