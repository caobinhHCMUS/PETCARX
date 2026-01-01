import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Appointment } from '../../types';

export default function AppointmentList() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            api.getAppointments(user.id, 'doctor').then(data => {
                // Sort by date descending
                const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setAppointments(sorted);
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
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Lịch hẹn của tôi</h2>
                <p className="text-slate-500 mt-1">Xem tất cả các lịch hẹn đã lên kế hoạch</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Tất cả lịch hẹn</CardTitle>
                </CardHeader>
                <CardContent>
                    {appointments.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">Không tìm thấy lịch hẹn nào</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ngày & Giờ</TableHead>
                                    <TableHead>Thú cưng</TableHead>
                                    <TableHead>Chủ sở hữu</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Ghi chú</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {appointments.map((appt) => (
                                    <TableRow key={appt.id}>
                                        <TableCell className="font-medium">
                                            {new Date(appt.date).toLocaleString('vi-VN', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </TableCell>
                                        <TableCell>{appt.petName}</TableCell>
                                        <TableCell>Khách hàng #{appt.petId}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${appt.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                appt.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                                    appt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {appt.status === 'completed' ? 'Đã xong' : appt.status === 'confirmed' ? 'Đã xác nhận' : appt.status === 'cancelled' ? 'Đã hủy' : 'Chờ xác nhận'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-slate-500">{appt.notes || '-'}</TableCell>
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
