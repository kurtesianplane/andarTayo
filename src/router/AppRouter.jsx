import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AlertProvider } from '../context/AlertContext';
import PWAManager from '../components/PWA/PWAManager';
import Layout from '../components/Layout';
import HomePage from '../pages/HomePage';
import AboutPage from '../pages/AboutPage';
import OfflinePage from '../pages/OfflinePage';
import MaintainerPage from '../pages/MaintainerPage';
import LRT1Page from '../pages/transport/LRT1Page';
import LRT2Page from '../pages/transport/LRT2Page';
import MRT3Page from '../pages/transport/MRT3Page';
import EDSACarouselPage from '../pages/transport/EDSACarouselPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "about",
        element: <AboutPage />
      },
      {
        path: "offline",
        element: <OfflinePage />
      },
      {
        path: "maintainer",
        element: <MaintainerPage />
      },
      {
        path: "transport/lrt-1",
        element: <LRT1Page />
      },
      {
        path: "transport/lrt-2",
        element: <LRT2Page />
      },
      {
        path: "transport/mrt-3",
        element: <MRT3Page />
      },
      {
        path: "transport/edsa-carousel",
        element: <EDSACarouselPage />
      }
    ]
  }
]);

const AppRouter = () => {
  return (
    <AlertProvider>
      <PWAManager>
        <RouterProvider router={router} />
      </PWAManager>
    </AlertProvider>
  );
};

export default AppRouter;
