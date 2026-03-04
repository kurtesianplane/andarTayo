import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import PWAManager from '../components/PWA/PWAManager';
import Layout from '../components/Layout';
import AboutPage from '../pages/AboutPage';
import PlanPage from '../pages/PlanPage';
import AlertsPage from '../pages/AlertsPage';
import NewsPage from '../pages/NewsPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <PlanPage />,
      },
      {
        path: 'alerts',
        element: <AlertsPage />,
      },
      {
        path: 'news',
        element: <NewsPage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
    ],
  },
]);

const AppRouter = () => {
  return (
    <PWAManager>
      <RouterProvider router={router} />
    </PWAManager>
  );
};

export default AppRouter;
