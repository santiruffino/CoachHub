import { useDraggable } from '@dnd-kit/core';

import { GripVertical } from 'lucide-react';
import { clsx } from 'clsx';

interface DraggableExerciseProps {
    id: string;
    title: string;
}

export function DraggableExercise({ id, title }: DraggableExerciseProps) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: id,
        data: {
            id,
            title,
            type: 'sidebar',
        },
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={clsx(
                "flex items-center justify-between p-3 bg-white border rounded-md shadow-sm cursor-move hover:border-blue-400 transition-colors",
                transform && "opacity-50"
            )}
        >
            <div className="flex items-center">
                <GripVertical className="h-4 w-4 text-gray-400 mr-2" />
                <div className="text-sm font-medium">{title}</div>
            </div>
        </div>
    );
}
