USE [PetCareX2];
GO
--1. prod đăng nhập
CREATE OR ALTER PROC dbo.sp_DangNhap
  @TenDangNhap VARCHAR(50),
  @MatKhau     VARCHAR(255)
AS
BEGIN
  SET NOCOUNT ON;

  -- 1) Kiểm tra tài khoản tồn tại
  IF NOT EXISTS (SELECT 1 FROM dbo.TAI_KHOAN WHERE Ten_DangNhap = @TenDangNhap)
  BEGIN
    ;THROW 50001, N'Tên đăng nhập không tồn tại.', 1;
    RETURN;
  END;

  -- 2) Kiểm tra mật khẩu
  IF NOT EXISTS (
    SELECT 1 FROM dbo.TAI_KHOAN
    WHERE Ten_DangNhap = @TenDangNhap AND Mat_Khau = @MatKhau
  )
  BEGIN
    ;THROW 50002, N'Mật khẩu không đúng.', 1;
    RETURN;
  END;

  -- 3) Trả thông tin user theo vai trò
  SELECT 
    tk.Ten_DangNhap,
    tk.vai_tro,
    tk.Ma_KH,
    kh.Ho_Ten AS Ten_KH,
    tk.Ma_NV,
    nv.Ho_Ten AS Ten_NV,
    tk.Ma_BS,                -- chứa mã NV của bác sĩ
    bs.Ho_Ten AS Ten_BS,
    bs.Ma_NV AS Ma_BacSiThuc, -- mã BS thật nếu bạn cần
    CASE 
      WHEN tk.vai_tro = 'Quản lý' THEN 1  -- Nếu là quản lý
      ELSE 0 -- Nếu là nhân viên
    END AS is_manager
  FROM dbo.TAI_KHOAN tk
  LEFT JOIN dbo.KHACH_HANG kh ON kh.Ma_KH = tk.Ma_KH
  LEFT JOIN dbo.NHAN_VIEN nv ON nv.Ma_NV = tk.Ma_NV
  LEFT JOIN dbo.CT_BAC_SI bs ON bs.Ma_NV = tk.Ma_BS  -- ✅ chính xác
  WHERE tk.Ten_DangNhap = @TenDangNhap;
END
select * from TAI_KHOAN
GO
-- các proc của khách hàng.




