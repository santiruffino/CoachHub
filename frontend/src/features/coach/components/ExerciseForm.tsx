import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { VideoUpload } from './VideoUpload';
import { useState } from 'react';

const exerciseSchema = z.object({
    title: z.string().min(2, 'Title is required'),
    description: z.string().optional(),
});

type ExerciseFormData = z.infer<typeof exerciseSchema>;

interface ExerciseFormProps {
    onSuccess: () => void;
}

export function ExerciseForm({ onSuccess }: ExerciseFormProps) {
    const queryClient = useQueryClient();
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<ExerciseFormData>({
        resolver: zodResolver(exerciseSchema),
        defaultValues: {
        }
    });

    const mutation = useMutation({
        mutationFn: async (data: ExerciseFormData) => {
            await api.post('/exercises', { ...data, videoUrl });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exercises'] });
            onSuccess();
        },
    });

    return (
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="title">Exercise Title</Label>
                <Input id="title" {...register('title')} placeholder="e.g. Barbell Squat" />
                {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input id="description" {...register('description')} placeholder="Instructions..." />
            </div>



            <div className="space-y-2">
                <Label>Demonstration Video</Label>
                <VideoUpload onUploadComplete={setVideoUrl} />
            </div>

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? 'Creating...' : 'Create Exercise'}
            </Button>
        </form>
    );
}
