import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import {
    LayoutDashboard,
    Calendar,
    Dog,
    History,
    FileText,
    DollarSign,
    LogOut
} from 'lucide-react';

export function Sidebar() {
    const { user, logout } = useAuth();

    const links = {
        customer: [
            { to: '/customer', label: 'Tổng quan', icon: LayoutDashboard },
            { to: '/customer/pets', label: 'Thú cưng của tôi', icon: Dog },
            { to: '/customer/booking', label: 'Đặt lịch khám', icon: Calendar },
            { to: '/customer/history', label: 'Lịch sử y tế', icon: History },
        ],
        doctor: [
            { to: '/doctor', label: 'Tổng quan', icon: LayoutDashboard },
            { to: '/doctor/appointments', label: 'Lịch hẹn', icon: Calendar },
            { to: '/doctor/records', label: 'Lập bệnh án', icon: FileText },
        ],
        admin: [
            { to: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
            { to: '/admin/revenue', label: 'Báo cáo doanh thu', icon: DollarSign },
        ],
    };

    const currentLinks = user ? links[user.role] : [];

    return (
        <div className="h-screen w-64 bg-slate-900 text-white flex flex-col">
            <div className="p-6 border-b border-slate-700">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    PETCARX
                </h1>
                <p className="text-xs text-slate-400 mt-1">Quản lý Thú cưng</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {currentLinks.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.to.split('/').length === 2} // Exact match for dashboard
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                isActive
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )
                        }
                    >
                        <link.icon className="w-5 h-5" />
                        <span className="font-medium">{link.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-700">
                <div className="flex items-center gap-3 px-4 py-3 mb-2">
                    <img src={user?.avatar} alt="User" className="w-8 h-8 rounded-full bg-slate-700" />
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 capitalize">
                            {user?.role === 'admin' ? 'Quản trị' : user?.role === 'doctor' ? 'Bác sĩ' : 'Khách hàng'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                </button>
            </div>
        </div>
    );
}
