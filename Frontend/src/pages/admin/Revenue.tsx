import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';

export default function RevenueReport() {
    const [filters, setFilters] = useState({
        branch: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });

    const [reportData] = useState([
        { branch: 'Chi nhánh Q1', month: 1, year: 2026, revenue: 28500000, appointments: 120 },
        { branch: 'Chi nhánh Q2', month: 1, year: 2026, revenue: 32000000, appointments: 145 },
        { branch: 'Chi nhánh Q3', month: 1, year: 2026, revenue: 25000000, appointments: 98 },
    ]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const handleGenerateReport = () => {
        console.log('Generating report with filters:', filters);
        // In a real app, this would call an API
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Báo cáo Doanh thu</h2>
                <p className="text-slate-500 mt-1">Tạo báo cáo doanh thu chi tiết theo chi nhánh và khoảng thời gian</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Bộ lọc báo cáo</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Chi nhánh</label>
                            <select
                                value={filters.branch}
                                onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                                className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="">Tất cả chi nhánh</option>
                                <option value="q1">Chi nhánh Q1</option>
                                <option value="q2">Chi nhánh Q2</option>
                                <option value="q3">Chi nhánh Q3</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Tháng</label>
                            <Input
                                type="number"
                                min="1"
                                max="12"
                                value={filters.month}
                                onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value) })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Năm</label>
                            <Input
                                type="number"
                                min="2020"
                                max="2030"
                                value={filters.year}
                                onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
                            />
                        </div>

                        <div className="flex items-end">
                            <Button onClick={handleGenerateReport} className="w-full">
                                Tạo báo cáo
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Tổng hợp doanh thu</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Chi nhánh</TableHead>
                                <TableHead>Thời gian</TableHead>
                                <TableHead className="text-right">Doanh thu</TableHead>
                                <TableHead className="text-right">Số lịch hẹn</TableHead>
                                <TableHead className="text-right">D.Thu TB/Lịch hẹn</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reportData.map((row, idx) => (
                                <TableRow key={idx}>
                                    <TableCell className="font-medium">{row.branch}</TableCell>
                                    <TableCell>{row.month}/{row.year}</TableCell>
                                    <TableCell className="text-right font-medium">{formatCurrency(row.revenue)}</TableCell>
                                    <TableCell className="text-right">{row.appointments}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(row.revenue / row.appointments)}</TableCell>
                                </TableRow>
                            ))}
                            <TableRow className="bg-slate-50 font-semibold">
                                <TableCell colSpan={2}>Tổng cộng</TableCell>
                                <TableCell className="text-right">
                                    {formatCurrency(reportData.reduce((sum, r) => sum + r.revenue, 0))}
                                </TableCell>
                                <TableCell className="text-right">
                                    {reportData.reduce((sum, r) => sum + r.appointments, 0)}
                                </TableCell>
                                <TableCell className="text-right">-</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
