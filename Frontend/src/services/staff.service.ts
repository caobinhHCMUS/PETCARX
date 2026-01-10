import api from "./api";

/* ================== TYPES ================== */

export interface ProductPayload {
  Ma_SP: string;
  Ten_SP: string;
  Loai_SP: "Phụ kiện" | "Thuốc" | "Thức ăn";
  Gia: number;
  Don_Vi_Tinh?: string;
  So_Luong: number;
}

export interface PetPayload {
  Ma_PET: string;
  Ma_KH: string;
  Ten_PET: string;
  Ten_Loai: string;
  Giong?: string;
  Gioi_Tinh?: string;
  Ngay_Sinh?: string;
  Tinh_Trang_Suc_Khoe?: string;
  Mau_Sac?: string;
}

/* ================== SERVICE ================== */

export const staffService = {
  /* ================== PRODUCTS ================== */

  /** 📦 Lấy toàn bộ sản phẩm */
  getProducts: async () => {
    const res = await api.get("/staff/products");
    return res.data;
  },

  /** ➕ Thêm sản phẩm */
  createProduct: async (data: ProductPayload) => {
    const res = await api.post("/staff/products", data);
    return res.data;
  },

  /** ✏️ Cập nhật sản phẩm */
  updateProduct: async (
    maSP: string,
    data: Partial<ProductPayload>
  ) => {
    const res = await api.put(`/staff/products/${maSP}`, data);
    return res.data;
  },

  /** 🗑️ Xoá sản phẩm */
  deleteProduct: async (maSP: string) => {
    const res = await api.delete(`/staff/products/${maSP}`);
    return res.data;
  },

  /* ================== PETS ================== */

  /** 🐶 Lấy thú cưng theo khách hàng */
  getPetsByCustomer: async (maKH: string) => {
    const res = await api.get(`/staff/customers/${maKH}/pets`);
    return res.data;
  },

  /** ➕ Thêm thú cưng cho khách */
  createPet: async (data: PetPayload) => {
    const res = await api.post("/staff/pets", data);
    return res.data;
  },

  /** ✏️ Cập nhật thú cưng */
  updatePet: async (
    maPET: string,
    data: Partial<PetPayload>
  ) => {
    const res = await api.put(`/staff/pets/${maPET}`, data);
    return res.data;
  },

  /** ❌ Xoá thú cưng */
  deletePet: async (maPET: string) => {
    const res = await api.delete(`/staff/pets/${maPET}`);
    return res.data;
  },
};
