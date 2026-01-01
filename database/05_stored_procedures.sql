USE [PetCareX];
GO

-- 1. Tìm kiếm sản phẩm theo tên.
CREATE OR ALTER PROCEDURE TimKiemSanPham
    @Ten_SP nvarchar(100)
AS
BEGIN
    SELECT Ma_SP, Ten_SP, Loai_SP, So_Luong, Gia FROM SAN_PHAM WHERE Ten_SP LIKE '%' + @Ten_SP + '%'
END
GO

-- 2. Đặt mua sản phẩm (Retail)
CREATE OR ALTER PROCEDURE datmuasanpham
    @Ma_KH varchar(10),
    @Ma_SP varchar(10),
    @Ma_NV varchar(10),
    @Hinhthuc_tt nvarchar(50),
    @So_Luong int
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Generate Ma_HD
        DECLARE @count int;
        SELECT @count = COUNT(*) FROM HOA_DON;
        DECLARE @Ma_HD varchar(10) = 'HD' + RIGHT('000000' + CAST(@count + 1 AS varchar(6)), 6);

        -- Get Product Price
        DECLARE @Gia decimal(18,2);
        SELECT @Gia = Gia FROM SAN_PHAM WHERE Ma_SP = @Ma_SP;

        -- Create Invoice
        INSERT INTO HOA_DON (Ma_HD, Ma_KH, NV_Lap, Ngay_Lap, HinhThuc_TT, Tong_Tien, Trang_Thai)
        VALUES (@Ma_HD, @Ma_KH, @Ma_NV, GETDATE(), @Hinhthuc_tt, @Gia * @So_Luong, N'Hoàn thành');

        -- Create Detail
        INSERT INTO CT_MUA_HANG (Ma_HD, Ma_SP, So_Luong, Thanh_Tien)
        VALUES (@Ma_HD, @Ma_SP, @So_Luong, @Gia * @So_Luong);

        COMMIT TRANSACTION;
        SELECT @Ma_HD AS MaHD_Moi, 'Success' AS Status, N'Đặt hàng thành công' AS Message;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 'Failed' AS Status, ERROR_MESSAGE() AS Message;
    END CATCH
END
GO

-- 3. Đặt lịch khám (Appointment with Auto-Invoicing)
CREATE OR ALTER PROCEDURE sp_DatLichKham
    @Ma_KH varchar(10),
    @Ma_PET varchar(10),
    @Ma_BS varchar(10),
    @Ca_lamviec int,
    @Ngay_Dat datetime
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        IF CAST(@Ngay_Dat AS DATE) < CAST(GETDATE() AS DATE)
            RAISERROR(N'Không thể đặt lịch cho ngày trong quá khứ.', 16, 1);

        -- Generate Ma_HD
        DECLARE @count int;
        SELECT @count = COUNT(*) FROM HOA_DON;
        DECLARE @Ma_HD varchar(10) = 'HD' + RIGHT('000000' + CAST(@count + 1 AS varchar(6)), 6);

        -- Create Invoice (Fee: 150,000 VND)
        INSERT INTO HOA_DON (Ma_HD, Ma_KH, NV_Lap, Ngay_Lap, HinhThuc_TT, Tong_Tien, Trang_Thai)
        VALUES (@Ma_HD, @Ma_KH, NULL, GETDATE(), N'Chưa xác định', 150000, N'Chưa thanh toán');

        -- Create Detail record to link Pet/Doctor
        INSERT INTO CT_KHAM_BENH (Ma_HD, Ma_PET, Ngay_Kham, Bac_Si, Thanh_Tien)
        VALUES (@Ma_HD, @Ma_PET, @Ngay_Dat, @Ma_BS, 150000);

        -- Create Appointment ticket
        INSERT INTO Phieu_Dat_Lich_Kham (Ma_KH, Ma_PET, Ma_BS, Ca_lamviec, Ngay_Dat, Trang_Thai)
        VALUES (@Ma_KH, @Ma_PET, @Ma_BS, @Ca_lamviec, @Ngay_Dat, N'Chưa xác nhận');

        COMMIT TRANSACTION;
        SELECT @Ma_HD AS MaHD_Moi, 'Success' AS Status;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 'Error' AS Status, ERROR_MESSAGE() AS Message;
    END CATCH
END
GO

-- 4. Xem lịch sử cho Pet
CREATE OR ALTER PROCEDURE XemLichSuChoPet
    @Ma_kh varchar(10)
AS
BEGIN
    -- Purchase History
    SELECT hd.Ma_HD, hd.Ngay_lap, sp.Ten_SP, ctmh.So_Luong, hd.Tong_Tien, hd.Trang_Thai
    FROM HOA_DON hd
    LEFT JOIN CT_MUA_HANG ctmh ON hd.Ma_HD = ctmh.Ma_HD
    LEFT JOIN SAN_PHAM sp ON ctmh.Ma_SP = sp.Ma_SP
    WHERE hd.Ma_kh = @Ma_kh
    ORDER BY hd.Ngay_lap DESC;

    -- Health History
    SELECT ctkb.Ma_PET, p.Ten_PET, hd.Ngay_Lap, bs.Ho_Ten, ctkb.Chuan_Doan, hd.Tong_Tien
    FROM HOA_DON hd
    JOIN CT_KHAM_BENH ctkb ON hd.Ma_HD = ctkb.Ma_HD
    JOIN THU_CUNG p ON ctkb.Ma_PET = p.Ma_PET
    LEFT JOIN NHAN_VIEN bs ON ctkb.Bac_Si = bs.Ma_NV
    WHERE hd.Ma_KH = @Ma_kh
    ORDER BY hd.Ngay_lap DESC;
END
GO