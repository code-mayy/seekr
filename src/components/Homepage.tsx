import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, MessageCircle, Sparkles, Package, User, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/SearchBar';
import { CollectiblesGrid } from '@/components/CollectiblesGrid';
import { ListRequestForm } from '@/components/ListRequestForm';
import { UserGrid } from '@/components/UserGrid';

export function Homepage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [showListForm, setShowListForm] = useState(false);
  const [newListings, setNewListings] = useState<any[]>([]);
  const [searchType, setSearchType] = useState<'products' | 'users'>('products');

  const handleSearch = (query: string, searchFilters: any) => {
    setSearchQuery(query);
    setFilters(searchFilters);
    setSearchType(searchFilters.searchType || 'products');
  };

  const handleNewListing = (listingData: any) => {
    // Convert form data to display format
    const newListing = {
      id: `new-${Date.now()}`,
      name: listingData.title,
      price: `$${listingData.maxBudget.toLocaleString()}`,
      image: listingData.images.length > 0 
        ? listingData.images[0]
        : "https://images.pexels.com/photos/1040173/pexels-photo-1040173.jpeg?auto=compress&cs=tinysrgb&w=800",
      description: listingData.description,
      rating: 5.0,
      reviewCount: 1,
      sellerVerified: true,
      sellerRating: 5.0,
      category: listingData.category,
      priceValue: listingData.maxBudget,
      isNewListing: true
    };

    setNewListings(prev => [newListing, ...prev]);
  };

  return (
    <div className="min-h-screen luxury-gradient-cream">
      {/* Header Section */}
      <div className="luxury-gradient-navy text-white luxury-section-padding">
        <div className="max-w-7xl mx-auto luxury-container-padding">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h1 className="luxury-display text-white mb-6 luxury-text-shadow">
              Discover Rare
              <span className="block text-amber-400 mt-2">Treasures</span>
            </h1>
            <div className="flex items-center justify-center gap-3 mb-8">
              {searchType === 'products' ? (
                <>
                  <div className="w-8 h-8 rounded-full luxury-gradient-gold flex items-center justify-center">
                    <Package className="w-4 h-4 text-navy-900" />
                  </div>
                  <p className="luxury-body-large text-gray-300">
                    These are items our community is seeking
                  </p>
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-full luxury-gradient-gold flex items-center justify-center">
                    <Crown className="w-4 h-4 text-navy-900" />
                  </div>
                  <p className="luxury-body-large text-gray-300">
                    Connect with verified collectors and dealers
                  </p>
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </>
              )}
            </div>
            <div className="flex items-center justify-center gap-3 text-amber-400 font-medium">
              <MessageCircle className="w-5 h-5" />
              <span className="luxury-body">
                {searchType === 'products' 
                  ? "If you have what they're looking for, connect with them!"
                  : "Find experts and build your collector network!"
                }
              </span>
            </div>
          </motion.div>

          {/* Search Bar and List Request Button */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-6 lg:gap-8 max-w-6xl mx-auto">
            <div className="flex-1 w-full">
              <SearchBar onSearch={handleSearch} />
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="lg:flex-shrink-0"
            >
              <Button
                onClick={() => setShowListForm(true)}
                size="lg"
                className="w-full lg:w-auto luxury-gradient-gold text-navy-900 font-medium px-8 py-6 text-lg whitespace-nowrap luxury-button luxury-press rounded-xl shadow-lg hover:shadow-xl border-0"
              >
                <Plus className="w-5 h-5 mr-3" />
                List Your Request
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto luxury-container-padding luxury-section-padding">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="mb-16 text-center"
        >
          <h2 className="luxury-headline text-gray-900 mb-6">
            {searchType === 'products' ? 'Community Requests' : 'Verified Collectors & Dealers'}
          </h2>
          <p className="luxury-body text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {searchType === 'products' 
              ? 'Help fellow collectors find their dream items — browse requests from verified members worldwide'
              : 'Connect with trusted collectors, dealers, and experts in the luxury marketplace'
            }
          </p>
        </motion.div>

        {/* Dynamic Grid Based on Search Type */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        >
          {searchType === 'users' ? (
            <UserGrid 
              searchQuery={searchQuery} 
              filters={filters} 
            />
          ) : (
            <CollectiblesGrid 
              searchQuery={searchQuery} 
              filters={filters} 
              newListings={newListings}
            />
          )}
        </motion.div>
      </div>

      {/* List Request Form Modal */}
      <ListRequestForm 
        isOpen={showListForm} 
        onClose={() => setShowListForm(false)}
        onSubmit={handleNewListing}
      />
    </div>
  );
}