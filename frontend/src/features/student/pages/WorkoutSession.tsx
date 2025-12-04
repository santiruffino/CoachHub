import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbPromise } from '../../../lib/db';
import { syncEngine } from '../../../lib/sync-engine';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { Clock, Save } from 'lucide-react';

export function WorkoutSession() {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const [plan, setPlan] = useState<any>(null);
    const [currentDayIndex] = useState(0); // TODO: Add UI to switch days
    const [workoutData, setWorkoutData] = useState<any>({});
    const [startTime] = useState(Date.now());

    useEffect(() => {
        const loadPlan = async () => {
            if (!assignmentId) return;
            const db = await dbPromise;
            const assignment = await db.get('assignments', assignmentId);
            if (assignment) {
                setPlan(assignment.plan);
            }
        };
        loadPlan();
    }, [assignmentId]);

    const handleInputChange = (exerciseId: string, setIndex: number, field: string, value: string) => {
        setWorkoutData((prev: any) => {
            const exerciseData = prev[exerciseId] || { sets: [] };
            const sets = [...(exerciseData.sets || [])];
            if (!sets[setIndex]) sets[setIndex] = {};
            sets[setIndex] = { ...sets[setIndex], [field]: value };
            return { ...prev, [exerciseId]: { ...exerciseData, sets } };
        });
    };

    const finishWorkout = async () => {
        const durationMinutes = Math.round((Date.now() - startTime) / 60000);

        const exercises = Object.entries(workoutData).map(([exerciseId, data]: [string, any]) => ({
            exerciseId,
            sets: data.sets.map((set: any, index: number) => ({
                setNumber: index + 1,
                reps: parseInt(set.reps) || 0,
                weight: parseFloat(set.weight) || 0,
                rpe: parseInt(set.rpe) || 0,
            })),
        }));

        const payload = {
            planId: plan.id,
            dayId: plan.days[currentDayIndex].id,
            exercises,
            durationMinutes,
            feedback: '', // Could add a feedback field
            timestamp: Date.now(),
        };

        await syncEngine.queueMutation('LOG_WORKOUT', payload);
        navigate('/student/dashboard');
    };

    if (!plan) return <div>Loading workout...</div>;

    const currentDay = plan.days[currentDayIndex];

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{currentDay.name}</h1>
                <div className="text-sm text-gray-500">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {Math.round((Date.now() - startTime) / 60000)} min
                </div>
            </div>

            {currentDay.exercises.map((planExercise: any) => (
                <Card key={planExercise.id}>
                    <CardHeader>
                        <CardTitle className="text-lg">{planExercise.exercise.title}</CardTitle>
                        <p className="text-sm text-gray-500">{planExercise.sets} sets x {planExercise.reps || 'reps'}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Array.from({ length: planExercise.sets }).map((_, i) => (
                            <div key={i} className="grid grid-cols-3 gap-4 items-end">
                                <div>
                                    <Label className="text-xs">Weight (kg)</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        onChange={(e) => handleInputChange(planExercise.exercise.id, i, 'weight', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs">Reps</Label>
                                    <Input
                                        type="number"
                                        placeholder={planExercise.reps || "0"}
                                        onChange={(e) => handleInputChange(planExercise.exercise.id, i, 'reps', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs">RPE</Label>
                                    <Input
                                        type="number"
                                        placeholder="1-10"
                                        onChange={(e) => handleInputChange(planExercise.exercise.id, i, 'rpe', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
                <div className="max-w-3xl mx-auto">
                    <Button className="w-full" size="lg" onClick={finishWorkout}>
                        <Save className="w-4 h-4 mr-2" />
                        Finish Workout
                    </Button>
                </div>
            </div>
        </div>
    );
}
