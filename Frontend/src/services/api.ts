import axios from "axios";
import { Product, Vaccine, VaccinePackage, PackageVaccine, ApiResponse } from "../types";

export const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Gắn token tự động cho request cần auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Products API
export const getProducts = () => api.get<ApiResponse<Product[]>>("/products");
export const getProductById = (id: string) => api.get<ApiResponse<Product>>(`/products/${id}`);
export const createProduct = (data: Partial<Product>) => api.post<ApiResponse<any>>("/products", data);
export const updateProduct = (id: string, data: Partial<Product>) => api.put<ApiResponse<any>>(`/products/${id}`, data);
export const deleteProduct = (id: string) => api.delete<ApiResponse<any>>(`/products/${id}`);
export const searchProducts = (query: string) => api.get<ApiResponse<Product[]>>(`/products/search?q=${query}`);
export const updateProductStock = (id: string, So_Luong: number) => api.patch<ApiResponse<any>>(`/products/${id}/stock`, { So_Luong });

// Vaccines API
export const getVaccines = () => api.get<ApiResponse<Vaccine[]>>("/vaccines");
export const getVaccineById = (id: string) => api.get<ApiResponse<Vaccine>>(`/vaccines/${id}`);
export const createVaccine = (data: Partial<Vaccine>) => api.post<ApiResponse<any>>("/vaccines", data);
export const updateVaccine = (id: string, data: Partial<Vaccine>) => api.put<ApiResponse<any>>(`/vaccines/${id}`, data);
export const deleteVaccine = (id: string) => api.delete<ApiResponse<any>>(`/vaccines/${id}`);
export const searchVaccines = (query: string) => api.get<ApiResponse<Vaccine[]>>(`/vaccines/search?q=${query}`);
export const getExpiredVaccines = () => api.get<ApiResponse<Vaccine[]>>("/vaccines/expired");

// Packages API
export const getPackages = () => api.get<ApiResponse<VaccinePackage[]>>("/packages");
export const getPackageById = (id: string) => api.get<ApiResponse<VaccinePackage>>(`/packages/${id}`);
export const createPackage = (data: Partial<VaccinePackage>) => api.post<ApiResponse<any>>("/packages", data);
export const updatePackage = (id: string, data: Partial<VaccinePackage>) => api.put<ApiResponse<any>>(`/packages/${id}`, data);
export const deletePackage = (id: string) => api.delete<ApiResponse<any>>(`/packages/${id}`);

// Package Vaccines management
export const getPackageVaccines = (packageId: string) => api.get<ApiResponse<PackageVaccine[]>>(`/packages/${packageId}/vaccines`);
export const addVaccineToPackage = (packageId: string, data: { Ma_Vacxin: string, SoMuiTiem: number }) =>
  api.post<ApiResponse<any>>(`/packages/${packageId}/vaccines`, data);
export const removeVaccineFromPackage = (packageId: string, vaccineId: string) =>
  api.delete<ApiResponse<any>>(`/packages/${packageId}/vaccines/${vaccineId}`);
export const updateVaccineInPackage = (packageId: string, vaccineId: string, SoMuiTiem: number) =>
  api.put<ApiResponse<any>>(`/packages/${packageId}/vaccines/${vaccineId}`, { SoMuiTiem });

export default api;
