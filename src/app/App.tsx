import { lazy, Suspense, useEffect } from 'react';
import { createBrowserRouter, Navigate, RouterProvider, useLocation } from 'react-router-dom';
import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion';
import { Layout } from './Layout';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { usePwa } from './usePwa';
import { usePrefsStore } from '@/store/usePrefsStore';
import { LockScreen } from '@/features/privacy/LockScreen';
import { NEUTRAL_FAVICON } from '@/assets/Logo';

// Découpage du code par écran.
const Auth = lazy(() => import('@/screens/Auth'));
const Home = lazy(() => import('@/screens/Home'));
const Learn = lazy(() => import('@/screens/Learn'));
const Help = lazy(() => import('@/screens/Help'));
const Tracking = lazy(() => import('@/screens/Tracking'));
const Settings = lazy(() => import('@/screens/Settings'));
const Impact = lazy(() => import('@/screens/Impact'));
const NotFound = lazy(() => import('@/screens/NotFound'));

/** Espace personnel : sans session ouverte, direction la page de connexion. */
function RequireAuth() {
  const loggedIn = useAuthStore((s) => s.currentUserId !== null);
  const locked = usePrefsStore((s) => s.locked);
  const { pathname, search, hash } = useLocation();
  if (!loggedIn) return <Navigate to="/connexion" replace state={{ from: pathname + search + hash }} />;
  // Mode discret : le code secret est redemandé avant d'afficher l'espace.
  if (locked) return <LockScreen />;
  return <Layout />;
}

const router = createBrowserRouter([
  {
    path: '/connexion',
    element: (
      <Suspense fallback={<div className="min-h-dvh bg-plum-700" aria-busy="true" />}>
        <Auth />
      </Suspense>
    ),
  },
  {
    element: <RequireAuth />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/comprendre', element: <Learn /> },
      { path: '/aide', element: <Help /> },
      { path: '/suivi', element: <Tracking /> },
      { path: '/reglages', element: <Settings /> },
      { path: '/impact', element: <Impact /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

/** Mode discret : favicon neutre à la place du ruban rose. */
function useDiscreetFavicon() {
  const discreet = usePrefsStore((s) => s.discreet);
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (link) link.href = discreet ? NEUTRAL_FAVICON : '/favicon.svg';
  }, [discreet]);
}

export function App() {
  usePwa();
  useDiscreetFavicon();
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        <RouterProvider router={router} />
      </LazyMotion>
    </MotionConfig>
  );
}
