import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './Pages/Home'
import Login from './Pages/Login'
import SignUp from './Pages/SignUp'
import Shop from './Pages/Shop'
import { Toaster } from 'react-hot-toast'

const App = () => {
  return (
    <main className='overflow-x-hidden text-textColor'>

      <Toaster />
     
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/shop' element={<Shop />} />
      </Routes>
    </main>
  )
}

export default App
