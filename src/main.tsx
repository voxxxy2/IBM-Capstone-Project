
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
import Edit from './pages/Edit'
import Trash from './pages/Trash'
import About from './pages/About'
import './styles.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'edit', element: <Edit /> },
      { path: 'edit/:id', element: <Edit /> },
      { path: 'trash', element: <Trash /> },
      { path: 'about', element: <About /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
