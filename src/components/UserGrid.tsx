import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, MessageCircle, MapPin, Star, Shield, Crown, Sparkles } from 'lucide-react';
import { profileService, messagingService, type Profile } from '@/lib/database';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

interface UserGridProps {
  searchQuery?: string;
  filters?: any;
}

export function UserGrid({ searchQuery, filters }: UserGridProps) {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    loadUsers();
  }, [searchQuery, filters]);

  const loadUsers = async () => {
    setLoading(true);
    
    try {
      let data: Profile[] = [];
      
      if (searchQuery || (filters && Object.keys(filters).length > 0)) {
        // Use search with filters
        data = await profileService.searchUsers(searchQuery || '', filters);
      } else {
        // Load all public profiles
        data = await profileService.getPublicProfiles();
      }
      
      setUsers(data);
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Error loading users:', error);
      showError('Loading Error', 'Failed to load user profiles. Please try again.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleContactUser = async (targetUser: Profile) => {
    if (!user) {
      showError('Authentication Required', 'Please sign in to contact other users');
      return;
    }

    if (user.id === targetUser.id) {
      showError('Invalid Action', 'You cannot contact yourself');
      return;
    }

    try {
      // Create conversation
      const conversationId = await messagingService.createConversation(targetUser.id);

      if (conversationId) {
        // Send initial message
        const defaultMessage = `Hello ${targetUser.full_name}! I'm interested in connecting with you regarding collectibles and rare items. Would you be open to discussing potential collaborations?`;
        
        await messagingService.sendMessage(conversationId, defaultMessage);
        
        showSuccess('Message Sent', 'Your message has been sent successfully. Check your messages tab to continue the conversation.');
      }
    } catch (error) {
      showError('Message Failed', 'Failed to send message. Please try again.');
    }
  };

  const getUserRating = (user: Profile) => {
    // Calculate rating based on profile completeness and activity
    let rating = 4.0;
    if (user.bio && user.bio.length > 50) rating += 0.3;
    if (user.avatar_url) rating += 0.2;
    if (user.contact_details?.website) rating += 0.2;
    if (user.contact_details?.location) rating += 0.2;
    if (user.username) rating += 0.1;
    
    return Math.min(rating, 5.0);
  };

  const getUserSpecialties = (user: Profile) => {
    // Extract specialties from bio
    const bio = user.bio || '';
    const specialties = [];
    
    if (bio.toLowerCase().includes('art')) specialties.push('Art');
    if (bio.toLowerCase().includes('watch')) specialties.push('Watches');
    if (bio.toLowerCase().includes('sculpture')) specialties.push('Sculptures');
    if (bio.toLowerCase().includes('curator')) specialties.push('Curation');
    if (bio.toLowerCase().includes('appraiser')) specialties.push('Appraisal');
    if (bio.toLowerCase().includes('expert')) specialties.push('Expert');
    if (bio.toLowerCase().includes('dealer')) specialties.push('Dealer');
    if (bio.toLowerCase().includes('collector')) specialties.push('Collector');
    if (bio.toLowerCase().includes('vintage')) specialties.push('Vintage');
    if (bio.toLowerCase().includes('antique')) specialties.push('Antiques');
    
    return specialties.slice(0, 3); // Limit to 3 specialties
  };

  const getJoinDate = (user: Profile) => {
    const joinDate = new Date(user.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="luxury-spacing">
      {/* Results Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12"
      >
        <div>
          <p className="luxury-body text-gray-600">
            Showing <span className="font-semibold text-gray-900">{users.length}</span> verified member{users.length !== 1 ? 's' : ''}
            {searchQuery && (
              <span className="ml-2 text-amber-600 font-medium">
                for "{searchQuery}"
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2 luxury-caption text-gray-500">
          <RefreshCw className="w-4 h-4" />
          <span>Last updated: {new Date(lastUpdate).toLocaleTimeString()}</span>
        </div>
      </motion.div>

      {/* Grid */}
      {users.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {users.map((profile, index) => {
            const rating = getUserRating(profile);
            const specialties = getUserSpecialties(profile);
            const joinDate = getJoinDate(profile);
            
            return (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                className="w-full"
              >
                <Card className="h-full luxury-card luxury-hover group border-gray-200/60 hover:border-amber-300/60 hover:shadow-xl">
                  <CardContent className="p-8">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className="relative">
                        <Avatar className="w-20 h-20 border-3 border-amber-200/50 shadow-lg group-hover:border-amber-300 transition-all duration-300">
                          <AvatarImage src={profile.avatar_url || undefined} />
                          <AvatarFallback className="luxury-gradient-gold text-navy-900 text-xl font-semibold">
                            {profile.full_name?.charAt(0) || profile.email?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        {/* Verification badge */}
                        <div className="absolute -top-2 -right-2 w-8 h-8 luxury-gradient-gold rounded-full flex items-center justify-center shadow-lg">
                          <Crown className="w-4 h-4 text-navy-900" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="luxury-title text-gray-900 truncate group-hover:text-amber-600 transition-colors duration-300 mb-1">
                          {profile.full_name || 'Anonymous User'}
                        </h3>
                        <p className="luxury-caption text-gray-500 truncate mb-2">
                          @{profile.username || 'user'}
                        </p>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="luxury-caption font-medium text-gray-700">
                              {rating.toFixed(1)}
                            </span>
                          </div>
                          <span className="luxury-caption text-gray-500">
                            Profile Score
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="luxury-body text-gray-600 line-clamp-3 mb-6 leading-relaxed">
                      {profile.bio || 'This member prefers to keep their profile minimal and exclusive.'}
                    </p>

                    {/* Specialties */}
                    {specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {specialties.map((specialty, idx) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className="luxury-caption border-amber-300/60 text-amber-700 bg-amber-50/80 hover:bg-amber-100/80 transition-colors duration-300 px-3 py-1"
                          >
                            <Sparkles className="w-3 h-3 mr-1" />
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Location */}
                    {profile.contact_details?.location && (
                      <div className="flex items-center gap-2 mb-4 luxury-body text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.contact_details.location}</span>
                      </div>
                    )}

                    {/* Member Info */}
                    <div className="flex items-center justify-between mb-6 luxury-caption text-gray-500">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span className="text-green-600 font-medium">Verified Member</span>
                      </div>
                      <span>Joined {joinDate}</span>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => handleContactUser(profile)}
                      disabled={!user || user.id === profile.id}
                      className="w-full luxury-gradient-gold text-navy-900 font-medium group-hover:shadow-lg transition-all duration-300 border-0 luxury-button luxury-press py-4 rounded-xl"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {user?.id === profile.id ? 'This is you' : 'Connect & Collaborate'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center py-24"
        >
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 luxury-gradient-platinum rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Shield className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="luxury-headline text-gray-900 mb-4">No verified members found</h3>
            <p className="luxury-body text-gray-500 mb-8 leading-relaxed">
              Try adjusting your search criteria or check back later as our exclusive community grows
            </p>
            <Button
              onClick={loadUsers}
              variant="outline"
              className="border-2 border-amber-300 text-amber-600 hover:bg-amber-50 luxury-button luxury-press px-8 py-4 rounded-xl"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Search
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}