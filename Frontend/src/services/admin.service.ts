import api from "./api";

/* ================== TYPES ================== */

export interface StaffPayload {
  Ma_NV: string;
  Ho_Ten: string;
  Ngay_Sinh?: string;
  Gioi_Tinh?: string;
  Vai_Tro: string;
  Ngay_Vao?: string;
  Luong_CB?: number;
  Ma_CN?: string;
}

export interface AccountPayload {
  Ten_DangNhap: string;
  Mat_Khau: string;
  Ma_NV: string;
  Ma_KH: string;
  Ma_BS: string;
  Vai_Tro: string;
}

export interface ProductPayload {
  Ma_SP: string;
  Ten_SP: string;
  Loai_SP: "Phụ kiện" | "Thuốc" | "Thức ăn";
  Gia: number;
  Don_Vi_Tinh?: string;
  So_Luong: number;
}
/* ================== SERVICE ================== */

export const adminService = {
  /* ===== STAFF ===== */

  getStaffs: async () => {
    const res = await api.get("/admin/staffs");
    return res.data;
  },

  createStaff: async (data: StaffPayload) => {
    const res = await api.post("/admin/staffs", data);
    return res.data;
  },

  updateStaff: async (maNV: string, data: Partial<StaffPayload>) => {
    const res = await api.put(`/admin/staffs/${maNV}`, data);
    return res.data;
  },

  deleteStaff: async (maNV: string) => {
    const res = await api.delete(`/admin/staffs/${maNV}`);
    return res.data;
  },

  /* ===== ACCOUNTS ===== */

  getAccounts: async () => {
    const res = await api.get("/admin/accounts");
    console.log(res.data);
    return res.data;
  },

  createAccount: async (data: AccountPayload) => {
    const res = await api.post("/admin/accounts", data);
    return res.data;
  },

  deleteAccount: async (username: string) => {
    const res = await api.delete(`/admin/accounts/${username}`);
    return res.data;
  },

  /* ===== PRODUCTS ===== */
  getProducts: async () => {
    const res = await api.get("/admin/products");
    return res.data;
  },

  createProduct: async (data: ProductPayload) => {
    const res = await api.post("/admin/products", data);
    return res.data;
  },

  /** ✏️ Cập nhật sản phẩm */
  updateProduct: async (maSP: string, data: Partial<ProductPayload>) => {
    const res = await api.put(`/admin/products/${maSP}`, data);
    return res.data;
  },

  /** 🗑️ Xoá sản phẩm */
  deleteProduct: async (maSP: string) => {
    const res = await api.delete(`/admin/products/${maSP}`);
    return res.data;
  },

  /* ===== STATISTICS ===== */

  getRevenueStatistics: async (params?: {
    tu_ngay: string;
    den_ngay: string;
    ma_cn?: string;
    loai_dv?: string;
  }) => {
    const res = await api.get("/admin/statistics", { params });
    return res.data;
  },

  fetchDoctorStats: async (params?: {
    TuNgay: string;
    DenNgay: string;
    Ma_CN?: string;
    Ma_BS?: string;
  }) => {
    const res = await api.get("/admin/doctor-statistic", { params });
    console.log("res:", res.data);
    return res.data;
  },
};

// services/admin.service.ts
export interface DoctorStatistic {
  Ma_BacSi: string;
  Ten_BacSi: string;
  Ma_CN: string;
  Tong_Luot: number;
  Tong_Doanh_Thu: number;
}



export interface PagingResponse<T> {
  data: T[];
  totalRecords: number;
}

export const DoctorStatisticService = {

  /** 📋 Danh sách phân trang */
  getPaging: async (params: {
    tuNgay: string;
    denNgay: string;
    maCN?: string;
    page: number;
    pageSize: number;
  }): Promise<{ data: DoctorStatistic[]; total: number }> => {

    const res = await api.get("admin/doctor-statistic/paging", {
      params: {
        tuNgay: params.tuNgay,
        denNgay: params.denNgay,
        Ma_CN: params.maCN,
        page: params.page,
        pageSize: params.pageSize
      }
    });

    console.log("Paging API:", res.data);

    return {
      data: res.data.data || [],
      total: res.data.total || 0
    };
  },

  /** 📊 Chart TOP 10 */
  getTop10: async (params: {
    tuNgay: string;
    denNgay: string;
    maCN?: string;
  }): Promise<DoctorStatistic[]> => {

    const res = await api.get("admin/doctor-statistic/top10", {
      params: {
        tuNgay: params.tuNgay,
        denNgay: params.denNgay, // ✅ FIX QUAN TRỌNG
        Ma_CN: params.maCN
      }
    });

    console.log("Top10 API:", res.data);

    return res.data.data || [];
  }
};
