import express from "express";
import {
  searchProducts,
  getPets,
  addThuCung,
  updateThuCung,
  deleteThuCung,
} from "../controllers/customerController.js";


import { requireAuth, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);
/**
 * 🔍 Customer tìm sản phẩm
 * GET /api/customer/products?search=...
 */
router.get("/products", allowRoles(["Khách hàng"]), searchProducts);

/**
 * 🐶 Lấy danh sách thú cưng của khách
 * GET /api/customer/pets
 */
router.get("/pets", allowRoles(["Khách hàng"]), getPets);

/**
 * ➕ Thêm thú cưng
 * POST /api/customer/pets
 */
router.post("/pets", allowRoles(["Khách hàng"]), addThuCung);

/**
 * ✏️ Cập nhật thú cưng
 * PUT /api/customer/pets
 */
router.put("/pets", allowRoles(["Khách hàng"]), updateThuCung);

/**
 * ❌ Xoá thú cưng
 * DELETE /api/customer/pets/:ma_pet
 */
router.delete("/pets/:ma_pet", allowRoles(["Khách hàng"]), deleteThuCung);

export default router;
