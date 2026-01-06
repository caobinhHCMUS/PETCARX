import express from "express";
import { searchProducts } from "../controllers/customerController.js";
console.log("✅ customerRoutes loaded");
const router = express.Router();

// ✅ /api/customer/products?search=hat
router.get("/products", searchProducts);

export default router;
