import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { CoachList } from '../features/admin/CoachList';
import { CoachForm } from '../features/admin/CoachForm';

export function Coaches() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Coaches</h1>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Coach
                </Button>
            </div>

            <CoachList />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Coach"
            >
                <CoachForm onSuccess={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
}
