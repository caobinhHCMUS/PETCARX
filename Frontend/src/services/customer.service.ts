import { api } from "./api";

// Tạo một instance axios với đường dẫn gốc trỏ thẳng về Backend


export const getDoctors = () =>
  api.get("/customer/doctors");

export const getPets = () =>
  api.get("/customer/pets");

export const bookAppointment = (data: {
  maPet: string;
  maBS: string;
  caLamViec: number;
  ngayDat: string;
}) =>
  api.post("/customer/appointments", data);