import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Shield, Syringe, X, ChevronRight } from 'lucide-react';
import {
    getPackages, deletePackage, createPackage, updatePackage,
    getPackageVaccines, addVaccineToPackage, removeVaccineFromPackage, getVaccines
} from '../../services/api';
import { VaccinePackage, PackageVaccine, Vaccine } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { cn } from '../../lib/utils';

const VaccinePackagesPage: React.FC = () => {
    const [packages, setPackages] = useState<VaccinePackage[]>([]);
    const [allVaccines, setAllVaccines] = useState<Vaccine[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Package Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<VaccinePackage | null>(null);
    const [formData, setFormData] = useState<Partial<VaccinePackage>>({
        Ma_GT: '',
        Ten_GT: '',
        Thoi_Gian: '',
        Thoi_Gian_Thang: 0,
        Gia: 0,
        Mo_Ta: '',
        Do_Tuoi_Ap_Dung: '',
        Loai_Thu_Cung: 'Tất cả',
    });

    // Manage Vaccines Modal State
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<VaccinePackage | null>(null);
    const [packageVaccines, setPackageVaccines] = useState<PackageVaccine[]>([]);
    const [newVaccineData, setNewVaccineData] = useState({
        Ma_Vacxin: '',
        SoMuiTiem: 1
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [pkRes, vxRes] = await Promise.all([getPackages(), getVaccines()]);
            if (pkRes.data.success) setPackages(pkRes.data.data);
            if (vxRes.data.success) setAllVaccines(vxRes.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (pkg?: VaccinePackage) => {
        if (pkg) {
            setEditingPackage(pkg);
            setFormData(pkg);
        } else {
            setEditingPackage(null);
            setFormData({
                Ma_GT: '',
                Ten_GT: '',
                Thoi_Gian: '',
                Thoi_Gian_Thang: 0,
                Gia: 0,
                Mo_Ta: '',
                Do_Tuoi_Ap_Dung: '',
                Loai_Thu_Cung: 'Tất cả',
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa gói tiêm này? Điều này sẽ xóa tất cả liên kết với vaccin.')) {
            try {
                await deletePackage(id);
                fetchData();
            } catch (error) {
                console.error('Error deleting package:', error);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingPackage) {
                await updatePackage(editingPackage.Ma_GT, formData);
            } else {
                await createPackage(formData);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Error saving package:', error);
        }
    };

    // Vaccine Management Functions
    const handleOpenManageModal = async (pkg: VaccinePackage) => {
        setSelectedPackage(pkg);
        setIsManageModalOpen(true);
        try {
            const res = await getPackageVaccines(pkg.Ma_GT);
            if (res.data.success) {
                setPackageVaccines(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching package vaccines:', error);
        }
    };

    const handleAddVaccine = async () => {
        if (!selectedPackage || !newVaccineData.Ma_Vacxin) return;
        try {
            await addVaccineToPackage(selectedPackage.Ma_GT, newVaccineData);
            const res = await getPackageVaccines(selectedPackage.Ma_GT);
            if (res.data.success) {
                setPackageVaccines(res.data.data);
                setNewVaccineData({ Ma_Vacxin: '', SoMuiTiem: 1 });
            }
        } catch (error) {
            console.error('Error adding vaccine:', error);
        }
    };

    const handleRemoveVaccine = async (vxId: string) => {
        if (!selectedPackage) return;
        try {
            await removeVaccineFromPackage(selectedPackage.Ma_GT, vxId);
            const res = await getPackageVaccines(selectedPackage.Ma_GT);
            if (res.data.success) {
                setPackageVaccines(res.data.data);
            }
        } catch (error) {
            console.error('Error removing vaccine:', error);
        }
    };

    const filteredPackages = packages.filter(p =>
        p.Ten_GT.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.Ma_GT.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Quản lý Gói Vaccin</h1>
                    <p className="text-slate-500">Thiết kế và quản lý các gói tiêm chủng định kỳ cho thú cưng.</p>
                </div>
                <Button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-indigo-600">
                    <Plus size={18} />
                    Tạo gói mới
                </Button>
            </div>

            <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                        placeholder="Tìm kiếm gói theo tên hoặc mã..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-20">Đang tải dữ liệu...</div>
                ) : filteredPackages.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-slate-500">Không tìm thấy gói vaccin nào</div>
                ) : filteredPackages.map((pkg) => (
                    <div key={pkg.Ma_GT} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                        <div className="p-6 flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                    <Shield size={24} />
                                </div>
                                <span className={cn(
                                    "px-2 py-1 rounded-full text-xs font-medium",
                                    pkg.Trang_Thai === 'Hoạt động' ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"
                                )}>
                                    {pkg.Trang_Thai}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">{pkg.Ten_GT}</h3>
                            <p className="text-sm text-slate-500 mb-4 line-clamp-2">{pkg.Mo_Ta || 'Không có mô tả.'}</p>

                            <div className="space-y-2 mb-6 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Mã gói:</span>
                                    <span className="font-semibold">{pkg.Ma_GT}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Thời gian:</span>
                                    <span>{pkg.Thoi_Gian}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Thú cưng:</span>
                                    <span className="px-2 py-0.5 bg-slate-100 rounded text-xs">{pkg.Loai_Thu_Cung}</span>
                                </div>
                            </div>

                            <div className="text-2xl font-bold text-indigo-600 mb-6">
                                {pkg.Gia.toLocaleString('vi-VN')}đ
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleOpenModal(pkg)}
                                    className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                                    title="Sửa thông tin"
                                >
                                    <Edit2 size={16} className="text-slate-600" />
                                </button>
                                <button
                                    onClick={() => handleDelete(pkg.Ma_GT)}
                                    className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-red-100"
                                    title="Xóa gói"
                                >
                                    <Trash2 size={16} className="text-red-500" />
                                </button>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                onClick={() => handleOpenManageModal(pkg)}
                            >
                                Quản lý Vaccin
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Package Form Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingPackage ? 'Sửa gói vaccin' : 'Tạo gói vaccin mới'}
            >
                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Mã gói"
                            required
                            disabled={!!editingPackage}
                            value={formData.Ma_GT}
                            onChange={(e) => setFormData({ ...formData, Ma_GT: e.target.value })}
                        />
                        <Select
                            label="Loại thú cưng"
                            options={[
                                { value: 'Chó', label: 'Chó' },
                                { value: 'Mèo', label: 'Mèo' },
                                { value: 'Tất cả', label: 'Tất cả' },
                            ]}
                            value={formData.Loai_Thu_Cung}
                            onChange={(e: any) => setFormData({ ...formData, Loai_Thu_Cung: e.target.value })}
                        />
                    </div>
                    <Input
                        label="Tên gói vaccin"
                        required
                        value={formData.Ten_GT}
                        onChange={(e) => setFormData({ ...formData, Ten_GT: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Giá gói (VNĐ)"
                            type="number"
                            required
                            value={formData.Gia}
                            onChange={(e) => setFormData({ ...formData, Gia: Number(e.target.value) })}
                        />
                        <Input
                            label="Độ tuổi áp dụng"
                            placeholder="Ví dụ: 6-24 tuần tuổi"
                            value={formData.Do_Tuoi_Ap_Dung}
                            onChange={(e) => setFormData({ ...formData, Do_Tuoi_Ap_Dung: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Thời gian (text)"
                            placeholder="Ví dụ: 6 tháng"
                            value={formData.Thoi_Gian}
                            onChange={(e) => setFormData({ ...formData, Thoi_Gian: e.target.value })}
                        />
                        <Input
                            label="Thời gian (tháng)"
                            type="number"
                            value={formData.Thoi_Gian_Thang}
                            onChange={(e) => setFormData({ ...formData, Thoi_Gian_Thang: Number(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Mô tả gói</label>
                        <textarea
                            className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            rows={3}
                            value={formData.Mo_Ta}
                            onChange={(e) => setFormData({ ...formData, Mo_Ta: e.target.value })}
                        ></textarea>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Hủy</Button>
                        <Button type="submit">Lưu lại</Button>
                    </div>
                </form>
            </Modal>

            {/* Manage Vaccines Modal */}
            <Modal
                isOpen={isManageModalOpen}
                onClose={() => setIsManageModalOpen(false)}
                title={`Quản lý Vaccin trong gói: ${selectedPackage?.Ten_GT}`}
                size="lg"
            >
                <div className="space-y-6">
                    <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300">
                        <h4 className="text-sm font-semibold text-slate-900 mb-3">Thêm vaccin vào gói</h4>
                        <div className="flex gap-3 items-end text-sm">
                            <div className="flex-1">
                                <Select
                                    label="Chọn vaccin"
                                    options={allVaccines.map(v => ({ value: v.Ma_Vacxin, label: `${v.Ten_Vacxin} (${v.Ma_Vacxin})` }))}
                                    value={newVaccineData.Ma_Vacxin}
                                    onChange={(e: any) => setNewVaccineData({ ...newVaccineData, Ma_Vacxin: e.target.value })}
                                />
                            </div>
                            <div className="w-32">
                                <Input
                                    label="Số mũi tiêm"
                                    type="number"
                                    min={1}
                                    value={newVaccineData.SoMuiTiem}
                                    onChange={(e) => setNewVaccineData({ ...newVaccineData, SoMuiTiem: Number(e.target.value) })}
                                />
                            </div>
                            <Button onClick={handleAddVaccine} disabled={!newVaccineData.Ma_Vacxin} className="h-[38px]">Thêm</Button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                            <Syringe size={16} />
                            Danh sách vaccin hiện có
                        </h4>
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tên Vaccin</TableHead>
                                        <TableHead>Số mũi</TableHead>
                                        <TableHead>Giá lẻ</TableHead>
                                        <TableHead className="text-right"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {packageVaccines.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-6 text-slate-500">Chưa có vaccin nào trong gói này</TableCell>
                                        </TableRow>
                                    ) : packageVaccines.map((item) => (
                                        <TableRow key={item.Ma_Vacxin}>
                                            <TableCell>
                                                <div className="font-medium">{item.Ten_Vacxin}</div>
                                                <div className="text-xs text-slate-500">{item.Ma_Vacxin}</div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md font-bold">
                                                    {item.SoMuiTiem}
                                                </span>
                                            </TableCell>
                                            <TableCell>{item.Vaccine_Gia?.toLocaleString('vi-VN')}đ</TableCell>
                                            <TableCell className="text-right">
                                                <button
                                                    onClick={() => handleRemoveVaccine(item.Ma_Vacxin)}
                                                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button onClick={() => setIsManageModalOpen(false)}>Hoàn tất</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default VaccinePackagesPage;
