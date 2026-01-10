import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Syringe, AlertTriangle } from 'lucide-react';
import { getVaccines, deleteVaccine, createVaccine, updateVaccine } from '../../services/api';
import { Vaccine } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { cn } from '../../lib/utils';

const VaccinesPage: React.FC = () => {
    const [vaccines, setVaccines] = useState<Vaccine[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVaccine, setEditingVaccine] = useState<Vaccine | null>(null);
    const [formData, setFormData] = useState<Partial<Vaccine>>({
        Ma_Vacxin: '',
        Ten_Vacxin: '',
        Xuat_Xu: '',
        Gia: 0,
        Mo_Ta: '',
        Benh_Phong_Ngua: '',
        Do_Tuoi_Su_Dung: '',
        Han_Su_Dung: '',
        So_Luong: 0,
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getVaccines();
            if (res.data.success) {
                setVaccines(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching vaccines:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (vaccine?: Vaccine) => {
        if (vaccine) {
            setEditingVaccine(vaccine);
            setFormData({
                ...vaccine,
                Han_Su_Dung: vaccine.Han_Su_Dung ? new Date(vaccine.Han_Su_Dung).toISOString().split('T')[0] : ''
            });
        } else {
            setEditingVaccine(null);
            setFormData({
                Ma_Vacxin: '',
                Ten_Vacxin: '',
                Xuat_Xu: '',
                Gia: 0,
                Mo_Ta: '',
                Benh_Phong_Ngua: '',
                Do_Tuoi_Su_Dung: '',
                Han_Su_Dung: '',
                So_Luong: 0,
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa vaccin này?')) {
            try {
                await deleteVaccine(id);
                fetchData();
            } catch (error) {
                console.error('Error deleting vaccine:', error);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingVaccine) {
                await updateVaccine(editingVaccine.Ma_Vacxin, formData);
            } else {
                await createVaccine(formData);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Error saving vaccine:', error);
        }
    };

    const filteredVaccines = vaccines.filter(v =>
        v.Ten_Vacxin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.Ma_Vacxin.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Quản lý Vaccin</h1>
                    <p className="text-slate-500">Quản lý danh mục vaccin, liều lượng và hạn sử dụng.</p>
                </div>
                <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
                    <Plus size={18} />
                    Thêm vaccin
                </Button>
            </div>

            <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                        placeholder="Tìm kiếm vaccin theo tên, mã hoặc bệnh phòng ngừa..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-xl bg-white shadow-sm overflow-hidden border border-slate-200">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mã</TableHead>
                            <TableHead>Tên Vaccin</TableHead>
                            <TableHead>Xuất xứ</TableHead>
                            <TableHead>Giá</TableHead>
                            <TableHead>Số lượng</TableHead>
                            <TableHead>Hạn sử dụng</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-10">Đang tải dữ liệu...</TableCell>
                            </TableRow>
                        ) : filteredVaccines.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-10 text-slate-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <Syringe size={40} className="text-slate-200" />
                                        Không tìm thấy vaccin nào
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredVaccines.map((vaccine) => {
                            const isExpired = vaccine.Han_Su_Dung && new Date(vaccine.Han_Su_Dung) < new Date();
                            return (
                                <TableRow key={vaccine.Ma_Vacxin}>
                                    <TableCell className="font-medium text-emerald-600">{vaccine.Ma_Vacxin}</TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{vaccine.Ten_Vacxin}</div>
                                            <div className="text-xs text-slate-500">{vaccine.Benh_Phong_Ngua}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{vaccine.Xuat_Xu}</TableCell>
                                    <TableCell>{vaccine.Gia.toLocaleString('vi-VN')}đ</TableCell>
                                    <TableCell>{vaccine.So_Luong}</TableCell>
                                    <TableCell>
                                        <div className={cn(
                                            "flex items-center gap-1",
                                            isExpired && "text-red-500 font-medium"
                                        )}>
                                            {vaccine.Han_Su_Dung ? new Date(vaccine.Han_Su_Dung).toLocaleDateString('vi-VN') : '-'}
                                            {isExpired && <AlertTriangle size={14} />}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={cn(
                                            "px-2 py-1 rounded-full text-xs font-medium",
                                            vaccine.Trang_Thai === 'Còn hàng' ? "bg-green-100 text-green-700" :
                                                vaccine.Trang_Thai === 'Hết hạn' ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"
                                        )}>
                                            {vaccine.Trang_Thai}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <button
                                            onClick={() => handleOpenModal(vaccine)}
                                            className="p-1 hover:text-emerald-600 transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(vaccine.Ma_Vacxin)}
                                            className="p-1 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingVaccine ? 'Sửa vaccin' : 'Thêm vaccin mới'}
            >
                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Mã vaccin"
                            required
                            disabled={!!editingVaccine}
                            value={formData.Ma_Vacxin}
                            onChange={(e) => setFormData({ ...formData, Ma_Vacxin: e.target.value })}
                        />
                        <Input
                            label="Xuất xứ"
                            required
                            value={formData.Xuat_Xu}
                            onChange={(e) => setFormData({ ...formData, Xuat_Xu: e.target.value })}
                        />
                    </div>
                    <Input
                        label="Tên vaccin"
                        required
                        value={formData.Ten_Vacxin}
                        onChange={(e) => setFormData({ ...formData, Ten_Vacxin: e.target.value })}
                    />
                    <Input
                        label="Bệnh phòng ngừa"
                        placeholder="Ví dụ: Dại, Parvo, Carre..."
                        value={formData.Benh_Phong_Ngua}
                        onChange={(e) => setFormData({ ...formData, Benh_Phong_Ngua: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Giá (VNĐ)"
                            type="number"
                            required
                            value={formData.Gia}
                            onChange={(e) => setFormData({ ...formData, Gia: Number(e.target.value) })}
                        />
                        <Input
                            label="Số lượng"
                            type="number"
                            required
                            value={formData.So_Luong}
                            onChange={(e) => setFormData({ ...formData, So_Luong: Number(e.target.value) })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Hạn sử dụng"
                            type="date"
                            required
                            value={formData.Han_Su_Dung}
                            onChange={(e) => setFormData({ ...formData, Han_Su_Dung: e.target.value })}
                        />
                        <Input
                            label="Độ tuổi sử dụng"
                            placeholder="Ví dụ: > 6 tuần tuổi"
                            value={formData.Do_Tuoi_Su_Dung}
                            onChange={(e) => setFormData({ ...formData, Do_Tuoi_Su_Dung: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Mô tả</label>
                        <textarea
                            className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            rows={3}
                            value={formData.Mo_Ta}
                            onChange={(e) => setFormData({ ...formData, Mo_Ta: e.target.value })}
                        ></textarea>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Hủy</Button>
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Lưu lại</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default VaccinesPage;
