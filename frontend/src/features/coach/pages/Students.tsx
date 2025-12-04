import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Plus } from 'lucide-react';
import { StudentList } from '../components/StudentList';
import { StudentForm } from '../components/StudentForm';

export function Students() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Students</h1>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Student
                </Button>
            </div>

            <StudentList />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Student"
            >
                <StudentForm onSuccess={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
}
