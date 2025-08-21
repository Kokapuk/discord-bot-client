import { Suspense } from 'react';
import { Outlet } from 'react-router';
import RouteSpinner from '../RouteSpinner';
import Titlebar from '../Titlebar';
import styles from './Layout.module.scss';

export default function GlobalLayout() {
  return (
    <div className={styles.layout}>
      <Titlebar />
      <div className={styles.content}>
        <Suspense fallback={<RouteSpinner />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}
