

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
--5. Thêm sản phẩm vào giỏ hàng
CREATE OR ALTER PROC sp_GioHang_Add
  @Ma_KH varchar(10),
  @Ma_SP varchar(10),
  @So_Luong int = 1
AS
BEGIN
  SET NOCOUNT ON;

  BEGIN TRY
    BEGIN TRAN;

    IF EXISTS (
      SELECT 1
      FROM GIO_HANG
      WHERE Ma_KH = @Ma_KH
        AND Ma_SP = @Ma_SP
    )
    BEGIN
      UPDATE GIO_HANG
      SET So_Luong = So_Luong + @So_Luong,
          Is_Selected = 1
      WHERE Ma_KH = @Ma_KH
        AND Ma_SP = @Ma_SP;
    END
    ELSE
    BEGIN
      INSERT INTO GIO_HANG (Ma_KH, Ma_SP, So_Luong, Is_Selected)
      VALUES (@Ma_KH, @Ma_SP, @So_Luong, 1);
    END

    COMMIT;
    SELECT 'Success' AS Status;
  END TRY
  BEGIN CATCH
    ROLLBACK;
    THROW;
  END CATCH
END
GO


--6. Xem giỏ hàng
CREATE OR ALTER PROC sp_GioHang_Get
  @Ma_KH varchar(10)
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    gh.Ma_SP,
    sp.Ten_SP,
    sp.Gia,
    gh.So_Luong,
    ISNULL(gh.Is_Selected, 0) AS Is_Selected
  FROM gio_hang gh
  JOIN SAN_PHAM sp ON sp.Ma_SP = gh.Ma_SP
  WHERE gh.Ma_KH = @Ma_KH;
END
GO


--7. cập nhật số lượng trong giỏ hàng
CREATE OR ALTER PROC sp_GioHang_UpdateQty
  @Ma_KH varchar(10),
  @Ma_SP varchar(10),
  @So_Luong int
AS
BEGIN
  SET NOCOUNT ON;

  IF @So_Luong <= 0
  BEGIN
    DELETE FROM gio_hang WHERE Ma_KH=@Ma_KH AND Ma_SP=@Ma_SP;
  END
  ELSE
  BEGIN
    UPDATE gio_hang
    SET So_Luong = @So_Luong
    WHERE Ma_KH=@Ma_KH AND Ma_SP=@Ma_SP;
  END

  SELECT 'Success' AS Status;
END
GO

--8. Xoá sản phẩm khỏi giỏ hàng
CREATE OR ALTER PROC sp_GioHang_Remove
  @Ma_KH varchar(10),
  @Ma_SP varchar(10)
AS
BEGIN
  SET NOCOUNT ON;

  DELETE FROM gio_hang
  WHERE Ma_KH=@Ma_KH AND Ma_SP=@Ma_SP;

  SELECT 'Success' AS Status;
END
GO
--9. bật/tắt thanh toán sản phẩm trong giỏ hàng
CREATE OR ALTER PROC sp_GioHang_ToggleSelect
  @Ma_KH varchar(10),
  @Ma_SP varchar(10),
  @Is_Selected bit
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE gio_hang
  SET Is_Selected = @Is_Selected
  WHERE Ma_KH=@Ma_KH AND Ma_SP=@Ma_SP;

  SELECT 'Success' AS Status;
END
GO

