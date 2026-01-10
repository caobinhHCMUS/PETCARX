
--các proc cho bác sĩ
-- proc ttra cưu hồ sơn thú cưng
CREATE OR ALTER PROC dbo.sp_BS_SearchPets
  @Keyword nvarchar(100)
AS
BEGIN
  SET NOCOUNT ON;
  DECLARE @k nvarchar(100)=LTRIM(RTRIM(@Keyword));

  SELECT TOP 50
    tc.Ma_PET, tc.Ten_PET, tc.Ten_Loai, tc.Giong, tc.Gioi_Tinh, tc.Ngay_Sinh,tc.mau_sac,
    tc.Tinh_Trang_Suc_Khoe,
    tc.Ma_KH, kh.Ho_Ten AS Ten_KH, kh.SDT
  FROM dbo.THU_CUNG tc
  LEFT JOIN dbo.KHACH_HANG kh ON kh.Ma_KH = tc.Ma_KH
  WHERE @k = N''
     OR tc.Ma_PET LIKE '%' + @k + '%'
     OR tc.Ten_PET LIKE N'%' + @k + N'%'
     OR tc.Ma_KH LIKE '%' + @k + '%'
     OR kh.Ho_Ten LIKE N'%' + @k + N'%'
  ORDER BY tc.Ten_PET;
END
GO


-- proc lịch sử khám của bác sĩ
CREATE OR ALTER PROC dbo.sp_BS_GetDoctorExamHistory
  @Ma_BS varchar(10)
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    kb.Ma_HD,
    kb.Ma_PET,
    kb.Ngay_Kham,
    kb.Trieu_Chung,
    kb.Chuan_Doan,
    kb.Ngay_Hen_Tai_Kham,
    kb.Bac_Si,
    kb.Thanh_Tien
  FROM dbo.CT_KHAM_BENH kb
  WHERE kb.Bac_Si = @Ma_BS
  ORDER BY kb.Ngay_Kham DESC, kb.Ma_HD DESC;
END
GO
-- proc lịch sử khám thú cưng.
CREATE OR ALTER PROC dbo.sp_BS_GetPetExamHistory
  @Ma_PET varchar(10)
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    kb.Ma_HD,
    kb.Ma_PET,
    kb.Ngay_Kham,
    kb.Trieu_Chung,
    kb.Chuan_Doan,
    kb.Ngay_Hen_Tai_Kham,
    kb.Bac_Si,
    kb.Thanh_Tien
  FROM dbo.CT_KHAM_BENH kb
  WHERE kb.Ma_PET = @Ma_PET
  ORDER BY kb.Ngay_Kham DESC, kb.Ma_HD DESC;
END
GO


--tra cứu thuốc
CREATE OR ALTER PROC dbo.sp_BS_SearchMedicines
  @Keyword nvarchar(100)
AS
BEGIN
  SET NOCOUNT ON;
  DECLARE @k nvarchar(100)=LTRIM(RTRIM(@Keyword));

  SELECT TOP 50
    Ma_SP, Ten_SP, Loai_SP, Gia, Don_Vi_Tinh, So_Luong
  FROM dbo.SAN_PHAM
  WHERE Loai_SP = N'Thuốc'
    AND (@k=N'' OR Ten_SP LIKE N'%' + @k + N'%' OR Ma_SP LIKE '%' + @k + '%')
  ORDER BY Ten_SP;
END
GO


--proc tạo bệnh án mới.
CREATE OR ALTER PROC dbo.sp_BS_CreateExam
  @Ma_PET varchar(10),
  @Ma_BS  varchar(10),
  @Trieu_Chung nvarchar(max),
  @Chuan_Doan  nvarchar(max),
  @Ngay_Hen_Tai_Kham datetime = NULL,
  @Thanh_Tien decimal(18,2) = 0
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @Ma_KH varchar(10) = (SELECT TOP 1 Ma_KH FROM dbo.THU_CUNG WHERE Ma_PET=@Ma_PET);

  IF @Ma_KH IS NULL
    THROW 50010, N'Không tìm thấy thú cưng', 1;

  DECLARE @Ma_HD varchar(10) =
    'HD' + RIGHT('000000' + CAST(ABS(CHECKSUM(NEWID())) % 1000000 AS varchar(6)), 6);

  INSERT dbo.HOA_DON(Ma_HD, NV_Lap, Ma_KH, Ngay_Lap, HinhThuc_TT, Khuyen_Mai, Tong_Tien)
  VALUES(@Ma_HD, NULL, @Ma_KH, GETDATE(), N'Tiền mặt', 0, @Thanh_Tien);

  INSERT dbo.CT_KHAM_BENH(Ma_HD, Ma_PET, Ngay_Kham, Trieu_Chung, Chuan_Doan, Ngay_Hen_Tai_Kham, Bac_Si, Thanh_Tien)
  VALUES(@Ma_HD, @Ma_PET, GETDATE(), @Trieu_Chung, @Chuan_Doan, @Ngay_Hen_Tai_Kham, @Ma_BS, @Thanh_Tien);

  SELECT @Ma_HD AS Ma_HD;
