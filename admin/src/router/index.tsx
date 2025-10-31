import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Spin } from 'antd';

// 懒加载页面组件
const Login = React.lazy(() => import('../pages/Login/index'));
const SimpleLayout = React.lazy(() => import('../components/SimpleLayout'));
const Dashboard = React.lazy(() => import('../pages/Dashboard/index'));
const ReadingManagement = React.lazy(() => import('../pages/ReadingManagement/index'));
const BookManagement = React.lazy(() => import('../pages/reading/BookManagement'));
const ListeningManagement = React.lazy(() => import('../pages/ListeningManagement/index'));
const DictionaryManagement = React.lazy(() => import('../pages/dictionary/DictionaryManagement'));
const UserManagement = React.lazy(() => import('../pages/UserManagement/index'));
const Settings = React.lazy(() => import('../pages/Settings/index'));

// 加载组件
const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
    <Spin size="large" />
  </div>
);

// 路由配置
export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <SimpleLayout />
      </Suspense>
    ),
    children: [
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'reading',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ReadingManagement />
          </Suspense>
        ),
      },
      {
        path: 'reading/books',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <BookManagement />
          </Suspense>
        ),
      },
      {
        path: 'listening',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ListeningManagement />
          </Suspense>
        ),
      },
      {
        path: 'dictionary',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <DictionaryManagement />
          </Suspense>
        ),
      },
      {
        path: 'users',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <UserManagement />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Settings />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

export default router;