import Categories from '@/Components/Categories'
import Footer from '@/Components/Footer'
import PageNavbar from '@/Components/PageNavbar'
import Products from '@/Components/Products'
import ShopSidebar from '@/Components/ShopSidebar'
import React, { useState, useRef } from 'react'

const Shop = () => {
  const [sortBy, setSortBy] = useState('Distance (Nearest First)')
  const [priceRange, setPriceRange] = useState(50000)
  const productsRef = useRef()

  return (
    <div className='bg-white min-h-screen pt-20'>
      <PageNavbar onMobileFilterClick={() => productsRef.current?.openMobileSort()} />
      <Categories />
      
      <div className="px-6 md:px-8 lg:px-12 xl:px-16 py-6">
        <div className="flex gap-6 items-start pb-12">
          {/* Left Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0 self-stretch">
            <ShopSidebar 
              sortBy={sortBy}
              setSortBy={setSortBy}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
            />
          </aside>
          {/* Main Content Area */}
          <main className="flex-1">
            <Products 
              ref={productsRef}
              sortBy={sortBy} 
              priceRange={priceRange}
              setSortBy={setSortBy}
              setPriceRange={setPriceRange}
            />
          </main>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Shop
