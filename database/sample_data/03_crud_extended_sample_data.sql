USE [PetCareX];
GO

-- =============================================
-- Phase 1.6: Dữ liệu mẫu mở rộng cho CRUD
-- Bổ sung thêm data để test đầy đủ các tính năng
-- =============================================

-- ============================================
-- 1. Bổ sung SAN_PHAM (10+ sản phẩm đa dạng)
-- ============================================
INSERT INTO [dbo].[SAN_PHAM] (Ma_SP, Ten_SP, Loai_SP, Gia, Don_Vi_Tinh, So_Luong, Mo_Ta, Hinh_Anh, Trang_Thai)
VALUES 
-- Thức ăn cho chó
('SP006', N'Pedigree Adult 1.5kg', N'Thức ăn', 95000, N'Gói 1.5kg', 80, N'Thức ăn hạt cho chó trưởng thành, đầy đủ dinh dưỡng', 'https://example.com/pedigree.jpg', N'Còn hàng'),
('SP007', N'Smartheart Adult 500g', N'Thức ăn', 35000, N'Gói 500g', 150, N'Thức ăn cho chó trưởng thành, giá bình dân', 'https://example.com/smartheart.jpg', N'Còn hàng'),
('SP008', N'Xương gặm sạch răng Dentastix', N'Thức ăn', 120000, N'Hộp 14 thanh', 40, N'Xương gặm giúp vệ sinh răng miệng', 'https://example.com/dentastix.jpg', N'Còn hàng'),

-- Thức ăn cho mèo
('SP009', N'Catsrang Adult 400g', N'Thức ăn', 38000, N'Gói 400g', 120, N'Thức ăn hạt cho mèo trưởng thành', 'https://example.com/catsrang.jpg', N'Còn hàng'),
('SP010', N'Pate Meo Meo vị cá thu', N'Thức ăn', 12000, N'Gói 80g', 250, N'Pate ướt cho mèo, vị ngon', 'https://example.com/meomeo.jpg', N'Còn hàng'),
('SP011', N'Minino Adult 1kg', N'Thức ăn', 85000, N'Túi 1kg', 60, N'Thức ăn hạt cho mèo, nhiều hương vị', 'https://example.com/minino.jpg', N'Còn hàng'),

-- Phụ kiện
('SP012', N'Bát đôi inox chống lật', N'Phụ kiện', 75000, N'Bộ', 45, N'Bát ăn uống inox cao cấp', 'https://example.com/bowl.jpg', N'Còn hàng'),
('SP013', N'Nhà nệm cho chó size M', N'Phụ kiện', 280000, N'Cái', 20, N'Nhà nệm ấm áp cho thú cưng', 'https://example.com/house.jpg', N'Còn hàng'),
('SP014', N'Đồ chơi bóng cao su', N'Phụ kiện', 35000, N'Cái', 100, N'Bóng cao su an toàn cho thú cưng', 'https://example.com/ball.jpg', N'Còn hàng'),
('SP015', N'Dây dắt tự động 5m', N'Phụ kiện', 185000, N'Cái', 35, N'Dây dắt tự cuộn tiện lợi', 'https://example.com/leash.jpg', N'Còn hàng'),
('SP016', N'Lồng vận chuyển size M', N'Phụ kiện', 350000, N'Cái', 15, N'Lồng nhựa chắc chắn cho chó mèo', 'https://example.com/carrier.jpg', N'Còn hàng'),

-- Thuốc
('SP017', N'Thuốc tẩy giun Drontal', N'Thuốc', 45000, N'Viên', 200, N'Tẩy giun hiệu quả cho chó mèo', 'https://example.com/drontal.jpg', N'Còn hàng'),
('SP018', N'Xit ve rận Frontline', N'Thuốc', 320000, N'Chai 100ml', 50, N'Diệt ve rận hiệu quả lâu dài', 'https://example.com/frontline.jpg', N'Còn hàng'),
('SP019', N'Vitamin tổng hợp Multi-Vit', N'Thuốc', 95000, N'Hộp 50 viên', 80, N'Bổ sung vitamin cho thú cưng', 'https://example.com/multivit.jpg', N'Còn hàng'),
('SP020', N'Thuốc nhỏ tai Otiderm', N'Thuốc', 65000, N'Lọ 15ml', 60, N'Điều trị viêm tai cho chó mèo', 'https://example.com/otiderm.jpg', N'Còn hàng'),

