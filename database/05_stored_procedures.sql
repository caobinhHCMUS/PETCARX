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


-- 6. Xem hồ sơ thú cưng và thông tin chủ nuôi.
CREATE OR ALTER PROCEDURE sp_HoSoThuCung
    @Ma_PET varchar(10) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @Ma_PET IS NULL
    BEGIN
        -- Lấy tất cả thú cưng
        SELECT 
            tc.Ma_PET,
            tc.Ten_PET,
            tc.Ten_Loai,
            tc.Giong,
            tc.Gioi_Tinh,
            tc.Ngay_Sinh,
            tc.Tinh_Trang_Suc_Khoe,
            kh.Ma_KH,
            kh.Ho_Ten AS TenChuNuoi,
            kh.SDT,
            kh.Email,
            kh.Ngay_Sinh AS NgaySinhChu,
            kh.Gioi_Tinh AS GioiTinhChu,
            kh.Cap_Do_Hoi_Vien,
            kh.Tong_Chi_Tieu
        FROM THU_CUNG tc
        INNER JOIN KHACH_HANG kh ON tc.Ma_KH = kh.Ma_KH
        ORDER BY tc.Ma_PET;
    END
    ELSE
    BEGIN
        -- Lấy thông tin một thú cưng cụ thể
        SELECT 
            tc.Ma_PET,
            tc.Ten_PET,
            tc.Ten_Loai,
            tc.Giong,
            tc.Gioi_Tinh,
            tc.Ngay_Sinh,
            tc.Tinh_Trang_Suc_Khoe,
            kh.Ma_KH,
            kh.Ho_Ten AS TenChuNuoi,
            kh.SDT,
            kh.Email,
            kh.Ngay_Sinh AS NgaySinhChu,
            kh.Gioi_Tinh AS GioiTinhChu,
            kh.Cap_Do_Hoi_Vien,
            kh.Tong_Chi_Tieu
        FROM THU_CUNG tc
        INNER JOIN KHACH_HANG kh ON tc.Ma_KH = kh.Ma_KH
        WHERE tc.Ma_PET = @Ma_PET;
        
        IF @@ROWCOUNT = 0
        BEGIN
            PRINT N'Không tìm thấy thú cưng với mã: ' + @Ma_PET;
        END
    END
END
GO

-- 7. Tạo hoặc cập nhật bệnh án (triệu chứng, chẩn đoán).
CREATE OR ALTER PROCEDURE sp_TaoBenhAn
    @Ma_HD varchar(10),
    @Ma_PET varchar(10),
    @Bac_Si varchar(10),
    @Trieu_Chung nvarchar(max),
    @Chuan_Doan nvarchar(max),
    @Ngay_Hen_Tai_Kham datetime = NULL,
    @Thanh_Tien decimal(18,2) = 0
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Kiểm tra thú cưng tồn tại
        IF NOT EXISTS (SELECT 1 FROM THU_CUNG WHERE Ma_PET = @Ma_PET)
        BEGIN
            RAISERROR(N'Thú cưng không tồn tại.', 16, 1);
        END
        
        -- Kiểm tra bác sĩ tồn tại và là bác sĩ
        IF NOT EXISTS (SELECT 1 FROM NHAN_VIEN WHERE Ma_NV = @Bac_Si AND Vai_Tro = N'Bác si')
        BEGIN
            RAISERROR(N'Nhân viên không phải là bác sĩ hoặc không tồn tại.', 16, 1);
        END
        
        -- Kiểm tra hóa đơn đã có trong CT_KHAM_BENH chưa
        IF EXISTS (SELECT 1 FROM CT_KHAM_BENH WHERE Ma_HD = @Ma_HD)
        BEGIN
            -- Cập nhật bệnh án
            UPDATE CT_KHAM_BENH
            SET 
                Ma_PET = @Ma_PET,
                Ngay_Kham = GETDATE(),
                Trieu_Chung = @Trieu_Chung,
                Chuan_Doan = @Chuan_Doan,
                Ngay_Hen_Tai_Kham = @Ngay_Hen_Tai_Kham,
                Bac_Si = @Bac_Si,
                Thanh_Tien = @Thanh_Tien
            WHERE Ma_HD = @Ma_HD;
            
            PRINT N'Đã cập nhật bệnh án thành công cho hóa đơn: ' + @Ma_HD;
        END
        ELSE
        BEGIN
            -- Tạo mới bệnh án
            INSERT INTO CT_KHAM_BENH (
                Ma_HD,
                Ma_PET,
                Ngay_Kham,
                Trieu_Chung,
                Chuan_Doan,
                Ngay_Hen_Tai_Kham,
                Bac_Si,
                Thanh_Tien
            )
            VALUES (
                @Ma_HD,
                @Ma_PET,
                GETDATE(),
                @Trieu_Chung,
                @Chuan_Doan,
                @Ngay_Hen_Tai_Kham,
                @Bac_Si,
                @Thanh_Tien
            );
            
            PRINT N'Đã tạo mới bệnh án thành công cho hóa đơn: ' + @Ma_HD;
        END
        
        -- Cập nhật tình trạng sức khỏe thú cưng
        UPDATE THU_CUNG
        SET Tinh_Trang_Suc_Khoe = N'Đã khám bệnh - Chẩn đoán: ' + LEFT(@Chuan_Doan, 100)
        WHERE Ma_PET = @Ma_PET;
        
        -- Trả về kết quả thành công
        SELECT 'Success' AS Status, N'Thao tác thành công' AS Message;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        -- Hủy bỏ toàn bộ các bước đã thực hiện (Rollback)
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        -- Trả về thông tin lỗi
        SELECT 'Failed' AS Status, ERROR_MESSAGE() AS Message;
    END CATCH
