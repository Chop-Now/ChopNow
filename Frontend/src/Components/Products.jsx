import React, { useEffect, useState } from 'react'
import { useAppContext } from '@/context/AppContext';
import ProductCard from './ProductCard';

const Products = ({ sortBy, priceRange, category }) => {

    const {products, searchQuery} = useAppContext();
    const [filteredProducts, setFilteredProducts] = useState([])

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

  return (
    <div className='mt-1 flex flex-col'> 
       <div className='flex flex-col items-end w-max'>
           <p className='text-2xl font-medium'>{getSortTitle()}</p>
           <div className='w-16 h-0.5 bg-solid rounded-full'>
           </div>
       </div>
       <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6'>
          {filteredProducts.map((product, index) =>(
             <ProductCard key={index} product={product} />
          ))}
       </div>
    </div>
  )
}

export default Products
