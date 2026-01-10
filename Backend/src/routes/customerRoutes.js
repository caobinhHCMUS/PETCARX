import express from "express";
import {
  searchProducts,
  getDoctors,
  getPets,
  bookAppointment
} from "../controllers/customerController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
const router = express.Router();
router.use(requireAuth);
router.get("/products", searchProducts);
router.get("/doctors", getDoctors);
router.get("/pets", getPets);
router.post("/appointments", bookAppointment);

export default router;