END
GO

IF TYPE_ID(N'dbo.TVP_PrescriptionItems') IS NULL
CREATE TYPE dbo.TVP_PrescriptionItems AS TABLE(
    ma_sp NVARCHAR(50) NOT NULL,
    so_luong INT NOT NULL,
    lieu_dung NVARCHAR(255) NULL,
    tan_suat NVARCHAR(255) NULL,
    so_ngay INT NULL,
    cach_dung NVARCHAR(255) NULL
);
GO

--proc kê đơn thuốc
-- Cập nhật CT_DON_THUOC để lưu giá sản phẩm và tính thành tiền
CREATE OR ALTER PROCEDURE dbo.sp_BS_IssuePrescription
    @ma_pet NVARCHAR(10),
    @ma_bs NVARCHAR(10),
    @items dbo.TVP_PrescriptionItems READONLY,
    @ma_hd NVARCHAR(10) OUTPUT,
    @ma_dt NVARCHAR(10) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRAN;

        -- 1) Validate dữ liệu đầu vào
        IF @ma_pet IS NULL OR LTRIM(RTRIM(@ma_pet)) = '' THROW 50001, N'Thiếu mã pet', 1;
        IF @ma_bs IS NULL OR LTRIM(RTRIM(@ma_bs)) = '' THROW 50001, N'Thiếu mã bác sĩ', 1;
        IF NOT EXISTS (SELECT 1 FROM @items) THROW 50002, N'Danh sách thuốc rỗng', 1;
        IF EXISTS (SELECT 1 FROM @items WHERE so_luong <= 0) THROW 50003, N'Số lượng không hợp lệ', 1;

        -- 2) Kiểm tra tồn kho
        IF EXISTS (
            SELECT 1 FROM @items i
            JOIN SAN_PHAM sp ON sp.Ma_SP = i.ma_sp
            WHERE sp.So_Luong < i.so_luong
        ) THROW 50004, N'Số lượng sản phẩm không đủ trong kho', 1;

        -- 3) Lấy Ma_KH từ bảng THU_CUNG (Để điền vào Hóa Đơn)
        DECLARE @Ma_KH VARCHAR(10);
        SELECT @Ma_KH = Ma_KH FROM THU_CUNG WHERE Ma_PET = @ma_pet;

        IF @Ma_KH IS NULL 
            THROW 50005, N'Thú cưng không thuộc về khách hàng nào hoặc không tồn tại', 1;

        -- 4) Tạo mã HD và DT (Random nhưng đảm bảo độ dài varchar(10))
        SET @ma_hd = CONCAT('HD', LEFT(REPLACE(CONVERT(NVARCHAR(36), NEWID()), '-', ''), 8));
        SET @ma_dt = CONCAT('DT', LEFT(REPLACE(CONVERT(NVARCHAR(36), NEWID()), '-', ''), 8));

        -- 5) Tính tổng tiền (Quan trọng: Xử lý NULL để tránh lỗi insert)
        DECLARE @tong_tien DECIMAL(18,2);
        
        SELECT @tong_tien = ISNULL(SUM(CAST(i.so_luong AS DECIMAL(18,2)) * ISNULL(sp.Gia, 0)), 0)
        FROM @items i
        JOIN SAN_PHAM sp ON sp.Ma_SP = i.ma_sp;

        -- 6) Insert HOA_DON (Vẫn insert Tong_Tien như yêu cầu)
        -- Lưu ý: Loai_Nghiep_Vu phải khớp chính xác với CHECK constraint trong DB (N'Đơn thuốc')
        INSERT INTO HOA_DON (Ma_HD, NV_Lap, Ma_KH, Ngay_Lap, Loai_Nghiep_Vu, Tong_Tien, Trang_Thai, HinhThuc_TT)
        VALUES (@ma_hd, @ma_bs, @Ma_KH, GETDATE(), N'Đơn thuốc', @tong_tien, N'Hoàn thành', N'Tiền mặt');

        -- 7) Insert DON_THUOC
        INSERT INTO DON_THUOC (Ma_DT, Ma_HD, Ma_Pet, Ma_BS, Ngay_Ke)
        VALUES (@ma_dt, @ma_hd, @ma_pet, @ma_bs, GETDATE());

        -- 8) Insert CT_DON_THUOC
        -- Lưu ý: KHÔNG insert cột Thanh_Tien vì trong DB nó là cột computed (AS So_Luong * Don_Gia)
        INSERT INTO CT_DON_THUOC (Ma_DT, Ma_SP, So_Luong, Don_Gia, Lieu_Dung, Tan_Suat, So_Ngay, Cach_Dung)
        SELECT 
            @ma_dt, 
            i.ma_sp, 
            i.so_luong, 
            sp.Gia, -- Lấy giá hiện tại từ bảng sản phẩm để lưu vào lịch sử
            i.lieu_dung,
            i.tan_suat,
            i.so_ngay,
            i.cach_dung
        FROM @items i
        JOIN SAN_PHAM sp ON sp.Ma_SP = i.ma_sp;

        -- 9) Trừ tồn kho
        UPDATE sp
        SET sp.So_Luong = sp.So_Luong - i.so_luong
        FROM SAN_PHAM sp
        JOIN @items i ON sp.Ma_SP = i.ma_sp;

        COMMIT;

        -- Trả về kết quả cho Backend
        SELECT 1 AS success, @ma_hd AS ma_hd, @ma_dt AS ma_dt, @tong_tien AS tong_tien;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        DECLARE @msg NVARCHAR(4000) = ERROR_MESSAGE();
        THROW 50099, @msg, 1;
    END CATCH
