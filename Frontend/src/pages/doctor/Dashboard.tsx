import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatsCard } from '../../components/ui/StatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Calendar, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { type Appointment } from '../../types';

export default function DoctorDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ todayAppointments: 0, totalPatients: 0, completedToday: 0 });
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            Promise.all([
                api.getDoctorStats(user.id),
                api.getAppointments(user.id, 'doctor')
            ]).then(([statsData, apptData]) => {
                setStats(statsData);
                const today = new Date();
                const todayAppts = apptData.filter(a => {
                    const apptDate = new Date(a.date);
                    return apptDate.toDateString() === today.toDateString();
                });
                setAppointments(todayAppts);
                setLoading(false);
            });
        }
    }, [user]);

    if (loading) {
        return <div className="flex items-center justify-center h-64"><p className="text-slate-500 animate-pulse">Đang tải lịch trình...</p></div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-slate-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Tổng quan Bác sĩ
                    </h2>
                    <p className="text-slate-500 mt-2 text-lg">Xin chào, BS. {user?.name.split(' ').pop()}! Bạn có {stats.todayAppointments} thú cưng cần khám hôm nay.</p>
                </div>
                <Button onClick={() => navigate('/doctor/records')} variant="primary" className="gap-2">
                    Lập hồ sơ bệnh án mới <ArrowRight className="w-4 h-4" />
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <StatsCard
                    title="Lịch hẹn hôm nay"
                    value={stats.todayAppointments}
                    icon={Calendar}
                    className="border-l-4 border-l-blue-500"
                />
                <StatsCard
                    title="Tổng số bệnh nhân"
                    value={stats.totalPatients}
                    icon={Users}
                    className="border-l-4 border-l-purple-500"
                />
                <StatsCard
                    title="Đã hoàn thành"
                    value={stats.completedToday}
                    icon={CheckCircle}
                    trendUp
                    className="border-l-4 border-l-green-500"
                />
            </div>

            <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md">
                <CardHeader className="bg-slate-50/50">
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        Danh sách khám hôm nay
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {appointments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                            <Calendar className="w-12 h-12 mb-4 opacity-20" />
                            <p>Không có lịch hẹn nào cho hôm nay</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[100px]">Thời gian</TableHead>
                                    <TableHead>Tên Thú cưng</TableHead>
                                    <TableHead>Chủ sở hữu</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {appointments.map((appt) => (
                                    <TableRow key={appt.id} className="group transition-colors">
                                        <TableCell className="font-bold text-blue-600">
                                            {new Date(appt.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-slate-900">{appt.petName}</div>
                                            <div className="text-xs text-slate-500">ID: {appt.petId}</div>
                                        </TableCell>
                                        <TableCell className="text-slate-600">Khách hàng #{appt.petId.slice(-3)}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${appt.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                appt.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                {appt.status === 'completed' ? 'Đã xong' : appt.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ khám'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => navigate('/doctor/records', { state: { petId: appt.petId } })}
                                            >
                                                Bắt đầu khám
                                            </Button>
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
