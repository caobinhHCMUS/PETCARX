
--1. thống kê daonh thu toàn hệ thống theo từng loại nghiệp vụ
CREATE OR ALTER PROCEDURE Get_DoanhThu_TheoLoaiNghiepVu
    @startDate DATE,
    @endDate DATE
AS
BEGIN
    -- Sử dụng ISNULL để nếu truyền NULL từ Backend thì vẫn lấy được toàn bộ dữ liệu
    SET @startDate = ISNULL(@startDate, '1900-01-01');
    SET @endDate = ISNULL(@endDate, '2099-12-31');

    SELECT 
        Loai_Nghiep_Vu, 
        COUNT(*) AS So_Luong_Don,       -- Thêm cột này để hiện lên giao diện
        SUM(Tong_Tien) AS Doanh_Thu
    FROM 
        [dbo].[HOA_DON]
    WHERE 
        Trang_Thai = N'Hoàn thành' 
        -- Ép kiểu ngay_lap về DATE nếu nó đang là DATETIME để so sánh chính xác
        AND CAST(ngay_lap AS DATE) BETWEEN @startDate AND @endDate 
    GROUP BY 
        Loai_Nghiep_Vu
    ORDER BY 
        Doanh_Thu DESC;
END
GO