import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Login } from './pages/Login';
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminDashboard } from './pages/AdminDashboard';
import { Coaches } from './pages/Coaches';
import { CoachLayout } from './features/coach/components/CoachLayout';
import { CoachDashboard } from './features/coach/pages/CoachDashboard';
import { Students } from './features/coach/pages/Students';
import { Plans } from './features/coach/pages/Plans';
import { Exercises } from './features/coach/pages/Exercises';
import { ProtectedRoute } from './components/ProtectedRoute'; // Assuming ProtectedRoute is in this path
import { StudentLayout } from './features/student/components/StudentLayout';
import { StudentDashboard } from './features/student/pages/StudentDashboard';
import { WorkoutSession } from './features/student/pages/WorkoutSession';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="coaches" element={<Coaches />} />
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
          </Route>

          {/* Coach Routes */}
          <Route element={<ProtectedRoute allowedRoles={['COACH']} />}>
            <Route path="/coach" element={<CoachLayout />}>
              <Route path="dashboard" element={<CoachDashboard />} />
              {/* Placeholders for now */}
              <Route path="students" element={<Students />} />
              <Route path="exercises" element={<Exercises />} />
              <Route path="plans" element={<Plans />} />
              <Route index element={<Navigate to="/coach/dashboard" replace />} />
            </Route>
          </Route>

          {/* Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
            <Route path="/student" element={<StudentLayout />}>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="workout/:assignmentId" element={<WorkoutSession />} />
              <Route index element={<Navigate to="/student/dashboard" replace />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
