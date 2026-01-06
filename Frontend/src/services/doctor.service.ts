import api from "./api";

// Tìm kiếm thú cưng theo từ khóa
export const bsSearchPets = async (keyword: string) => {
  const res = await api.get("/doctor/pets", { params: { keyword } });
  return res.data as { success: boolean; items: any[]; message?: string };
};

// Lấy lịch sử khám của thú cưng theo mã thú cưng
export const bsGetPetExamHistory = async (ma_pet: string) => {
  const res = await api.get(`/doctor/pets/${ma_pet}/exams`);
  return res.data as { success: boolean; items: any[]; message?: string };
};

// Tìm kiếm thuốc theo từ khóa
export const bsSearchMedicines = async (keyword: string) => {
  try {
    console.log("[bsSearchMedicines] keyword =", keyword);

    const res = await api.get("/doctor/medicines", { params: { keyword } });

    console.log("[bsSearchMedicines] status =", res.status);
    console.log("[bsSearchMedicines] data =", res.data);

    return res.data as { success: boolean; items: any[]; message?: string };
  } catch (e: any) {
    console.log("[bsSearchMedicines] ERROR status =", e?.response?.status);
    console.log("[bsSearchMedicines] ERROR data =", e?.response?.data);
    console.log("[bsSearchMedicines] ERROR message =", e?.message);
    throw e;
  }
};

// Tạo bệnh án cho thú cưng
export const bsCreateExam = async (payload: {
  ma_pet: string;
  trieu_chung?: string | null;
  chuan_doan: string;
  ngay_hen_tai_kham?: string | null;
  thanh_tien: number;
}) => {
  const res = await api.post("/doctor/exams", {
    ma_pet: payload.ma_pet,
    trieu_chung: payload.trieu_chung ?? null,
    chuan_doan: payload.chuan_doan,
    ngay_hen_tai_kham: payload.ngay_hen_tai_kham || null,
    thanh_tien: payload.thanh_tien ?? 0,
  });
  return res.data as { success: boolean; ma_hd?: string; message?: string };
};

// Lấy lịch sử khám của bác sĩ theo mã bác sĩ
export const bsGetDoctorExamHistory = async (ma_bs: string) => {
  const res = await api.get(`/doctor/${ma_bs}/exam-history`);
  return res.data as { success: boolean; items: any[]; message?: string };
};

// Kê đơn thuốc (gọi API tạo đơn thuốc và chi tiết đơn thuốc)
export const bsIssuePrescription = async (payload: IssuePrescriptionPayload) => {
  const res = await api.post("/doctor/prescriptions/issue", payload);
  return res.data as { success: boolean; ma_hd?: string; ma_dt?: string; message?: string };
};

// Khai báo kiểu dữ liệu cho thuốc và thú cưng
export type MedicineItem = {
  ma_sp: string;
  ten_sp: string;
  // ...
};

export type PetItem = {
  ma_pet: string;
  ten_pet: string;
  ten_kh?: string;
  // ...
};

// Khai báo kiểu dữ liệu cho payload kê đơn thuốc
export type IssuePrescriptionPayload = {
  ma_pet: string;
  items: Array<{
    ma_sp: string;
    so_luong: number;
    lieu_dung?: string | null;
    tan_suat?: string | null;
    so_ngay?: number | null;
    cach_dung?: string | null;
  }>;
};


// Khai báo kiểu dữ liệu bổ sung cho Lịch sử khám (Tùy chọn để code sạch hơn)
export type DoctorExamHistoryItem = {
  Ma_HD: string;
  Ten_Pet: string;
  Trieu_Chung?: string;
  Chuan_Doan?: string;
  Ngay_Lap: string;
  Thanh_Tien: number;
};





