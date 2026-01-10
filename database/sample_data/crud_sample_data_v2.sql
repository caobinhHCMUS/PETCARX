USE [PETCARX];
GO

-- =============================================
-- Phase 1.6: Dữ liệu mẫu bổ sung cho CRUD
-- =============================================

-- 1. Dữ liệu mẫu cho SAN_PHAM
INSERT INTO [dbo].[SAN_PHAM] (Ma_SP, Ten_SP, Loai_SP, Gia, Don_Vi_Tinh, So_Luong, Mo_Ta, Hinh_Anh, Trang_Thai)
VALUES 
('SP001', N'Thức ăn Royal Canin Adult', N'Thức ăn', 250000, N'Gói 2kg', 50, N'Thức ăn hạt cho chó trưởng thành', 'https://example.com/rc-adult.jpg', N'Còn hàng'),
('SP002', N'Pate Whiskas cho mèo', N'Thức ăn', 15000, N'Gói 85g', 200, N'Pate ướt hương vị cá thu', 'https://example.com/whiskas.jpg', N'Còn hàng'),
('SP003', N'Vòng cổ trị rận', N'Phụ kiện', 85000, N'Cái', 30, N'Vòng cổ ngăn ngừa bọ chét và rận', 'https://example.com/collar.jpg', N'Còn hàng'),
('SP004', N'Chuồng vận chuyển lớn', N'Phụ kiện', 450000, N'Cái', 10, N'Chuồng nhựa bền cho vận chuyển thú cưng', 'https://example.com/cage.jpg', N'Còn hàng'),
('SP005', N'Men tiêu hóa Biolatyl', N'Thuốc', 10000, N'Gói', 150, N'Hỗ trợ tiêu hóa cho chó mèo', 'https://example.com/biolatyl.jpg', N'Còn hàng');
GO

-- 2. Dữ liệu mẫu cho VAC_XIN
INSERT INTO [dbo].[VAC_XIN] (Ma_Vacxin, Ten_Vacxin, Xuat_Xu, Gia, Mo_Ta, Benh_Phong_Ngua, Do_Tuoi_Su_Dung, Han_Su_Dung, So_Luong, Trang_Thai)
VALUES 
('VX001', N'Vaccine 7 bệnh Eurican', N'Pháp', 350000, N'Phòng ngừa 7 bệnh nguy hiểm trên chó', N'Carre, Parvo, Viêm gan, Leptospirosis...', N'Trên 6 tuần tuổi', '2025-12-31', 100, N'Còn hàng'),
('VX002', N'Vaccine Dại Rabisin', N'Pháp', 150000, N'Phòng bệnh dại', N'Bệnh dại (Rabies)', N'Trên 12 tuần tuổi', '2026-06-30', 200, N'Còn hàng'),
('VX003', N'Vaccine 4 bệnh cho mèo', N'Mỹ', 450000, N'Phòng 4 bệnh trên mèo', N'Giảm bạch cầu, Viêm mũi, Calicivirus...', N'Trên 8 tuần tuổi', '2025-10-15', 80, N'Còn hàng'),
('VX004', N'Vaccine Lepto', N'Mỹ', 200000, N'Phòng bệnh xoắn khuẩn', N'Leptospirosis', N'Trên 8 tuần tuổi', '2025-08-20', 50, N'Còn hàng');
GO

-- 3. Dữ liệu mẫu cho GOI_TIEM
INSERT INTO [dbo].[GOI_TIEM] (Ma_GT, Ten_GT, Thoi_Gian, Thoi_Gian_Thang, Gia, Mo_Ta, Do_Tuoi_Ap_Dung, Loai_Thu_Cung, Trang_Thai)
VALUES 
('GT001', N'Gói Vaccin Trọn Gói Cho Chó Con', N'6 tháng', 6, 1500000, N'Bao gồm đầy đủ các mũi cơ bản cho chó năm đầu', N'6-24 tuần tuổi', N'Chó', N'Hoạt động'),
('GT002', N'Gói Vaccin Cơ Bản Cho Mèo Con', N'4 tháng', 4, 1200000, N'Bao gồm 3 mũi 4 bệnh và 1 mũi dại', N'8-20 tuần tuổi', N'Mèo', N'Hoạt động'),
('GT003', N'Gói Nhắc Lại Hàng Năm', N'1 tháng', 1, 600000, N'Gói nhắc lại cho thú cưng trưởng thành', N'Trên 1 năm tuổi', N'Tất cả', N'Hoạt động');
GO

-- 4. Liên kết Vaccin và Gói tiêm (SOMUITIEM)
INSERT INTO [dbo].[SOMUITIEM] (Ma_GT, Ma_Vacxin, SoMuiTiem)
VALUES 
('GT001', 'VX001', 3),
('GT001', 'VX002', 1),
('GT001', 'VX004', 2),
('GT002', 'VX003', 3),
('GT002', 'VX002', 1),
('GT003', 'VX001', 1),
('GT003', 'VX003', 1),
('GT003', 'VX002', 1);
GO

PRINT 'Sample data inserted successfully.';
GO
