import { useState, useEffect } from 'react';
import { StatsCard } from '../../components/ui/StatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Dog, Calendar, Trophy } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Appointment } from '../../types';

export default function CustomerDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalPets: 0, upcomingAppointments: 0, loyaltyPoints: 0 });
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            Promise.all([
                api.getCustomerStats(user.id),
                api.getAppointments(user.id, 'customer')
            ]).then(([statsData, apptData]) => {
                setStats(statsData);
                const upcoming = apptData.filter(a => new Date(a.date) > new Date()).slice(0, 5);
                setAppointments(upcoming);
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
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Tổng quan</h2>
                <p className="text-slate-500 mt-1">Chào mừng bạn trở lại! Đây là tổng quan về thú cưng và lịch hẹn của bạn.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <StatsCard title="Thú cưng của tôi" value={stats.totalPets} icon={Dog} />
                <StatsCard title="Lịch hẹn sắp tới" value={stats.upcomingAppointments} icon={Calendar} />
                <StatsCard title="Điểm tích lũy" value={stats.loyaltyPoints} icon={Trophy} trendUp />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lịch hẹn sắp tới</CardTitle>
                </CardHeader>
                <CardContent>
                    {appointments.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">Không có lịch hẹn sắp tới</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Thú cưng</TableHead>
                                    <TableHead>Bác sĩ</TableHead>
                                    <TableHead>Ngày & Giờ</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {appointments.map((appt) => (
                                    <TableRow key={appt.id}>
                                        <TableCell className="font-medium">{appt.petName}</TableCell>
                                        <TableCell>{appt.doctorName}</TableCell>
                                        <TableCell>{new Date(appt.date).toLocaleString('vi-VN')}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${appt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                appt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-slate-100 text-slate-800'
                                                }`}>
                                                {appt.status === 'confirmed' ? 'Đã xác nhận' : appt.status === 'pending' ? 'Chờ xác nhận' : 'Khác'}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
