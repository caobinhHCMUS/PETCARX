--index
-- Nếu Email/SDT/CCCD có thể NULL nhưng muốn “không trùng khi có giá trị”
CREATE UNIQUE INDEX UX_KHACH_HANG_Email_NotNull ON dbo.KHACH_HANG(Email) WHERE Email IS NOT NULL;
CREATE UNIQUE INDEX UX_KHACH_HANG_SDT_NotNull   ON dbo.KHACH_HANG(SDT)   WHERE SDT IS NOT NULL;
CREATE UNIQUE INDEX UX_KHACH_HANG_CCCD_NotNull  ON dbo.KHACH_HANG(CCCD)  WHERE CCCD IS NOT NULL;


--THU_CUNG (xem danh sách pet theo khách hàng)
CREATE INDEX IX_THU_CUNG_Ma_KH ON dbo.THU_CUNG(Ma_KH)
INCLUDE (Ten_PET, Ten_Loai, Giong, Gioi_Tinh, Ngay_Sinh, Tinh_Trang_Suc_Khoe, Mau_Sac);


CREATE INDEX IX_HOA_DON_Ma_KH_NgayLap
ON dbo.HOA_DON(Ma_KH, Ngay_Lap DESC)
INCLUDE (Trang_Thai, Tong_Tien, HinhThuc_TT, Loai_Nghiep_Vu, Khuyen_Mai, NV_Lap);


--HOA_DON (xem lịch sử mua, lọc theo trạng thái/ngày)
CREATE INDEX IX_HOA_DON_NV_Lap_NgayLap
ON dbo.HOA_DON(NV_Lap, Ngay_Lap DESC)
INCLUDE (Ma_KH, Trang_Thai, Tong_Tien, Loai_Nghiep_Vu);


--GIO_HANG (checkout selected hay dùng)
CREATE INDEX IX_GIO_HANG_Selected
ON dbo.GIO_HANG(Ma_KH, Ma_SP)
INCLUDE (SO_LUONG)
WHERE Is_Selected = 1;

--SAN_PHAM (lọc theo loại, search tên, hiển thị giá/tồn)
CREATE INDEX IX_SAN_PHAM_Loai_Ten
ON dbo.SAN_PHAM(Loai_SP, Ten_SP)
INCLUDE (Gia, Don_Vi_Tinh, So_Luong);


-- CT_Mua_Hang: PK (Ma_HD, Ma_SP) phục vụ xem chi tiết hóa đơn. Thêm index ngược để thống kê theo sản phẩm:
CREATE INDEX IX_CT_MUA_HANG_Ma_SP
ON dbo.CT_MUA_HANG(Ma_SP, Ma_HD)
INCLUDE (So_Luong, Thanh_Tien);

--Don_Thuoc CT_Don_Thuoc
--DON_THUOC: Ma_HD UNIQUE đã tạo unique index ngầm
--CT_DON_THUOC: PK (Ma_DT, Ma_SP) ok, thêm index theo Ma_SP để tra thuốc được kê:
CREATE INDEX IX_CT_DON_THUOC_Ma_SP
ON dbo.CT_DON_THUOC(Ma_SP, Ma_DT)
INCLUDE (So_Luong, Don_Gia, Lieu_Dung, Tan_Suat, So_Ngay);

--CT_kham_benh
CREATE INDEX IX_CT_KHAM_BENH_Ma_PET_NgayKham
ON dbo.CT_KHAM_BENH(Ma_PET, Ngay_Kham DESC)
INCLUDE (Bac_Si, Chuan_Doan, Trieu_Chung, Ngay_Hen_Tai_Kham, Thanh_Tien, Ma_HD);

CREATE INDEX IX_CT_KHAM_BENH_Bac_Si_NgayKham
ON dbo.CT_KHAM_BENH(Bac_Si, Ngay_Kham DESC)
INCLUDE (Ma_PET, Ma_HD, Thanh_Tien);


