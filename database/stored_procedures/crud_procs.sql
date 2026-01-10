
-- =============================================
-- SECTION: SAN_PHAM (Products)
-- =============================================

-- 1. sp_GetAllProducts
CREATE OR ALTER PROCEDURE [dbo].[sp_GetAllProducts]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM [dbo].[SAN_PHAM] ORDER BY [Ngay_Tao] DESC;
END;
GO

-- 2. sp_GetProductById
CREATE OR ALTER PROCEDURE [dbo].[sp_GetProductById]
    @Ma_SP varchar(10)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM [dbo].[SAN_PHAM] WHERE [Ma_SP] = @Ma_SP;
END;
GO

-- 3. sp_CreateProduct
CREATE OR ALTER PROCEDURE [dbo].[sp_CreateProduct]
    @Ma_SP varchar(10),
    @Ten_SP nvarchar(100),
    @Loai_SP nvarchar(50),
    @Gia decimal(18, 2),
    @Don_Vi_Tinh nvarchar(20),
    @So_Luong int,
    @Mo_Ta nvarchar(max) = NULL,
    @Hinh_Anh varchar(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO [dbo].[SAN_PHAM] (Ma_SP, Ten_SP, Loai_SP, Gia, Don_Vi_Tinh, So_Luong, Mo_Ta, Hinh_Anh, Trang_Thai, Ngay_Tao)
    VALUES (@Ma_SP, @Ten_SP, @Loai_SP, @Gia, @Don_Vi_Tinh, @So_Luong, @Mo_Ta, @Hinh_Anh, N'Còn hàng', GETDATE());
END;
GO

-- 4. sp_UpdateProduct
CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateProduct]
    @Ma_SP varchar(10),
    @Ten_SP nvarchar(100),
    @Loai_SP nvarchar(50),
    @Gia decimal(18, 2),
    @Don_Vi_Tinh nvarchar(20),
    @So_Luong int,
    @Mo_Ta nvarchar(max) = NULL,
    @Hinh_Anh varchar(255) = NULL,
    @Trang_Thai nvarchar(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[SAN_PHAM]
    SET Ten_SP = @Ten_SP,
        Loai_SP = @Loai_SP,
        Gia = @Gia,
        Don_Vi_Tinh = @Don_Vi_Tinh,
        So_Luong = @So_Luong,
        Mo_Ta = @Mo_Ta,
        Hinh_Anh = @Hinh_Anh,
        Trang_Thai = ISNULL(@Trang_Thai, Trang_Thai),
        Ngay_Cap_Nhat = GETDATE()
    WHERE Ma_SP = @Ma_SP;
END;
GO

-- 5. sp_DeleteProduct
CREATE OR ALTER PROCEDURE [dbo].[sp_DeleteProduct]
    @Ma_SP varchar(10)
AS
BEGIN
    SET NOCOUNT ON;
    -- For now, hard delete. Could be changed to soft delete by updating Trang_Thai
    DELETE FROM [dbo].[SAN_PHAM] WHERE Ma_SP = @Ma_SP;
END;
GO

-- 6. sp_UpdateProductStock
CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateProductStock]
    @Ma_SP varchar(10),
    @So_Luong int
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[SAN_PHAM]
    SET So_Luong = @So_Luong,
        Ngay_Cap_Nhat = GETDATE()
    WHERE Ma_SP = @Ma_SP;
END;
GO

-- 7. sp_GetProductsByCategory
CREATE OR ALTER PROCEDURE [dbo].[sp_GetProductsByCategory]
    @Loai_SP nvarchar(50)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM [dbo].[SAN_PHAM] WHERE Loai_SP = @Loai_SP;
END;
GO

-- 8. TimKiemSanPham (Search by Name)
CREATE OR ALTER PROCEDURE [dbo].[TimKiemSanPham]
    @Ten_SP nvarchar(100)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM [dbo].[SAN_PHAM] WHERE Ten_SP LIKE N'%' + @Ten_SP + N'%';
END;
GO

-- =============================================
-- SECTION: VAC_XIN (Vaccines)
-- =============================================

-- 1. sp_GetAllVaccines
CREATE OR ALTER PROCEDURE [dbo].[sp_GetAllVaccines]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM [dbo].[VAC_XIN] ORDER BY [Ngay_Tao] DESC;
END;
GO

-- 2. sp_GetVaccineById
CREATE OR ALTER PROCEDURE [dbo].[sp_GetVaccineById]
    @Ma_Vacxin varchar(10)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM [dbo].[VAC_XIN] WHERE [Ma_Vacxin] = @Ma_Vacxin;
END;
GO

