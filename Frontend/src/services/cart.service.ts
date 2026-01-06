import api from "./api";

/**
 * POST /api/cart/add
 */
export const cartAdd = (ma_kh: string, ma_sp: string, so_luong: number) => {
  return api.post("/cart/add", {
    ma_kh,
    ma_sp,
    so_luong,
  });
};

/**
 * GET /api/cart/:ma_kh
 */
export const cartGet = (ma_kh: string) => {
  return api.get(`/cart/${ma_kh}?t=${Date.now()}`);
};

/**
 * POST /api/cart/update-qty
 */
export const cartUpdateQty = (ma_kh: string, ma_sp: string, so_luong: number) => {
  return api.post("/cart/update-qty", {
    ma_kh,
    ma_sp,
    so_luong,
  });
};

/**
 * POST /api/cart/remove
 */
export const cartRemove = (ma_kh: string, ma_sp: string) => {
  return api.post("/cart/remove", {
    ma_kh,
    ma_sp,
  });
};

/**
 * POST /api/cart/select
 */
export const cartToggleSelect = (ma_kh: string, ma_sp: string, checked: boolean) => {
  return api.post("/cart/select", {
    ma_kh,
    ma_sp,
    is_selected: checked,
  });
};


/**
 * POST /api/cart/checkout
 */
export const cartCheckout = (ma_kh: string, hinhThuc_TT?: string) => {
  return api.post("/cart/checkout", {
    ma_kh,
    ...(hinhThuc_TT ? { hinhThuc_TT } : {}),
  });
};

