import { render, screen, waitFor } from '@testing-library/react';
import { StatsCard } from './StatsCard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { api } from '../../lib/api';

const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
);

describe('StatsCard', () => {
    it('renders loading state initially', () => {
        vi.spyOn(api, 'get').mockReturnValue(new Promise(() => { }));

        render(<StatsCard coachId="123" />, { wrapper });
        expect(screen.getByText('Loading stats...')).toBeInTheDocument();
    });

    it('renders stats when data is loaded', async () => {
        vi.spyOn(api, 'get').mockResolvedValue({
            data: { studentCount: 10, planCount: 5 },
        });

        render(<StatsCard coachId="123" />, { wrapper });

        await waitFor(() => {
            expect(screen.getByText('10')).toBeInTheDocument();
            expect(screen.getByText('5')).toBeInTheDocument();
        });
    });
});
