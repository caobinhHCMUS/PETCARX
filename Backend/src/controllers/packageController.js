import { getPool, sql } from "../config/database.js";

export const getPackages = async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request().execute('sp_GetAllPackages');
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        console.error("Error in getPackages:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getPackageById = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = getPool();
        const result = await pool.request()
            .input('Ma_GT', sql.VarChar(10), id)
            .execute('sp_GetPackageById');

        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy gói tiêm' });
        }
        res.json({ success: true, data: result.recordset[0] });
    } catch (error) {
        console.error("Error in getPackageById:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createPackage = async (req, res) => {
    try {
        const { Ma_GT, Ten_GT, Thoi_Gian, Thoi_Gian_Thang, Gia, Mo_Ta, Do_Tuoi_Ap_Dung, Loai_Thu_Cung } = req.body;
        const pool = getPool();
        await pool.request()
            .input('Ma_GT', sql.VarChar(10), Ma_GT)
            .input('Ten_GT', sql.NVarChar(100), Ten_GT)
            .input('Thoi_Gian', sql.NVarChar(20), Thoi_Gian)
            .input('Thoi_Gian_Thang', sql.Int, Thoi_Gian_Thang)
            .input('Gia', sql.Decimal(18, 2), Gia)
            .input('Mo_Ta', sql.NVarChar(sql.MAX), Mo_Ta)
            .input('Do_Tuoi_Ap_Dung', sql.NVarChar(100), Do_Tuoi_Ap_Dung)
            .input('Loai_Thu_Cung', sql.NVarChar(50), Loai_Thu_Cung)
            .execute('sp_CreatePackage');

        res.status(201).json({ success: true, message: 'Thêm gói tiêm thành công' });
    } catch (error) {
        console.error("Error in createPackage:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updatePackage = async (req, res) => {
    try {
        const { id } = req.params;
        const { Ten_GT, Thoi_Gian, Thoi_Gian_Thang, Gia, Mo_Ta, Do_Tuoi_Ap_Dung, Loai_Thu_Cung, Trang_Thai } = req.body;
        const pool = getPool();
        await pool.request()
            .input('Ma_GT', sql.VarChar(10), id)
            .input('Ten_GT', sql.NVarChar(100), Ten_GT)
            .input('Thoi_Gian', sql.NVarChar(20), Thoi_Gian)
            .input('Thoi_Gian_Thang', sql.Int, Thoi_Gian_Thang)
            .input('Gia', sql.Decimal(18, 2), Gia)
            .input('Mo_Ta', sql.NVarChar(sql.MAX), Mo_Ta)
            .input('Do_Tuoi_Ap_Dung', sql.NVarChar(100), Do_Tuoi_Ap_Dung)
            .input('Loai_Thu_Cung', sql.NVarChar(50), Loai_Thu_Cung)
            .input('Trang_Thai', sql.NVarChar(50), Trang_Thai)
            .execute('sp_UpdatePackage');

        res.json({ success: true, message: 'Cập nhật gói tiêm thành công' });
    } catch (error) {
        console.error("Error in updatePackage:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deletePackage = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = getPool();
        await pool.request()
            .input('Ma_GT', sql.VarChar(10), id)
            .execute('sp_DeletePackage');

        res.json({ success: true, message: 'Xóa gói tiêm thành công' });
    } catch (error) {
        console.error("Error in deletePackage:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getPackageVaccines = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = getPool();
        const result = await pool.request()
            .input('Ma_GT', sql.VarChar(10), id)
            .execute('sp_GetPackageVaccines');
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        console.error("Error in getPackageVaccines:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const addVaccineToPackage = async (req, res) => {
    try {
        const { id } = req.params;
        const { Ma_Vacxin, SoMuiTiem } = req.body;
        const pool = getPool();
        await pool.request()
            .input('Ma_GT', sql.VarChar(10), id)
            .input('Ma_Vacxin', sql.VarChar(10), Ma_Vacxin)
            .input('SoMuiTiem', sql.Int, SoMuiTiem)
            .execute('sp_AddVaccineToPackage');

        res.json({ success: true, message: 'Thêm vaccin vào gói thành công' });
    } catch (error) {
        console.error("Error in addVaccineToPackage:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const removeVaccineFromPackage = async (req, res) => {
    try {
        const { id, vaccineId } = req.params;
        const pool = getPool();
        await pool.request()
            .input('Ma_GT', sql.VarChar(10), id)
            .input('Ma_Vacxin', sql.VarChar(10), vaccineId)
            .execute('sp_RemoveVaccineFromPackage');

        res.json({ success: true, message: 'Xóa vaccin khỏi gói thành công' });
    } catch (error) {
        console.error("Error in removeVaccineFromPackage:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateVaccineInPackage = async (req, res) => {
    try {
        const { id, vaccineId } = req.params;
        const { SoMuiTiem } = req.body;
        const pool = getPool();
        await pool.request()
            .input('Ma_GT', sql.VarChar(10), id)
            .input('Ma_Vacxin', sql.VarChar(10), vaccineId)
            .input('SoMuiTiem', sql.Int, SoMuiTiem)
            .execute('sp_UpdateVaccineInPackage');

        res.json({ success: true, message: 'Cập nhật số mũi tiêm thành công' });
    } catch (error) {
        console.error("Error in updateVaccineInPackage:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
