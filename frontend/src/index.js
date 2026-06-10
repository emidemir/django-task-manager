import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

/** REACT CONTEXTS */
import { AuthContextProvider } from './contexts/AuthContext';

/** PROTECTED ROUTE */
import { ProtectedRoute } from './components/protected_route/ProtectedRoute';

/** FEATURE IMPORTS */
import SignIn from './features/auth/SignIn';
import SignUp from './features/auth/SignUp';
import Dashboard     from './features/dashboard/Dashboard';
import Tasks         from './features/tasks/Tasks';
import CreateTask from './features/tasks/CreateTask';
import TaskDetail    from './features/tasks/TaskDetail';
import Projects      from './features/projects/Projects';
import ProjectDetail from './features/projects/ProjectDetail';
import CreateProject from './features/projects/CreateProject';
import Notifications from './features/notifications/Notifications';
import ProjectTeamPage          from './features/projects/ProjectTeamPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // Data is "fresh" for 5 minutes
      retry: 2,                   // Retry failed requests twice
    },
  },
});

const router = createBrowserRouter([
  // Public Routes
  { path: '/', element: <SignIn/> },
  { path: '/signup', element: <SignUp/> },
  { path: '/login', element: <SignIn/> },

  // Private Routes
  {
    element: <ProtectedRoute/>,
    children: [
      {
        element: <App/>,
        children: [
          { path: '/dashboard', element: <Dashboard/> },
          { path: '/tasks', element: <Tasks/> },
          { path: '/tasks/new', element: <CreateTask/> },
          { path: '/tasks/:taskId', element: <TaskDetail/> },
          { path: '/projects', element: <Projects/> },
          { path: '/projects/:projectId', element: <ProjectDetail/> },
          { path: '/projects/:projectId/team', element: <ProjectTeamPage/> },
          { path: '/projects/new', element: <CreateProject/> },
          { path: '/notifications', element: <Notifications/> },
          // { path: '/settings', element: <Settings/> },
        ]
      }
    ]
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <RouterProvider router={router} />
      </AuthContextProvider>
      <ReactQueryDevtools initialIsOpen={false} /> {/* Dev-only panel */}
    </QueryClientProvider>
  </React.StrictMode>
);

reportWebVitals();