END
GO

-- 8. Ghi nhận tiêm lẻ cho thú cưng.
CREATE OR ALTER PROCEDURE sp_TiemLe
    @Ma_HD varchar(10),
    @Ma_PET varchar(10),
    @Ma_Vacxin varchar(10),
    @Lieu_Luong nvarchar(50) = NULL,
    @Thanh_Tien decimal(18,2) = 0
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Kiểm tra thú cưng tồn tại
        IF NOT EXISTS (SELECT 1 FROM THU_CUNG WHERE Ma_PET = @Ma_PET)
        BEGIN
            RAISERROR(N'Thú cưng không tồn tại.', 16, 1);
        END
        
        -- Kiểm tra vắc xin tồn tại
        IF NOT EXISTS (SELECT 1 FROM VAC_XIN WHERE Ma_Vacxin = @Ma_Vacxin)
        BEGIN
            RAISERROR(N'Vắc xin không tồn tại.', 16, 1);
        END
        
        -- Kiểm tra trùng tiêm cùng vắc xin trong ngày
        IF EXISTS (
            SELECT 1 
            FROM CT_TIEM_LE 
            WHERE Ma_PET = @Ma_PET 
                AND Ma_Vacxin = @Ma_Vacxin 
                AND CONVERT(DATE, Ngay_Tiem) = CONVERT(DATE, GETDATE())
        )
        BEGIN
            RAISERROR(N'Thú cưng đã được tiêm vắc xin này hôm nay.', 16, 1);
        END
        
        -- Ghi nhận tiêm lẻ
        INSERT INTO CT_TIEM_LE (
            Ma_HD,
            Ma_PET,
            Ma_Vacxin,
            Ngay_Tiem,
            Lieu_Luong,
            Thanh_Tien
        )
        VALUES (
            @Ma_HD,
            @Ma_PET,
            @Ma_Vacxin,
            GETDATE(),
            @Lieu_Luong,
            @Thanh_Tien
        );
        
        -- Cập nhật tình trạng sức khỏe thú cưng
        DECLARE @TenVacxin nvarchar(100);
        SELECT @TenVacxin = Ten_Vacxin FROM VAC_XIN WHERE Ma_Vacxin = @Ma_Vacxin;
        
        UPDATE THU_CUNG
        SET Tinh_Trang_Suc_Khoe = 
            ISNULL(Tinh_Trang_Suc_Khoe + '; ', '') + 
            N'Đã tiêm ' + @TenVacxin + ' (' + CONVERT(nvarchar(10), GETDATE(), 103) + ')'
        WHERE Ma_PET = @Ma_PET;
        
        -- Trả về kết quả thành công
        SELECT 'Success' AS Status, N'Tiêm lẻ thành công' AS Message;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        -- Hủy bỏ toàn bộ các bước đã thực hiện (Rollback)
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        -- Trả về thông tin lỗi
        SELECT 'Failed' AS Status, ERROR_MESSAGE() AS Message;
    END CATCH
END
GO

