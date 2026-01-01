USE [PetCareX];
GO

-- 0. Ensure Base Data (Branch & Main Staff)
IF NOT EXISTS (SELECT * FROM CHI_NHANH WHERE Ma_CN = 'CN001')
    INSERT INTO CHI_NHANH (Ma_CN, Ten_CN, Dia_Chi, SDT, Gio_MoCua, Gio_DongCua)
    VALUES ('CN001', N'PetCareX Q1', N'123 Lê Lợi', '0281234567', '08:00', '21:00');

IF NOT EXISTS (SELECT * FROM NHAN_VIEN WHERE Ma_NV = 'AD001')
    INSERT INTO NHAN_VIEN (Ma_NV, Ho_Ten, Ngay_Sinh, Gioi_Tinh, Vai_Tro, Ngay_Vao, Luong_CB, Ma_CN)
    VALUES ('AD001', N'Quản trị', '1990-01-01', N'Nam', N'Quản lý', '2023-01-01', 15000000, 'CN001');

IF NOT EXISTS (SELECT * FROM NHAN_VIEN WHERE Ma_NV = 'BS001')
BEGIN
    INSERT INTO NHAN_VIEN (Ma_NV, Ho_Ten, Ngay_Sinh, Gioi_Tinh, Vai_Tro, Ngay_Vao, Luong_CB, Ma_CN)
    VALUES ('BS001', N'Bác sĩ An', '1985-01-01', N'Nam', N'Bác sĩ', '2023-01-01', 20000000, 'CN001');
    INSERT INTO CT_BAC_SI (Ma_NV, ho_ten, So_Nam_Kinh_Nghiem, Bang_Cap)
    VALUES ('BS001', N'Bác sĩ An', 10, N'Thạc sĩ');
END
GO

-- 1. Generate KHACH_HANG (70,000 rows)
PRINT 'Generating KHACH_HANG...';
SET NOCOUNT ON;
DECLARE @i INT = 1;
WHILE @i <= 70000
BEGIN
    INSERT INTO KHACH_HANG (Ma_KH, Ho_ten, SDT, Email, Dia_chi, Tong_Chi_Tieu, Cap_Do_Hoi_Vien)
    VALUES (
        'KH' + RIGHT('000000' + CAST(@i AS VARCHAR(10)), 6),
        N'Customer ' + CAST(@i AS NVARCHAR(10)),
        '09' + RIGHT('00000000' + CAST(@i AS VARCHAR(10)), 8),
        'customer' + CAST(@i AS VARCHAR(10)) + '@example.com',
        N'Address ' + CAST(@i AS NVARCHAR(10)),
        0,
        N'Cơ bản'
    );
    SET @i = @i + 1;
END;
GO

-- 2. Generate THU_CUNG (75,000 rows)
PRINT 'Generating THU_CUNG...';
DECLARE @j INT = 1;
WHILE @j <= 75000
BEGIN
    INSERT INTO THU_CUNG (Ma_PET, Ten_PET, Ten_Loai, Giong, Ngay_Sinh, Ma_KH)
    VALUES (
        'PET' + RIGHT('000000' + CAST(@j AS VARCHAR(10)), 6),
        N'Pet ' + CAST(@j AS NVARCHAR(10)),
        CASE WHEN @j % 2 = 0 THEN N'Chó' ELSE N'Mèo' END,
        CASE WHEN @j % 3 = 0 THEN N'Poodle' ELSE N'Ta' END,
        DATEADD(day, -(@j % 3650), GETDATE()),
        'KH' + RIGHT('000000' + CAST((@j % 70000) + 1 AS VARCHAR(10)), 6)
    );
    SET @j = @j + 1;
END;
GO

-- 3. Generate HOA_DON (80,000 rows)
PRINT 'Generating HOA_DON...';
DECLARE @k INT = 1;
WHILE @k <= 80000
BEGIN
    INSERT INTO HOA_DON (Ma_HD, NV_Lap, Ma_KH, Ngay_Lap, HinhThuc_TT, Tong_Tien, Trang_Thai)
    VALUES (
        'HD' + RIGHT('000000' + CAST(@k AS VARCHAR(10)), 6),
        'AD001',
        'KH' + RIGHT('000000' + CAST((@k % 70000) + 1 AS VARCHAR(10)), 6),
        DATEADD(day, -(@k % 365), GETDATE()),
        N'Tiền mặt',
        (@k % 1000) * 1000 + 50000,
        N'Hoàn thành'
    );
    SET @k = @k + 1;
END;
GO

-- 4. Generate Phieu_Dat_Lich_Kham (70,000 rows)
PRINT 'Generating Phieu_Dat_Lich_Kham...';
DECLARE @l INT = 1;
WHILE @l <= 70000
BEGIN
    INSERT INTO Phieu_Dat_Lich_Kham (Ma_Phieu, Ma_KH, Ma_PET, Ma_BS, Ca_lamviec, Ngay_Dat, Trang_Thai)
    VALUES (
        'PL' + RIGHT('000000' + CAST(@l AS VARCHAR(10)), 6),
        'KH' + RIGHT('000000' + CAST((@l % 70000) + 1 AS VARCHAR(10)), 6),
        'PET' + RIGHT('000000' + CAST((@l % 75000) + 1 AS VARCHAR(10)), 6),
        'BS001',
        (@l % 2) + 1,
        DATEADD(day, (@l % 30), GETDATE()),
        N'Chờ khám'
    );
    SET @l = @l + 1;
END;
GO

PRINT 'Data generation complete!';
GO
