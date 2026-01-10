

-- 1. Tìm kiếm sản phẩm theo tên.
CREATE OR ALTER PROCEDURE TimKiemSanPham
    @Ten_SP nvarchar(100)
AS
BEGIN
    SELECT Ma_SP, Ten_SP, Loai_SP, So_Luong, Gia , Don_Vi_Tinh FROM SAN_PHAM WHERE Ten_SP LIKE '%' + @Ten_SP + '%'
END
GO

-- 2. Đặt mua sản phẩm (Retail)
CREATE OR ALTER PROCEDURE datmuasanpham
    @Ma_KH varchar(10),
    @Ma_SP varchar(10),
    @Ma_NV varchar(10),
    @HinhThuc_TT nvarchar(50),
    @So_Luong int
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRAN;

        DECLARE @Ma_HD varchar(10);
        SELECT @Ma_HD =
          'HD' + RIGHT('00000' + CAST(ISNULL(MAX(CAST(SUBSTRING(Ma_HD,3,5) AS int)),0)+1 AS varchar(5)),5)
        FROM HOA_DON WITH (UPDLOCK, HOLDLOCK);

        DECLARE @Gia decimal(18,2);
        SELECT @Gia = Gia FROM SAN_PHAM WHERE Ma_SP = @Ma_SP;

        INSERT INTO HOA_DON
        (Ma_HD, Ma_KH, NV_Lap, Ngay_Lap, HinhThuc_TT, Tong_Tien, Trang_Thai, Loai_Nghiep_Vu)
        VALUES
        (@Ma_HD, @Ma_KH, @Ma_NV, GETDATE(), @HinhThuc_TT,
         @Gia * @So_Luong, N'Hoàn thành', N'Mua sản phẩm');

        INSERT INTO CT_MUA_HANG
        (Ma_HD, Ma_SP, So_Luong, Thanh_Tien)
        VALUES
        (@Ma_HD, @Ma_SP, @So_Luong, @Gia * @So_Luong);

        UPDATE SAN_PHAM
        SET So_Luong = So_Luong - @So_Luong
        WHERE Ma_SP = @Ma_SP;

        COMMIT;
        SELECT 'Success' AS Status, @Ma_HD AS Ma_HD;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        SELECT 'Fail' AS Status, ERROR_MESSAGE() AS Message;
    END CATCH
END
GO


CREATE OR ALTER PROCEDURE sp_DatLichKham
    @Ma_KH varchar(10),
    @Ma_PET varchar(10),
    @Ma_BS varchar(10),
    @Ca_LamViec int,
    @Ngay_Dat datetime
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRAN;

        IF CAST(@Ngay_Dat AS DATE) < CAST(GETDATE() AS DATE)
            THROW 50001, N'Không thể đặt lịch trong quá khứ', 1;

        DECLARE @Ma_HD varchar(10);
        SELECT @Ma_HD =
          'HD' + RIGHT('00000' + CAST(ISNULL(MAX(CAST(SUBSTRING(Ma_HD,3,5) AS int)),0)+1 AS varchar(5)),5)
        FROM HOA_DON WITH (UPDLOCK, HOLDLOCK);

        INSERT INTO HOA_DON
        (Ma_HD, Ma_KH, Ngay_Lap, Tong_Tien, Trang_Thai, Loai_Nghiep_Vu)
        VALUES
        (@Ma_HD, @Ma_KH, GETDATE(), 150000, N'Đang xử lý', N'Khám bệnh');

        INSERT INTO CT_KHAM_BENH
        (Ma_HD, Ma_PET, Ngay_Kham, Bac_Si, Thanh_Tien)
        VALUES
        (@Ma_HD, @Ma_PET, @Ngay_Dat, @Ma_BS, 150000);

        INSERT INTO Phieu_Dat_Lich_Kham
        (Ma_KH, Ma_PET, Ma_BS, Ca_LamViec, Ngay_Dat)
        VALUES
        (@Ma_KH, @Ma_PET, @Ma_BS, @Ca_LamViec, @Ngay_Dat);

        COMMIT;
        SELECT 'Success' AS Status, @Ma_HD AS Ma_HD;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        SELECT 'Fail' AS Status, ERROR_MESSAGE() AS Message;
    END CATCH
