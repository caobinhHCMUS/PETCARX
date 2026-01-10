import { useEffect, useState } from "react";
import { customerService } from "../../services/customer.service";

interface Pet {
  Ma_PET: string;
  Ten_PET: string;
  Ten_Loai: string;
  Tinh_Trang_Suc_Khoe?: string;
}

export default function CustomerPetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [tenPet, setTenPet] = useState("");
  const [tenLoai, setTenLoai] = useState("");

  const loadPets = async () => {
    try {
      const data = await customerService.getMyPets();
      setPets(data);
    } catch (err) {
      console.error(err);
      alert("Không tải được danh sách thú cưng");
    }
  };

  useEffect(() => {
    loadPets();
  }, []);

  const handleAddPet = async () => {
    if (!tenPet || !tenLoai) {
      alert("Nhập đủ thông tin");
      return;
    }

    try {
      await customerService.createPet({
        Ma_PET: crypto.randomUUID(),
        Ten_PET: tenPet,
        Ten_Loai: tenLoai,
      });

      setTenPet("");
      setTenLoai("");
      loadPets();
    } catch (err) {
      console.error(err);
      alert("Thêm thú cưng thất bại");
    }
  };

  const handleDelete = async (maPET: string) => {
    if (!confirm("Xoá thú cưng này?")) return;

    await customerService.deletePet(maPET);
    loadPets();
  };

  return (
    <div className="page">
      <h2>🐶 Thú cưng của tôi</h2>

      <div style={{ marginBottom: 16 }}>
        <input
          placeholder="Tên thú cưng"
          value={tenPet}
          onChange={(e) => setTenPet(e.target.value)}
        />
        <input
          placeholder="Loài"
          value={tenLoai}
          onChange={(e) => setTenLoai(e.target.value)}
        />
        <button onClick={handleAddPet}>➕ Thêm</button>
      </div>

      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>Mã</th>
            <th>Tên</th>
            <th>Loài</th>
            <th>Sức khoẻ</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {pets.map((pet) => (
            <tr key={pet.Ma_PET}>
              <td>{pet.Ma_PET}</td>
              <td>{pet.Ten_PET}</td>
              <td>{pet.Ten_Loai}</td>
              <td>{pet.Tinh_Trang_Suc_Khoe || "-"}</td>
              <td>
                <button onClick={() => handleDelete(pet.Ma_PET)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
