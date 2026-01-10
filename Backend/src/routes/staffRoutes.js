import express from "express";
import { getInvoiceInfo, addExamDetail } from "../controllers/staffController.js";
import { requireAuth } from "../middleware/authMiddleware.js";// Giả sử bạn có auth middleware

const router = express.Router();

// Middleware xác thực (nếu cần bảo vệ route)
router.use(requireAuth); 

router.get("/invoices/:id", getInvoiceInfo);
router.post("/exam-details", addExamDetail);

export default router;