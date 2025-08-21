import { Suspense } from 'react';
import { Outlet } from 'react-router';
import RouteSpinner from '../RouteSpinner';
import ServerList from '../ServerList';
import styles from './AppLayout.module.scss';

export default function AppLayout() {
  return (
    <div className={styles.layout}>
      <ServerList />
      <div className={styles.content}>
        <Suspense fallback={<RouteSpinner />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}
