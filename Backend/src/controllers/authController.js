import { sql, getPool } from '../config/database.js';

// Login
export async function login(req, res, next) {
    try {
        const { username, password } = req.body;
        const pool = getPool();

        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .input('password', sql.VarChar, password)
            .query(`
                SELECT tk.Ten_DangNhap, tk.Ma_KH, tk.Ma_NV, tk.Vai_Tro,
                       COALESCE(kh.Ho_Ten, nv.Ho_Ten) as Ho_Ten
                FROM TAI_KHOAN tk
                LEFT JOIN KHACH_HANG kh ON tk.Ma_KH = kh.Ma_KH
                LEFT JOIN NHAN_VIEN nv ON tk.Ma_NV = nv.Ma_NV
                WHERE tk.Ten_DangNhap = @username AND tk.Mat_Khau = @password
            `);

        if (result.recordset.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const user = result.recordset[0];
        res.json({
            success: true,
            data: {
                id: user.Ma_KH || user.Ma_NV,
                name: user.Ho_Ten,
                role: user.Vai_Tro,
                avatar: 'https://github.com/shadcn.png',
            }
        });
    } catch (err) {
        next(err);
    }
}

// Signup (Customer registration)
export async function signup(req, res, next) {
    try {
        const { name, email, phone, cccd, gender, birthDate, password } = req.body;
        const pool = getPool();

        // 1. Generate new Ma_KH
        const countResult = await pool.request().query('SELECT COUNT(*) as count FROM KHACH_HANG');
        const nextNum = countResult.recordset[0].count + 1;
        const maKH = 'KH' + nextNum.toString().padStart(6, '0');

        // 2. Create Transaction
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // 3. Insert KHACH_HANG
            await transaction.request()
                .input('Ma_KH', sql.VarChar, maKH)
                .input('CCCD', sql.VarChar, cccd)
                .input('Ho_Ten', sql.NVarChar, name)
                .input('Email', sql.VarChar, email)
                .input('SDT', sql.VarChar, phone)
                .input('Gioi_Tinh', sql.NVarChar, gender)
                .input('Ngay_Sinh', sql.Date, new Date(birthDate))
                .query(`
                    INSERT INTO KHACH_HANG (Ma_KH, CCCD, Ho_Ten, Email, SDT, Gioi_Tinh, Ngay_Sinh, Tong_Chi_Tieu, Cap_Do_Hoi_Vien)
                    VALUES (@Ma_KH, @CCCD, @Ho_Ten, @Email, @SDT, @Gioi_Tinh, @Ngay_Sinh, 0, N'Cơ bản')
                `);

            // 4. Insert TAI_KHOAN
            await transaction.request()
                .input('Ten_DangNhap', sql.VarChar, email) // Using email as username
                .input('Mat_Khau', sql.VarChar, password)
                .input('Ma_KH', sql.VarChar, maKH)
                .input('Vai_Tro', sql.NVarChar, 'customer')
                .query(`
                    INSERT INTO TAI_KHOAN (Ten_DangNhap, Mat_Khau, Ma_KH, Vai_Tro)
                    VALUES (@Ten_DangNhap, @Mat_Khau, @Ma_KH, @Vai_Tro)
                `);

            await transaction.commit();

            res.status(201).json({
                success: true,
                data: {
                    id: maKH,
                    name: name,
                    role: 'customer',
                    avatar: 'https://github.com/shadcn.png',
                }
            });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        next(err);
    }
}
