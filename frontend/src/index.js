import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
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
import Projects      from './features/projects/Projects';
import Notifications from './features/notifications/Notifications';
import Team          from './features/team/Team';

const router = createBrowserRouter([
  // Public Routes
  { path: '/', element: <SignIn/> },
  { path: '/signup', element: <SignUp/> },

  // Private Routes
  {
    element: <ProtectedRoute/>,
    children: [
      {
        element: <App/>,
        children: [
          { path: '/dashboard', element: <Dashboard/> },
          { path: '/tasks', element: <Tasks/> },
          { path: '/projects', element: <Projects/> },
          { path: '/notifications', element: <Notifications/> },
          { path: '/team', element: <Team/> },
        ]
      }
    ]
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <RouterProvider router={router}/>
    </AuthContextProvider>
  </React.StrictMode>
);

reportWebVitals();