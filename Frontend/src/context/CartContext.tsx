import React, { createContext, useEffect, useState } from "react";
import {
  cartGet,
  cartUpdateQty,
  cartRemove,
  cartToggleSelect,
  cartCheckout,
} from "../services/cart.service";
import { CartItem } from "../types/cart";
import { useAuth } from "../context/AuthContext";

interface CartContextType {
  cart: CartItem[];
  reload: () => Promise<void>;
  updateQty: (ma_sp: string, so_luong: number) => Promise<void>;
  removeItem: (ma_sp: string) => Promise<void>;
  toggleSelect: (ma_sp: string, checked: boolean) => Promise<void>;
  checkoutSelected: (hinhThuc_TT?: string) => Promise<{ ma_hd: string; tong_tien?: number }>;
  subtotal: number;
  totalSelected: number;
}

export const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const ma_kh = user?.ma_kh;

  const [cart, setCart] = useState<CartItem[]>([]);

  const loadCart = async () => {
    // ✅ CHẶN khi chưa có user/ma_kh
    if (!ma_kh) {
      setCart([]);
      return;
    }

    try {
      const res = await cartGet(ma_kh);
      const items = res.data?.items ?? res.data ?? [];

      setCart(
        (items as any[]).map((it) => ({
          ...it,
          Selected: !!(it.Selected ?? it.Is_Selected),
        }))
      );
    } catch (err) {
      console.error("loadCart error:", err);
      setCart([]);
    }
  };

  // ✅ Khi ma_kh thay đổi (login/logout), tự load lại cart
  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ma_kh]);

  const updateQty = async (ma_sp: string, so_luong: number) => {
    if (!ma_kh) throw new Error("Chưa đăng nhập");

    try {
      await cartUpdateQty(ma_kh, ma_sp, Math.max(1, so_luong));
      await loadCart();
    } catch (err) {
      console.error("updateQty error:", err);
      throw err;
    }
  };

  const removeItem = async (ma_sp: string) => {
    if (!ma_kh) throw new Error("Chưa đăng nhập");

    try {
      await cartRemove(ma_kh, ma_sp);
      await loadCart();
    } catch (err) {
      console.error("removeItem error:", err);
      throw err;
    }
  };

  const toggleSelect = async (ma_sp: string, checked: boolean) => {
    if (!ma_kh) throw new Error("Chưa đăng nhập");

    try {
      await cartToggleSelect(ma_kh, ma_sp, checked);
      await loadCart();
    } catch (err) {
      console.error("toggleSelect error:", err);
      throw err;
    }
  };

  const checkoutSelected = async (hinhThuc_TT?: string) => {
    if (!ma_kh) throw new Error("Chưa đăng nhập");

    try {
      const res = await cartCheckout(ma_kh, hinhThuc_TT);

      if (res.data?.success === false) {
        throw new Error(res.data?.message || "Thanh toán thất bại");
      }
      if (res.data?.Status && res.data.Status !== "Success") {
        throw new Error(res.data?.Message || "Thanh toán thất bại");
      }

      const ma_hd = res.data?.ma_hd ?? res.data?.Ma_HD;
      const tong_tien = res.data?.tong_tien ?? res.data?.Tong_Tien;

      if (!ma_hd) {
        throw new Error("Không nhận được mã hóa đơn từ backend");
      }

      await loadCart();
      return { ma_hd, tong_tien };
    } catch (err: any) {
      console.error("checkoutSelected error:", err);
      throw err;
    }
  };

  const subtotal = cart.reduce((sum, i) => sum + i.Gia * i.So_Luong, 0);

  const totalSelected = cart
    .filter((i) => !!(i as any).Selected)
    .reduce((sum, i) => sum + i.Gia * i.So_Luong, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        reload: loadCart,
        updateQty,
        removeItem,
        toggleSelect,
        checkoutSelected,
        subtotal,
        totalSelected,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
