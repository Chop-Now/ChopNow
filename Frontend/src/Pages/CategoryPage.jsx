import Breadcrumb from '@/Components/Breadcrumb'
import Footer from '@/Components/Footer'
import PageNavbar from '@/Components/PageNavbar'
import Products from '@/Components/Products'
import ShopSidebar from '@/Components/ShopSidebar'
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

const CategoryPage = () => {
  const { category } = useParams()
  const [sortBy, setSortBy] = useState('Distance (Nearest First)')
  const [priceRange, setPriceRange] = useState(50000)

  // Capitalize first letter of category for display
  const displayCategory = category.charAt(0).toUpperCase() + category.slice(1)

  return (
    <div className='bg-white min-h-screen'>
      <PageNavbar />
      
      <div className="px-6 md:px-8 lg:px-12 xl:px-16 py-6">
        <Breadcrumb category={displayCategory} />
        
        <div className="flex gap-6 mt-6">
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
            <Products 
              sortBy={sortBy} 
              priceRange={priceRange}
              category={category}
            />
          </main>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default CategoryPage
