import { api } from "./api";
import type { CreatePetDto, UpdatePetDto } from "../types/pet";

const PETS_BASE = "customer/pets";
const BOOKING_BASE = "customer/bookings";

export const getMyPets = () => api.get(PETS_BASE);

export const createPet = (data: CreatePetDto) => api.post(PETS_BASE, data);

export const updatePet = (ma_tc: string, data: UpdatePetDto) =>
  api.put(`${PETS_BASE}/${ma_tc}`, data);

export const deletePet = (ma_tc: string) => api.delete(`${PETS_BASE}/${ma_tc}`);

export const getAvailableDoctors = (ngay: string, ca: number) => 
  api.get(`customer/available-doctors`, { params: { ngay, ca } });

// Gửi phiếu đặt lịch: api/customer/bookings
export const createBooking = (data: { 
  Ma_PET: string; 
  Ma_BS: string; 
  Ca_lamviec: number; 
  Ngay_Dat: string 
}) => api.post(BOOKING_BASE, data);
// nếu giữ getMyOrders thì cũng nên đồng bộ return kiểu:
export const getMyOrders = () => api.get("/customer/orders/history");
