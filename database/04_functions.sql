select * from THU_CUNG

select * from HOA_DON order  by Ngay_Lap desc
select * from THU_CUNG
join khach_hang on thu_cung.Ma_KH = khach_hang.Ma_KH
where thu_cung.Ma_pet='TC1404'

select * from DON_THUOC
select * from san_pham
select * from CT_DON_THUOC
select * from hoa_don
where Ma_HD='HD1404'

select * from san_pham where loai_sp = N'Thuốc'

select ma_hd from HOA_DON order by ma_hd asc


select * from hoa_don where ma_hd='HD896DDCCC'


select * from don_thuoc order by ngay_ke desc
where ma_hd='HD97272CF9'

select * from CT_MUA_HANG where ma_hd='HD97272CF9'

select * from ct_don_thuoc
where ma_dt='DT767DE5A7'