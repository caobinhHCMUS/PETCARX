

--Proc cho chức năng xác thực đơn hàng.
CREATE PROCEDURE sp_DuyetHoaDon
    @Ma_HD varchar(10),
    @Ma_NV varchar(10),
    @Trang_Thai_Moi nvarchar(50)
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra hóa đơn có tồn tại không
    IF EXISTS (SELECT 1 FROM HOA_DON WHERE Ma_HD = @Ma_HD)
    BEGIN
        UPDATE HOA_DON
        SET Trang_Thai = @Trang_Thai_Moi,
            NV_Lap = @Ma_NV -- Ghi mã nhân viên duyệt vào đây
        WHERE Ma_HD = @Ma_HD;
        
        SELECT 1 AS Success, N'Cập nhật thành công' AS Message;
    END
    ELSE
    BEGIN
        SELECT 0 AS Success, N'Không tìm thấy hóa đơn' AS Message;
    END
END
GO

--proc lấy đơn hàng đang xử lý
CREATE OR ALTER PROC sp_getbill_processing
AS
BEGIN 
    select hd.Ma_HD, kh.Ho_Ten, HinhThuc_TT, hd.Ngay_Lap, hd.loai_nghiep_vu,hd.Tong_Tien
    from hoa_don hd join KHACH_HANG kh on hd.ma_kh=kh.Ma_KH
    WHERE TRANG_THAI = N'Đang xử lý'
END
GO


-- proc tìm kiếm thông tin thú cưng.
--dbo.sp_SearchPets  dùng lại proc trong chức năng của bác sĩ


-- proc thêm thú cưng
CREATE OR ALTER PROC dbo.sp_AddPetWithAutoID
    @Ma_KH varchar(10),
    @Ten_PET nvarchar(50),
    @Ten_Loai nvarchar(50),
    @Giong nvarchar(50),
    @Gioi_Tinh nvarchar(10),
    @Ngay_Sinh date,
    @Mau_Sac nvarchar(50)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @MaxID int;
        DECLARE @NewMaPET varchar(10);

        -- 1. Lấy phần số lớn nhất từ các mã có tiền tố 'TC'
        -- SUBSTRING(Ma_PET, 3, ...) vì 'TC' chiếm 2 ký tự đầu
        IF @MaxID < 10000
            SET @NewMaPET = 'TC' + RIGHT('0000' + CAST(@MaxID AS varchar(10)), 4);
        ELSE
            SET @NewMaPET = 'TC' + CAST(@MaxID AS varchar(10));

        -- 2. Tăng giá trị lên 1 (nếu chưa có mã nào thì bắt đầu từ 1)
        SET @MaxID = ISNULL(@MaxID, 0) + 1;

        -- 3. Định dạng mã mới: 'TC' + 4 chữ số (ví dụ: TC0001)
        SET @NewMaPET = 'TC' + RIGHT('0000' + CAST(@MaxID AS varchar(8)), 4);

        -- 4. Thêm vào bảng
        INSERT INTO dbo.THU_CUNG (
            Ma_PET, Ma_KH, Ten_PET, Ten_Loai, Giong, 
            Gioi_Tinh, Ngay_Sinh, Tinh_Trang_Suc_Khoe, Mau_Sac
        )
        VALUES (
            @NewMaPET, @Ma_KH, @Ten_PET, @Ten_Loai, @Giong, 
            @Gioi_Tinh, @Ngay_Sinh, N'Tốt', @Mau_Sac
        );

        -- Trả về kết quả thành công
        SELECT 1 AS Success, N'Thêm thú cưng thành công' AS Message, @NewMaPET AS GeneratedID;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message, NULL AS GeneratedID;
    END CATCH
END
GO