--10 . Thanh toán giỏ hàng.
CREATE OR ALTER PROC sp_GioHang_Checkout_Selected
  @Ma_KH varchar(10),
  @NV_Lap varchar(10) = NULL,
  @HinhThuc_TT nvarchar(50) = N'COD'
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @Ma_HD varchar(10);

  BEGIN TRY
    BEGIN TRAN;

    -- 1) Kiểm tra có item được chọn không
    IF NOT EXISTS (
      SELECT 1 FROM gio_hang
      WHERE Ma_KH = @Ma_KH AND ISNULL(Is_Selected,0) = 1
    )
    BEGIN
      ROLLBACK;
      SELECT 'Fail' AS Status, N'Chưa chọn sản phẩm để thanh toán' AS Message, NULL AS Ma_HD, CAST(0 AS decimal(18,2)) AS Tong_Tien;
      RETURN;
    END

    -- 2) Check tồn kho
    IF EXISTS (
      SELECT 1
      FROM gio_hang gh
      JOIN SAN_PHAM sp ON sp.Ma_SP = gh.Ma_SP
      WHERE gh.Ma_KH = @Ma_KH
        AND ISNULL(gh.Is_Selected,0) = 1
        AND sp.So_Luong < gh.So_Luong
    )
    BEGIN
      ROLLBACK;
      SELECT 'Fail' AS Status, N'Không đủ tồn kho cho một hoặc nhiều sản phẩm đã chọn' AS Message, NULL AS Ma_HD, CAST(0 AS decimal(18,2)) AS Tong_Tien;
      RETURN;
    END

    -- 3) Tạo mã hóa đơn HD00001
    SELECT @Ma_HD =
      'HD' + RIGHT('00000' + CAST(ISNULL(MAX(CAST(SUBSTRING(Ma_HD,3,5) AS int)),0)+1 AS varchar(5)),5)
    FROM HOA_DON WITH (UPDLOCK, HOLDLOCK);

    INSERT INTO HOA_DON(Ma_HD, NV_Lap, Ma_KH, Ngay_Lap, HinhThuc_TT, Tong_Tien, Trang_Thai)
    VALUES(@Ma_HD, @NV_Lap, @Ma_KH, GETDATE(), @HinhThuc_TT, 0, N'Đang xử lý');

    -- 4) Insert CT_MUA_HANG
    INSERT INTO CT_MUA_HANG(Ma_HD, Ma_SP, So_Luong, Thanh_Tien)
    SELECT
      @Ma_HD,
      gh.Ma_SP,
      gh.So_Luong,
      gh.So_Luong * sp.Gia
    FROM gio_hang gh
    JOIN SAN_PHAM sp ON sp.Ma_SP = gh.Ma_SP
    WHERE gh.Ma_KH = @Ma_KH AND ISNULL(gh.Is_Selected,0) = 1;

    -- 5) Trừ kho
    UPDATE sp
    SET sp.So_Luong = sp.So_Luong - gh.So_Luong
    FROM SAN_PHAM sp
    JOIN gio_hang gh ON gh.Ma_SP = sp.Ma_SP
    WHERE gh.Ma_KH = @Ma_KH AND ISNULL(gh.Is_Selected,0) = 1;

    -- 6) Update tổng tiền
    DECLARE @Tong_Tien decimal(18,2);
    SELECT @Tong_Tien = ISNULL(SUM(Thanh_Tien), 0)
    FROM CT_MUA_HANG
    WHERE Ma_HD = @Ma_HD;

    UPDATE HOA_DON
    SET Tong_Tien = @Tong_Tien
    WHERE Ma_HD = @Ma_HD;

    -- 7) Xóa item đã thanh toán khỏi giỏ
    DELETE FROM gio_hang
    WHERE Ma_KH = @Ma_KH AND ISNULL(Is_Selected,0) = 1;

    COMMIT;

    SELECT 'Success' AS Status, N'Tạo hóa đơn thành công' AS Message, @Ma_HD AS Ma_HD, @Tong_Tien AS Tong_Tien;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    -- Trả lỗi dạng dễ debug (backend có thể show message)
    SELECT 'Fail' AS Status, ERROR_MESSAGE() AS Message, NULL AS Ma_HD, CAST(0 AS decimal(18,2)) AS Tong_Tien;
  END CATCH
END
GO


--proc xem lịch sử mua hàng của khách
CREATE OR ALTER PROCEDURE dbo.sp_KH_GetOrderHistory
    @Ma_KH varchar(10)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        Ma_HD,
        NV_Lap,
        Ma_KH,
        Ngay_Lap,
        HinhThuc_TT,
        Khuyen_Mai,
        Tong_Tien,
        Trang_Thai,
        Loai_Nghiep_Vu
    FROM dbo.HOA_DON
    WHERE Ma_KH = @Ma_KH
    ORDER BY Ngay_Lap DESC;
END
GO


-- lấy danh sách thú cưng theo mã kh
CREATE OR ALTER PROCEDURE dbo.sp_KH_GetPets
    @Ma_KH varchar(10)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        Ma_PET,
        Ma_KH,
        Ten_PET,
        Ten_Loai,
        Giong,
        Gioi_Tinh,
        Ngay_Sinh,
        Tinh_Trang_Suc_Khoe,
        Mau_Sac
    FROM dbo.THU_CUNG
    WHERE Ma_KH = @Ma_KH
    ORDER BY Ma_PET DESC;
END
GO

-- thêm thú cưng mới 
CREATE OR ALTER PROCEDURE dbo.sp_KH_CreatePet
  @Ma_KH varchar(10),
  @Ten_PET nvarchar(50),
  @Ten_Loai nvarchar(50) = NULL,
  @Giong nvarchar(50) = NULL,
  @Gioi_Tinh nvarchar(10) = NULL,
  @Ngay_Sinh date = NULL,
  @Tinh_Trang_Suc_Khoe nvarchar(255) = NULL,
  @Mau_Sac nvarchar(50) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @NextNum int;
  DECLARE @NewID varchar(10);

  BEGIN TRAN;

  -- Khóa phạm vi đọc để tránh 2 request cùng lấy chung MAX
  SELECT @NextNum =
      ISNULL(MAX(CAST(SUBSTRING(Ma_PET, 3, 5) AS int)), 0) + 1
  FROM dbo.THU_CUNG WITH (UPDLOCK, HOLDLOCK)
  WHERE Ma_PET LIKE 'TC%';

  -- TC + 5 số
  SET @NewID = 'TC' + RIGHT('00000' + CAST(@NextNum AS varchar(5)), 5);

  INSERT INTO dbo.THU_CUNG (
    Ma_PET, Ma_KH, Ten_PET, Ten_Loai, Giong, Gioi_Tinh, Ngay_Sinh, Tinh_Trang_Suc_Khoe, Mau_Sac
  )
  VALUES (
    @NewID, @Ma_KH, @Ten_PET, @Ten_Loai, @Giong, @Gioi_Tinh, @Ngay_Sinh,
    ISNULL(@Tinh_Trang_Suc_Khoe, N'Tốt'),
    @Mau_Sac
  );

  COMMIT TRAN;

  SELECT * FROM dbo.THU_CUNG WHERE Ma_PET = @NewID;
