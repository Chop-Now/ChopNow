import Categories from '@/Components/Categories'
import Footer from '@/Components/Footer'
import PageNavbar from '@/Components/PageNavbar'
import Products from '@/Components/Products'
import ShopSidebar from '@/Components/ShopSidebar'
import React, { useState } from 'react'

const Shop = () => {
  const [sortBy, setSortBy] = useState('Distance (Nearest First)')
  const [priceRange, setPriceRange] = useState(50000)

  return (
    <div className='bg-white min-h-screen'>
      <PageNavbar />
      <Categories />
      
      <div className="flex gap-6 px-6 md:px-8 lg:px-12 xl:px-16 py-6">
        {/* Left Sidebar */}
        <aside className="hidden lg:block w-72 shrink-0">
          <ShopSidebar 
            sortBy={sortBy}
            setSortBy={setSortBy}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
          />
        </aside>
        {/* Main Content Area */}
        <main className="flex-1">
          <Products sortBy={sortBy} priceRange={priceRange} />
          {/* Product grid will go here
          <div className="text-center py-20" style={{ color: 'var(--color-gray-50)' }}>
            Products will be displayed here
          </div> */}
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default Shop
