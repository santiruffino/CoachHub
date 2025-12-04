import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { Input } from '../../../../components/ui/Input';

interface SortableExerciseProps {
    id: string; // unique instance id
    title: string;
    sets: number;
    reps: string;
    seriesSpecType: 'REPS' | 'TIME';
    onRemove: () => void;
    onUpdate: (field: string, value: any) => void;
}

export function SortableExercise({ id, title, sets, reps, seriesSpecType, onRemove, onUpdate }: SortableExerciseProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="bg-white p-3 rounded shadow-sm border space-y-2">
            <div className="flex justify-between items-start">
                <div className="flex items-center">
                    <button {...attributes} {...listeners} className="cursor-grab hover:text-blue-500 mr-2">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                    </button>
                    <span className="font-medium text-sm">{title}</span>
                </div>
                <button onClick={onRemove} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            <div className="grid grid-cols-3 gap-2 pl-6">
                <div>
                    <label className="text-[10px] text-gray-500 uppercase">Sets</label>
                    <Input
                        type="number"
                        value={sets}
                        onChange={(e) => onUpdate('sets', e.target.value)}
                        className="h-7 text-xs px-1"
                    />
                </div>
                <div>
                    <label className="text-[10px] text-gray-500 uppercase">Type</label>
                    <select
                        value={seriesSpecType}
                        onChange={(e) => onUpdate('seriesSpecType', e.target.value)}
                        className="h-7 w-full text-xs rounded-md border border-gray-300 px-1"
                    >
                        <option value="REPS">Reps</option>
                        <option value="TIME">Time</option>
                    </select>
                </div>
                <div>
                    <label className="text-[10px] text-gray-500 uppercase">Value</label>
                    <Input
                        value={reps}
                        onChange={(e) => onUpdate('reps', e.target.value)}
                        className="h-7 text-xs px-1"
                        placeholder={seriesSpecType === 'TIME' ? '30s' : '8-12'}
                    />
                </div>
            </div>
        </div>
    );
}
