import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Plus } from 'lucide-react';
import { ExerciseList } from '../components/ExerciseList';
import { ExerciseForm } from '../components/ExerciseForm';

export function Exercises() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Exercises</h1>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Exercise
                </Button>
            </div>

            <ExerciseList />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Exercise"
            >
                <ExerciseForm onSuccess={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
}
