import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import PageNavbar from '../Components/PageNavbar';
import Footer from '../Components/Footer';
import SEO from '../Components/SEO';
import LoadingSpinner from '../Components/ui/LoadingSpinner';
import { formatCurrency } from '../utils/transforms';
import { Clock, MapPin, Star, Share2, Phone, Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Store = () => {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);
        // Fetch business details
        const bizRes = await api.get(`/api/v1/businesses/${id}`);
        const bizData = bizRes.data.business || bizRes.data.data || bizRes.data;
        setBusiness(bizData);

        // Fetch business listings
        const listingsRes = await api.get(`/api/v1/listings?business=${id}&status=active`);
        const listingsData = listingsRes.data.listings || listingsRes.data.data || listingsRes.data || [];
        setListings(Array.isArray(listingsData) ? listingsData : []);
      } catch (err) {
        console.error('Error fetching store:', err);
        setError('Failed to load store profile. The business may not exist or is currently inactive.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchStoreData();
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${business?.name} on ChopNow`,
        text: `Check out great food deals from ${business?.name} on ChopNow!`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Store link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <PageNavbar />
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <PageNavbar />
        <div className="max-w-4xl mx-auto mt-16 p-8 bg-white rounded-2xl shadow-sm text-center">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Store Not Found</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link to="/shop" className="bg-green-600 text-white px-6 py-3 rounded-full font-medium hover:bg-green-700 transition-colors">
            Browse All Stores
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const coverImage = business.media?.coverImage || business.coverImage;
  const logo = business.media?.logo || business.logo;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <SEO 
        title={`${business.name} | ChopNow`}
        description={business.description || `Rescue delicious food from ${business.name} at a discount on ChopNow.`}
        image={coverImage || logo}
      />
      <PageNavbar />

      {/* Store Header / Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="relative h-64 md:h-80 w-full bg-gray-200">
          {coverImage ? (
            <img src={coverImage} alt={`${business.name} cover`} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-green-600 to-emerald-800" />
          )}
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-20 sm:-mt-24 pb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {/* Logo */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden shrink-0">
              {logo ? (
                <img src={logo} alt={`${business.name} logo`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-green-50 flex items-center justify-center text-4xl font-bold text-green-600">
                  {business.name.charAt(0)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0 sm:pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 justify-between">
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900">{business.name}</h1>
                  {business.type && (
                    <p className="text-gray-500 font-medium capitalize mt-1">{business.type.replace('-', ' ')}</p>
                  )}
                </div>
                
                <button 
                  onClick={handleShare}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium transition-colors sm:w-auto w-full mt-4 sm:mt-0"
                >
                  <Share2 className="w-4 h-4" />
                  Share Store
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 text-sm text-gray-600">
                {business.rating && (
                  <div className="flex items-center gap-1 font-medium text-gray-900 bg-amber-50 px-2.5 py-1 rounded-full">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>{typeof business.rating === 'object' ? (business.rating.average || 0) : business.rating}</span>
                    <span className="text-gray-500 font-normal">({typeof business.rating === 'object' ? (business.rating.count || 0) : (business.reviewCount || 0)})</span>
                  </div>
                )}
                {business.address?.street && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{business.address.street}, {business.address.city}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description & Details */}
          {(business.description || business.contact?.phone) && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                {business.description && (
                  <>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">About</h3>
                    <p className="text-gray-600 leading-relaxed">{business.description}</p>
                  </>
                )}
              </div>
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Contact & Info</h3>
                <div className="space-y-3">
                  {business.contact?.phone && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${business.contact.phone}`} className="hover:text-green-600">{business.contact.phone}</a>
                    </div>
                  )}
                  {business.website && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a href={business.website} target="_blank" rel="noopener noreferrer" className="hover:text-green-600 truncate">{business.website.replace(/^https?:\/\//, '')}</a>
                    </div>
                  )}
                  {/* Stats */}
                  {business.stats?.totalOrders > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-green-700 font-medium">
                        <span className="bg-green-100 p-1.5 rounded-lg">🎉</span>
                        <span>{business.stats.totalOrders}+ meals rescued</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Available Deals from {business.name}</h2>
        
        {listings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No active deals right now</h3>
            <p className="text-gray-500 mb-6">Check back later or browse other stores for great food rescues.</p>
            <Link to="/shop" className="inline-flex bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">
              Browse All Stores
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map(listing => (
              <ListingCard key={listing._id} item={listing} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

// Extracted ListingCard for better organization
const ListingCard = ({ item }) => {
  const discount = item.pricing?.originalPrice 
    ? Math.round(((item.pricing.originalPrice - item.pricing.price) / item.pricing.originalPrice) * 100) 
    : 0;
    
  const isLowStock = item.inventory?.quantity > 0 && item.inventory?.quantity <= 3;
  const isSoldOut = item.inventory?.quantity === 0;

  return (
    <Link to={`/shop/${item.category || 'all'}/${item._id}`} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 transform hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
        {item.photos && item.photos.length > 0 ? (
          <img 
            src={item.photos[0]} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
            <svg className="w-12 h-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount > 0 && (
            <div className="bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-md">
              SAVE {discount}%
            </div>
          )}
          {isLowStock && !isSoldOut && (
            <div className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-md">
              Only {item.inventory.quantity} left
            </div>
          )}
        </div>
        
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
            <span className="bg-white/90 text-gray-900 font-bold px-4 py-2 rounded-lg rotate-12 shadow-xl border border-gray-200">
              SOLD OUT
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-green-600 transition-colors">
            {item.title}
          </h3>
        </div>

        <div className="mt-auto pt-4 flex items-end justify-between">
          <div>
            <span className="text-xl font-extrabold text-green-600">
              {formatCurrency(item.pricing?.price || 0)}
            </span>
            {item.pricing?.originalPrice && (
              <span className="ml-2 text-sm text-gray-400 line-through font-medium">
                {formatCurrency(item.pricing.originalPrice)}
              </span>
            )}
          </div>
          
          <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Store;
