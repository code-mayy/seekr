import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ProductRevealCard } from '@/components/ui/product-reveal-card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { listingService, favoritesService, messagingService, reviewsService, type Listing } from '@/lib/database';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ProductDetailModal } from '@/components/ProductDetailModal';

// Mock data for demonstration (will be replaced by real data)
const mockCollectibles = [
  {
    id: 'mock-1',
    user_id: 'mock-user',
    title: "1960s Rolex Submariner",
    category: "Vintage Watches",
    description: "Rare vintage Rolex Submariner from the 1960s in excellent condition. Original dial, hands, and bezel. Complete with box and papers.",
    max_budget: 45000,
    preferred_condition: "Excellent",
    location: "New York, NY",
    additional_notes: "",
    images: ["https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=800"],
    status: "active",
    views_count: 156,
    favorites_count: 23,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mock-2',
    user_id: 'mock-user',
    title: "Original Picasso Sketch",
    category: "Art & Paintings",
    description: "Authentic Pablo Picasso pencil sketch from 1952. Provenance documented with gallery certificates. Museum-quality piece.",
    max_budget: 125000,
    preferred_condition: "Mint/New",
    location: "London, UK",
    additional_notes: "",
    images: ["https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=800"],
    status: "active",
    views_count: 89,
    favorites_count: 34,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mock-3',
    user_id: 'mock-user',
    title: "First Edition Harry Potter",
    category: "Rare Books",
    description: "First edition Harry Potter and the Philosopher's Stone, hardcover with dust jacket. Excellent condition, authenticated by rare book experts.",
    max_budget: 8500,
    preferred_condition: "Very Good",
    location: "Edinburgh, UK",
    additional_notes: "",
    images: ["https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=800"],
    status: "active",
    views_count: 234,
    favorites_count: 67,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

interface CollectiblesGridProps {
  searchQuery?: string;
  filters?: any;
  newListings?: any[];
}

export function CollectiblesGrid({ searchQuery, filters, newListings = [] }: CollectiblesGridProps) {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [listingRatings, setListingRatings] = useState<{ [key: string]: { average: number; count: number } }>({});
  const [isShowingMockData, setIsShowingMockData] = useState(false);

  useEffect(() => {
    loadListings();
  }, [searchQuery, filters]);

  const loadListings = async () => {
    setLoading(true);
    
    try {
      let data: Listing[] = [];
      
      if (searchQuery || (filters && Object.keys(filters).length > 0)) {
        // Use search with filters
        data = await listingService.searchListings(searchQuery || '', filters);
      } else {
        // Load all active listings
        data = await listingService.getActiveListings();
      }
      
      // If no real data, show mock data for demonstration
      if (data.length === 0) {
        data = mockCollectibles;
        setIsShowingMockData(true);
      } else {
        setIsShowingMockData(false);
      }
      
      setListings(data);
      
      // Load ratings for all listings
      await loadListingRatings(data, isShowingMockData || data === mockCollectibles);
      
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Error loading listings:', error);
      // Fallback to mock data
      setListings(mockCollectibles);
      setIsShowingMockData(true);
      await loadListingRatings(mockCollectibles, true);
      toast.error('Failed to load listings, showing demo data');
    } finally {
      setLoading(false);
    }
  };

  const loadListingRatings = async (listingsData: Listing[], isMock: boolean = false) => {
    const ratingsMap: { [key: string]: { average: number; count: number } } = {};
    
    for (const listing of listingsData) {
      if (isMock) {
        // For mock data, assign default rating values without API calls
        ratingsMap[listing.id] = {
          average: 4.8, // Default high rating for demo listings
          count: Math.floor(Math.random() * 20) + 5 // Random count between 5-24
        };
      } else {
        try {
          const reviews = await reviewsService.getListingReviews(listing.id);
          if (reviews.length > 0) {
            const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
            ratingsMap[listing.id] = {
              average: Math.round(average * 10) / 10, // Round to 1 decimal place
              count: reviews.length
            };
          } else {
            // Default rating for listings without reviews
            ratingsMap[listing.id] = {
              average: 4.8, // Default high rating for new listings
              count: 0
            };
          }
        } catch (error) {
          // Fallback rating
          ratingsMap[listing.id] = {
            average: 4.8,
            count: 0
          };
        }
      }
    }
    
    setListingRatings(ratingsMap);
  };

  const handleContactSeller = async (listing: Listing) => {
    if (!user) {
      toast.error('Please sign in to contact sellers');
      return;
    }

    if (isShowingMockData) {
      toast.error('This is a demo item. This action is not available for demo items.');
      return;
    }

    if (user.id === listing.user_id) {
      toast.error('You cannot contact yourself');
      return;
    }

    try {
      // Increment view count
      await listingService.incrementViews(listing.id);
      
      // Create conversation
      const conversationId = await messagingService.createConversation(
        listing.user_id,
        listing.id
      );

      if (conversationId) {
        // Send initial message
        const defaultMessage = `Hey! I think I have information about this item you are searching for: "${listing.title}". Can you provide more details about what exactly you're looking for?`;
        
        await messagingService.sendMessage(conversationId, defaultMessage);
        
        toast.success('Message sent successfully! Check your messages tab to continue the conversation.');
      }
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleFavorite = async (listing: Listing) => {
    if (!user) {
      toast.error('Please sign in to add favorites');
      return;
    }

    if (isShowingMockData) {
      toast.error('This is a demo item. This action is not available for demo items.');
      return;
    }

    try {
      const isFavorite = await favoritesService.isFavorite(listing.id);
      
      if (isFavorite) {
        await favoritesService.removeFavorite(listing.id);
        toast.success('Removed from favorites');
      } else {
        await favoritesService.addFavorite(listing.id);
        toast.success('Added to favorites');
      }
      
      // Refresh listings to update favorite count
      await loadListings();
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  const handleShowDetails = (listing: Listing) => {
    setSelectedListing(listing);
  };

  const formatPrice = (budget: number) => {
    return `$${budget.toLocaleString()}`;
  };

  const getImageUrl = (listing: Listing) => {
    if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
      return listing.images[0];
    }
    // Fallback image based on category
    const categoryImages: { [key: string]: string } = {
      'Art & Paintings': 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Vintage Watches': 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Rare Books': 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Antique Jewelry': 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Classic Cars': 'https://images.pexels.com/photos/544542/pexels-photo-544542.jpeg?auto=compress&cs=tinysrgb&w=800',
      'Wine & Spirits': 'https://images.pexels.com/photos/1170120/pexels-photo-1170120.jpeg?auto=compress&cs=tinysrgb&w=800',
    };
    return categoryImages[listing.category] || 'https://images.pexels.com/photos/1040173/pexels-photo-1040173.jpeg?auto=compress&cs=tinysrgb&w=800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Results Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-gray-600">
            Showing {listings.length} listing{listings.length !== 1 ? 's' : ''}
            {searchQuery && (
              <span className="ml-2 text-amber-600 font-medium">
                for "{searchQuery}"
              </span>
            )}
            {isShowingMockData && (
              <span className="ml-2 text-blue-600 font-medium">
                (Demo Data)
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <RefreshCw className="w-4 h-4" />
          <span>Last updated: {new Date(lastUpdate).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Grid */}
      {listings.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 justify-items-center"
        >
          {listings.map((listing, index) => {
            const rating = listingRatings[listing.id] || { average: 4.8, count: 0 };
            
            return (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="w-full max-w-sm"
              >
                <ProductRevealCard
                  name={listing.title}
                  price={formatPrice(listing.max_budget)}
                  image={getImageUrl(listing)}
                  description={listing.description}
                  rating={rating.average}
                  reviewCount={rating.count > 0 ? rating.count : listing.views_count}
                  onAdd={() => handleContactSeller(listing)}
                  onFavorite={() => handleFavorite(listing)}
                  onShowDetails={() => handleShowDetails(listing)}
                  className="w-full"
                />
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No listings found</p>
          <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
          <Button
            onClick={loadListings}
            variant="outline"
            className="mt-4"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedListing && (
        <ProductDetailModal
          listing={selectedListing}
          isOpen={!!selectedListing}
          onClose={() => setSelectedListing(null)}
          isMockListing={isShowingMockData}
        />
      )}
    </div>
  );
}