import { createBrowserRouter } from 'react-router-dom'
import { ProfileSelect, Dashboard, Points } from '@/pages'

const Router = createBrowserRouter([
  {
    path: '/',
    element: <ProfileSelect />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/points',
    element: <Points />,
  },
])

export default Router
