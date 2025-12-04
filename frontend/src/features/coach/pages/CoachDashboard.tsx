import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Users, Calendar, TrendingUp } from 'lucide-react';

interface DashboardStats {
    totalStudents: number;
    totalPlans: number;
    activeAssignments: number;
}

export function CoachDashboard() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['coach-stats'],
        queryFn: async () => {
            const res = await api.get<DashboardStats>('/coach/stats');
            return res.data;
        },
    });

    if (isLoading) return <div>Loading dashboard...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
                        <p className="text-xs text-gray-500">Active students</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
                        <Calendar className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalPlans || 0}</div>
                        <p className="text-xs text-gray-500">Created training plans</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.activeAssignments || 0}</div>
                        <p className="text-xs text-gray-500">Students currently training</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
