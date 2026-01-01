USE [PetCareX];
GO

-- 1. Reset accounts for testing if they exist to ensure consistent state
DELETE FROM TAI_KHOAN WHERE Ten_DangNhap IN ('admin@petcarex.com', 'doctor@petcarex.com', 'customer1@example.com', 'customer2@example.com');

-- 2. Ensure Doctors exist (using real IDs from database)
PRINT 'Ensuring Doctor accounts exist...';
-- Use BS001 which we know exists from previous step
IF EXISTS (SELECT * FROM NHAN_VIEN WHERE Ma_NV = 'BS001')
BEGIN
    INSERT INTO TAI_KHOAN (Ten_DangNhap, Mat_Khau, Ma_NV, Vai_Tro)
    VALUES ('doctor@petcarex.com', 'doctor123', 'BS001', 'doctor');
END

-- 3. Ensure Customer accounts exist (using real IDs from the 70,000 generated rows)
PRINT 'Ensuring Customer accounts exist...';
-- We use KH000001 and KH000002 which were generated in the 70k batch
IF EXISTS (SELECT * FROM KHACH_HANG WHERE Ma_KH = 'KH000001')
BEGIN
    INSERT INTO TAI_KHOAN (Ten_DangNhap, Mat_Khau, Ma_KH, Vai_Tro)
    VALUES ('customer1@example.com', 'customer123', 'KH000001', 'customer');
END

IF EXISTS (SELECT * FROM KHACH_HANG WHERE Ma_KH = 'KH000002')
BEGIN
    INSERT INTO TAI_KHOAN (Ten_DangNhap, Mat_Khau, Ma_KH, Vai_Tro)
    VALUES ('customer2@example.com', 'customer123', 'KH000002', 'customer');
END

-- 4. Ensure Admin account exists
IF EXISTS (SELECT * FROM NHAN_VIEN WHERE Ma_NV = 'AD001')
BEGIN
    INSERT INTO TAI_KHOAN (Ten_DangNhap, Mat_Khau, Ma_NV, Vai_Tro)
    VALUES ('admin@petcarex.com', 'admin123', 'AD001', 'admin');
END
GO

PRINT 'Real Data Sample Accounts Created Successfully!';
GO