END
GO



--câp nhật thú cững
CREATE OR ALTER PROCEDURE dbo.sp_KH_UpdatePet
    @Ma_KH varchar(10),
    @Ma_PET varchar(10),
    @Ten_PET nvarchar(50) = NULL,
    @Ten_Loai nvarchar(50) = NULL,
    @Giong nvarchar(50) = NULL,
    @Gioi_Tinh nvarchar(10) = NULL,
    @Ngay_Sinh date = NULL,
    @Tinh_Trang_Suc_Khoe nvarchar(255) = NULL,
    @Mau_Sac nvarchar(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.THU_CUNG WHERE Ma_PET = @Ma_PET AND Ma_KH = @Ma_KH)
    BEGIN
        RAISERROR(N'Không tìm thấy thú cưng hoặc bạn không có quyền cập nhật.', 16, 1);
        RETURN;
    END

    UPDATE dbo.THU_CUNG
    SET
        Ten_PET = COALESCE(@Ten_PET, Ten_PET),
        Ten_Loai = COALESCE(@Ten_Loai, Ten_Loai),
        Giong = COALESCE(@Giong, Giong),
        Gioi_Tinh = COALESCE(@Gioi_Tinh, Gioi_Tinh),
        Ngay_Sinh = COALESCE(@Ngay_Sinh, Ngay_Sinh),
        Tinh_Trang_Suc_Khoe = COALESCE(@Tinh_Trang_Suc_Khoe, Tinh_Trang_Suc_Khoe),
        Mau_Sac = COALESCE(@Mau_Sac, Mau_Sac)
    WHERE Ma_PET = @Ma_PET AND Ma_KH = @Ma_KH;

    SELECT * FROM dbo.THU_CUNG WHERE Ma_PET = @Ma_PET;
END
GO


--xóa thú cưng
CREATE OR ALTER PROCEDURE dbo.sp_KH_DeletePet
    @Ma_KH varchar(10),
    @Ma_PET varchar(10)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.THU_CUNG WHERE Ma_PET = @Ma_PET AND Ma_KH = @Ma_KH)
    BEGIN
        RAISERROR(N'Không tìm thấy thú cưng hoặc bạn không có quyền xóa.', 16, 1);
        RETURN;
    END

    DELETE FROM dbo.THU_CUNG
    WHERE Ma_PET = @Ma_PET AND Ma_KH = @Ma_KH;

    SELECT 1 AS Deleted;
END
GO


-- lấy danh sách bác sĩ được phân lịch làm việc theo ngày và ca
CREATE PROCEDURE dbo.sp_KH_GetAvailableDoctors
    @Ngay_Kham DATE,
    @Ca_lamviec INT
AS
BEGIN
    SELECT 
        BS.Ma_BS, 
        BS.Ho_Ten, 
        BS.SDT, 
        BS.So_Nam_Kinh_Nghiem,
        BS.Bang_Cap
    FROM dbo.Bac_Si BS
    INNER JOIN dbo.LICH_KHAM LK ON BS.Ma_BS = LK.Ma_BS
    WHERE CAST(LK.Ngay_Kham AS DATE) = @Ngay_Kham 
      AND LK.Ca_lamviec = @Ca_lamviec
END
GO

-- tạo và Lưu phiếu đặt lịch
CREATE PROCEDURE dbo.sp_KH_CreateBooking
    @Ma_KH VARCHAR(10),
    @Ma_PET VARCHAR(10),
    @Ma_BS VARCHAR(10),
    @Ca_lamviec INT,
    @Ngay_Dat DATE
AS
BEGIN
    INSERT INTO dbo.PHIEU_DAT_LICH_KHAM (Ma_KH, Ma_PET, Ma_BS, Ca_lamviec, Ngay_Dat)
    VALUES (@Ma_KH, @Ma_PET, @Ma_BS, @Ca_lamviec, @Ngay_Dat);
    
    SELECT SCOPE_IDENTITY() AS NewBookingID;
END
GO