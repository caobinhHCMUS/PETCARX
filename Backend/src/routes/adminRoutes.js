import express from 'express';
import { getRevenueByBusinessType } from '../controllers/adminController.js'; // Import controller

const router = express.Router();

// Định tuyến cho API lấy doanh thu theo loại nghiệp vụ
router.get('/revenue-by-type', getRevenueByBusinessType);

export default router;  // Xuất khẩu router dưới dạng mặc định
