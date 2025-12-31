-- stored procedures
--tìm kiếm sản phẩm theo tên.
CREATE PROCEDURE TimKiemSanPham
    @Ten_SP nvarchar(100)
AS
BEGIN
    SELECT ten_sp, loai_sp, so_luong, gia FROM SAN_PHAM WHERE Ten_SP LIKE '%' + @Ten_SP + '%'
END

go 

CREATE PROCEDURE datmuasanpham
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
        -- kiểm tra tồn kho.
        DECLARE @TonKhoHienTai int;
        SELECT @TonKhoHienTai = So_Luong FROM SAN_PHAM WHERE Ma_SP = @Ma_SP;

        IF @TonKhoHienTai IS NULL
        BEGIN
            RAISERROR('Sản phẩm không tồn tại.', 16, 1);
        END

        IF @TonKhoHienTai < @So_Luong
        BEGIN
            RAISERROR('Số lượng tồn kho không đủ để thực hiện giao dịch.', 16, 1);
        END

        -- 2. Chèn vào bảng Hóa đơn
        INSERT INTO Hoa_don (Ma_kh, NV_lap, Hinhthuc_tt, Ngay_lap)
        VALUES (@Ma_KH, @Ma_NV, @Hinhthuc_tt, GETDATE());

        -- Lấy mã hóa đơn vừa tạo
        DECLARE @New_Ma_HD int = SCOPE_IDENTITY();

        -- 3. Chèn vào bảng Chi tiết mua hàng
        INSERT INTO CT_Mua_hang (Ma_HD, Ma_SP, So_Luong)
        VALUES (@New_Ma_HD, @Ma_SP, @So_Luong);

        -- 4. Trừ số lượng tồn kho của sản phẩm
        UPDATE SAN_PHAM 
        SET So_Luong = So_Luong - @So_Luong 
        WHERE Ma_SP = @Ma_SP;

        -- Nếu chạy đến đây không có lỗi, xác nhận lưu tất cả vào DB
        COMMIT TRANSACTION;

        -- Trả về kết quả thành công cho Backend
        SELECT 
            @New_Ma_HD AS MaHD_Moi, 
            'Success' AS Status, 
            N'Đặt hàng thành công' AS Message;

    END TRY
    BEGIN CATCH
        -- Hủy bỏ toàn bộ các bước đã thực hiện (Rollback)
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        -- Trả về thông tin lỗi cho Backend xử lý
        SELECT 
            'Failed' AS Status,
            ERROR_MESSAGE() AS Message;
    END CATCH
END

GO

--xem lịch sử mua/khám cho thú cưng.

CREATE PROCEDURE XemLichSuChoPet
    @Ma_kh varchar(10)
AS
BEGIN

    --lịch sử mua hàng
    SELECT hd.Ma_HD, hd.Ngay_lap, sp.Ten_SP, ctmh.So_Luong
    FROM HOA_DON hd
    LEFT JOIN CT_MUA_HANG ctmh ON hd.Ma_HD = ctmh.Ma_HD
    LEFT JOIN SAN_PHAM sp ON ctmh.Ma_SP = sp.Ma_SP
    WHERE hd.Ma_kh = @Ma_kh
    ORDER BY hd.Ngay_lap DESC;
    -- lịch sử khám bệnh
    select hd.Ngay_Lap, bs.ho_ten, ctkb.Ma_PET, ctkb.Chuan_Doan
    from hoa_don hd
    left join CT_KHAM_BENH ctkb on hd.Ma_HD = ctkb.Ma_HD
    left join ct_BAC_SI bs on ctkb.Bac_Si = bs.Ma_nv
    where hd.Ma_kh = @Ma_kh
    order by hd.Ngay_lap desc;

    -- lịch sử tiêm
    select hd.Ngay_Lap, ctl.Ma_PET as Ma_PET_Le, ctl.Ma_Vacxin as Ma_Vacxin_Le, ctg.Ma_PET as Ma_PET_Goi, ctg.Ma_Vacxin as Ma_Vacxin_Goi
    from hoa_don hd
    left join CT_TIEM_LE ctl on hd.Ma_HD = ctl.Ma_HD
    left join CT_TIEM_GOI ctg on hd.Ma_HD = ctg.Ma_HD
    where hd.Ma_kh = @Ma_kh
