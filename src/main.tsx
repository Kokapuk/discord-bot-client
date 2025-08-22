import { lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { createHashRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import GlobalLayout from './components/GlobalLayout';
import { Provider } from './ui/provider';

const Auth = lazy(() => import('./routes/Auth'));
const AppLayout = lazy(() => import('./components/AppLayout'));
const Home = lazy(() => import('./routes/Home'));
const GuildLayout = lazy(() => import('./components/GuildLayout'));
const Guild = lazy(() => import('./routes/Home/Guild'));
const Channel = lazy(() => import('./routes/Home/Guild/Channel'));

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
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider>
    <RouterProvider router={router} />
  </Provider>
);
