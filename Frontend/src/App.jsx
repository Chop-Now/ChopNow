import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './Pages/Home'
import Login from './Pages/Login'
import SignUp from './Pages/SignUp'
import Shop from './Pages/Shop'
import CategoryPage from './Pages/CategoryPage'
import { Toaster } from 'react-hot-toast'
import ProductDetails from './Pages/ProductDetails'
import Cart from './Pages/Cart'
import MyOrders from './Pages/MyOrders'
import MyImpact from './Pages/MyImpact'
import Notification from './Pages/Notification'
import MyProfile from './Pages/MyProfile'
import BusinessVerification from './Pages/BusinessVerification'
import PendingReview from './Pages/PendingReview'

const App = () => {
  return (
    <main className='overflow-x-hidden text-textColor'>

      <Toaster />
     
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/business-verification' element={<BusinessVerification />} />
        <Route path='/pending-review' element={<PendingReview />} />
        <Route path='/shop' element={<Shop />} />
        <Route path='/shop/:category' element={<CategoryPage />} />
        <Route path='/shop/:category/:id' element={<ProductDetails />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/my-orders' element={<MyOrders />} />
        <Route path='/my-impact' element={<MyImpact />} />
        <Route path='/my-profile' element={<MyProfile />} />
        <Route path='/notifications' element={<Notification />} />
        {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
      </Routes>
    </main>
  )
}

export default App
