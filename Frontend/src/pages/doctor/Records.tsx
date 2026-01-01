import { useState, type FormEvent } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { api } from '../../services/api';

export default function CreateRecord() {
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        petId: '',
        symptoms: '',
        diagnosis: '',
        treatment: '',
        reExamDate: '',
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await api.createMedicalRecord({
                petId: formData.petId,
                diagnosis: formData.diagnosis,
                treatment: formData.treatment,
                metadata: {
                    symptoms: formData.symptoms,
                    reExamDate: formData.reExamDate,
                },
            });
            setSuccess(true);
            setFormData({ petId: '', symptoms: '', diagnosis: '', treatment: '', reExamDate: '' });
        } catch (error) {
            console.error('Failed to create medical record:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Lập hồ sơ bệnh án</h2>
                <p className="text-slate-500 mt-1">Ghi chú quá trình khám và điều trị thú cưng</p>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Chi tiết hồ sơ bệnh án</CardTitle>
                </CardHeader>
                <CardContent>
                    {success && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                            Hồ sơ bệnh án đã được tạo thành công!
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Mã Thú cưng</label>
                            <Input
                                type="text"
                                value={formData.petId}
                                onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
                                placeholder="Nhập mã thú cưng"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Triệu chứng</label>
                            <textarea
                                value={formData.symptoms}
                                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                                className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[80px]"
                                placeholder="Mô tả các triệu chứng quan sát được..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Chẩn đoán</label>
                            <textarea
                                value={formData.diagnosis}
                                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                                className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[80px]"
                                placeholder="Nhập kết quả chẩn đoán..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Điều trị & Đơn thuốc</label>
                            <textarea
                                value={formData.treatment}
                                onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                                className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[100px]"
                                placeholder="Mô tả phương pháp điều trị và thuốc kê đơn..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Ngày tái khám (tùy chọn)</label>
                            <Input
                                type="date"
                                value={formData.reExamDate}
                                onChange={(e) => setFormData({ ...formData, reExamDate: e.target.value })}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <Button type="submit" disabled={submitting} className="w-full">
                            {submitting ? 'Đang tạo...' : 'Lưu hồ sơ bệnh án'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
