import { getPool, sql } from "../config/database.js";

export const getProducts = async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request().execute('sp_GetAllProducts');
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        console.error("Error in getProducts:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = getPool();
        const result = await pool.request()
            .input('Ma_SP', sql.VarChar(10), id)
            .execute('sp_GetProductById');

        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        }
        res.json({ success: true, data: result.recordset[0] });
    } catch (error) {
        console.error("Error in getProductById:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { Ma_SP, Ten_SP, Loai_SP, Gia, Don_Vi_Tinh, So_Luong, Mo_Ta, Hinh_Anh } = req.body;
        const pool = getPool();
        await pool.request()
            .input('Ma_SP', sql.VarChar(10), Ma_SP)
            .input('Ten_SP', sql.NVarChar(100), Ten_SP)
            .input('Loai_SP', sql.NVarChar(50), Loai_SP)
            .input('Gia', sql.Decimal(18, 2), Gia)
            .input('Don_Vi_Tinh', sql.NVarChar(20), Don_Vi_Tinh)
            .input('So_Luong', sql.Int, So_Luong)
            .input('Mo_Ta', sql.NVarChar(sql.MAX), Mo_Ta)
            .input('Hinh_Anh', sql.VarChar(255), Hinh_Anh)
            .execute('sp_CreateProduct');

        res.status(201).json({ success: true, message: 'Thêm sản phẩm thành công' });
    } catch (error) {
        console.error("Error in createProduct:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { Ten_SP, Loai_SP, Gia, Don_Vi_Tinh, So_Luong, Mo_Ta, Hinh_Anh, Trang_Thai } = req.body;
        const pool = getPool();
        await pool.request()
            .input('Ma_SP', sql.VarChar(10), id)
            .input('Ten_SP', sql.NVarChar(100), Ten_SP)
            .input('Loai_SP', sql.NVarChar(50), Loai_SP)
            .input('Gia', sql.Decimal(18, 2), Gia)
            .input('Don_Vi_Tinh', sql.NVarChar(20), Don_Vi_Tinh)
            .input('So_Luong', sql.Int, So_Luong)
            .input('Mo_Ta', sql.NVarChar(sql.MAX), Mo_Ta)
            .input('Hinh_Anh', sql.VarChar(255), Hinh_Anh)
            .input('Trang_Thai', sql.NVarChar(50), Trang_Thai)
            .execute('sp_UpdateProduct');

        res.json({ success: true, message: 'Cập nhật sản phẩm thành công' });
    } catch (error) {
        console.error("Error in updateProduct:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = getPool();
        await pool.request()
            .input('Ma_SP', sql.VarChar(10), id)
            .execute('sp_DeleteProduct');

        res.json({ success: true, message: 'Xóa sản phẩm thành công' });
    } catch (error) {
        console.error("Error in deleteProduct:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const searchProducts = async (req, res) => {
    try {
        const { q } = req.query;
        const pool = getPool();
        const result = await pool.request()
            .input('Ten_SP', sql.NVarChar(100), q)
            .execute('TimKiemSanPham');
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        console.error("Error in searchProducts:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { So_Luong } = req.body;
        const pool = getPool();
        await pool.request()
            .input('Ma_SP', sql.VarChar(10), id)
            .input('So_Luong', sql.Int, So_Luong)
            .execute('sp_UpdateProductStock');

        res.json({ success: true, message: 'Cập nhật tồn kho thành công' });
    } catch (error) {
        console.error("Error in updateStock:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const pool = getPool();
        const result = await pool.request()
            .input('Loai_SP', sql.NVarChar(50), category)
            .execute('sp_GetProductsByCategory');
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        console.error("Error in getProductsByCategory:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