-- 3. sp_CreateVaccine
CREATE OR ALTER PROCEDURE [dbo].[sp_CreateVaccine]
    @Ma_Vacxin varchar(10),
    @Ten_Vacxin nvarchar(100),
    @Xuat_Xu nvarchar(100),
    @Gia decimal(18, 2),
    @Mo_Ta nvarchar(max) = NULL,
    @Benh_Phong_Ngua nvarchar(255) = NULL,
    @Do_Tuoi_Su_Dung nvarchar(100) = NULL,
    @Han_Su_Dung date = NULL,
    @So_Luong int = 0
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO [dbo].[VAC_XIN] (Ma_Vacxin, Ten_Vacxin, Xuat_Xu, Gia, Mo_Ta, Benh_Phong_Ngua, Do_Tuoi_Su_Dung, Han_Su_Dung, So_Luong, Trang_Thai, Ngay_Tao)
    VALUES (@Ma_Vacxin, @Ten_Vacxin, @Xuat_Xu, @Gia, @Mo_Ta, @Benh_Phong_Ngua, @Do_Tuoi_Su_Dung, @Han_Su_Dung, @So_Luong, N'Còn hàng', GETDATE());
END;
GO

-- 4. sp_UpdateVaccine
CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateVaccine]
    @Ma_Vacxin varchar(10),
    @Ten_Vacxin nvarchar(100),
    @Xuat_Xu nvarchar(100),
    @Gia decimal(18, 2),
    @Mo_Ta nvarchar(max) = NULL,
    @Benh_Phong_Ngua nvarchar(255) = NULL,
    @Do_Tuoi_Su_Dung nvarchar(100) = NULL,
    @Han_Su_Dung date = NULL,
    @So_Luong int = NULL,
    @Trang_Thai nvarchar(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[VAC_XIN]
    SET Ten_Vacxin = @Ten_Vacxin,
        Xuat_Xu = @Xuat_Xu,
        Gia = @Gia,
        Mo_Ta = @Mo_Ta,
        Benh_Phong_Ngua = @Benh_Phong_Ngua,
        Do_Tuoi_Su_Dung = @Do_Tuoi_Su_Dung,
        Han_Su_Dung = @Han_Su_Dung,
        So_Luong = ISNULL(@So_Luong, So_Luong),
        Trang_Thai = ISNULL(@Trang_Thai, Trang_Thai),
        Ngay_Cap_Nhat = GETDATE()
    WHERE Ma_Vacxin = @Ma_Vacxin;
END;
GO

-- 5. sp_DeleteVaccine
CREATE OR ALTER PROCEDURE [dbo].[sp_DeleteVaccine]
    @Ma_Vacxin varchar(10)
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM [dbo].[VAC_XIN] WHERE Ma_Vacxin = @Ma_Vacxin;
END;
GO

-- 6. sp_SearchVaccines
CREATE OR ALTER PROCEDURE [dbo].[sp_SearchVaccines]
    @keyword nvarchar(100)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM [dbo].[VAC_XIN] 
    WHERE Ten_Vacxin LIKE N'%' + @keyword + N'%' 
       OR Xuat_Xu LIKE N'%' + @keyword + N'%'
       OR Benh_Phong_Ngua LIKE N'%' + @keyword + N'%';
END;
GO

-- 7. sp_GetExpiredVaccines
CREATE OR ALTER PROCEDURE [dbo].[sp_GetExpiredVaccines]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM [dbo].[VAC_XIN] WHERE Han_Su_Dung < GETDATE();
END;
GO

-- 8. sp_UpdateVaccineStock
CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateVaccineStock]
    @Ma_Vacxin varchar(10),
    @So_Luong int
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[VAC_XIN]
    SET So_Luong = @So_Luong,
        Ngay_Cap_Nhat = GETDATE()
    WHERE Ma_Vacxin = @Ma_Vacxin;
END;
GO

-- =============================================
-- SECTION: GOI_TIEM (Vaccine Packages)
-- =============================================

-- 1. sp_GetAllPackages
CREATE OR ALTER PROCEDURE [dbo].[sp_GetAllPackages]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM [dbo].[GOI_TIEM] ORDER BY [Ngay_Tao] DESC;
END;
GO

-- 2. sp_GetPackageById
CREATE OR ALTER PROCEDURE [dbo].[sp_GetPackageById]
    @Ma_GT varchar(10)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM [dbo].[GOI_TIEM] WHERE [Ma_GT] = @Ma_GT;
END;
GO

