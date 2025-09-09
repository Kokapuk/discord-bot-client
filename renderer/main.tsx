import { lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { createHashRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import GlobalLayout from './layouts/GlobalLayout';
import { ChakraProvider } from './ui/ChakraProvider';
import { Toaster } from './ui/Toaster';

const Auth = lazy(() => import('./routes/Auth'));
const AppLayout = lazy(() => import('./layouts/AppLayout'));
const Home = lazy(() => import('./routes/Home'));
const GuildLayout = lazy(() => import('./layouts/GuildLayout'));
const Guild = lazy(() => import('./routes/Home/Guild'));
const Channel = lazy(() => import('./routes/Home/Guild/Channel'));
const MiniBrowser = lazy(() => import('./routes/MiniBrowser'));

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
          {
            path: 'guilds/:guildId',
            element: <GuildLayout />,
            children: [
              {
                index: true,
                element: <Guild />,
              },
              {
                path: ':channelId',
                element: <Channel />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '/miniBrowser',
    element: <MiniBrowser />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ChakraProvider>
    <Toaster />
    <RouterProvider router={router} />
  </ChakraProvider>
);
