import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

interface StatsCardProps {
    coachId: string;
}

export function StatsCard({ coachId }: StatsCardProps) {
    const { data, isLoading } = useQuery({
        queryKey: ['coachStats', coachId],
        queryFn: async () => {
            const res = await api.get(`/admin/coaches/${coachId}/stats`);
            return res.data;
        },
    });

    if (isLoading) return <div className="text-sm text-gray-500">Loading stats...</div>;

    return (
        <div className="flex space-x-4 text-sm">
            <div>
                <span className="font-semibold">{data?.studentCount || 0}</span> Students
            </div>
            <div>
                <span className="font-semibold">{data?.planCount || 0}</span> Plans
            </div>
        </div>
    );
}
