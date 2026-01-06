
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



--proc kê đơn thuốc
-- Cập nhật CT_DON_THUOC để lưu giá sản phẩm và tính thành tiền
CREATE OR ALTER PROCEDURE dbo.sp_BS_IssuePrescription
    @ma_pet NVARCHAR(50),
    @items dbo.TVP_PrescriptionItems READONLY, -- Tham số TVP chứa danh sách thuốc
    @ma_hd NVARCHAR(50) OUTPUT,
    @ma_dt NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRAN;

        -- 1) Validate đầu vào
        IF @ma_pet IS NULL OR LTRIM(RTRIM(@ma_pet)) = ''
            THROW 50001, N'Thiếu mã pet', 1;

        IF NOT EXISTS (SELECT 1 FROM @items)
            THROW 50002, N'Danh sách thuốc rỗng', 1;

        IF EXISTS (SELECT 1 FROM @items WHERE so_luong <= 0)
            THROW 50003, N'Số lượng không hợp lệ', 1;

        -- 2) Kiểm tra số lượng tồn kho
        IF EXISTS (
            SELECT 1
            FROM @items i
            JOIN SAN_PHAM sp ON sp.Ma_SP = i.ma_sp
            WHERE sp.So_Luong < i.so_luong
        )
            THROW 50004, N'Số lượng sản phẩm không đủ trong kho', 1;

        -- 3) Tạo mã hóa đơn (Ma_HD) và mã đơn thuốc (Ma_DT) ngẫu nhiên
        SET @ma_hd = CONCAT('HD', LEFT(REPLACE(CONVERT(NVARCHAR(36), NEWID()), '-', ''), 8));
        SET @ma_dt = CONCAT('DT', LEFT(REPLACE(CONVERT(NVARCHAR(36), NEWID()), '-', ''), 8));

        -- 4) Tính tổng tiền từ các sản phẩm trong TVP
        DECLARE @tong_tien DECIMAL(18,2);
        SELECT @tong_tien = SUM(CAST(i.so_luong AS DECIMAL(18,2)) * sp.Gia)
        FROM @items i
        JOIN SAN_PHAM sp ON sp.Ma_SP = i.ma_sp;

        -- 5) Insert vào bảng HOA_DON
        INSERT INTO HOA_DON (Ma_HD, Ngay_Lap, Loai_Nghiep_Vu, Tong_Tien)
        VALUES (@ma_hd, GETDATE(), N'đơn thuốc', @tong_tien);

        -- 6) Insert vào bảng DON_THUOC
        INSERT INTO DON_THUOC (Ma_DT, Ma_HD, Ma_Pet, Ngay_Ke)
        VALUES (@ma_dt, @ma_hd, @ma_pet, GETDATE());

        -- 7) Insert CHI TIẾT ĐƠN THUỐC (Lấy đầy đủ thông tin liều dùng, tần suất...)
        -- Xử lý tập dữ liệu (Set-based) thay vì dùng CURSOR để đạt hiệu năng cao nhất
        INSERT INTO CT_DON_THUOC (MA_DT, Ma_SP, So_Luong, Don_Gia, Lieu_Dung, Tan_Suat, So_Ngay, Cach_Dung)
        SELECT 
            @ma_dt, 
            i.ma_sp, 
            i.so_luong, 
            sp.Gia,
            i.lieu_dung, -- Đảm bảo cột này được map từ TVP
            i.tan_suat,  -- Đảm bảo cột này được map từ TVP
            i.so_ngay,   -- Đảm bảo cột này được map từ TVP
            i.cach_dung  -- Đảm bảo cột này được map từ TVP
        FROM @items i
        JOIN SAN_PHAM sp ON sp.Ma_SP = i.ma_sp;

        -- 8) Cập nhật số lượng tồn kho trong bảng SAN_PHAM cho tất cả thuốc trong đơn
        UPDATE sp
        SET sp.So_Luong = sp.So_Luong - i.so_luong
        FROM SAN_PHAM sp
        JOIN @items i ON sp.Ma_SP = i.ma_sp;

        COMMIT;

        -- Trả kết quả về cho Backend/Frontend
        SELECT 1 AS success, @ma_hd AS ma_hd, @ma_dt AS ma_dt, @tong_tien AS tong_tien;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        DECLARE @msg NVARCHAR(4000) = ERROR_MESSAGE();
        THROW 50099, @msg, 1;
    END CATCH
END
GO
