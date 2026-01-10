export type Role = "KhachHang" | "Bác sĩ" | "Quản lý" | "Tiếp tân" | "Bán hàng";

export interface User {
  username: string;
  role: Role;
  ma_kh: string | null;
  ma_bs: string | null;
  ma_nv: string | null;
  ten_kh?: string | null;
  ten_bs?: string | null;
  ten_nv?: string | null;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface Product {
  Ma_SP: string;
  Ten_SP: string;
  Loai_SP: 'Thức ăn' | 'Thuốc' | 'Phụ kiện';
  Gia: number;
  Don_Vi_Tinh: string;
  So_Luong: number;
  Mo_Ta?: string;
  Hinh_Anh?: string;
  Trang_Thai?: string;
  Ngay_Tao?: string;
  Ngay_Cap_Nhat?: string;
}

export interface Vaccine {
  Ma_Vacxin: string;
  Ten_Vacxin: string;
  Xuat_Xu: string;
  Gia: number;
  Mo_Ta?: string;
  Benh_Phong_Ngua?: string;
  Do_Tuoi_Su_Dung?: string;
  Han_Su_Dung?: string;
  So_Luong?: number;
  Trang_Thai?: string;
  Ngay_Tao?: string;
  Ngay_Cap_Nhat?: string;
}

export interface VaccinePackage {
  Ma_GT: string;
  Ten_GT: string;
  Thoi_Gian: string;
  Thoi_Gian_Thang?: number;
  Gia: number;
  Mo_Ta?: string;
  Do_Tuoi_Ap_Dung?: string;
  Loai_Thu_Cung?: string;
  Trang_Thai?: string;
  Ngay_Tao?: string;
  Ngay_Cap_Nhat?: string;
}

export interface PackageVaccine {
  Ma_GT: string;
  Ma_Vacxin: string;
  SoMuiTiem: number;
  Ten_Vacxin?: string;
  Vaccine_Gia?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: any[];
}