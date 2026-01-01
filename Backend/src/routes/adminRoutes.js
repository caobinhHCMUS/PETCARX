import express from 'express';
import { getAdminStats, getRevenueReport } from '../controllers/adminController.js';

const router = express.Router();

// Admin routes
router.get('/stats', getAdminStats);
router.get('/revenue', getRevenueReport);

export default router;
