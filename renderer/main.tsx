import { lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { createHashRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import GlobalLayout from './layouts/GlobalLayout';
import { ChakraProvider } from './ui/ChakraProvider';
import { Toaster } from './ui/Toaster';

const Auth = lazy(() => import('./routes/Auth'));
const AppLayout = lazy(() => import('./layouts/AppLayout'));
const GuildLayout = lazy(() => import('./layouts/GuildLayout'));
const GuildChannel = lazy(() => import('./routes/Home/Guild/Channel'));
const DmLayout = lazy(() => import('./layouts/DmLayout'));
const DmChannel = lazy(() => import('./routes/Home/Dm/Channel'));
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
            path: 'guilds/:guildId',
            element: <GuildLayout />,
            children: [
              {
                path: ':channelId',
                element: <GuildChannel />,
              },
            ],
          },
          {
            path: 'dm',
            element: <DmLayout />,
            children: [
              {
                path: ':channelId',
                element: <DmChannel />,
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
