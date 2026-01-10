import express from 'express';
import {
    getPackages,
    getPackageById,
    createPackage,
    updatePackage,
    deletePackage,
    getPackageVaccines,
    addVaccineToPackage,
    removeVaccineFromPackage,
    updateVaccineInPackage
} from '../controllers/packageController.js';
import { packageValidation } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getPackages);
router.get('/:id', getPackageById);
router.post('/', packageValidation, createPackage);
router.put('/:id', packageValidation, updatePackage);
router.delete('/:id', deletePackage);

// Package vaccines management
router.get('/:id/vaccines', getPackageVaccines);
router.post('/:id/vaccines', addVaccineToPackage);
router.delete('/:id/vaccines/:vaccineId', removeVaccineFromPackage);
router.put('/:id/vaccines/:vaccineId', updateVaccineInPackage);

export default router;
