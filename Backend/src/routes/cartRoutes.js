import { Router } from "express";
import * as cartController from "../controllers/cartController.js";

const router = Router();

router.post("/add", cartController.addToCart);
router.get("/:ma_kh", cartController.getCart);
router.post("/update-qty", cartController.updateQty);
router.post("/remove", cartController.removeItem);
router.post("/select", cartController.toggleSelect);
router.post("/checkout", cartController.checkoutSelected);

export default router;
