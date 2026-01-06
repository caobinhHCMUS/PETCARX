import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import * as doctorController from "../controllers/doctorController.js";
import { issuePrescription } from "../controllers/doctorController.js";
const router = express.Router();
router.use(requireAuth);

router.get("/pets", doctorController.searchPets);                    // ?keyword=
router.get("/pets/:ma_pet/exams", doctorController.getPetExamHistory);
router.get("/medicines", doctorController.searchMedicines);          // ?keyword=
router.get('/:ma_bs/exam-history', doctorController.getDoctorExamHistory);
router.post("/exams", doctorController.createExam);                  // tạo bệnh án (Ma_HD)
router.post("/prescriptions/issue", issuePrescription);

router.get("/test", (req, res) => {
  res.json({ ok: true });
});
export default router;