END
GO


CREATE OR ALTER PROC sp_BacSi_TaoDonThuoc
    @Ma_BS varchar(10),
    @Ma_PET varchar(10)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRAN;

        -- 1. Sinh mã hóa đơn cho đơn thuốc
        DECLARE @Ma_HD varchar(10);
        SELECT @Ma_HD =
            'HD' + RIGHT(
                '00000' + CAST(
                    ISNULL(MAX(CAST(SUBSTRING(Ma_HD,3,5) AS int)),0) + 1
                AS varchar(5)), 5)
        FROM HOA_DON WITH (UPDLOCK, HOLDLOCK);

        -- 2. Tạo hóa đơn (chưa có tiền)
        INSERT INTO HOA_DON
        (
            Ma_HD, NV_Lap, Ma_KH,
            Ngay_Lap, Tong_Tien,
            Trang_Thai, Loai_Nghiep_Vu
        )
        VALUES
        (
            @Ma_HD, @Ma_BS, NULL,
            GETDATE(), 0,
            N'Đang xử lý', N'Đơn thuốc'
        );

        -- 3. Sinh mã đơn thuốc
        DECLARE @Ma_DT varchar(10);
        SELECT @Ma_DT =
            'DT' + RIGHT(
                '00000' + CAST(
                    ISNULL(MAX(CAST(SUBSTRING(Ma_DT,3,5) AS int)),0) + 1
                AS varchar(5)), 5)
        FROM DON_THUOC WITH (UPDLOCK, HOLDLOCK);

        -- 4. Tạo đơn thuốc (CHỈ BS + PET)
        INSERT INTO DON_THUOC
        (
            Ma_DT, Ma_HD, Ma_PET, Ma_BS
        )
        VALUES
        (
            @Ma_DT, @Ma_HD, @Ma_PET, @Ma_BS
        );

        COMMIT;
        SELECT 
            'Success' AS Status,
            @Ma_DT AS Ma_DonThuoc,
            @Ma_HD AS Ma_HoaDon;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        SELECT 'Fail' AS Status, ERROR_MESSAGE() AS Message;
    END CATCH
END
GO

CREATE OR ALTER PROC sp_BacSi_ThemThuocVaoDon
    @Ma_DT varchar(10),
    @Ma_SP varchar(10),
    @So_Luong int,
    @Lieu_Dung nvarchar(100),
    @Tan_Suat nvarchar(100),
    @So_Ngay int,
    @Cach_Dung nvarchar(255)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO CT_DON_THUOC
    (
        Ma_DT, Ma_SP, So_Luong,
        Lieu_Dung, Tan_Suat,
        So_Ngay, Cach_Dung, Don_Gia
    )
    SELECT
        @Ma_DT, @Ma_SP, @So_Luong,
        @Lieu_Dung, @Tan_Suat,
        @So_Ngay, @Cach_Dung, Gia
    FROM SAN_PHAM
    WHERE Ma_SP = @Ma_SP
      AND Loai_SP = N'Thuốc';

    SELECT 'Success' AS Status;
END
GO

CREATE OR ALTER PROC sp_CapNhatTongTien_DonThuoc
    @Ma_DT varchar(10)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Tong_Tien decimal(18,2);

    SELECT @Tong_Tien = ISNULL(SUM(Thanh_Tien),0)
    FROM CT_DON_THUOC
    WHERE Ma_DT = @Ma_DT;

    UPDATE hd
    SET Tong_Tien = @Tong_Tien
    FROM HOA_DON hd
    JOIN DON_THUOC dt ON dt.Ma_HD = hd.Ma_HD
    WHERE dt.Ma_DT = @Ma_DT;

    SELECT 'Success' AS Status, @Tong_Tien AS Tong_Tien;
END
GO



