import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { User, Activity } from 'lucide-react';

interface Student {
    id: string;
    name: string;
    email: string;
}

export function StudentList() {
    const { data: students, isLoading } = useQuery({
        queryKey: ['students'],
        queryFn: async () => {
            const res = await api.get<Student[]>('/users/students');
            return res.data;
        },
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: true,
    });

    if (isLoading) return <div>Loading students...</div>;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {students?.map((student) => (
                <Card key={student.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{student.name}</CardTitle>
                        <User className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-gray-500 mb-4">{student.email}</div>
                        <div className="flex items-center text-sm text-blue-600">
                            <Activity className="mr-2 h-4 w-4" />
                            View Progress
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
