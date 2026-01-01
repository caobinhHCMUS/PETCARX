import { useState, useEffect } from 'react';
import { StatsCard } from '../../components/ui/StatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DollarSign, TrendingUp, Calendar, Users, Briefcase, ChevronRight, PieChart } from 'lucide-react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalRevenue: 0,
        monthlyRevenue: 0,
        totalAppointments: 0,
        totalCustomers: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getAdminStats().then(data => {
            setStats(data);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center h-64"><p className="text-slate-500 animate-pulse text-lg">Đang tính toán các chỉ số kinh doanh...</p></div>;
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-slate-900">
                        Cổng Quản trị
                    </h2>
                    <p className="text-slate-500 mt-2 text-lg">Tổng quan hiệu suất toàn hệ thống</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2" onClick={() => navigate('/admin/revenue')}>
                        Xem báo cáo <PieChart className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Tổng doanh thu"
                    value={formatCurrency(stats.totalRevenue)}
                    icon={DollarSign}
                    className="bg-blue-600 text-white border-none shadow-blue-200"
                />
                <StatsCard
                    title="Tháng hiện tại"
                    value={formatCurrency(stats.monthlyRevenue)}
                    icon={TrendingUp}
                    trend="+12% so với tháng trước"
                    trendUp
                    className="shadow-lg border-none"
                />
                <StatsCard
                    title="Lịch hẹn đang hoạt động"
                    value={stats.totalAppointments}
                    icon={Calendar}
                    className="shadow-lg border-none"
                />
                <StatsCard
                    title="Tổng số khách hàng"
                    value={stats.totalCustomers}
                    icon={Users}
                    className="shadow-lg border-none"
                />
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                <Card className="md:col-span-2 border-none shadow-xl bg-white overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-blue-600" />
                            Chỉ số Sức khỏe Kinh doanh
                        </CardTitle>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dữ liệu thời gian thực</span>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-slate-500">Doanh thu TB / Khách hàng</p>
                                    <p className="text-3xl font-bold text-slate-900">
                                        {formatCurrency(stats.totalCustomers > 0 ? stats.totalRevenue / stats.totalCustomers : 0)}
                                    </p>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-4">
                                        <div className="bg-blue-500 h-full w-[65%]" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-slate-500">Tần suất Dịch vụ</p>
                                    <p className="text-3xl font-bold text-slate-900">
                                        {(stats.totalCustomers > 0 ? stats.totalAppointments / stats.totalCustomers : 0).toFixed(1)} <span className="text-sm text-slate-400 font-normal">lịch/khách</span>
                                    </p>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-4">
                                        <div className="bg-purple-500 h-full w-[45%]" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-slate-900">Hoạt động Hệ thống</h4>
                                    <div className="flex gap-2">
                                        <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Trực tiếp
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold font-sans">
                                                    {i === 1 ? 'DL' : i === 2 ? 'TT' : 'BA'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">
                                                        {i === 1 ? 'Yêu cầu Đặt lịch mới' : i === 2 ? 'Giao dịch đã đồng bộ' : 'Bệnh án đã cập nhật'}
                                                    </p>
                                                    <p className="text-xs text-slate-400">{i * 5} phút trước</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none shadow-xl">
                        <CardContent className="p-8">
                            <h3 className="text-xl font-bold mb-2">Tiến độ Doanh thu</h3>
                            <p className="text-indigo-100 text-sm mb-6">Mục tiêu: {formatCurrency(30000000)} / tháng</p>

                            <div className="relative pt-1">
                                <div className="flex mb-2 items-center justify-between">
                                    <div>
                                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-200 bg-indigo-500/30">
                                            Hoàn thành
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-semibold inline-block text-white">
                                            {Math.round((stats.monthlyRevenue / 30000000) * 100)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-indigo-500/30">
                                    <div style={{ width: `${(stats.monthlyRevenue / 30000000) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-white" />
                                </div>
                            </div>

                            <p className="text-xs text-indigo-200 mt-2">
                                Còn lại: {formatCurrency(Math.max(0, 30000000 - stats.monthlyRevenue))}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-slate-900 text-white">
                        <CardContent className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold">Mẹo Tăng trưởng</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                Dựa trên số liệu hiện tại, nếu tăng tần suất đặt lịch khám trung bình lên 0.5 lần/khách, doanh thu tháng có thể tăng thêm 15%.
                            </p>
                            <Button variant="ghost" className="w-full text-amber-500 hover:text-amber-400 hover:bg-slate-800 border border-slate-800">
                                Gửi chiến dịch Thúc đẩy
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
