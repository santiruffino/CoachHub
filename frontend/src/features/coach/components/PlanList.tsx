import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Calendar, UserPlus } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { PlanAssignmentModal } from './PlanAssignmentModal';

interface Plan {
    id: string;
    title: string;
    description?: string;
    _count?: {
        days: number;
    };
}

interface PlanListProps {
    onEdit: (planId: string) => void;
}

export function PlanList({ onEdit }: PlanListProps) {
    const [assignPlanId, setAssignPlanId] = useState<string | null>(null);

    const { data: plans, isLoading } = useQuery({
        queryKey: ['plans'],
        queryFn: async () => {
            const res = await api.get<Plan[]>('/plans');
            return res.data;
        },
    });

    if (isLoading) return <div>Loading plans...</div>;

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {plans?.map((plan) => (
                    <Card key={plan.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{plan.title}</CardTitle>
                            <Calendar className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-gray-500 mb-4">
                                {plan.description || 'No description'}
                                <br />
                                {plan._count?.days || 0} Days
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => onEdit(plan.id)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => setAssignPlanId(plan.id)}
                                >
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Assign
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Modal
                isOpen={!!assignPlanId}
                onClose={() => setAssignPlanId(null)}
                title="Assign Plan"
            >
                {assignPlanId && (
                    <PlanAssignmentModal
                        planId={assignPlanId}
                        onClose={() => setAssignPlanId(null)}
                    />
                )}
            </Modal>
        </>
    );
}
