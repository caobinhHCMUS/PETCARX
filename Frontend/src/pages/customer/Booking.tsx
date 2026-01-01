import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Pet } from '../../types';

export default function Booking() {
    const { user } = useAuth();
    const [pets, setPets] = useState<Pet[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        petId: '',
        date: '',
        time: '',
        notes: '',
    });

    useEffect(() => {
        if (user) {
            api.getPets(user.id).then(data => {
                setPets(data);
                setLoading(false);
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const selectedPet = pets.find(p => p.id === formData.petId);
        const appointmentDate = new Date(`${formData.date}T${formData.time}`);

        try {
            await api.createAppointment({
                petId: formData.petId,
                petName: selectedPet?.name || '',
                date: appointmentDate.toISOString(),
                notes: formData.notes,
            });
            setSuccess(true);
            setFormData({ petId: '', date: '', time: '', notes: '' });
        } catch (error) {
            console.error('Failed to create appointment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><p className="text-slate-500">Đang tải...</p></div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Đặt lịch khám</h2>
                <p className="text-slate-500 mt-1">Lên lịch hẹn chăm sóc cho thú cưng của bạn</p>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Chi tiết lịch hẹn</CardTitle>
                </CardHeader>
                <CardContent>
                    {success && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                            Đặt lịch thành công! Chúng tôi sẽ xác nhận sớm nhất có thể.
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Chọn thú cưng</label>
                            <select
                                value={formData.petId}
                                onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
                                className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                required
                            >
                                <option value="">Chọn một thú cưng...</option>
                                {pets.map(pet => (
                                    <option key={pet.id} value={pet.id}>{pet.name} ({pet.species})</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Ngày</label>
                                <Input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Giờ</label>
                                <Input
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Ghi chú (tùy chọn)</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[100px]"
                                placeholder="Mô tả tình trạng hoặc yêu cầu đặc biệt..."
                            />
                        </div>

                        <Button type="submit" disabled={submitting} className="w-full">
                            {submitting ? 'Đang xử lý...' : 'Xác nhận Đặt lịch'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
