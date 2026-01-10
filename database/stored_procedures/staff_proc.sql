CREATE OR ALTER PROC sp_LeTan_TaoHoaDonKham
    @Ma_KH varchar(10),
    @Ma_PET varchar(10),
    @Ma_BS varchar(10),
    @NV_Lap varchar(10),
    @Ngay_Kham datetime,
    @Tien_Kham decimal(18,2) = 150000
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRAN;

        -- Sinh mã hóa đơn
        DECLARE @Ma_HD varchar(10);
        SELECT @Ma_HD =
            'HD' + RIGHT('00000' +
                CAST(ISNULL(MAX(CAST(SUBSTRING(Ma_HD,3,5) AS int)),0)+1 AS varchar(5)),5)
        FROM HOA_DON WITH (UPDLOCK, HOLDLOCK);

        -- Tạo hóa đơn
        INSERT INTO HOA_DON
        (
            Ma_HD, Ma_KH, NV_Lap,
            Ngay_Lap, HinhThuc_TT,
            Tong_Tien, Trang_Thai
        )
        VALUES
        (
            @Ma_HD, @Ma_KH, @NV_Lap,
            GETDATE(), N'Tiền mặt',
            @Tien_Kham, N'Chưa thanh toán'
        );

        -- Chi tiết khám bệnh
        INSERT INTO CT_KHAM_BENH
        (
            Ma_HD, Ma_PET, Bac_Si,
            Ngay_Kham, Thanh_Tien
        )
        VALUES
        (
            @Ma_HD, @Ma_PET, @Ma_BS,
            @Ngay_Kham, @Tien_Kham
        );

        COMMIT;
        SELECT 'Success' AS Status, @Ma_HD AS Ma_HD;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        SELECT 'Fail' AS Status, ERROR_MESSAGE() AS Message;
    END CATCH
END
GO


USE PetCareX2
GO

-- 1. SP Lấy thông tin Hóa đơn và dữ liệu phụ trợ (List thú cưng của khách, List bác sĩ)
CREATE OR ALTER PROC sp_Staff_GetInvoiceInfo
    @Ma_HD varchar(10)
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra tồn tại
    IF NOT EXISTS (SELECT 1 FROM HOA_DON WHERE Ma_HD = @Ma_HD)
    BEGIN
        SELECT 'NotFound' as Status;
        RETURN;
    END

    -- 1. Trả về thông tin Hóa Đơn + Khách Hàng
    SELECT 
        hd.Ma_HD, hd.Ngay_Lap, hd.Tong_Tien, hd.Trang_Thai, hd.Loai_Nghiep_Vu,
        kh.Ma_KH, kh.Ho_Ten AS Ten_Khach_Hang, kh.SDT
    FROM HOA_DON hd
    LEFT JOIN KHACH_HANG kh ON hd.Ma_KH = kh.Ma_KH
    WHERE hd.Ma_HD = @Ma_HD;

    -- 2. Trả về danh sách Thú cưng của Khách hàng đó (để chọn khám cho con nào)
    DECLARE @MaKH_In_HD varchar(10);
    SELECT @MaKH_In_HD = Ma_KH FROM HOA_DON WHERE Ma_HD = @Ma_HD;

    SELECT Ma_PET, Ten_PET, Ten_Loai, Giong 
    FROM THU_CUNG 
    WHERE Ma_KH = @MaKH_In_HD;

    -- 3. Trả về danh sách Bác sĩ (để chọn ai khám)
    SELECT nv.Ma_NV AS Ma_BS, nv.Ho_Ten AS Ten_Bac_Si
    FROM NHAN_VIEN nv
    JOIN CT_BAC_SI bs ON nv.Ma_NV = bs.Ma_NV;
    
    -- 4. Trả về chi tiết khám bệnh đã có (nếu muốn hiển thị danh sách đã thêm)
    SELECT 
        ct.Ma_PET, tc.Ten_PET, ct.Bac_Si, nv.Ho_Ten AS Ten_Bac_Si, 
        ct.Trieu_Chung, ct.Chuan_Doan, ct.Thanh_Tien, ct.Ngay_Hen_Tai_Kham
    FROM CT_KHAM_BENH ct
    JOIN THU_CUNG tc ON ct.Ma_PET = tc.Ma_PET
    JOIN NHAN_VIEN nv ON ct.Bac_Si = nv.Ma_NV
    WHERE ct.Ma_HD = @Ma_HD;
END
GO

-- 2. SP Thêm chi tiết khám bệnh
CREATE OR ALTER PROC sp_Staff_AddExamDetail
    @Ma_HD varchar(10),
    @Ma_PET varchar(10),
    @Bac_Si varchar(10),
    @Trieu_Chung nvarchar(MAX),
    @Chuan_Doan nvarchar(MAX),
    @Ngay_Hen_Tai_Kham datetime,
    @Thanh_Tien decimal(18,2)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRAN;

        -- Kiểm tra loại hóa đơn (Chỉ được thêm vào hóa đơn Khám bệnh)
        DECLARE @LoaiNV nvarchar(30);
        SELECT @LoaiNV = Loai_Nghiep_Vu FROM HOA_DON WHERE Ma_HD = @Ma_HD;

        IF @LoaiNV IS NULL OR @LoaiNV <> N'Khám bệnh'
            THROW 50001, N'Hóa đơn này không phải loại nghiệp vụ Khám bệnh', 1;

        -- Insert vào CT_KHAM_BENH
        INSERT INTO CT_KHAM_BENH (
            Ma_HD, Ma_PET, Bac_Si, Ngay_Kham, 
            Trieu_Chung, Chuan_Doan, Ngay_Hen_Tai_Kham, Thanh_Tien
        )
        VALUES (
            @Ma_HD, @Ma_PET, @Bac_Si, GETDATE(), 
            @Trieu_Chung, @Chuan_Doan, @Ngay_Hen_Tai_Kham, @Thanh_Tien
        );

        -- Cập nhật Tổng tiền trong bảng HOA_DON
        UPDATE HOA_DON
        SET Tong_Tien = Tong_Tien + @Thanh_Tien
        WHERE Ma_HD = @Ma_HD;

        COMMIT;
        SELECT 'Success' AS Status;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END
GO