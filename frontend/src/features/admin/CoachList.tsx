import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Trash2 } from 'lucide-react';
import { StatsCard } from './StatsCard';

export function CoachList() {
    const queryClient = useQueryClient();
    const { data: coaches, isLoading } = useQuery({
        queryKey: ['coaches'],
        queryFn: async () => {
            const res = await api.get('/admin/coaches');
            return res.data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/admin/coaches/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coaches'] });
        },
    });

    if (isLoading) return <div>Loading coaches...</div>;

    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Stats</th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {coaches?.map((coach: any) => (
                        <tr key={coach.id}>
                            <td className="whitespace-nowrap px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">{coach.name}</div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                                <div className="text-sm text-gray-500">{coach.email}</div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${coach.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {coach.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                                <StatsCard coachId={coach.id} />
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                <Button
                                    variant="ghost"
                                    className="text-red-600 hover:text-red-900"
                                    onClick={() => {
                                        if (confirm('Are you sure you want to delete this coach?')) {
                                            deleteMutation.mutate(coach.id);
                                        }
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
