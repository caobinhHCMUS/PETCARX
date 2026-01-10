import { useState } from "react";
import { staffService, PetPayload } from "../../services/staff.service";

const StaffPetPage = () => {
  const [maKH, setMaKH] = useState("");
  const [pets, setPets] = useState<PetPayload[]>([]);

  const handleSearch = async () => {
    if (!maKH) return;
    const data = await staffService.getPetsByCustomer(maKH);
    setPets(data);
  };

  const handleDelete = async (maPET: string) => {
    if (!confirm("Xoá thú cưng này?")) return;
    await staffService.deletePet(maPET);
    handleSearch();
  };

  return (
    <div>
      <h2>🐾 Thú cưng của khách hàng</h2>

      <div style={{ marginBottom: 10 }}>
        <input
          placeholder="Nhập mã khách hàng"
          value={maKH}
          onChange={e => setMaKH(e.target.value)}
        />
        <button onClick={handleSearch}>🔍 Tìm</button>
      </div>

      <table border={1} cellPadding={8} width="100%">
        <thead>
          <tr>
            <th>Mã PET</th>
            <th>Tên</th>
            <th>Loài</th>
            <th>Giống</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {pets.map(p => (
            <tr key={p.Ma_PET}>
              <td>{p.Ma_PET}</td>
              <td>{p.Ten_PET}</td>
              <td>{p.Ten_Loai}</td>
              <td>{p.Giong}</td>
              <td>
                <button onClick={() => handleDelete(p.Ma_PET)}>🗑️ Xoá</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StaffPetPage;
