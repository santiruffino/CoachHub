import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { clsx } from 'clsx';
import { SortableExercise } from './SortableExercise';

interface PlanDayProps {
    dayId: string;
    dayIndex: number;
    exercises: any[];
    onRemoveExercise: (dayIndex: number, exerciseIndex: number) => void;
    onUpdateExercise: (dayIndex: number, exerciseIndex: number, field: string, value: any) => void;
}

export function PlanDay({ dayId, dayIndex, exercises, onRemoveExercise, onUpdateExercise }: PlanDayProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: dayId,
        data: { dayIndex, type: 'day' },
    });

    return (
        <div
            ref={setNodeRef}
            className={clsx(
                "bg-gray-50 rounded-lg p-4 border-2 border-dashed transition-colors min-h-[200px] whitespace-normal",
                isOver ? "border-blue-500 bg-blue-50" : "border-gray-200"
            )}
        >
            <h3 className="font-medium text-gray-700 mb-4">Day {dayIndex + 1}</h3>

            <SortableContext items={exercises.map(e => e.instanceId)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                    {exercises.length === 0 && (
                        <div className="text-sm text-gray-400 text-center py-8">
                            Drop exercises here
                        </div>
                    )}

                    {exercises.map((ex, idx) => (
                        <SortableExercise
                            key={ex.instanceId}
                            id={ex.instanceId}
                            title={ex.title}
                            sets={ex.sets}
                            reps={ex.reps}
                            seriesSpecType={ex.seriesSpecType}
                            onRemove={() => onRemoveExercise(dayIndex, idx)}
                            onUpdate={(field, value) => onUpdateExercise(dayIndex, idx, field, value)}
                        />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
}