END
GO


-- 4. Xem lịch sử cho Pet
CREATE OR ALTER PROCEDURE XemLichSuChoPet
    @Ma_KH varchar(10)
AS
BEGIN
    SELECT
        hd.Ma_HD,
        hd.Ngay_Lap,
        p.Ten_PET,
        nv.Ho_Ten AS Bac_Si,
        ctkb.Chuan_Doan,
        hd.Tong_Tien
    FROM HOA_DON hd
    JOIN CT_KHAM_BENH ctkb ON hd.Ma_HD = ctkb.Ma_HD
    JOIN THU_CUNG p ON ctkb.Ma_PET = p.Ma_PET
    JOIN NHAN_VIEN nv ON ctkb.Bac_Si = nv.Ma_NV
    WHERE hd.Ma_KH = @Ma_KH
    ORDER BY hd.Ngay_Lap DESC;
END
GO
--5. Thêm sản phẩm vào giỏ hàng
CREATE OR ALTER PROC sp_Khach_DatLichKham
    @Ma_KH varchar(10),
    @Ma_PET varchar(10),
    @Ma_BS varchar(10),
    @Ca_LamViec int,
    @Ngay_Kham datetime
AS
BEGIN
    SET NOCOUNT ON;

    IF CAST(@Ngay_Kham AS DATE) < CAST(GETDATE() AS DATE)
    BEGIN
        RAISERROR (N'Không thể đặt lịch cho ngày trong quá khứ', 16, 1);
        RETURN;
    END

    INSERT INTO PHIEU_DAT_LICH_KHAM
    (
        Ma_KH, Ma_PET, Ma_BS,
        Ca_LamViec, Ngay_Dat, Trang_Thai
    )
    VALUES
    (
        @Ma_KH, @Ma_PET, @Ma_BS,
        @Ca_LamViec, @Ngay_Kham, N'Chờ xác nhận'
    );

    SELECT 'Success' AS Status, N'Đặt lịch thành công' AS Message;
END
GO

CREATE OR ALTER PROC sp_Khach_GetBacSi
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        nv.Ma_NV       AS Ma_BS,
        nv.Ho_Ten      AS Ten_Bac_Si,
        bs.So_Nam_Kinh_Nghiem,
        bs.Bang_Cap,

        cn.Ma_CN,
        cn.Ten_CN,
        cn.Dia_Chi     AS Dia_Chi_Chi_Nhanh
    FROM NHAN_VIEN nv
    JOIN CT_BAC_SI bs 
        ON nv.Ma_NV = bs.Ma_NV
    LEFT JOIN CHI_NHANH cn 
        ON nv.Ma_CN = cn.Ma_CN
    WHERE nv.Vai_Tro = N'Bác sĩ';
END
GO

CREATE OR ALTER PROC sp_Khach_GetThuCung
    @Ma_KH varchar(10)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        Ma_PET,
        Ten_PET,
        Ten_Loai,
        Giong
    FROM THU_CUNG
    WHERE Ma_KH = @Ma_KH;
END
GO

CREATE OR ALTER PROC sp_Khach_DatLichKham
    @Ma_KH varchar(10),
    @Ma_PET varchar(10),
    @Ma_BS varchar(10),
    @Ca_LamViec int,
    @Ngay_Dat datetime
AS
BEGIN
    SET NOCOUNT ON;

    IF CAST(@Ngay_Dat AS DATE) < CAST(GETDATE() AS DATE)
    BEGIN
        RAISERROR(N'Không thể đặt lịch trong quá khứ', 16, 1);
        RETURN;
    END

    INSERT INTO Phieu_Dat_Lich_Kham
    (
        Ma_KH, Ma_PET, Ma_BS,
        Ca_LamViec, Ngay_Dat, Trang_Thai
    )
    VALUES
    (
        @Ma_KH, @Ma_PET, @Ma_BS,
        @Ca_LamViec, @Ngay_Dat, N'Chưa xác nhận'
    );

    SELECT 'Success' AS Status;
END
GO
