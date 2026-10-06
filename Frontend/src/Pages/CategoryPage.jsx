import Breadcrumb from '../Components/Breadcrumb';
import Footer from '../Components/Footer';
import PageNavbar from '../Components/PageNavbar';
import Products from '../Components/Products';
import ShopSidebar from '../Components/ShopSidebar';
import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getCategoryBackend, getCategoryDisplay } from '../utils/transforms';

const CategoryPage = () => {
  const { category } = useParams();
  const [sortBy, setSortBy] = useState('Distance (Nearest First)');
  const [priceRange, setPriceRange] = useState(50000);
  const productsRef = useRef();

  // Capitalize first letter of category for display (with fallback)
  // "/shop/vegetables" and "/shop/fruit-veg" both read as "Fruits & Vegetables";
  // anything we don't recognise falls back to the path, tidied up.
  const knownBackend = category ? getCategoryBackend(category) : null;
  const displayCategory = !category
    ? 'All Products'
    : knownBackend && (knownBackend !== 'other' || category.toLowerCase() === 'other')
      ? getCategoryDisplay(knownBackend)
      : category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');

  return (
    <div className="bg-white min-h-screen pt-20">
      <PageNavbar onMobileFilterClick={() => productsRef.current?.openMobileSort()} />

      <div className="px-6 md:px-8 lg:px-12 xl:px-16 py-6">
        <Breadcrumb category={displayCategory} />
        <h1 className="sr-only">{displayCategory} deals</h1>

        <div className="flex gap-6 mt-6 items-start pb-20">
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
          <div className="flex-1">
            <Products
              ref={productsRef}
              sortBy={sortBy}
              priceRange={priceRange}
              category={category}
              setSortBy={setSortBy}
              setPriceRange={setPriceRange}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CategoryPage;
