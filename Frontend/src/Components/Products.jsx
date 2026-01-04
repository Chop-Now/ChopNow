import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react'
import { useAppContext } from '@/context/AppContext';
import ProductCard from './ProductCard';
import { ChevronDown } from 'lucide-react';

const Products = forwardRef(({ sortBy, priceRange, category, setSortBy, setPriceRange }, ref) => {

    const {products, searchQuery} = useAppContext();
    const [filteredProducts, setFilteredProducts] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [showMobileSort, setShowMobileSort] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    // Expose method to parent
    useImperativeHandle(ref, () => ({
      openMobileSort: () => setShowMobileSort(true)
    }))

    // Check if mobile
    useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 768)
      checkMobile()
      window.addEventListener('resize', checkMobile)
      return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const productsPerPage = isMobile ? 10 : 9

    useEffect(() => {
       let filtered = products.filter(product => product.inStock)
       
       // Filter by category if provided
       if(category){
        filtered = filtered.filter(
            product => product.category.toLowerCase() === category.toLowerCase()
        )
       }
       
       // Filter by search query
       if(searchQuery.length > 0){
        filtered = filtered.filter(
            product => product.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
       }
       
       // Filter by price range
       filtered = filtered.filter(product => product.offerPrice <= priceRange)
       
       // Sort products
       if(sortBy === 'Distance (Nearest First)') {
         // For now, keep original order (would need location data to sort by distance)
         filtered = [...filtered]
       } else if(sortBy === 'Date Posted') {
         filtered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
       } else if(sortBy === 'A to Z') {
         filtered = filtered.sort((a, b) => a.name.localeCompare(b.name))
       } else if(sortBy === 'Vendor Rating') {
         filtered = filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
       }
       
       setFilteredProducts(filtered)
       setCurrentPage(1) // Reset to page 1 when filters change
    }, [products, searchQuery, sortBy, priceRange, category])

  const getSortTitle = () => {
    switch(sortBy) {
      case 'Distance (Nearest First)':
        return 'Fresh Deals Near You'
      case 'Date Posted':
        return 'Recently Posted Deals'
      case 'A to Z':
        return 'All Deals A-Z'
      case 'Vendor Rating':
        return 'Top Rated Vendors'
      default:
        return 'Fresh Deals Near You'
    }
  }
// Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)

  // Generate page numbers to display (max 5)
  const getPageNumbers = () => {
    const pages = []
    const maxPages = 5
    
    if (totalPages <= maxPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= maxPages; i++) {
          pages.push(i)
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - maxPages + 1; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i)
        }
      }
    }
    
    return pages
  }

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
    <div className='mt-1 flex flex-col relative'> 
       {/* Title and Price Slider Row */}
       <div className='flex items-center justify-between gap-4'>
         <div className='flex flex-col items-end w-max'>
             <p className='md:text-2xl text-lg font-medium'>{getSortTitle()}</p>
             <div className='w-16 h-0.5 bg-solid rounded-full'></div>
         </div>
         
         {/* Mobile Price Slider */}
         <div className="md:hidden flex flex-col items-end">
           <label className="text-xs font-medium mb-1" style={{ color: 'var(--color-textColor)' }}>
             Price: RWF {priceRange.toLocaleString()}
           </label>
           <input
             type="range"
             min="0"
             max="100000"
             step="1000"
             value={priceRange}
             onChange={(e) => setPriceRange(parseInt(e.target.value))}
             className="w-24 h-1.5 rounded-lg appearance-none cursor-pointer"
             style={{
               background: `linear-gradient(to right, var(--color-solid) 0%, var(--color-solid) ${(priceRange / 100000) * 100}%, #E5E5E5 ${(priceRange / 100000) * 100}%, #E5E5E5 100%)`
             }}
           />
         </div>
       </div>

       {/* Mobile Sort Modal */}
       {showMobileSort && (
         <>
           <div 
             className="fixed inset-0 bg-black/30 z-40 md:hidden"
             onClick={() => setShowMobileSort(false)}
           />
           <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 md:hidden animate-slide-up">
             <div className="p-6">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-lg font-semibold" style={{ color: 'var(--color-textColor)' }}>Sort By</h3>
                 <button onClick={() => setShowMobileSort(false)} className="text-gray-500">✕</button>
               </div>
               <div className="flex flex-col gap-3">
                 {['Distance (Nearest First)', 'Date Posted', 'A to Z', 'Vendor Rating'].map((option) => (
                   <button
                     key={option}
                     onClick={() => {
                       setSortBy(option)
                       setShowMobileSort(false)
                     }}
                     className={`text-left px-4 py-3 rounded-lg transition ${
                       sortBy === option ? 'font-semibold' : ''
                     }`}
                     style={{
                       color: sortBy === option ? 'var(--color-solid)' : 'var(--color-textColor)',
                       backgroundColor: sortBy === option ? 'rgba(0, 168, 107, 0.1)' : 'transparent'
                     }}
                   >
                     {option}
                   </button>
                 ))}
               </div>
             </div>
           </div>
         </>
       )}

       <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-6'>
          {currentProducts.map((product, index) =>(
             <ProductCard key={index} product={product} />
          ))}
       </div>

       {/* Pagination absolutely positioned so sidebar matches only grid height */}
       {totalPages > 1 && (
         <div className="absolute left-0 right-0 top-full mt-8 flex items-center justify-center w-full">
           <div className="flex items-center justify-between w-full max-w-80 text-gray-500 font-medium">
             <button 
               type="button" 
               aria-label="prev" 
               className="rounded-full bg-slate-200/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
               onClick={() => handlePageChange(currentPage - 1)}
               disabled={currentPage === 1}
             >
               <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M22.499 12.85a.9.9 0 0 1 .57.205l.067.06a.9.9 0 0 1 .06 1.206l-.06.066-5.585 5.586-.028.027.028.027 5.585 5.587a.9.9 0 0 1 .06 1.207l-.06.066a.9.9 0 0 1-1.207.06l-.066-.06-6.25-6.25a1 1 0 0 1-.158-.212l-.038-.08a.9.9 0 0 1-.03-.606l.03-.083a1 1 0 0 1 .137-.226l.06-.066 6.25-6.25a.9.9 0 0 1 .635-.263Z" fill="#475569" stroke="#475569" strokeWidth=".078"/>
               </svg>
             </button>

             <div className="flex items-center gap-2 text-sm font-medium">
               {getPageNumbers().map((pageNum) => (
                 <button 
                   key={pageNum}
                   onClick={() => handlePageChange(pageNum)}
                   className={`h-10 w-10 flex items-center justify-center aspect-square cursor-pointer ${
                     currentPage === pageNum 
                       ? 'border rounded-full' 
                       : ''
                   }`}
                   style={currentPage === pageNum ? { 
                     color: 'var(--color-solid)', 
                     borderColor: 'var(--color-solid)' 
                   } : {}}
                 >
                   {pageNum}
                 </button>
               ))}
             </div>

             <button 
               type="button" 
               aria-label="next" 
               className="rounded-full bg-slate-200/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
               onClick={() => handlePageChange(currentPage + 1)}
               disabled={currentPage === totalPages}
             >
               <svg className="rotate-180" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M22.499 12.85a.9.9 0 0 1 .57.205l.067.06a.9.9 0 0 1 .06 1.206l-.06.066-5.585 5.586-.028.027.028.027 5.585 5.587a.9.9 0 0 1 .06 1.207l-.06.066a.9.9 0 0 1-1.207.06l-.066-.06-6.25-6.25a1 1 0 0 1-.158-.212l-.038-.08a.9.9 0 0 1-.03-.606l.03-.083a1 1 0 0 1 .137-.226l.06-.066 6.25-6.25a.9.9 0 0 1 .635-.263Z" fill="#475569" stroke="#475569" strokeWidth=".078"/>
               </svg>
             </button>
           </div>
         </div>
       )}
    </div>
    </>
  )
})

Products.displayName = 'Products'

export default Products