END
GO
-- tra cưu lịch khám, có trể truyền vào 1 trong 3 tham số.

CREATE PROCEDURE TraCuuLichBacSi
    @Ho_Ten nvarchar(100) = NULL, -- Tham số tùy chọn
    @Ngay_Kham datetime = NULL,   -- Tham số tùy chọn
    @Ca_lamviec int = NULL        -- Tham số tùy chọn
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        bs.Ho_Ten,
        lk.Ngay_Kham,
        lk.Ca_lamviec,
        lk.ghi_chu
    FROM lich_kham lk
    JOIN ct_Bac_Si bs ON lk.Ma_BS = bs.Ma_nv
    WHERE 
        -- Tra cứu theo tên (sử dụng LIKE để tìm kiếm tương đối)
        (@Ho_Ten IS NULL OR bs.Ho_Ten LIKE N'%' + @Ho_Ten + N'%')
        
        -- Tra cứu chính xác ngày (chỉ lấy phần Date để tránh lệch giờ phút giây)
        AND (@Ngay_Kham IS NULL OR CAST(lk.Ngay_Kham AS DATE) = CAST(@Ngay_Kham AS DATE))
        
        -- Tra cứu theo ca
        AND (@Ca_lamviec IS NULL OR lk.Ca_lamviec = @Ca_lamviec)
    ORDER BY lk.Ngay_Kham DESC, lk.Ca_lamviec ASC;
END

GO

-- đặt lịch khám.
CREATE PROCEDURE sp_DatLichKham
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

        -- 1. Kiểm tra ngày đặt có hợp lệ không (không cho đặt ngày đã qua)
        IF CAST(@Ngay_Dat AS DATE) < CAST(GETDATE() AS DATE)
        BEGIN
            RAISERROR(N'Không thể đặt lịch cho ngày trong quá khứ.', 16, 1);
        END

        -- 2. Kiểm tra xem Bác sĩ có lịch trực vào ngày/ca đó không
        -- Giả sử bảng lịch làm việc của bạn tên là Lich_Kham
        IF NOT EXISTS (
            SELECT 1 FROM Lich_Kham 
            WHERE Ma_BS = @Ma_BS 
              AND CAST(Ngay_Kham AS DATE) = CAST(@Ngay_Dat AS DATE) 
              AND Ca_lamviec = @Ca_lamviec
        )
        BEGIN
            RAISERROR(N'Bác sĩ không có lịch trực vào ca này.', 16, 1);
        END

        -- 3. Kiểm tra xem ca này bác sĩ đã có ai đặt chưa (Trạng thái khác 'Đã hủy')
        IF EXISTS (
            SELECT 1 FROM Phieu_Dat_Lich_Kham
            WHERE Ma_BS = @Ma_BS 
              AND CAST(Ngay_Dat AS DATE) = CAST(@Ngay_Dat AS DATE) 
              AND Ca_lamviec = @Ca_lamviec
              AND Trang_Thai <> N'Đã hủy'
        )
        BEGIN
            RAISERROR(N'Bác sĩ đã có lịch hẹn khác vào khung giờ này.', 16, 1);
        END

        -- 4. Nếu mọi thứ ổn, tiến hành Insert
        INSERT INTO Phieu_Dat_Lich_Kham (Ma_KH, Ma_PET, Ma_BS, Ca_lamviec, Ngay_Dat, Trang_Thai)
        VALUES (@Ma_KH, @Ma_PET, @Ma_BS, @Ca_lamviec, @Ngay_Dat, N'Chưa xác nhận');

        -- Trả về ID vừa tạo để Backend xử lý
        SELECT SCOPE_IDENTITY() AS Ma_Phieu_Moi, 'Success' AS Status;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        
        -- Trả về lỗi cho Backend
        SELECT 'Error' AS Status, ERROR_MESSAGE() AS Message;
    END CATCH
END