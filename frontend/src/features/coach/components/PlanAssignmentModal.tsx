import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';
import { Input } from '../../../components/ui/Input';

interface Student {
    id: string;
    name: string;
}

interface PlanAssignmentModalProps {
    planId: string;
    onClose: () => void;
}

export function PlanAssignmentModal({ planId, onClose }: PlanAssignmentModalProps) {
    const [selectedStudent, setSelectedStudent] = useState('');
    const [startDate, setStartDate] = useState('');

    const { data: students } = useQuery({
        queryKey: ['students'],
        queryFn: async () => {
            const res = await api.get<Student[]>('/users/students');
            return res.data;
        },
    });

    const mutation = useMutation({
        mutationFn: async () => {
            await api.post(`/plans/${planId}/assign`, {
                studentId: selectedStudent,
                startDate,
            });
        },
        onSuccess: () => {
            alert('Plan assigned successfully!');
            onClose();
        },
    });

    return (
        <div className="space-y-4">
            <div>
                <Label>Select Student</Label>
                <select
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                >
                    <option value="">Select a student...</option>
                    {students?.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <Label>Start Date</Label>
                <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button
                    onClick={() => mutation.mutate()}
                    disabled={!selectedStudent || !startDate || mutation.isPending}
                >
                    {mutation.isPending ? 'Assigning...' : 'Assign Plan'}
                </Button>
            </div>
        </div>
    );
}
