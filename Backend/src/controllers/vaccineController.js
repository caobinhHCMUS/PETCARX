import { getPool, sql } from "../config/database.js";

export const getVaccines = async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request().execute('sp_GetAllVaccines');
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        console.error("Error in getVaccines:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getVaccineById = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = getPool();
        const result = await pool.request()
            .input('Ma_Vacxin', sql.VarChar(10), id)
            .execute('sp_GetVaccineById');

        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy vaccin' });
        }
        res.json({ success: true, data: result.recordset[0] });
    } catch (error) {
        console.error("Error in getVaccineById:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createVaccine = async (req, res) => {
    try {
        const { Ma_Vacxin, Ten_Vacxin, Xuat_Xu, Gia, Mo_Ta, Benh_Phong_Ngua, Do_Tuoi_Su_Dung, Han_Su_Dung, So_Luong } = req.body;
        const pool = getPool();
        await pool.request()
            .input('Ma_Vacxin', sql.VarChar(10), Ma_Vacxin)
            .input('Ten_Vacxin', sql.NVarChar(100), Ten_Vacxin)
            .input('Xuat_Xu', sql.NVarChar(100), Xuat_Xu)
            .input('Gia', sql.Decimal(18, 2), Gia)
            .input('Mo_Ta', sql.NVarChar(sql.MAX), Mo_Ta)
            .input('Benh_Phong_Ngua', sql.NVarChar(255), Benh_Phong_Ngua)
            .input('Do_Tuoi_Su_Dung', sql.NVarChar(100), Do_Tuoi_Su_Dung)
            .input('Han_Su_Dung', sql.Date, Han_Su_Dung)
            .input('So_Luong', sql.Int, So_Luong)
            .execute('sp_CreateVaccine');

        res.status(201).json({ success: true, message: 'Thêm vaccin thành công' });
    } catch (error) {
        console.error("Error in createVaccine:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateVaccine = async (req, res) => {
    try {
        const { id } = req.params;
        const { Ten_Vacxin, Xuat_Xu, Gia, Mo_Ta, Benh_Phong_Ngua, Do_Tuoi_Su_Dung, Han_Su_Dung, So_Luong, Trang_Thai } = req.body;
        const pool = getPool();
        await pool.request()
            .input('Ma_Vacxin', sql.VarChar(10), id)
            .input('Ten_Vacxin', sql.NVarChar(100), Ten_Vacxin)
            .input('Xuat_Xu', sql.NVarChar(100), Xuat_Xu)
            .input('Gia', sql.Decimal(18, 2), Gia)
            .input('Mo_Ta', sql.NVarChar(sql.MAX), Mo_Ta)
            .input('Benh_Phong_Ngua', sql.NVarChar(255), Benh_Phong_Ngua)
            .input('Do_Tuoi_Su_Dung', sql.NVarChar(100), Do_Tuoi_Su_Dung)
            .input('Han_Su_Dung', sql.Date, Han_Su_Dung)
            .input('So_Luong', sql.Int, So_Luong)
            .input('Trang_Thai', sql.NVarChar(50), Trang_Thai)
            .execute('sp_UpdateVaccine');

        res.json({ success: true, message: 'Cập nhật vaccin thành công' });
    } catch (error) {
        console.error("Error in updateVaccine:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteVaccine = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = getPool();
        await pool.request()
            .input('Ma_Vacxin', sql.VarChar(10), id)
            .execute('sp_DeleteVaccine');

        res.json({ success: true, message: 'Xóa vaccin thành công' });
    } catch (error) {
        console.error("Error in deleteVaccine:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const searchVaccines = async (req, res) => {
    try {
        const { q } = req.query;
        const pool = getPool();
        const result = await pool.request()
            .input('keyword', sql.NVarChar(100), q)
            .execute('sp_SearchVaccines');
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        console.error("Error in searchVaccines:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getExpiredVaccines = async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request().execute('sp_GetExpiredVaccines');
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        console.error("Error in getExpiredVaccines:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { So_Luong } = req.body;
        const pool = getPool();
        await pool.request()
            .input('Ma_Vacxin', sql.VarChar(10), id)
            .input('So_Luong', sql.Int, So_Luong)
            .execute('sp_UpdateVaccineStock');

        res.json({ success: true, message: 'Cập nhật tồn kho thành công' });
    } catch (error) {
        console.error("Error in updateStock:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