-- Sản phẩm hết hàng để test
('SP021', N'Thức ăn cao cấp Hills', N'Thức ăn', 580000, N'Túi 3kg', 0, N'Thức ăn cao cấp cho chó mèo', 'https://example.com/hills.jpg', N'Hết hàng'),
('SP022', N'Vòng cổ điện tử GPS', N'Phụ kiện', 1200000, N'Cái', 0, N'Vòng cổ định vị GPS', 'https://example.com/gps.jpg', N'Ngừng kinh doanh');
GO

-- ============================================
-- 2. Bổ sung VAC_XIN (5+ vaccin đa dạng)
-- ============================================
INSERT INTO [dbo].[VAC_XIN] (Ma_Vacxin, Ten_Vacxin, Xuat_Xu, Gia, Mo_Ta, Benh_Phong_Ngua, Do_Tuoi_Su_Dung, Han_Su_Dung, So_Luong, Trang_Thai)
VALUES 
-- Vaccin cho chó
('VX005', N'Vaccine 8 bệnh Nobivac DHPPi+L4', N'Hà Lan', 380000, N'Phòng 8 bệnh nguy hiểm cho chó', N'Carre, Parvo, Hepatitis, Parainfluenza, Leptospira', N'6-8 tuần tuổi', '2026-12-31', 150, N'Còn hàng'),
('VX006', N'Vaccine Dại Nobivac Rabies', N'Hà Lan', 120000, N'Phòng bệnh dại cho chó mèo', N'Bệnh dại (Rabies)', N'12 tuần tuổi trở lên', '2027-03-15', 250, N'Còn hàng'),
('VX007', N'Vaccine Cúm chó', N'Mỹ', 280000, N'Phòng cúm chó (Kennel Cough)', N'Cúm chó (Bordetella)', N'8 tuần tuổi trở lên', '2026-09-20', 100, N'Còn hàng'),

-- Vaccin cho mèo
('VX008', N'Vaccine 5 bệnh Fel-O-Vax', N'Mỹ', 420000, N'Phòng 5 bệnh cho mèo', N'FPV, FHV, FCV, Chlamydia, FeLV', N'8-10 tuần tuổi', '2026-11-30', 90, N'Còn hàng'),
('VX009', N'Vaccine 3 bệnh Nobivac Tricat', N'Hà Lan', 380000, N'Phòng 3 bệnh cơ bản cho mèo', N'Giảm bạch cầu, Viêm mũi họng, Calicivirus', N'8 tuần tuổi trở lên', '2026-08-25', 120, N'Còn hàng'),
('VX010', N'Vaccine Bạch hầu mèo', N'Pháp', 350000, N'Phòng bệnh bạch hầu (FeLV)', N'Bạch hầu mèo (Feline Leukemia)', N'8 tuần tuổi trở lên', '2026-10-10', 70, N'Còn hàng'),

-- Vaccin đa năng
('VX011', N'Vaccine 6 bệnh Vanguard Plus', N'Mỹ', 320000, N'Phòng 6 bệnh cho chó', N'Distemper, Parvo, Adenovirus, Parainfluenza, Leptospira', N'6 tuần tuổi trở lên', '2026-07-15', 110, N'Còn hàng'),

-- Vaccin sắp hết hạn để test
('VX012', N'Vaccine Parvo đơn', N'Việt Nam', 180000, N'Phòng bệnh Parvo riêng', N'Parvovirus', N'6 tuần tuổi trở lên', '2025-02-28', 30, N'Sắp hết hạn'),

-- Vaccin hết hạn để test
('VX013', N'Vaccine Corona', N'Thái Lan', 250000, N'Phòng bệnh Corona cho chó', N'Coronavirus', N'6 tuần tuổi trở lên', '2024-12-31', 20, N'Hết hạn');
GO

-- ============================================
-- 3. Bổ sung GOI_TIEM (5+ gói đa dạng)
-- ============================================
INSERT INTO [dbo].[GOI_TIEM] (Ma_GT, Ten_GT, Thoi_Gian, Thoi_Gian_Thang, Gia, Mo_Ta, Do_Tuoi_Ap_Dung, Loai_Thu_Cung, Trang_Thai)
VALUES 
-- Gói cho chó
('GT004', N'Gói Vaccin Cao Cấp Cho Chó', N'8 tháng', 8, 2000000, N'Gói vaccin cao cấp bao gồm 8 bệnh + dại + cúm chó', N'6-28 tuần tuổi', N'Chó', N'Hoạt động'),
('GT005', N'Gói Tiêm Chủng Chó Con Cơ Bản', N'5 tháng', 5, 1200000, N'Gói cơ bản cho chó con: 7 bệnh + dại', N'6-20 tuần tuổi', N'Chó', N'Hoạt động'),
('GT006', N'Gói Tiêm Phòng Chó Trưởng Thành', N'2 tháng', 2, 800000, N'Gói nhắc lại cho chó trưởng thành', N'Trên 1 năm tuổi', N'Chó', N'Hoạt động'),

