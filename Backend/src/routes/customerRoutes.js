import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { searchProducts, getMyOrderHistory, getMyPets, createMyPet,updateMyPet, deleteMyPet, getAvailableDoctors, 
  createBooking } from "../controllers/customerController.js";
const router = express.Router();

// ✅ /api/customer/products?search=hat
router.get("/products", searchProducts);
router.get("/orders/history", requireAuth, getMyOrderHistory);
router.get("/pets", requireAuth, getMyPets);
router.post("/pets", requireAuth, createMyPet);
router.put("/pets/:ma_pet", requireAuth, updateMyPet);
router.delete("/pets/:ma_pet", requireAuth, deleteMyPet);
router.get("/bookings/doctors", requireAuth, getAvailableDoctors);
router.post("/bookings", requireAuth, createBooking);
export default router;
