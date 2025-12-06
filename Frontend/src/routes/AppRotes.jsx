import React from 'react'
import { Route, Routes, BrowserRouter } from 'react-router-dom'
import Login from '../screens/Login'
import Register from '../screens/Register'
import Home from '../screens/Home'
import Project from '../screens/Project'
import AuthUser from '../auth/AuthUser'

const AppRotes = () => {
  return (
    <BrowserRouter>
        <Routes>
            <Route path='/' element={<AuthUser><Home /></AuthUser>} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/project' element={<AuthUser><Project /></AuthUser>} />
        </Routes>
    </BrowserRouter>
  )
}

export default AppRotes
