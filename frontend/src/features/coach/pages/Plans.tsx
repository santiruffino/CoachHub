import { useState } from 'react';
import { PlanBuilder } from '../components/PlanEditor/PlanBuilder';
import { PlanList } from '../components/PlanList';
import { Button } from '../../../components/ui/Button';
import { Plus, List } from 'lucide-react';

export function Plans() {
    const [view, setView] = useState<'list' | 'builder'>('list');

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Training Plans</h1>
                    <p className="text-gray-500">Manage and create training plans.</p>
                </div>
                <div className="flex space-x-2">
                    <Button
                        variant={view === 'list' ? 'primary' : 'outline'}
                        onClick={() => setView('list')}
                    >
                        <List className="mr-2 h-4 w-4" />
                        My Plans
                    </Button>
                    <Button
                        variant={view === 'builder' ? 'primary' : 'outline'}
                        onClick={() => setView('builder')}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create New
                    </Button>
                </div>
            </div>

            <div className="flex-1">
                {view === 'list' ? <PlanList /> : <PlanBuilder />}
            </div>
        </div>
    );
}
