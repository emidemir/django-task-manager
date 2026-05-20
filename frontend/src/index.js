import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

/** REACT CONTEXTS */
import {AuthContextProvider} from './contexts/AuthContext'

/** PROTECTED ROUTE */
import {ProtectedRoute} from './components/protected_route/ProtectedRoute'

/** FEATURE IMPORTS */
import SignIn from './features/auth/SignIn';
import SignUp from './features/auth/SignUp'

import Dashboard     from './features/dashboard/Dashboard';
import Tasks         from './features/tasks/Tasks';
import Projects      from './features/projects/Projects';
import Notifications from './features/notifications/Notifications';
import Team          from './features/team/Team';



import {createBrowserRouter, RouterProvider} from 'react-router-dom'

const router = createBrowserRouter([
  // Public Route
  {path:'/', element:<SignIn/>},
  {path:'/signup', element:<SignUp/>},

  // Private Route
  {
    element: <ProtectedRoute/>,
    children:[
      {path:'/dashboard', element:<Dashboard/>},
      {path:'/tasks', element:<Tasks/>},
      {path:'/projects', element:<Projects/>},
      {path:'/notifications', element:<Notifications/>},
      {path:'/team', element:<Team/>},
    ]
  }
  
])

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <RouterProvider router={router}/>
    </AuthContextProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
