import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Dumbbell, PlayCircle } from 'lucide-react';

interface Exercise {
    id: string;
    title: string;
    description?: string;
    videoUrl?: string;
    defaultSeriesSpec: string;
}

export function ExerciseList() {
    const { data: exercises, isLoading } = useQuery({
        queryKey: ['exercises'],
        queryFn: async () => {
            const res = await api.get<Exercise[]>('/exercises');
            return res.data;
        },
    });

    if (isLoading) return <div>Loading exercises...</div>;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {exercises?.map((exercise) => (
                <Card key={exercise.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{exercise.title}</CardTitle>
                        <Dumbbell className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-gray-500 mb-2">{exercise.description || 'No description'}</div>
                        <div className="flex items-center justify-between mt-4">
                            <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                                {exercise.defaultSeriesSpec}
                            </span>
                            {exercise.videoUrl && (
                                <a
                                    href={exercise.videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-xs text-blue-600 hover:underline"
                                >
                                    <PlayCircle className="h-3 w-3 mr-1" />
                                    Watch Video
                                </a>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
