export type Role = "KhachHang" | "Bác si" | "Quản lý";

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
  ma_sp: string;
  ten_sp: string;
  loai_sp: string;
  gia: number;
  don_vi_tinh: string;
  so_luong: number;
}