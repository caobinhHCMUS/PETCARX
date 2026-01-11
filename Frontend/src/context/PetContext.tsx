import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Pet, PetForm } from "../types/pet";
import { useAuth } from "./AuthContext";
import { getMyPets, createPet, updatePet, deletePet } from "../services/customer.service";

// ===== Types =====
type PetContextType = {
  pets: Pet[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  addPet: (data: PetForm) => Promise<void>;
  editPet: (ma_tc: string, data: PetForm) => Promise<void>;
  removePet: (ma_tc: string) => Promise<void>;
};

const PetContext = createContext<PetContextType | null>(null);

// ===== Helpers =====

// Backend trả về: Ma_PET, Ten_PET, Ten_Loai, Giong, Gioi_Tinh, ...
// Frontend dùng: ma_tc, ten_tc, loai, giong, gioi_tinh, tuoi, can_nang ...
function mapFromBackendToFrontend(p: any): Pet {
  return {
    ma_tc: p?.Ma_PET ?? p?.ma_pet ?? p?.ma_tc,
    ten_tc: p?.Ten_PET ?? p?.ten_pet ?? p?.ten_tc,
    loai: p?.Ten_Loai ?? p?.ten_loai ?? p?.loai,
    giong: p?.Giong ?? p?.giong,
    gioi_tinh: p?.Gioi_Tinh ?? p?.gioi_tinh,
    tinh_trang_suc_khoe:p?.Tinh_Trang_Suc_Khoe ?? p?.tinh_trang_suc_khoe ?? "Tốt",
    mau_sac: p?.Mau_Sac ?? p?.mau_sac,
  };
}

// Frontend gửi PetForm: ten_tc, loai, giong, gioi_tinh...
// Backend controller đang đọc: Ten_PET, Ten_Loai, Giong, Gioi_Tinh...
function mapFromFrontendToBackendPayload(form: PetForm) {
  return {
    Ten_PET: form.ten_tc,
    Ten_Loai: form.loai,
    Giong: form.giong ?? null,
    Gioi_Tinh: form.gioi_tinh ?? null,

    // Chưa có UI nhập ngày sinh / sức khoẻ / màu sắc -> gửi null
    Ngay_Sinh: null,
    Tinh_Trang_Suc_Khoe: null,
    Mau_Sac: null,
  };
}

export function PetProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  // ✅ setPets được khai báo ở đây => hết lỗi "setPets is not defined"
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPets = async () => {
    if (!isAuthenticated) {
      setPets([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await getMyPets();

      // Backend đang trả: { ma_kh, items: [...] }
      const raw = res.data?.items ?? res.data ?? [];
      const items = Array.isArray(raw) ? raw : [];

      // ✅ map để PetsPage đọc được p.ten_tc, p.loai...
      const mapped = items.map(mapFromBackendToFrontend);
      setPets(mapped);
    } catch (e: any) {
      setPets([]);
      setError(e?.response?.data?.message || e?.message || "Không tải được danh sách thú cưng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const addPet = async (data: PetForm) => {
    if (!isAuthenticated) throw new Error("Chưa đăng nhập");
    setError(null);

    // ✅ map body đúng key backend
    const payload = mapFromFrontendToBackendPayload(data);
    await createPet(payload as any);

    await loadPets();
  };

  const editPet = async (ma_tc: string, data: PetForm) => {
    if (!isAuthenticated) throw new Error("Chưa đăng nhập");
    setError(null);

    const payload = mapFromFrontendToBackendPayload(data);
    await updatePet(ma_tc, payload as any);

    await loadPets();
  };

  const removePet = async (ma_tc: string) => {
    if (!isAuthenticated) throw new Error("Chưa đăng nhập");
    setError(null);

    await deletePet(ma_tc);
    await loadPets();
  };

  const value = useMemo(
    () => ({
      pets,
      loading,
      error,
      reload: loadPets,
      addPet,
      editPet,
      removePet,
    }),
    [pets, loading, error]
  );

  return <PetContext.Provider value={value}>{children}</PetContext.Provider>;
}

export function usePets() {
  const ctx = useContext(PetContext);
  if (!ctx) throw new Error("usePets must be used inside PetProvider");
  return ctx;
}
