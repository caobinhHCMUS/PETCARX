USE [PetCareX];
GO

-- =============================================
-- Sample Accounts for Login Testing
-- =============================================

-- Xóa dữ liệu cũ nếu có
DELETE FROM TAI_KHOAN WHERE Ten_DangNhap IN ('admin@petcarex.com', 'doctor@petcarex.com', 'customer1@gmail.com', 'customer2@gmail.com');
DELETE FROM KHACH_HANG WHERE Ma_KH IN ('KH001', 'KH002', 'KH003');
DELETE FROM NHAN_VIEN WHERE Ma_NV IN ('NV001', 'NV002', 'NV003');
GO

-- ============================================
-- 1. Tạo ADMIN Account
-- ============================================
-- Admin không cần khách hàng, chỉ cần tài khoản
INSERT INTO TAI_KHOAN (Ten_DangNhap, Mat_Khau, Ma_KH)
VALUES ('admin@petcarex.com', 'admin123', NULL);
GO

-- ============================================
-- 2. Tạo DOCTOR Account
-- ============================================
-- Tạo nhân viên bác sĩ
INSERT INTO NHAN_VIEN (Ma_NV, Ho_Ten, Ngay_Sinh, Gioi_Tinh, Vai_Tro, Ngay_Vao, Luong_CB, Ma_CN)
VALUES 
('NV001', N'BS. Nguyễn Văn An', '1985-05-15', N'Nam', N'Bác sĩ', '2020-01-10', 15000000, NULL),
('NV002', N'BS. Trần Thị Mai', '1988-08-20', N'Nữ', N'Bác sĩ', '2021-03-15', 14000000, NULL);
GO

-- Tài khoản cho bác sĩ
INSERT INTO TAI_KHOAN (Ten_DangNhap, Mat_Khau, Ma_KH)
VALUES ('doctor@petcarex.com', 'doctor123', NULL);
GO

-- ============================================
-- 3. Tạo CUSTOMER Accounts
-- ============================================
-- Tạo khách hàng
INSERT INTO KHACH_HANG (Ma_KH, CCCD, Ho_Ten, Ngay_Sinh, Gioi_Tinh, Email, SDT, Tong_Chi_Tieu, Cap_Do_Hoi_Vien, Diem_Loyalty)
VALUES 
('KH001', '001234567890', N'Nguyễn Văn Khách', '1990-01-15', N'Nam', 'customer1@gmail.com', '0901234567', 5000000, N'Thân thiết', 100),
('KH002', '001234567891', N'Trần Thị Lan', '1992-06-20', N'Nữ', 'customer2@gmail.com', '0912345678', 15000000, N'VIP', 300),
('KH003', '001234567892', N'Lê Hoàng Nam', '1995-03-10', N'Nam', 'customer3@gmail.com', '0923456789', 2000000, N'Cơ bản', 40);
GO

-- Tạo tài khoản cho khách hàng
INSERT INTO TAI_KHOAN (Ten_DangNhap, Mat_Khau, Ma_KH)
VALUES 
('customer1@gmail.com', 'customer123', 'KH001'),
('customer2@gmail.com', 'customer123', 'KH002'),
('customer3@gmail.com', 'customer123', 'KH003');
GO

-- ============================================
-- 4. Tạo thú cưng cho khách hàng
-- ============================================
INSERT INTO THU_CUNG (Ma_PET, Ma_KH, Ten_PET, Ten_Loai, Giong, Gioi_Tinh, Ngay_Sinh, Tinh_Trang_Suc_Khoe)
VALUES 
('PET001', 'KH001', N'Lucky', N'Chó', N'Golden Retriever', N'Đực', '2022-05-10', N'Khỏe mạnh'),
('PET002', 'KH001', N'Mimi', N'Mèo', N'Mèo Ba Tư', N'Cái', '2021-08-15', N'Khỏe mạnh'),
('PET003', 'KH002', N'Buddy', N'Chó', N'Poodle', N'Đực', '2023-01-20', N'Khỏe mạnh'),
('PET004', 'KH002', N'Luna', N'Mèo', N'Mèo Anh Lông Ngắn', N'Cái', '2022-11-05', N'Khỏe mạnh'),
('PET005', 'KH003', N'Max', N'Chó', N'Husky', N'Đực', '2020-06-25', N'Khỏe mạnh');
GO

PRINT '✅ Sample accounts created successfully!';
PRINT '';
PRINT '═══════════════════════════════════════════════════════════';
PRINT '📋 THÔNG TIN TÀI KHOẢN ĐĂNG NHẬP';
PRINT '═══════════════════════════════════════════════════════════';
PRINT '';
PRINT '👨‍💼 ADMIN ACCOUNT:';
PRINT '   Email: admin@petcarex.com';
PRINT '   Password: admin123';
PRINT '';
PRINT '👨‍⚕️ DOCTOR ACCOUNT:';
PRINT '   Email: doctor@petcarex.com';
PRINT '   Password: doctor123';
PRINT '';
PRINT '👥 CUSTOMER ACCOUNTS:';
PRINT '   1. Email: customer1@gmail.com';
PRINT '      Password: customer123';
PRINT '      Name: Nguyễn Văn Khách';
PRINT '      Level: Thân thiết';
PRINT '      Pets: Lucky (Chó Golden), Mimi (Mèo Ba Tư)';
PRINT '';
PRINT '   2. Email: customer2@gmail.com';
PRINT '      Password: customer123';
PRINT '      Name: Trần Thị Lan';
PRINT '      Level: VIP';
PRINT '      Pets: Buddy (Chó Poodle), Luna (Mèo Anh)';
PRINT '';
PRINT '   3. Email: customer3@gmail.com';
PRINT '      Password: customer123';
PRINT '      Name: Lê Hoàng Nam';
PRINT '      Level: Cơ bản';
PRINT '      Pets: Max (Chó Husky)';
PRINT '';
PRINT '═══════════════════════════════════════════════════════════';
GO
