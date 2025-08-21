import { lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { createHashRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import GlobalLayout from './components/GlobalLayout';
import { Provider } from './ui/provider';

const Auth = lazy(() => import('./routes/Auth'));
const AppLayout = lazy(() => import('./components/AppLayout'));
const Home = lazy(() => import('./routes/Home'));

const router = createHashRouter([
  {
    element: <GlobalLayout />,
    children: [
      {
        path: '/auth',
        element: <Auth />,
      },
      {
        path: '/',
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Home />,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider>
    <RouterProvider router={router} />
  </Provider>
);
