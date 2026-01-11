export type PetGender = "Đực" | "Cái" | "Khác" | string;

export interface Pet {
  ma_tc: string;
  ten_tc: string;
  loai: string;
  giong?: string;
  tuoi?: number;
  gioi_tinh?: PetGender;
  can_nang?: number;
  tinh_trang_suc_khoe?:string;
  mau_sac?:string;
}

// Form UI (cho phép rỗng/undefined hợp lý)
export type PetForm = {
  ten_tc: string;
  loai: string;
  giong?: string;
  tuoi?: number;
  gioi_tinh?: PetGender;
  can_nang?: number;
};

export type CreatePetDto = PetForm;
export type UpdatePetDto = Partial<CreatePetDto>;
