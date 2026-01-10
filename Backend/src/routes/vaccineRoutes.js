import express from 'express';
import {
    getVaccines,
    getVaccineById,
    createVaccine,
    updateVaccine,
    deleteVaccine,
    searchVaccines,
    getExpiredVaccines,
    updateStock
} from '../controllers/vaccineController.js';
import { vaccineValidation } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getVaccines);
router.get('/search', searchVaccines);
router.get('/expired', getExpiredVaccines);
router.get('/:id', getVaccineById);
router.post('/', vaccineValidation, createVaccine);
router.put('/:id', vaccineValidation, updateVaccine);
router.delete('/:id', deleteVaccine);
router.patch('/:id/stock', updateStock);

export default router;
