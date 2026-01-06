

INSERT INTO NHAN_VIEN (Ma_NV, Ho_Ten, Ngay_Sinh, Gioi_Tinh, Vai_Tro, Ngay_Vao, Luong_CB, Ma_CN) VALUES
('NV001', N'Nguyễn Văn An', '1996-03-15', N'Nam', N'Bán hàng', '2023-06-01', 8500000, NULL),
('NV002', N'Trần Thị Mai', '1998-11-22', N'Nữ', N'Bán hàng', '2024-01-10', 9000000, NULL),
('NV003', N'Lê Quốc Huy', '1995-07-09', N'Nam', N'Bán hàng', '2022-09-18', 10500000, NULL),
('NV004', N'Phạm Ngọc Linh', '2000-02-28', N'Nữ', N'Bán hàng', '2024-05-03', 8000000, NULL),
('NV005', N'Võ Minh Tuấn', '1997-12-01', N'Nam', N'Tiếp tân', '2023-03-20', 7500000, NULL),
('NV006', N'Nguyễn Thị Hạnh', '1999-08-14', N'Nữ', N'Tiếp tân', '2024-02-11', 7800000, NULL),
('NV007', N'Hoàng Gia Bảo', '1996-05-06', N'Nam', N'Tiếp tân', '2022-12-05', 8200000, NULL),
('NV008', N'Lê Thanh Thảo', '2001-01-19', N'Nữ', N'Tiếp tân', '2024-06-18', 7600000, NULL);

INSERT INTO TAI_KHOAN (Ten_DangNhap, Mat_Khau, Vai_Tro, Ma_NV) VALUES
('nv001', '123456', N'Nhân viên', 'NV001'),
('nv002', '123456', N'Nhân viên', 'NV002'),
('nv003', '123456', N'Nhân viên', 'NV003'),
('nv004', '123456', N'Nhân viên', 'NV004'),
('nv005', '123456', N'Nhân viên', 'NV005'),
('nv006', '123456', N'Nhân viên', 'NV006'),
('nv007', '123456', N'Nhân viên', 'NV007'),
('nv008', '123456', N'Nhân viên', 'NV008');
