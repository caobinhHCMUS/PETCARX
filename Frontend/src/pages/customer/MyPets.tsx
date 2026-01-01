import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Dog, Cat } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Pet } from '../../types';

export default function MyPets() {
    const { user } = useAuth();
    const [pets, setPets] = useState<Pet[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            api.getPets(user.id).then(data => {
                setPets(data);
                setLoading(false);
            });
        }
    }, [user]);

    if (loading) {
        return <div className="flex items-center justify-center h-64"><p className="text-slate-500">Đang tải...</p></div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Thú cưng của tôi</h2>
                <p className="text-slate-500 mt-1">Quản lý danh sách thú cưng của bạn</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pets.map((pet) => (
                    <Card key={pet.id}>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    {(pet.species === 'Dog' || pet.species === 'Chó') ? <Dog className="w-6 h-6" /> : <Cat className="w-6 h-6" />}
                                </div>
                                <CardTitle>{pet.name}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <dl className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-slate-500">Loài:</dt>
                                    <dd className="font-medium">{pet.species === 'Dog' ? 'Chó' : pet.species === 'Cat' ? 'Mèo' : pet.species}</dd>
                                </div>
                                {pet.breed && (
                                    <div className="flex justify-between">
                                        <dt className="text-slate-500">Giống:</dt>
                                        <dd className="font-medium">{pet.breed}</dd>
                                    </div>
                                )}
                                {pet.age && (
                                    <div className="flex justify-between">
                                        <dt className="text-slate-500">Tuổi:</dt>
                                        <dd className="font-medium">{pet.age} tuổi</dd>
                                    </div>
                                )}
                            </dl>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {pets.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-slate-500">Bạn chưa đăng ký thú cưng nào.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
