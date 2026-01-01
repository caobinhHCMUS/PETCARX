import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { Dog, ShieldCheck, UserCircle } from 'lucide-react';
import { api } from '../../services/api';

export default function Login() {
    const [role, setRole] = useState<'customer' | 'doctor' | 'admin'>('customer');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userData = await api.login({ email, password });
            login(userData.role, userData);
            navigate(`/${userData.role}`);
        } catch (err) {
            alert('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

            <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 text-white relative z-10">
                <CardContent className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            PETCARX
                        </h1>
                        <p className="text-slate-400 mt-2">Chào mừng bạn trở lại với Hệ thống Chăm sóc Thú cưng</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Chọn vai trò của bạn</label>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole('customer')}
                                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${role === 'customer'
                                        ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                                        : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600'
                                        }`}
                                >
                                    <Dog className="w-6 h-6 mb-1" />
                                    <span className="text-xs font-semibold">Khách hàng</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('doctor')}
                                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${role === 'doctor'
                                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400'
                                        : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600'
                                        }`}
                                >
                                    <UserCircle className="w-6 h-6 mb-1" />
                                    <span className="text-xs font-semibold">Bác sĩ</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('admin')}
                                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${role === 'admin'
                                        ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                                        : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600'
                                        }`}
                                >
                                    <ShieldCheck className="w-6 h-6 mb-1" />
                                    <span className="text-xs font-semibold">Quản trị</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <Input
                                    type="email"
                                    placeholder="email@vidu.com"
                                    className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                                    required
                                    value={email}
                                    onChange={(e: any) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <Input
                                    type="password"
                                    placeholder="Mật khẩu"
                                    className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                                    required
                                    value={password}
                                    onChange={(e: any) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white border-none py-6 text-lg font-bold shadow-2xl shadow-blue-500/20 active:scale-[0.98] transition-transform">
                            Đăng nhập
                        </Button>
                    </form>

                    <p className="text-center text-slate-400 mt-8 text-sm">
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className="text-blue-400 hover:underline font-semibold">
                            Tạo tài khoản ngay
                        </Link>
                    </p>
                </CardContent>
            </Card>

            {/* Bottom info */}
            <div className="absolute bottom-8 text-slate-600 text-xs text-center w-full">
                © 2026 PETCARX - Hệ thống Y tế Thú cưng. Bảo lưu mọi quyền.
            </div>
        </div>
    );
}
