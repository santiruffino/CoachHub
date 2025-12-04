import { useEffect, useState } from 'react';
import { dbPromise } from '../../../lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Play, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function StudentDashboard() {
    const [assignments, setAssignments] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const loadAssignments = async () => {
            const db = await dbPromise;
            const allAssignments = await db.getAll('assignments');
            // Filter for active assignments
            const active = allAssignments.filter((a: any) => a.isActive);
            setAssignments(active);
        };

        loadAssignments();

        const handleSyncComplete = () => loadAssignments();
        window.addEventListener('sync-complete', handleSyncComplete);

        return () => {
            window.removeEventListener('sync-complete', handleSyncComplete);
        };
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">My Training</h1>

            {assignments.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-gray-500">No active training plans found. Sync to update.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {assignments.map((assignment) => (
                        <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle>{assignment.plan.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500 mb-4">{assignment.plan.description}</p>
                                <div className="flex items-center text-sm text-gray-500 mb-4">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Started: {new Date(assignment.startDate).toLocaleDateString()}
                                </div>
                                <Button
                                    className="w-full"
                                    onClick={() => navigate(`/student/workout/${assignment.id}`)}
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    Start Workout
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
