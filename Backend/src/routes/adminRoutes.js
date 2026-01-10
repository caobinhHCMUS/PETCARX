import express from "express";
import { requireAuth, allowRoles } from "../middleware/authMiddleware.js";
import * as Admin from "../controllers/adminController.js";

const router = express.Router();

/* ================== STAFF ================== */

/**
 * GET: Lấy danh sách nhân viên
 * GET /api/admin/staffs
 */
router.get("/staffs", requireAuth, allowRoles(["Quản lý"]), Admin.getStaffs);

/**
 * POST: Thêm nhân viên + tạo tài khoản
 * POST /api/admin/staffs
 */
router.post(
  "/staffs",
  requireAuth,
  allowRoles(["Quản lý"]),
  Admin.addStaffWithAccount
);

/**
 * PUT: Cập nhật nhân viên
 * PUT /api/admin/staffs/:ma_nv
 */
router.put(
  "/staffs/:ma_nv",
  requireAuth,
  allowRoles(["Quản lý"]),
  Admin.updateStaff
);

/**
 * DELETE: Xoá nhân viên
 * DELETE /api/admin/staffs/:ma_nv
 */
router.delete(
  "/staffs/:ma_nv",
  requireAuth,
  allowRoles(["Quản lý"]),
  Admin.deleteStaff
);

/* ================== ACCOUNTS ================== */

/**
 * GET: Lấy danh sách tài khoản
 * GET /api/admin/accounts
 */
router.get(
  "/accounts",
  requireAuth,
  allowRoles(["Quản lý"]),
  Admin.getAccounts
);

/**
 * POST: Thêm tài khoản
 * POST /api/admin/accounts
 */
router.post(
  "/accounts",
  requireAuth,
  allowRoles(["Quản lý"]),
  Admin.addAccount
);

/**
 * DELETE: Xoá tài khoản
 * DELETE /api/admin/accounts/:username
 */
router.delete(
  "/accounts/:username",
  requireAuth,
  allowRoles(["Quản lý"]),
  Admin.deleteAccount
);

/* ================== STATISTICS ================== */

router.get(
  "/statistics",
  requireAuth,
  allowRoles(["Quản lý"]),
  Admin.thongKeDoanhThu
);

//router.get("/doctor-statistic", requireAuth, allowRoles(["Quản lý"]), Admin.getDoctorStats);

router.get(
  "/doctor-statistic/paging",
  requireAuth, allowRoles(["Quản lý"]),
  Admin.getDoctorStatistic
);

router.get(
  "/doctor-statistic/top10",
  requireAuth, allowRoles(["Quản lý"]),
  Admin.getDoctorStatisticTop10
);

export default router;
