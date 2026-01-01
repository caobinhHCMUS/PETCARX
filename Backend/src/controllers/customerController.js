import { sql, getPool } from '../config/database.js';

// Get customer's pets
export async function getCustomerPets(req, res, next) {
    try {
        const { customerId } = req.params;
        const pool = getPool();

        const result = await pool.request()
            .input('Ma_KH', sql.VarChar, customerId)
            .query(`
        SELECT Ma_PET as id, Ten_PET as name, Ten_Loai as species, 
               Giong as breed, DATEDIFF(year, Ngay_Sinh, GETDATE()) as age, Ma_KH as ownerId
        FROM THU_CUNG WHERE Ma_KH = @Ma_KH
      `);

        res.json({ success: true, data: result.recordset });
    } catch (err) {
        next(err);
    }
}

// Get customer stats
export async function getCustomerStats(req, res, next) {
    try {
        const { customerId } = req.params;
        const pool = getPool();

        // Count pets
        const petsResult = await pool.request()
            .input('Ma_KH', sql.VarChar, customerId)
            .query('SELECT COUNT(*) as count FROM THU_CUNG WHERE Ma_KH = @Ma_KH');

        // Count upcoming appointments
        const apptsResult = await pool.request()
            .input('Ma_KH', sql.VarChar, customerId)
            .query(`
        SELECT COUNT(*) as count 
        FROM Phieu_Dat_Lich_Kham pdlk
        JOIN THU_CUNG p ON pdlk.Ma_PET = p.Ma_PET
        WHERE p.Ma_KH = @Ma_KH AND pdlk.Ngay_Dat > GETDATE()
      `);

        res.json({
            success: true,
            data: {
                totalPets: petsResult.recordset[0].count,
                upcomingAppointments: apptsResult.recordset[0].count,
                loyaltyPoints: 250, // Mock for now
            },
        });
    } catch (err) {
        next(err);
    }
}

// Get customer appointments
export async function getCustomerAppointments(req, res, next) {
    try {
        const { customerId } = req.params;
        const pool = getPool();

        const result = await pool.request()
            .input('Ma_KH', sql.VarChar, customerId)
            .query(`
        SELECT pdlk.Ma_Phieu as id, pdlk.Ma_PET as petId, p.Ten_PET as petName,
               pdlk.Ma_BS as doctorId, bs.Ho_Ten as doctorName,
               pdlk.Ngay_Dat as date, pdlk.Trang_Thai as status, pdlk.Ghi_chu as notes
        FROM Phieu_Dat_Lich_Kham pdlk
        JOIN THU_CUNG p ON pdlk.Ma_PET = p.Ma_PET
        JOIN CT_BAC_SI bs ON pdlk.Ma_BS = bs.Ma_nv
        WHERE p.Ma_KH = @Ma_KH
        ORDER BY pdlk.Ngay_Dat DESC
      `);

        res.json({ success: true, data: result.recordset });
    } catch (err) {
        next(err);
    }
}

// Create appointment (calls stored procedure)
export async function createAppointment(req, res, next) {
    try {
        const { petId, doctorId, date, notes } = req.body;
        const pool = getPool();

        // Get customer ID from pet
        const petResult = await pool.request()
            .input('Ma_PET', sql.VarChar, petId)
            .query('SELECT Ma_KH FROM THU_CUNG WHERE Ma_PET = @Ma_PET');

        if (petResult.recordset.length === 0) {
            return res.status(404).json({ success: false, error: 'Pet not found' });
        }

        const customerId = petResult.recordset[0].Ma_KH;

        // Call stored procedure
        const result = await pool.request()
            .input('Ma_KH', sql.VarChar, customerId)
            .input('Ma_PET', sql.VarChar, petId)
            .input('Ma_BS', sql.VarChar, doctorId || 'BS001')
            .input('Ca_lamviec', sql.Int, 1) // Default to morning shift
            .input('Ngay_Dat', sql.DateTime, new Date(date))
            .execute('sp_DatLichKham');

        if (result.recordset[0].Status === 'Success') {
            res.status(201).json({ success: true, data: result.recordset[0] });
        } else {
            res.status(400).json({ success: false, error: result.recordset[0].Message });
        }
    } catch (err) {
        next(err);
    }
}

// Get pet medical history (calls stored procedure)
export async function getPetHistory(req, res, next) {
    try {
        const { petId } = req.params;
        const pool = getPool();

        // Get customer ID from pet
        const petResult = await pool.request()
            .input('Ma_PET', sql.VarChar, petId)
            .query('SELECT Ma_KH FROM THU_CUNG WHERE Ma_PET = @Ma_PET');

        if (petResult.recordset.length === 0) {
            return res.status(404).json({ success: false, error: 'Pet not found' });
        }

        const customerId = petResult.recordset[0].Ma_KH;

        // Call stored procedure
        const result = await pool.request()
            .input('Ma_kh', sql.VarChar, customerId)
            .execute('XemLichSuChoPet');

        // Filter results for specific pet
        const medicalRecords = result.recordsets[1] || [];
        const filtered = medicalRecords.filter(r => r.Ma_PET === petId);

        const formattedRecords = filtered.map(record => ({
            id: record.Ma_PET + '_' + record.Ngay_Lap,
            petId: record.Ma_PET,
            date: record.Ngay_Lap,
            diagnosis: record.Chuan_Doan || 'N/A',
            treatment: 'Khám bệnh bởi ' + record.ho_ten,
        }));

        res.json({ success: true, data: formattedRecords });
    } catch (err) {
        next(err);
    }
}
