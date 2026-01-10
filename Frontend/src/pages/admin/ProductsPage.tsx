import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';
import { getProducts, deleteProduct, createProduct, updateProduct } from '../../services/api';
import { Product } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { cn } from '../../lib/utils';

const ProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<Partial<Product>>({
        Ma_SP: '',
        Ten_SP: '',
        Loai_SP: 'Thức ăn',
        Gia: 0,
        Don_Vi_Tinh: '',
        So_Luong: 0,
        Mo_Ta: '',
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getProducts();
            if (res.data.success) {
                setProducts(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData(product);
        } else {
            setEditingProduct(null);
            setFormData({
                Ma_SP: '',
                Ten_SP: '',
                Loai_SP: 'Thức ăn',
                Gia: 0,
                Don_Vi_Tinh: '',
                So_Luong: 0,
                Mo_Ta: '',
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            try {
                await deleteProduct(id);
                fetchData();
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await updateProduct(editingProduct.Ma_SP, formData);
            } else {
                await createProduct(formData);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const filteredProducts = products.filter(p =>
        p.Ten_SP.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.Ma_SP.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Quản lý Sản phẩm</h1>
                    <p className="text-slate-500">Quản lý danh sách sản phẩm, tồn kho và giá cả.</p>
                </div>
                <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
                    <Plus size={18} />
                    Thêm sản phẩm
                </Button>
            </div>

            <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                        placeholder="Tìm kiếm sản phẩm theo tên hoặc mã..."
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
                            <TableHead>Mã SP</TableHead>
                            <TableHead>Tên phẩm</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Giá</TableHead>
                            <TableHead>ĐVT</TableHead>
                            <TableHead>Số lượng</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-10">Đang tải dữ liệu...</TableCell>
                            </TableRow>
                        ) : filteredProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-10 text-slate-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <Package size={40} className="text-slate-200" />
                                        Không tìm thấy sản phẩm nào
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredProducts.map((product) => (
                            <TableRow key={product.Ma_SP}>
                                <TableCell className="font-medium text-indigo-600">{product.Ma_SP}</TableCell>
                                <TableCell>{product.Ten_SP}</TableCell>
                                <TableCell>
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                        {product.Loai_SP}
                                    </span>
                                </TableCell>
                                <TableCell>{product.Gia.toLocaleString('vi-VN')}đ</TableCell>
                                <TableCell>{product.Don_Vi_Tinh}</TableCell>
                                <TableCell>{product.So_Luong}</TableCell>
                                <TableCell>
                                    <span className={cn(
                                        "px-2 py-1 rounded-full text-xs font-medium",
                                        product.Trang_Thai === 'Còn hàng' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                    )}>
                                        {product.Trang_Thai}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <button
                                        onClick={() => handleOpenModal(product)}
                                        className="p-1 hover:text-indigo-600 transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.Ma_SP)}
                                        className="p-1 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
            >
                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Mã sản phẩm"
                            required
                            disabled={!!editingProduct}
                            value={formData.Ma_SP}
                            onChange={(e) => setFormData({ ...formData, Ma_SP: e.target.value })}
                        />
                        <Select
                            label="Loại sản phẩm"
                            options={[
                                { value: 'Thức ăn', label: 'Thức ăn' },
                                { value: 'Thuốc', label: 'Thuốc' },
                                { value: 'Phụ kiện', label: 'Phụ kiện' },
                            ]}
                            value={formData.Loai_SP}
                            onChange={(e: any) => setFormData({ ...formData, Loai_SP: e.target.value })}
                        />
                    </div>
                    <Input
                        label="Tên sản phẩm"
                        required
                        value={formData.Ten_SP}
                        onChange={(e) => setFormData({ ...formData, Ten_SP: e.target.value })}
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
                            label="Đơn vị tính"
                            required
                            placeholder="Ví dụ: Gói 2kg, Cái, Lọ..."
                            value={formData.Don_Vi_Tinh}
                            onChange={(e) => setFormData({ ...formData, Don_Vi_Tinh: e.target.value })}
                        />
                    </div>
                    <Input
                        label="Số lượng"
                        type="number"
                        required
                        value={formData.So_Luong}
                        onChange={(e) => setFormData({ ...formData, So_Luong: Number(e.target.value) })}
                    />
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Mô tả</label>
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
        </div>
    );
};

export default ProductsPage;