-- 9. Tạo lịch tiêm theo gói tiêm đã đăng ký.
CREATE OR ALTER PROCEDURE sp_TaoLichTiemGoi
    @Ma_PET varchar(10),
    @Ma_GT varchar(10),
    @Ma_HD varchar(10)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Kiểm tra thú cưng tồn tại
        IF NOT EXISTS (SELECT 1 FROM THU_CUNG WHERE Ma_PET = @Ma_PET)
        BEGIN
            RAISERROR(N'Thú cưng không tồn tại.', 16, 1);
        END
        
        -- Kiểm tra gói tiêm tồn tại
        IF NOT EXISTS (SELECT 1 FROM GOI_TIEM WHERE Ma_GT = @Ma_GT)
        BEGIN
            RAISERROR(N'Gói tiêm không tồn tại.', 16, 1);
        END
        
        -- Đăng ký gói tiêm nếu chưa đăng ký
        IF NOT EXISTS (SELECT 1 FROM DANGKY_GOITIEM WHERE MA_PET = @Ma_PET AND ma_GT = @Ma_GT)
        BEGIN
            INSERT INTO DANGKY_GOITIEM (MA_PET, ma_GT)
            VALUES (@Ma_PET, @Ma_GT);
            PRINT N'Đã đăng ký gói tiêm ' + @Ma_GT + ' cho thú cưng ' + @Ma_PET;
        END
        
        -- Kiểm tra xem đã có lịch tiêm cho gói này chưa
        IF EXISTS (SELECT 1 FROM CT_TIEM_GOI WHERE Ma_PET = @Ma_PET AND Ma_GT = @Ma_GT AND Ma_HD = @Ma_HD)
        BEGIN
            PRINT N'Đã có lịch tiêm gói ' + @Ma_GT + ' cho thú cưng ' + @Ma_PET + ' trong hóa đơn ' + @Ma_HD;
            
            -- Trả về lịch tiêm hiện có
            SELECT 
                Ma_HD,
                Ma_PET,
                Ma_GT,
                Ma_Vacxin,
                Ngay_Hen_Tiem,
                Ngay_Tiem_Thuc_Te,
                so_mui_tiem_con_lai,
                CASE 
                    WHEN Ngay_Tiem_Thuc_Te IS NOT NULL THEN N'Đã tiêm'
                    WHEN so_mui_tiem_con_lai > 0 THEN N'Chờ tiêm'
                    ELSE N'Hoàn thành'
                END AS TrangThai
            FROM CT_TIEM_GOI
            WHERE Ma_PET = @Ma_PET AND Ma_GT = @Ma_GT AND Ma_HD = @Ma_HD
            ORDER BY Ngay_Hen_Tiem;
            
            SELECT 'Success' AS Status, N'Đã có lịch tiêm' AS Message;
            
            COMMIT TRANSACTION;
            RETURN;
        END
        
        -- Lấy danh sách vắc xin trong gói từ bảng SOMUITIEM
        DECLARE @NgayBatDau datetime = GETDATE();
        DECLARE @KhoangCachNgay int = 30; -- Mặc định 30 ngày giữa các mũi
        
        INSERT INTO CT_TIEM_GOI (
            Ma_HD,
            Ma_PET,
            Ma_GT,
            Ma_Vacxin,
            Ngay_Hen_Tiem,
            Ngay_Tiem_Thuc_Te,
            so_mui_tiem_con_lai
        )
        SELECT 
            @Ma_HD,
            @Ma_PET,
            @Ma_GT,
            smt.Ma_Vacxin,
            DATEADD(DAY, (ROW_NUMBER() OVER (ORDER BY smt.Ma_Vacxin) - 1) * @KhoangCachNgay, @NgayBatDau) AS Ngay_Hen_Tiem,
            NULL AS Ngay_Tiem_Thuc_Te,
            smt.SoMuiTiem
        FROM SOMUITIEM smt
        WHERE smt.Ma_GT = @Ma_GT;
        
        PRINT N'Đã tạo lịch tiêm gói ' + @Ma_GT + ' cho thú cưng ' + @Ma_PET;
        
        -- Trả về lịch tiêm vừa tạo
        SELECT 
            ctg.Ma_HD,
            ctg.Ma_PET,
            ctg.Ma_GT,
            gt.Ten_GT,
            ctg.Ma_Vacxin,
            vx.Ten_Vacxin,
            ctg.Ngay_Hen_Tiem,
            ctg.Ngay_Tiem_Thuc_Te,
            ctg.so_mui_tiem_con_lai,
            CASE 
                WHEN ctg.Ngay_Tiem_Thuc_Te IS NOT NULL THEN N'Đã tiêm'
                WHEN ctg.so_mui_tiem_con_lai > 0 THEN N'Chờ tiêm'
                ELSE N'Hoàn thành'
            END AS TrangThai
        FROM CT_TIEM_GOI ctg
        INNER JOIN GOI_TIEM gt ON ctg.Ma_GT = gt.Ma_GT
        INNER JOIN VAC_XIN vx ON ctg.Ma_Vacxin = vx.Ma_Vacxin
        WHERE ctg.Ma_PET = @Ma_PET 
            AND ctg.Ma_GT = @Ma_GT
            AND ctg.Ma_HD = @Ma_HD
        ORDER BY ctg.Ngay_Hen_Tiem;
        
        -- Trả về kết quả thành công
        SELECT 'Success' AS Status, N'Tạo lịch tiêm thành công' AS Message;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        -- Hủy bỏ toàn bộ các bước đã thực hiện (Rollback)
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        -- Trả về thông tin lỗi
        SELECT 'Failed' AS Status, ERROR_MESSAGE() AS Message;
    END CATCH
END
GO
