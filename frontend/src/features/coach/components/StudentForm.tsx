import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { useAuth } from '../../../hooks/useAuth';

const studentSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
    onSuccess: () => void;
}

export function StudentForm({ onSuccess }: StudentFormProps) {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { register, handleSubmit, formState: { errors } } = useForm<StudentFormData>({
        resolver: zodResolver(studentSchema),
    });

    const mutation = useMutation({
        mutationFn: async (data: StudentFormData) => {
            // If we have a user (coach) logged in, send their ID
            const payload = { ...data, coachId: user?.id };
            await api.post('/auth/register', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            onSuccess();
        },
    });

    return (
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Temporary Password</Label>
                <Input id="password" type="password" {...register('password')} />
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? 'Creating...' : 'Create Student'}
            </Button>
        </form>
    );
}
