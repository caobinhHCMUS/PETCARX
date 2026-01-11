export type Order = {
  Ma_HD: string;         // Khớp với Ma_HD varchar(10)
  Ho_Ten: string;         // Khớp với Ma_KH
  Ngay_Lap: string;
  HinhThuc_TT: string;
  Tong_Tien: number;     // Khớp với Tong_Tien decimal
  Trang_Thai: 'Hoàn thành' | 'Đang xử lý' | 'Đã hủy';
  Loai_Nghiep_Vu: string; // Khớp với Loai_Nghiep_Vu
};