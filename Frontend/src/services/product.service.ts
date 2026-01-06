import { api } from "./api";

export type ProductSearchItem = {
  ma_sp: string;
  ten_sp: string;
  loai_sp: string;
  so_luong: number;
  gia: number;
};

export async function searchProducts(keyword: string): Promise<ProductSearchItem[]> {
  const k = keyword.trim();
  if (!k) return [];

  const res = await api.get<ProductSearchItem[]>("/customer/products", {
    params: { search: k },
  });

  return res.data;
}
