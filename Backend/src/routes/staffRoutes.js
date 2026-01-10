import express from "express";
import { requireAuth, allowRoles } from "../middleware/authMiddleware.js";
import * as Staff from "../controllers/staffController.js";

const router = express.Router();

router.use(requireAuth);

/* ===== PRODUCTS ===== */
router.get(
  "/products",
  allowRoles(["Nhân viên", "Quản lý"]),
  Staff.getProducts
);
router.get(
  "/products/search",
  allowRoles(["Nhân viên", "Quản lý"]),
  Staff.searchProducts
);
router.post("/products", allowRoles(["Quản lý"]), Staff.createProduct);
router.put("/products/:ma_sp", allowRoles(["Quản lý"]), Staff.updateProduct);
router.delete("/products/:ma_sp", allowRoles(["Quản lý"]), Staff.deleteProduct);

/* ===== PETS ===== */
router.get(
  "/customers/:ma_kh/pets",
  allowRoles(["Nhân viên", "Quản lý"]),
  Staff.getPetsByCustomer
);

router.post("/pets", allowRoles(["Nhân viên", "Quản lý"]), Staff.createPet);
router.put(
  "/pets/:ma_pet",
  allowRoles(["Nhân viên", "Quản lý"]),
  Staff.updatePet
);
router.delete(
  "/pets/:ma_pet",
  allowRoles(["Nhân viên", "Quản lý"]),
  Staff.deletePet
);

export default router;
