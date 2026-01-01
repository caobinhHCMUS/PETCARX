import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { api } from '../../services/api';

export default function Register() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        cccd: '',
        gender: 'Nam',
        birthDate: '',
        password: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert('Mật khẩu xác nhận không khớp');
            return;
        }

        setLoading(true);
        try {
            await api.register(formData);
            alert('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/');
        } catch (err: any) {
            alert(err.response?.data?.error || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden py-12">
            {/* Decorative Elements */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            <div className="absolute -bottom-8 right-20 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

            <Card className="w-full max-w-xl bg-white/10 backdrop-blur-xl border-white/20 text-white relative z-10">
                <CardContent className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            PETCARX
                        </h1>
                        <p className="text-slate-400 mt-2">Tham gia cộng đồng chăm sóc thú cưng ngay hôm nay</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-300">Họ tên</label>
                                <Input
                                    name="name"
                                    placeholder="Nguyễn Văn A"
                                    className="bg-slate-900/50 border-slate-700 text-white"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-300">CCCD</label>
                                <Input
                                    name="cccd"
                                    placeholder="012345678901"
                                    className="bg-slate-900/50 border-slate-700 text-white"
                                    required
                                    value={formData.cccd}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-300">Email</label>
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="bg-slate-900/50 border-slate-700 text-white"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-300">Số điện thoại</label>
                                <Input
                                    name="phone"
                                    placeholder="0912345678"
                                    className="bg-slate-900/50 border-slate-700 text-white"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-300">Giới tính</label>
                                <select
                                    name="gender"
                                    className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-white"
                                    value={formData.gender}
                                    onChange={handleChange}
                                >
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-300">Ngày sinh</label>
                                <Input
                                    name="birthDate"
                                    type="date"
                                    className="bg-slate-900/50 border-slate-700 text-white"
                                    required
                                    value={formData.birthDate}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300">Mật khẩu</label>
                            <Input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                className="bg-slate-900/50 border-slate-700 text-white"
                                required
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300">Xác nhận mật khẩu</label>
                            <Input
                                name="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                className="bg-slate-900/50 border-slate-700 text-white"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>

                        <Button disabled={loading} type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white border-none py-6 font-bold mt-4 shadow-xl shadow-purple-500/10">
                            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
                        </Button>
                    </form>

                    <p className="text-center text-slate-400 mt-8 text-sm">
                        Bạn đã có tài khoản?{' '}
                        <Link to="/" className="text-blue-400 hover:underline font-semibold">
                            Đăng nhập
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
