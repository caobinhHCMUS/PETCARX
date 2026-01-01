import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Pet, MedicalRecord } from '../../types';

export default function History() {
    const { user } = useAuth();
    const [pets, setPets] = useState<Pet[]>([]);
    const [selectedPetId, setSelectedPetId] = useState('');
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            api.getPets(user.id).then(data => {
                setPets(data);
                if (data.length > 0) {
                    setSelectedPetId(data[0].id);
                }
                setLoading(false);
            });
        }
    }, [user]);

    useEffect(() => {
        if (selectedPetId) {
            api.getMedicalRecords(selectedPetId).then(setRecords);
        }
    }, [selectedPetId]);

    if (loading) {
        return <div className="flex items-center justify-center h-64"><p className="text-slate-500">Đang tải...</p></div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Lịch sử Y tế</h2>
                <p className="text-slate-500 mt-1">Hồ sơ khám bệnh và điều trị của thú cưng</p>
            </div>

            {pets.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Chọn thú cưng</label>
                    <select
                        value={selectedPetId}
                        onChange={(e) => setSelectedPetId(e.target.value)}
                        className="w-full max-w-xs h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        {pets.map(pet => (
                            <option key={pet.id} value={pet.id}>{pet.name} ({pet.species})</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="space-y-4">
                {records.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-8">
                            <p className="text-slate-500">Chưa có lịch sử khám bệnh</p>
                        </CardContent>
                    </Card>
                ) : (
                    records.map((record) => (
                        <Card key={record.id}>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    {new Date(record.date).toLocaleDateString('vi-VN', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="space-y-3">
                                    <div>
                                        <dt className="text-sm font-medium text-slate-500">Chẩn đoán</dt>
                                        <dd className="mt-1 text-sm text-slate-900">{record.diagnosis}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-slate-500">Treatment</dt>
                                        <dd className="mt-1 text-sm text-slate-900">{record.treatment}</dd>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
