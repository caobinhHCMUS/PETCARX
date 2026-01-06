USE [PetCareX];
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