-- 3. sp_CreatePackage
CREATE OR ALTER PROCEDURE [dbo].[sp_CreatePackage]
    @Ma_GT varchar(10),
    @Ten_GT nvarchar(100),
    @Thoi_Gian nvarchar(20),
    @Thoi_Gian_Thang int,
    @Gia decimal(18, 2),
    @Mo_Ta nvarchar(max) = NULL,
    @Do_Tuoi_Ap_Dung nvarchar(100) = NULL,
    @Loai_Thu_Cung nvarchar(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO [dbo].[GOI_TIEM] (Ma_GT, Ten_GT, Thoi_Gian, Thoi_Gian_Thang, Gia, Mo_Ta, Do_Tuoi_Ap_Dung, Loai_Thu_Cung, Trang_Thai, Ngay_Tao)
    VALUES (@Ma_GT, @Ten_GT, @Thoi_Gian, @Thoi_Gian_Thang, @Gia, @Mo_Ta, @Do_Tuoi_Ap_Dung, @Loai_Thu_Cung, N'Hoạt động', GETDATE());
END;
GO

-- 4. sp_UpdatePackage
CREATE OR ALTER PROCEDURE [dbo].[sp_UpdatePackage]
    @Ma_GT varchar(10),
    @Ten_GT nvarchar(100),
    @Thoi_Gian nvarchar(20),
    @Thoi_Gian_Thang int,
    @Gia decimal(18, 2),
    @Mo_Ta nvarchar(max) = NULL,
    @Do_Tuoi_Ap_Dung nvarchar(100) = NULL,
    @Loai_Thu_Cung nvarchar(50) = NULL,
    @Trang_Thai nvarchar(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[GOI_TIEM]
    SET Ten_GT = @Ten_GT,
        Thoi_Gian = @Thoi_Gian,
        Thoi_Gian_Thang = @Thoi_Gian_Thang,
        Gia = @Gia,
        Mo_Ta = @Mo_Ta,
        Do_Tuoi_Ap_Dung = @Do_Tuoi_Ap_Dung,
        Loai_Thu_Cung = @Loai_Thu_Cung,
        Trang_Thai = ISNULL(@Trang_Thai, Trang_Thai),
        Ngay_Cap_Nhat = GETDATE()
    WHERE Ma_GT = @Ma_GT;
END;
GO

-- 5. sp_DeletePackage
CREATE OR ALTER PROCEDURE [dbo].[sp_DeletePackage]
    @Ma_GT varchar(10)
AS
BEGIN
    SET NOCOUNT ON;
    -- First delete from SOMUITIEM (junction table)
    DELETE FROM [dbo].[SOMUITIEM] WHERE Ma_GT = @Ma_GT;
    -- Then delete from GOI_TIEM
    DELETE FROM [dbo].[GOI_TIEM] WHERE Ma_GT = @Ma_GT;
END;
GO

-- 6. sp_GetPackageVaccines
CREATE OR ALTER PROCEDURE [dbo].[sp_GetPackageVaccines]
    @Ma_GT varchar(10)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT smt.*, vx.Ten_Vacxin, vx.Gia as Vaccine_Gia
    FROM [dbo].[SOMUITIEM] smt
    JOIN [dbo].[VAC_XIN] vx ON smt.Ma_Vacxin = vx.Ma_Vacxin
    WHERE smt.Ma_GT = @Ma_GT;
END;
GO

-- 7. sp_AddVaccineToPackage
CREATE OR ALTER PROCEDURE [dbo].[sp_AddVaccineToPackage]
    @Ma_GT varchar(10),
    @Ma_Vacxin varchar(10),
    @SoMuiTiem int = 1
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM [dbo].[SOMUITIEM] WHERE Ma_GT = @Ma_GT AND Ma_Vacxin = @Ma_Vacxin)
    BEGIN
        UPDATE [dbo].[SOMUITIEM] SET SoMuiTiem = SoMuiTiem + @SoMuiTiem WHERE Ma_GT = @Ma_GT AND Ma_Vacxin = @Ma_Vacxin;
    END
    ELSE
    BEGIN
        INSERT INTO [dbo].[SOMUITIEM] (Ma_GT, Ma_Vacxin, SoMuiTiem) VALUES (@Ma_GT, @Ma_Vacxin, @SoMuiTiem);
    END
END;
GO

-- 8. sp_RemoveVaccineFromPackage
CREATE OR ALTER PROCEDURE [dbo].[sp_RemoveVaccineFromPackage]
    @Ma_GT varchar(10),
    @Ma_Vacxin varchar(10)
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM [dbo].[SOMUITIEM] WHERE Ma_GT = @Ma_GT AND Ma_Vacxin = @Ma_Vacxin;
END;
GO

-- 9. sp_UpdateVaccineInPackage
CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateVaccineInPackage]
    @Ma_GT varchar(10),
    @Ma_Vacxin varchar(10),
    @SoMuiTiem int
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[SOMUITIEM] SET SoMuiTiem = @SoMuiTiem WHERE Ma_GT = @Ma_GT AND Ma_Vacxin = @Ma_Vacxin;
END;
GO

PRINT 'CRUD Stored Procedures created successfully.';
GO