--TIÊM (CT_TIEM_LE, CT_TIEM_GOI)
-- tiêm lẻ theo pet
CREATE INDEX IX_CT_TIEM_LE_Ma_PET_NgayTiem
ON dbo.CT_TIEM_LE(Ma_PET, Ngay_Tiem DESC)
INCLUDE (Ma_Vacxin, Thanh_Tien, Lieu_Luong, Ma_HD);

-- tiêm gói theo pet / trạng thái tiêm thực tế
CREATE INDEX IX_CT_TIEM_GOI_Ma_PET
ON dbo.CT_TIEM_GOI(Ma_PET, Ma_GT)
INCLUDE (Ma_Vacxin, Ngay_Hen_Tiem, Ngay_Tiem_Thuc_Te, Ma_HD);

select * from CT_TIEM_GOI
-- tra gói theo vaccine (nếu hay làm UI “gói này gồm vaccine gì” hoặc ngược lại)
CREATE INDEX IX_SOMUITIEM_Ma_Vacxin
ON dbo.SOMUITIEM(Ma_Vacxin, Ma_GT)
INCLUDE (SoMuiTiem);

-- tra gói theo Ma_GT (PK đã là (Ma_GT, Ma_Vacxin) rồi -> OK, không bắt buộc thêm)


--LỊCH KHÁM + PHIẾU ĐẶT
-- lịch bác sĩ theo ngày/ca
CREATE INDEX IX_LICH_KHAM_BS_Ngay_Ca
ON dbo.LICH_KHAM(Ma_BS, Ngay_Kham, Ca_lamviec)
INCLUDE (ghi_chu);

-- phiếu đặt: bác sĩ theo ngày + trạng thái
CREATE INDEX IX_PDLK_BS_Ngay_TrangThai
ON dbo.PHIEU_DAT_LICH_KHAM(Ma_BS, Ngay_Dat DESC, Trang_Thai)
INCLUDE (Ma_KH, Ma_PET, Ca_lamviec);

-- phiếu đặt: khách hàng xem lịch sử
CREATE INDEX IX_PDLK_KH_Ngay
ON dbo.PHIEU_DAT_LICH_KHAM(Ma_KH, Ngay_Dat DESC)
INCLUDE (Ma_PET, Ma_BS, Trang_Thai, Ca_lamviec);

-- nếu UI hay lọc theo pet
CREATE INDEX IX_PDLK_PET_Ngay
ON dbo.PHIEU_DAT_LICH_KHAM(Ma_PET, Ngay_Dat DESC)
INCLUDE (Ma_BS, Trang_Thai, Ca_lamviec);


--NHAN_VIEN / CHI_NHANH / LICH_SU_DIEU_DONG
-- nhân viên theo chi nhánh + vai trò
CREATE INDEX IX_NHAN_VIEN_Ma_CN_VaiTro
ON dbo.NHAN_VIEN(Ma_CN, Vai_Tro)
INCLUDE (Ho_Ten, Ngay_Vao, Luong_CB);

-- lịch sử điều động: xem theo chi nhánh nhận
CREATE INDEX IX_LICH_SU_DIEU_DONG_ToCN_Ngay
ON dbo.LICH_SU_DIEU_DONG(To_CN, Ngay_Chuyen DESC)
INCLUDE (Ma_NV, From_CN);





----- thường dùng để lấy account theo Ma_KH/Ma_NV/Ma_BS
CREATE INDEX IX_TAI_KHOAN_Ma_KH ON dbo.TAI_KHOAN(Ma_KH) INCLUDE (Ten_DangNhap, vai_tro);
CREATE INDEX IX_TAI_KHOAN_Ma_NV ON dbo.TAI_KHOAN(Ma_NV) INCLUDE (Ten_DangNhap, vai_tro);
CREATE INDEX IX_TAI_KHOAN_Ma_BS ON dbo.TAI_KHOAN(Ma_BS) INCLUDE (Ten_DangNhap, vai_tro);


--DANHGIA (PK (Ma_KH, Ma_HD)) xem đánh giá theo hóa đơn
CREATE INDEX IX_DANHGIA_Ma_HD ON dbo.DANHGIA(ma_HD) INCLUDE (Ma_KH, muc_do_hai_long);
