import express from 'express';
import {
    getCustomerPets,
    getCustomerStats,
    getCustomerAppointments,
    createAppointment,
    getPetHistory,
} from '../controllers/customerController.js';

const router = express.Router();

// Customer routes
router.get('/:customerId/pets', getCustomerPets);
router.get('/:customerId/stats', getCustomerStats);
router.get('/:customerId/appointments', getCustomerAppointments);
router.post('/appointments', createAppointment);
router.get('/pets/:petId/history', getPetHistory);

export default router;
