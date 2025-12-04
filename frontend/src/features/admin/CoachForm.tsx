import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const coachSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type CoachFormValues = z.infer<typeof coachSchema>;

interface CoachFormProps {
    onSuccess: () => void;
}

export function CoachForm({ onSuccess }: CoachFormProps) {
    const queryClient = useQueryClient();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<CoachFormValues>({
        resolver: zodResolver(coachSchema),
    });

    const mutation = useMutation({
        mutationFn: (data: CoachFormValues) => api.post('/admin/coaches', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coaches'] });
            onSuccess();
        },
    });

    const onSubmit = (data: CoachFormValues) => {
        mutation.mutate(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register('password')} />
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            {mutation.isError && (
                <p className="text-sm text-red-500">Failed to create coach</p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Coach'}
            </Button>
        </form>
    );
}
