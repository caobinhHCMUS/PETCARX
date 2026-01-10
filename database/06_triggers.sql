USE [PETCARX];
GO

-- 1. Membership & Loyalty Implementation (Trigger on HOA_DON)
PRINT 'Creating trg_UpdateMembershipAndLoyalty...';
GO
CREATE OR ALTER TRIGGER [dbo].[trg_UpdateMembershipAndLoyalty]
ON [dbo].[HOA_DON]
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Update Tong_Chi_Tieu and Diem_Loyalty for the customer
    UPDATE kh
    SET 
        kh.Tong_Chi_Tieu = (SELECT ISNULL(SUM(Tong_Tien), 0) FROM HOA_DON WHERE Ma_KH = kh.Ma_KH),
        kh.Diem_Loyalty = kh.Diem_Loyalty + (i.Tong_Tien / 50000)
    FROM KHACH_HANG kh
    INNER JOIN inserted i ON kh.Ma_KH = i.Ma_KH;

    -- Update Membership Level based on Tong_Chi_Tieu
    UPDATE kh
    SET kh.Cap_Do_Hoi_Vien = 
        CASE 
            WHEN kh.Tong_Chi_Tieu >= 12000000 THEN N'VIP'
            WHEN kh.Tong_Chi_Tieu >= 5000000 THEN N'Thân thiết'
            ELSE N'Cơ bản'
        END
    FROM KHACH_HANG kh
    INNER JOIN inserted i ON kh.Ma_KH = i.Ma_KH;
END;
GO

-- 2. Inventory Management (Trigger on CT_MUA_HANG)
PRINT 'Creating trg_UpdateInventory...';
GO
CREATE OR ALTER TRIGGER [dbo].[trg_UpdateInventory]
ON [dbo].[CT_MUA_HANG]
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Decrease So_Luong in SAN_PHAM
    UPDATE sp
    SET sp.So_Luong = sp.So_Luong - i.So_Luong
    FROM SAN_PHAM sp
    INNER JOIN inserted i ON sp.Ma_SP = i.Ma_SP;

    -- Prevent negative stock (will roll back if So_Luong becomes < 0 due to CHK_TonKho constraint)
END;
GO

-- 3. Employee Age Validation (Constraint on NHAN_VIEN)
PRINT 'Adding CHK_NhanVien_Tuoi constraint...';
GO
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CHK_NhanVien_Tuoi')
BEGIN
    ALTER TABLE [dbo].[NHAN_VIEN] 
    ADD CONSTRAINT [CHK_NhanVien_Tuoi] 
    CHECK (DATEDIFF(year, Ngay_Sinh, Ngay_Vao) >= 18);
END;
GO

-- 4. Unified Business Rules Update
PRINT 'Standardizing Roles and Statuses...';
GO
-- Update existing constraints if necessary
-- Ensure Bác sĩ role is correctly spelled (user spec says 'Bác sĩ', schema had 'Bác si')
IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CHK_Vai_Tro')
BEGIN
    ALTER TABLE [dbo].[NHAN_VIEN] DROP CONSTRAINT [CHK_Vai_Tro];
END;
GO
ALTER TABLE [dbo].[NHAN_VIEN] WITH CHECK ADD CONSTRAINT [CHK_Vai_Tro] 
CHECK ([Vai_Tro] IN (N'Bác sĩ', N'Bán hàng', N'Tiếp tân', N'Quản lý'));
GO

PRINT 'Business Logic Implementation Complete!';
GO

-- =============================================
-- Phase 1.5: Triggers cho CRUD
-- =============================================

-- 1. Trigger cập nhật Ngay_Cap_Nhat cho SAN_PHAM
CREATE OR ALTER TRIGGER [dbo].[trg_SanPham_Update_Time]
ON [dbo].[SAN_PHAM]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE(Ngay_Cap_Nhat)
    BEGIN
        UPDATE sp
        SET sp.Ngay_Cap_Nhat = GETDATE()
        FROM [dbo].[SAN_PHAM] sp
        INNER JOIN inserted i ON sp.Ma_SP = i.Ma_SP;
    END
END;
GO

-- 2. Trigger cập nhật Ngay_Cap_Nhat cho VAC_XIN
CREATE OR ALTER TRIGGER [dbo].[trg_VacXin_Update_Time]
ON [dbo].[VAC_XIN]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE(Ngay_Cap_Nhat)
    BEGIN
        UPDATE vx
        SET vx.Ngay_Cap_Nhat = GETDATE()
        FROM [dbo].[VAC_XIN] vx
        INNER JOIN inserted i ON vx.Ma_Vacxin = i.Ma_Vacxin;
    END
END;
GO

-- 3. Trigger cập nhật Ngay_Cap_Nhat cho GOI_TIEM
CREATE OR ALTER TRIGGER [dbo].[trg_GoiTiem_Update_Time]
ON [dbo].[GOI_TIEM]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE(Ngay_Cap_Nhat)
    BEGIN
        UPDATE gt
        SET gt.Ngay_Cap_Nhat = GETDATE()
        FROM [dbo].[GOI_TIEM] gt
        INNER JOIN inserted i ON gt.Ma_GT = i.Ma_GT;
    END
END;
GO

-- 4. Trigger tự động cập nhật trạng thái sản phẩm khi So_Luong = 0
CREATE OR ALTER TRIGGER [dbo].[trg_SanPham_AutoStatus]
ON [dbo].[SAN_PHAM]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(So_Luong)
    BEGIN
        UPDATE sp
        SET sp.Trang_Thai = CASE WHEN sp.So_Luong = 0 THEN N'Hết hàng' ELSE N'Còn hàng' END
        FROM [dbo].[SAN_PHAM] sp
        INNER JOIN inserted i ON sp.Ma_SP = i.Ma_SP
        WHERE sp.Trang_Thai IN (N'Còn hàng', N'Hết hàng'); -- Don't change if 'Ngừng kinh doanh'
    END
END;
GO

-- 5. Trigger kiểm tra Han_Su_Dung và cập nhật trạng thái Vaccin
CREATE OR ALTER TRIGGER [dbo].[trg_VacXin_AutoStatus]
ON [dbo].[VAC_XIN]
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE vx
    SET vx.Trang_Thai = CASE 
                            WHEN vx.Han_Su_Dung < GETDATE() THEN N'Hết hạn' 
                            WHEN vx.So_Luong = 0 THEN N'Hết hàng' 
                            ELSE N'Còn hàng' 
                        END
    FROM [dbo].[VAC_XIN] vx
    INNER JOIN inserted i ON vx.Ma_Vacxin = i.Ma_Vacxin;
END;
GO

-- 6. Constrainst cho Gia > 0 (Nếu chưa có)
-- Thay vì trigger, dùng CHECK constraint cho hiệu năng tốt hơn
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CHK_SanPham_Gia')
    ALTER TABLE [dbo].[SAN_PHAM] ADD CONSTRAINT [CHK_SanPham_Gia] CHECK (Gia > 0);

IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CHK_VacXin_Gia')
    ALTER TABLE [dbo].[VAC_XIN] ADD CONSTRAINT [CHK_VacXin_Gia] CHECK (Gia > 0);

IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CHK_GoiTiem_Gia')
    ALTER TABLE [dbo].[GOI_TIEM] ADD CONSTRAINT [CHK_GoiTiem_Gia] CHECK (Gia > 0);
GO

PRINT 'CRUD Triggers and Constraints created successfully.';
GO