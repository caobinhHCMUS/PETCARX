import express from 'express';
import {
    getDoctorStats,
    getDoctorAppointments,
    createMedicalRecord,
} from '../controllers/doctorController.js';

const router = express.Router();

// Doctor routes
router.get('/:doctorId/stats', getDoctorStats);
router.get('/:doctorId/appointments', getDoctorAppointments);
router.post('/:doctorId/medical-records', createMedicalRecord);

export default router;
