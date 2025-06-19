import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Star, Heart, MessageCircle, Eye, MapPin, Calendar, User, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { favoritesService, reviewsService, messagingService, listingService, type Listing, type Review } from '@/lib/database';
import { toast } from 'sonner';

interface ProductDetailModalProps {
  listing: Listing;
  isOpen: boolean;
  onClose: () => void;
  isMockListing?: boolean;
}

export function ProductDetailModal({ listing, isOpen, onClose, isMockListing = false }: ProductDetailModalProps) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isContactingUser, setIsContactingUser] = useState(false);

  useEffect(() => {
    if (isOpen && listing) {
      loadData();
    }
  }, [isOpen, listing, isMockListing]);

  const loadData = async () => {
    if (!listing) return;

    if (isMockListing) {
      // For mock data, set default values without API calls
      setIsFavorite(false);
      setReviews([]);
      setUserReview(null);
      return;
    }

    try {
      // Check if favorited
      const favoriteStatus = await favoritesService.isFavorite(listing.id);
      setIsFavorite(favoriteStatus);

      // Load reviews
      const listingReviews = await reviewsService.getListingReviews(listing.id);
      setReviews(listingReviews);

      // Load user's review if exists
      if (user) {
        const existingReview = await reviewsService.getUserReview(listing.id);
        setUserReview(existingReview);
      }

      // Increment view count
      await listingService.incrementViews(listing.id);
    } catch (error) {
      console.error('Error loading product details:', error);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      toast.error('Please sign in to add favorites');
      return;
    }

    if (isMockListing) {
      toast.error('This is a demo item. This action is not available for demo items.');
      return;
    }

    try {
      if (isFavorite) {
        await favoritesService.removeFavorite(listing.id);
        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        await favoritesService.addFavorite(listing.id);
        setIsFavorite(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Please sign in to leave a review');
      return;
    }

    if (isMockListing) {
      toast.error('This is a demo item. This action is not available for demo items.');
      return;
    }

    if (user.id === listing.user_id) {
      toast.error('You cannot review your own listing');
      return;
    }

    setIsSubmittingReview(true);
    try {
      if (userReview) {
        // Update existing review
        const updatedReview = await reviewsService.updateReview(
          userReview.id,
          newReview.rating,
          newReview.comment
        );
        if (updatedReview) {
          setUserReview(updatedReview);
          // Update in reviews list
          setReviews(reviews.map(r => r.id === updatedReview.id ? updatedReview : r));
        }
      } else {
        // Create new review
        const createdReview = await reviewsService.addReview(
          listing.id,
          newReview.rating,
          newReview.comment
        );
        if (createdReview) {
          setUserReview(createdReview);
          setReviews([createdReview, ...reviews]);
        }
      }

      setShowReviewForm(false);
      setNewReview({ rating: 5, comment: '' });
      toast.success(userReview ? 'Review updated successfully' : 'Review added successfully');
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleContactUser = async () => {
    if (!user) {
      toast.error('Please sign in to contact users');
      return;
    }

    if (isMockListing) {
      toast.error('This is a demo item. This action is not available for demo items.');
      return;
    }

    if (user.id === listing.user_id) {
      toast.error('You cannot contact yourself');
      return;
    }

    setIsContactingUser(true);
    try {
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
        onClose();
      }
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsContactingUser(false);
    }
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

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light">
            {listing.title}
            {isMockListing && (
              <Badge variant="outline" className="ml-2 text-blue-600 border-blue-600">
                Demo Item
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-lg">
              <img
                src={getImageUrl(listing)}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Additional images if available */}
            {listing.images && Array.isArray(listing.images) && listing.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {listing.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="aspect-square relative overflow-hidden rounded">
                    <img
                      src={image}
                      alt={`${listing.title} ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{listing.category}</Badge>
                  <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
                    {listing.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {listing.views_count} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {listing.favorites_count} favorites
                  </span>
                  {reviews.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {averageRating.toFixed(1)} ({reviews.length})
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFavoriteToggle}
                  disabled={!user}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Price */}
            <div className="text-3xl font-bold text-amber-600">
              ${listing.max_budget.toLocaleString()}
              <span className="text-sm font-normal text-gray-500 ml-2">max budget</span>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{listing.description}</p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">Preferred Condition</span>
                <p className="font-medium">{listing.preferred_condition}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Location</span>
                <p className="font-medium flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {listing.location}
                </p>
              </div>
            </div>

            {/* Additional Notes */}
            {listing.additional_notes && (
              <div>
                <h3 className="font-semibold mb-2">Additional Notes</h3>
                <p className="text-gray-700">{listing.additional_notes}</p>
              </div>
            )}

            {/* Seller Info */}
            {listing.profiles && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={listing.profiles.avatar_url} />
                      <AvatarFallback>
                        {listing.profiles.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{listing.profiles.full_name || 'Anonymous'}</p>
                      <p className="text-sm text-gray-500">@{listing.profiles.username || 'user'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleContactUser}
                disabled={!user || user.id === listing.user_id || isContactingUser}
                className="flex-1 bg-amber-400 hover:bg-amber-500 text-black"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {isContactingUser ? 'Sending...' : 'Contact Seller'}
              </Button>
              
              {user && user.id !== listing.user_id && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReviewForm(!showReviewForm);
                    if (userReview) {
                      setNewReview({
                        rating: userReview.rating,
                        comment: userReview.comment || ''
                      });
                    }
                  }}
                >
                  <Star className="w-4 h-4 mr-2" />
                  {userReview ? 'Edit Review' : 'Add Review'}
                </Button>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-semibold">
                    {userReview ? 'Edit Your Review' : 'Write a Review'}
                  </h3>
                  
                  {/* Star Rating */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          className="p-1"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= newReview.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <Textarea
                    placeholder="Share your thoughts about this listing..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    rows={3}
                  />

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSubmitReview}
                      disabled={isSubmittingReview}
                      size="sm"
                    >
                      {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowReviewForm(false)}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="mt-8">
            <Separator className="mb-6" />
            <h3 className="text-xl font-semibold mb-4">
              Reviews ({reviews.length})
            </h3>
            
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={review.profile?.avatar_url} />
                        <AvatarFallback>
                          {review.profile?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">
                              {review.profile?.full_name || 'Anonymous'}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {review.comment && (
                          <p className="text-gray-700">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}