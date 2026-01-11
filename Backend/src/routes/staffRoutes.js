import express from 'express';
// Khi dùng ES Modules (type: module), bạn bắt buộc phải có đuôi file .js khi import
import * as staffController from '../controllers/staffController.js';
import { verifyToken, isStaff } from '../middleware/authMiddleware.js';

const router = express.Router();

// Endpoint: PUT /api/staff/orders/:maHD
// Middleware verifyToken sẽ giải mã JWT và lưu thông tin vào req.user
router.put('/orders/:maHD',verifyToken,isStaff,staffController.updateOrderStatus);

//lấy danh sách hóa đơn chờ duyệt
router.get('/orders',verifyToken,isStaff,staffController.getPendingOrders);
router.get('/pets', verifyToken, isStaff, staffController.searchPets);
router.get('/pets', verifyToken, isStaff, staffController.searchPets);

export default router;