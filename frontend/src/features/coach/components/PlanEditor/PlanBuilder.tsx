import { useState, useEffect } from 'react';
import { DndContext, type DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, type DragStartEvent, type DragOverEvent, closestCorners } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { DraggableExercise } from './DraggableExercise';
import { PlanDay } from './PlanDay';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../../lib/api';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Label } from '../../../../components/ui/Label';
import { Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Exercise {
    id: string;
    title: string;
}

interface PlanDayData {
    id: string;
    exercises: Array<{
        instanceId: string; // Unique ID for the plan instance
        id: string; // Reference to original exercise ID
        title: string;
        sets: number;
        reps: string;
        seriesSpecType: 'REPS' | 'TIME';
        rpe?: number;
        restSeconds?: number;
    }>;
}

interface PlanBuilderProps {
    planId?: string | null;
    onSuccess?: () => void;
}

export function PlanBuilder({ planId, onSuccess }: PlanBuilderProps) {
    const queryClient = useQueryClient();
    const [planTitle, setPlanTitle] = useState('');
    const [days, setDays] = useState<PlanDayData[]>([{ id: 'day-0', exercises: [] }]);
    const [activeDragItem, setActiveDragItem] = useState<any | null>(null);

    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        },
    }));

    const { data: availableExercises } = useQuery({
        queryKey: ['exercises'],
        queryFn: async () => {
            const res = await api.get<Exercise[]>('/exercises');
            return res.data;
        },
    });

    const { data: existingPlan } = useQuery({
        queryKey: ['plan', planId],
        queryFn: async () => {
            if (!planId) return null;
            const res = await api.get(`/plans/${planId}`);
            return res.data;
        },
        enabled: !!planId,
    });

    useEffect(() => {
        if (existingPlan) {
            setPlanTitle(existingPlan.title);
            const loadedDays = existingPlan.days.map((day: any) => ({
                id: day.id,
                exercises: day.exercises.map((ex: any) => ({
                    instanceId: uuidv4(),
                    id: ex.exercise.id,
                    title: ex.exercise.title,
                    sets: ex.sets,
                    reps: ex.reps,
                    seriesSpecType: ex.seriesSpecType,
                    restSeconds: ex.restSeconds,
                    rpe: ex.rpe,
                })),
            }));
            setDays(loadedDays);
        }
    }, [existingPlan]);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        // Check if dragging from sidebar
        if (active.data.current?.type === 'sidebar') {
            setActiveDragItem(active.data.current);
        } else {
            // Find the exercise in days
            for (const day of days) {
                const ex = day.exercises.find(e => e.instanceId === active.id);
                if (ex) {
                    setActiveDragItem(ex);
                    break;
                }
            }
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // If dragging from sidebar, do nothing in dragOver (handled in dragEnd)
        if (active.data.current?.type === 'sidebar') return;

        // Find source and destination containers
        const activeDayIndex = days.findIndex(d => d.exercises.some(e => e.instanceId === activeId));
        const overDayIndex = days.findIndex(d => d.id === overId || d.exercises.some(e => e.instanceId === overId));

        if (activeDayIndex !== -1 && overDayIndex !== -1 && activeDayIndex !== overDayIndex) {
            // Moving between days
            const newDays = [...days];
            const activeExerciseIndex = newDays[activeDayIndex].exercises.findIndex(e => e.instanceId === activeId);
            const [movedExercise] = newDays[activeDayIndex].exercises.splice(activeExerciseIndex, 1);

            // If over a day, add to end. If over an exercise, add before/after (simplified to end for now or index)
            // For simplicity in dragOver, we just move it to the new day's list
            newDays[overDayIndex].exercises.push(movedExercise);
            setDays(newDays);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragItem(null);

        if (!over) return;

        // 1. Dragging from Sidebar to Day
        if (active.data.current?.type === 'sidebar') {
            const exercise = active.data.current as Exercise;
            // Find which day we dropped onto
            const dayIndex = days.findIndex(d => d.id === over.id || d.exercises.some(e => e.instanceId === over.id));

            if (dayIndex !== -1) {
                const newDays = [...days];
                newDays[dayIndex].exercises.push({
                    instanceId: uuidv4(),
                    id: exercise.id,
                    title: exercise.title,
                    sets: 3,
                    reps: '10',
                    seriesSpecType: 'REPS',
                });
                setDays(newDays);
            }
            return;
        }

        // 2. Reordering within same day or finishing move between days
        const activeId = active.id;
        const overId = over.id;

        if (activeId !== overId) {
            const dayIndex = days.findIndex(d => d.exercises.some(e => e.instanceId === activeId));
            if (dayIndex !== -1) {
                const newDays = [...days];
                const oldIndex = newDays[dayIndex].exercises.findIndex(e => e.instanceId === activeId);
                const newIndex = newDays[dayIndex].exercises.findIndex(e => e.instanceId === overId);

                if (oldIndex !== -1 && newIndex !== -1) {
                    newDays[dayIndex].exercises = arrayMove(newDays[dayIndex].exercises, oldIndex, newIndex);
                    setDays(newDays);
                }
            }
        }
    };

    const addDay = () => {
        setDays([...days, { id: `day-${days.length}`, exercises: [] }]);
    };

    const removeExercise = (dayIndex: number, exerciseIndex: number) => {
        const newDays = [...days];
        newDays[dayIndex].exercises.splice(exerciseIndex, 1);
        setDays(newDays);
    };

    const updateExercise = (dayIndex: number, exerciseIndex: number, field: string, value: any) => {
        const newDays = [...days];
        const exercise = newDays[dayIndex].exercises[exerciseIndex];
        (exercise as any)[field] = value;
        setDays(newDays);
    };

    const saveMutation = useMutation({
        mutationFn: async () => {
            const payload = {
                title: planTitle,
                days: days.map((d, i) => ({
                    name: `Day ${i + 1}`,
                    order: i + 1,
                    exercises: d.exercises.map((e, j) => ({
                        exerciseId: e.id,
                        order: j + 1,
                        sets: Number(e.sets),
                        reps: e.reps,
                        seriesSpecType: e.seriesSpecType,
                        restSeconds: e.restSeconds,
                        rpe: e.rpe,
                    }))
                }))
            };

            if (planId) {
                await api.patch(`/plans/${planId}`, payload);
            } else {
                await api.post('/plans', payload);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plans'] });
            if (planId) {
                queryClient.invalidateQueries({ queryKey: ['plan', planId] });
            }
            alert(planId ? 'Plan updated!' : 'Plan saved!');
            if (onSuccess) {
                onSuccess();
            } else {
                setPlanTitle('');
                setDays([{ id: 'day-0', exercises: [] }]);
            }
        }
    });

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-12 gap-6 h-[calc(100vh-100px)]">
                {/* Sidebar: Available Exercises */}
                <div className="col-span-3 bg-white p-4 rounded-lg border overflow-y-auto">
                    <h3 className="font-bold mb-4">Exercises</h3>
                    <div className="space-y-2">
                        {availableExercises?.map((ex) => (
                            <DraggableExercise
                                key={ex.id}
                                id={ex.id}
                                title={ex.title}
                            />
                        ))}
                    </div>
                </div>

                {/* Main: Plan Builder */}
                <div className="col-span-9 flex flex-col space-y-4">
                    <div className="bg-white p-4 rounded-lg border space-y-4">
                        <div>
                            <Label>Plan Title</Label>
                            <Input
                                value={planTitle}
                                onChange={(e) => setPlanTitle(e.target.value)}
                                placeholder="e.g. Hypertrophy Phase 1"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-x-auto whitespace-nowrap pb-4 space-x-4">
                        {days.map((day, idx) => (
                            <div key={day.id} className="inline-block w-80 align-top h-full">
                                <PlanDay
                                    dayId={day.id}
                                    dayIndex={idx}
                                    exercises={day.exercises}
                                    onRemoveExercise={removeExercise}
                                    onUpdateExercise={updateExercise}
                                />
                            </div>
                        ))}

                        <div className="inline-block w-80 align-top">
                            <button
                                onClick={addDay}
                                className="w-full h-[200px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors"
                            >
                                <Plus className="h-8 w-8 mb-2" />
                                Add Day
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={() => saveMutation.mutate()} disabled={!planTitle || saveMutation.isPending}>
                            {saveMutation.isPending ? 'Saving...' : 'Save Plan'}
                        </Button>
                    </div>
                </div>
            </div>

            <DragOverlay>
                {activeDragItem ? (
                    <div className="p-3 bg-white border rounded-md shadow-lg w-64 opacity-90">
                        <div className="font-medium break-words">{activeDragItem.title}</div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