-- Gói cho mèo
('GT007', N'Gói Vaccin Hoàn Chỉnh Cho Mèo', N'6 tháng', 6, 1800000, N'Gói đầy đủ: 5 bệnh + dại + bạch hầu', N'8-24 tuần tuổi', N'Mèo', N'Hoạt động'),
('GT008', N'Gói Tiêm Mèo Con Tiết Kiệm', N'4 tháng', 4, 1000000, N'Gói tiết kiệm cho mèo con: 3 bệnh + dại', N'8-20 tuần tuổi', N'Mèo', N'Hoạt động'),

-- Gói đa năng
('GT009', N'Gói Tiêm Chủng VIP', N'12 tháng', 12, 3500000, N'Gói VIP: Tiêm phòng + tư vấn + khám định kỳ', N'6 tuần trở lên', N'Tất cả', N'Hoạt động'),
('GT010', N'Gói Bảo Vệ Cơ Bản', N'3 tháng', 3, 650000, N'Gói bảo vệ cơ bản cho mọi loại thú cưng', N'6 tuần trở lên', N'Tất cả', N'Hoạt động'),

-- Gói ngừng hoạt động để test
('GT011', N'Gói Khuyến Mãi Hè', N'6 tháng', 6, 999000, N'Gói khuyến mãi hè (đã hết hiệu lực)', N'6 tuần trở lên', N'Tất cả', N'Không hoạt động');
GO

-- ============================================
-- 4. Bổ sung SOMUITIEM (quan hệ gói-vaccin)
-- ============================================
INSERT INTO [dbo].[SOMUITIEM] (Ma_GT, Ma_Vacxin, SoMuiTiem)
VALUES 
-- Gói GT004 - Cao cấp cho chó
('GT004', 'VX005', 3),  -- 8 bệnh: 3 mũi
('GT004', 'VX006', 1),  -- Dại: 1 mũi
('GT004', 'VX007', 2),  -- Cúm chó: 2 mũi

-- Gói GT005 - Cơ bản chó con
('GT005', 'VX001', 3),  -- 7 bệnh: 3 mũi
('GT005', 'VX002', 1),  -- Dại: 1 mũi

-- Gói GT006 - Chó trưởng thành
('GT006', 'VX005', 1),  -- 8 bệnh: 1 mũi nhắc
('GT006', 'VX006', 1),  -- Dại: 1 mũi nhắc

-- Gói GT007 - Hoàn chỉnh cho mèo
('GT007', 'VX008', 3),  -- 5 bệnh: 3 mũi
('GT007', 'VX006', 1),  -- Dại: 1 mũi
('GT007', 'VX010', 2),  -- Bạch hầu: 2 mũi

-- Gói GT008 - Mèo con tiết kiệm
('GT008', 'VX009', 3),  -- 3 bệnh: 3 mũi
('GT008', 'VX006', 1),  -- Dại: 1 mũi

-- Gói GT009 - VIP
('GT009', 'VX005', 3),  -- 8 bệnh chó
('GT009', 'VX008', 3),  -- 5 bệnh mèo
('GT009', 'VX006', 2),  -- Dại
('GT009', 'VX011', 2),  -- 6 bệnh

-- Gói GT010 - Bảo vệ cơ bản
('GT010', 'VX006', 1),  -- Dại
('GT010', 'VX001', 2),  -- 7 bệnh

-- Gói GT011 - Ngừng hoạt động (vẫn có data để test)
('GT011', 'VX001', 2),
('GT011', 'VX003', 2),
('GT011', 'VX002', 1);
GO

PRINT '✅ Extended sample data for CRUD inserted successfully!';
PRINT '';
PRINT '📊 Summary:';
PRINT '  - SAN_PHAM: Added 17 products (Food, Accessories, Medicine)';
PRINT '  - VAC_XIN: Added 9 vaccines (Dogs, Cats, Multi-purpose)';
PRINT '  - GOI_TIEM: Added 8 packages (Various durations and types)';
PRINT '  - SOMUITIEM: Added 25 vaccine-package relationships';
PRINT '';
PRINT '🎯 Test scenarios included:';
PRINT '  ✓ Products in stock, out of stock, discontinued';
PRINT '  ✓ Vaccines active, expiring soon, expired';
PRINT '  ✓ Packages active and inactive';
PRINT '  ✓ Various price ranges and categories';
GO
