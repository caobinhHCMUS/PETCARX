import api from "./api";
export const getStaffInvoiceInfo = async (maHD: string) => {
  const res = await api.get(`/staff/invoices/${maHD}`);
  return res.data; 
  // Trả về: { invoice, pets, doctors, details }
};

export const addStaffExamDetail = async (data: {
  maHD: string;
  maPet: string;
  bacSi: string;
  trieuChung: string;
  chuanDoan: string;
  ngayHenTaiKham: string | null;
  thanhTien: number;
}) => {
  const res = await api.post("/staff/exam-details", data);
  return res.data;
};