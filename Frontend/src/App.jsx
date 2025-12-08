import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './Pages/Home'
import Footer from './Components/Footer'
import Header from './Components/Header'

const App = () => {
  return (
    <main className='overflow-x-hidden text-textColor'>
      <Header />
      <Routes>
        <Route path='/' element={<Home />} />
      </Routes>
      <Footer />
    </main>
  )
}

export default App
