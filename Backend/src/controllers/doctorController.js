import { sql, getPool } from '../config/database.js';

// Get doctor stats
export async function getDoctorStats(req, res, next) {
    try {
        const { doctorId } = req.params;
        const pool = getPool();

        // Today's appointments
        const todayResult = await pool.request()
            .input('Ma_BS', sql.VarChar, doctorId)
            .query(`
        SELECT COUNT(*) as count
        FROM Phieu_Dat_Lich_Kham
        WHERE Ma_BS = @Ma_BS 
        AND CAST(Ngay_Dat AS DATE) = CAST(GETDATE() AS DATE)
      `);

        // Total patients (unique pets)
        const patientsResult = await pool.request()
            .input('Ma_BS', sql.VarChar, doctorId)
            .query(`
        SELECT COUNT(DISTINCT Ma_PET) as count
        FROM Phieu_Dat_Lich_Kham
        WHERE Ma_BS = @Ma_BS
      `);

        res.json({
            success: true,
            data: {
                todayAppointments: todayResult.recordset[0].count,
                totalPatients: patientsResult.recordset[0].count,
                completedToday: 0, // Mock for now
            },
        });
    } catch (err) {
        next(err);
    }
}

// Get doctor appointments
export async function getDoctorAppointments(req, res, next) {
    try {
        const { doctorId } = req.params;
        const pool = getPool();

        const result = await pool.request()
            .input('Ma_BS', sql.VarChar, doctorId)
            .query(`
        SELECT pdlk.Ma_Phieu as id, pdlk.Ma_PET as petId, p.Ten_PET as petName,
               pdlk.Ma_BS as doctorId, bs.Ho_Ten as doctorName,
               pdlk.Ngay_Dat as date, pdlk.Trang_Thai as status, pdlk.Ghi_chu as notes
        FROM Phieu_Dat_Lich_Kham pdlk
        JOIN THU_CUNG p ON pdlk.Ma_PET = p.Ma_PET
        JOIN CT_BAC_SI bs ON pdlk.Ma_BS = bs.Ma_nv
        WHERE pdlk.Ma_BS = @Ma_BS
        ORDER BY pdlk.Ngay_Dat DESC
      `);

        res.json({ success: true, data: result.recordset });
    } catch (err) {
        next(err);
    }
}

// Create medical record
export async function createMedicalRecord(req, res, next) {
    try {
        const { petId, symptoms, diagnosis, treatment, reExamDate } = req.body;
        const pool = getPool();

        // Get next invoice number
        const invoiceResult = await pool.request()
            .query('SELECT ISNULL(MAX(Ma_HD), 0) + 1 as nextId FROM HOA_DON');

        const nextInvoiceId = invoiceResult.recordset[0].nextId;

        // Get pet's customer ID
        const petResult = await pool.request()
            .input('Ma_PET', sql.VarChar, petId)
            .query('SELECT Ma_KH FROM THU_CUNG WHERE Ma_PET = @Ma_PET');

        if (petResult.recordset.length === 0) {
            return res.status(404).json({ success: false, error: 'Pet not found' });
        }

        const customerId = petResult.recordset[0].Ma_KH;

        // Create invoice first
        await pool.request()
            .input('Ma_HD', sql.Int, nextInvoiceId)
            .input('Ma_kh', sql.VarChar, customerId)
            .input('NV_lap', sql.VarChar, 'NV001') // Default employee
            .input('Hinhthuc_tt', sql.NVarChar, 'Tiền mặt')
            .input('Ngay_lap', sql.DateTime, new Date())
            .query(`
        INSERT INTO HOA_DON (Ma_HD, Ma_kh, NV_lap, Hinhthuc_tt, Ngay_lap)
        VALUES (@Ma_HD, @Ma_kh, @NV_lap, @Hinhthuc_tt, @Ngay_lap)
      `);

        // Create medical record
        await pool.request()
            .input('Ma_HD', sql.Int, nextInvoiceId)
            .input('Ma_PET', sql.VarChar, petId)
            .input('Bac_Si', sql.VarChar, req.params.doctorId || 'BS001')
            .input('Chuan_Doan', sql.NVarChar, diagnosis)
            .input('Ghi_chu', sql.NVarChar, `Triệu chứng: ${symptoms}. Điều trị: ${treatment}`)
            .query(`
        INSERT INTO CT_KHAM_BENH (Ma_HD, Ma_PET, Bac_Si, Chuan_Doan, Ghi_chu)
        VALUES (@Ma_HD, @Ma_PET, @Bac_Si, @Chuan_Doan, @Ghi_chu)
      `);

        res.status(201).json({
            success: true,
            data: { id: nextInvoiceId, message: 'Medical record created successfully' },
        });
    } catch (err) {
        next(err);
    }
}
