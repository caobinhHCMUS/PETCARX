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
