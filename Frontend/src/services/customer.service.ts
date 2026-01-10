import api from "./api";

/* ================== TYPES ================== */

export interface PetPayload {
  Ma_PET: string;
  Ten_PET: string;
  Ten_Loai: string;
  Giong?: string;
  Gioi_Tinh?: string;
  Ngay_Sinh?: string;
  Tinh_Trang_Suc_Khoe?: string;
  Mau_Sac?: string;
}

/* ================== SERVICE ================== */

export const customerService = {
  /* ================== PRODUCTS ================== */

  /** 📦 Lấy toàn bộ sản phẩm (chỉ xem) */
  getProducts: async () => {
    const res = await api.get("/customer/products");
    return res.data;
  },

  /** 🔍 Tìm kiếm sản phẩm */
  searchProducts: async (search: string) => {
    const res = await api.get("/customer/products/search", {
      params: { search },
    });
    return res.data;
  },

  /* ================== PETS (CỦA TÔI) ================== */

  /** 🐾 Lấy thú cưng của tôi (Ma_KH lấy từ JWT) */
  getMyPets: async () => {
    const res = await api.get("/customer/pets");
    return res.data;
  },

  /** ➕ Thêm thú cưng */
  createPet: async (data: PetPayload) => {
    const res = await api.post("/customer/pets", data);
    return res.data;
  },

  /** ✏️ Cập nhật thú cưng */
  updatePet: async (maPET: string, data: Partial<PetPayload>) => {
    const res = await api.put(`/customer/pets/${maPET}`, data);
    return res.data;
  },

  /** ❌ Xoá thú cưng */
  deletePet: async (maPET: string) => {
    const res = await api.delete(`/customer/pets/${maPET}`);
    return res.data;
  },
};
