import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Edit3, 
  Save, 
  X, 
  Camera, 
  Mail, 
  Phone, 
  MapPin, 
  Eye, 
  EyeOff,
  Bell,
  Settings,
  Plus,
  MoreVertical,
  Trash2,
  Pause,
  Play,
  BarChart3,
  Heart,
  MessageCircle,
  Crown,
  Star,
  Sparkles
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { profileService, listingService, storageService, favoritesService, messagingService, type Profile, type Listing, type Favorite, type Conversation } from '@/lib/database';
import { toast } from 'sonner';
import { ListRequestForm } from '@/components/ListRequestForm';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { MessagingModal } from '@/components/MessagingModal';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  bio: z.string().max(500, 'Bio must be less than 500 characters'),
  contact_details: z.object({
    phone: z.string().optional(),
    website: z.string().url().optional().or(z.literal('')),
    location: z.string().optional(),
  }),
});

type ProfileForm = z.infer<typeof profileSchema>;

export function UserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showListForm, setShowListForm] = useState(false);
  const [deleteListingId, setDeleteListingId] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showMessaging, setShowMessaging] = useState(false);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      username: '',
      bio: '',
      contact_details: {
        phone: '',
        website: '',
        location: '',
      },
    },
  });

  useEffect(() => {
    if (user) {
      loadProfile();
      loadListings();
      loadFavorites();
      loadConversations();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const profileData = await profileService.getProfile(user.id);
      if (profileData) {
        setProfile(profileData);
        form.reset({
          full_name: profileData.full_name || '',
          username: profileData.username || '',
          bio: profileData.bio || '',
          contact_details: profileData.contact_details || {
            phone: '',
            website: '',
            location: '',
          },
        });
      }
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const loadListings = async () => {
    if (!user) return;
    
    try {
      const userListings = await listingService.getUserListings(user.id);
      setListings(userListings);
    } catch (error) {
      toast.error('Failed to load listings');
    }
  };

  const loadFavorites = async () => {
    if (!user) return;
    
    try {
      const userFavorites = await favoritesService.getUserFavorites(user.id);
      setFavorites(userFavorites);
    } catch (error) {
      toast.error('Failed to load favorites');
    }
  };

  const loadConversations = async () => {
    if (!user) return;
    
    try {
      const userConversations = await messagingService.getUserConversations(user.id);
      setConversations(userConversations);
    } catch (error) {
      toast.error('Failed to load conversations');
    }
  };

  const handleProfileUpdate = async (data: ProfileForm) => {
    if (!user || !profile) return;

    try {
      // Check username availability
      if (data.username !== profile.username) {
        const isAvailable = await profileService.checkUsernameAvailability(data.username, user.id);
        if (!isAvailable) {
          toast.error('Username is already taken');
          return;
        }
      }

      const updatedProfile = await profileService.updateProfile(user.id, {
        full_name: data.full_name,
        username: data.username,
        bio: data.bio,
        contact_details: data.contact_details,
      });

      if (updatedProfile) {
        setProfile(updatedProfile);
        setIsEditing(false);
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const avatarUrl = await storageService.uploadImage(file, 'avatars');
      if (avatarUrl) {
        const updatedProfile = await profileService.updateProfile(user.id, {
          avatar_url: avatarUrl,
        });
        if (updatedProfile) {
          setProfile(updatedProfile);
          toast.success('Avatar updated successfully');
          
          // Force a page refresh to update the navbar avatar
          window.location.reload();
        }
      }
    } catch (error) {
      toast.error('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleVisibilityChange = async (key: string, value: boolean) => {
    if (!user || !profile) return;

    try {
      const updatedPreferences = {
        ...profile.visibility_preferences,
        [key]: value,
      };

      const updatedProfile = await profileService.updateProfile(user.id, {
        visibility_preferences: updatedPreferences,
      });

      if (updatedProfile) {
        setProfile(updatedProfile);
        toast.success('Privacy settings updated');
      }
    } catch (error) {
      toast.error('Failed to update privacy settings');
    }
  };

  const handleNotificationChange = async (key: string, value: boolean) => {
    if (!user || !profile) return;

    try {
      const updatedSettings = {
        ...profile.notification_settings,
        [key]: value,
      };

      const updatedProfile = await profileService.updateProfile(user.id, {
        notification_settings: updatedSettings,
      });

      if (updatedProfile) {
        setProfile(updatedProfile);
        toast.success('Notification settings updated');
      }
    } catch (error) {
      toast.error('Failed to update notification settings');
    }
  };

  const handleListingStatusChange = async (listingId: string, status: string) => {
    try {
      await listingService.updateListing(listingId, { status });
      await loadListings();
      toast.success(`Listing ${status === 'active' ? 'activated' : 'paused'} successfully`);
    } catch (error) {
      toast.error('Failed to update listing status');
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    try {
      await listingService.deleteListing(listingId);
      await loadListings();
      setDeleteListingId(null);
      toast.success('Listing deleted successfully');
    } catch (error) {
      toast.error('Failed to delete listing');
    }
  };

  const handleNewListing = async (listingData: any) => {
    try {
      // Upload images if any
      const imageUrls = [];
      for (const image of listingData.images) {
        const url = await storageService.uploadImage(image);
        if (url) imageUrls.push(url);
      }

      await listingService.createListing({
        title: listingData.title,
        category: listingData.category,
        description: listingData.description,
        max_budget: listingData.maxBudget,
        preferred_condition: listingData.preferredCondition,
        location: listingData.location,
        additional_notes: listingData.additionalNotes || '',
        images: imageUrls,
      });

      await loadListings();
      toast.success('Listing created successfully');
    } catch (error) {
      toast.error('Failed to create listing');
    }
  };

  const handleRemoveFavorite = async (listingId: string) => {
    try {
      await favoritesService.removeFavorite(listingId);
      await loadFavorites();
      toast.success('Removed from favorites');
    } catch (error) {
      toast.error('Failed to remove favorite');
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-black">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2 text-white">Profile not found</h2>
          <p className="text-gray-400">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-600/20 via-purple-600/20 to-blue-600/20 border-b border-white/10">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative max-w-6xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row items-center gap-8"
          >
            {/* Avatar Section */}
            <div className="relative group">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-amber-400/50 shadow-2xl shadow-amber-400/20">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-4xl bg-gradient-to-br from-amber-400 to-amber-600 text-black font-bold">
                    {profile.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                  </label>
                )}
                <div className="absolute -top-2 -right-2">
                  <Crown className="w-8 h-8 text-amber-400" />
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {profile.full_name || 'No name set'}
              </h1>
              <p className="text-xl text-amber-400 mb-2">@{profile.username || 'no-username'}</p>
              <p className="text-gray-300 mb-4">{profile.email}</p>
              {profile.bio && (
                <p className="text-gray-200 text-lg max-w-2xl">{profile.bio}</p>
              )}
              
              {/* Stats */}
              <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{listings.length}</div>
                  <div className="text-sm text-gray-400">Listings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{favorites.length}</div>
                  <div className="text-sm text-gray-400">Favorites</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{conversations.length}</div>
                  <div className="text-sm text-gray-400">Conversations</div>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <div className="flex gap-3">
              <Button
                variant={isEditing ? "outline" : "default"}
                onClick={() => {
                  if (isEditing) {
                    form.reset();
                  }
                  setIsEditing(!isEditing);
                }}
                className={isEditing 
                  ? "border-amber-400 text-amber-400 hover:bg-amber-400/10" 
                  : "bg-amber-400 hover:bg-amber-500 text-black font-semibold"
                }
              >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 bg-black/40 border border-white/10 backdrop-blur-sm">
            <TabsTrigger value="profile" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black text-white">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="listings" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              Listings
            </TabsTrigger>
            <TabsTrigger value="favorites" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black text-white">
              <Heart className="w-4 h-4 mr-2" />
              Favorites
            </TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black text-white">
              <MessageCircle className="w-4 h-4 mr-2" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="privacy" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black text-white">
              <Eye className="w-4 h-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black text-white">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <User className="w-5 h-5 text-amber-400" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(handleProfileUpdate)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="full_name" className="text-white">Full Name</Label>
                      <Input
                        id="full_name"
                        {...form.register('full_name')}
                        disabled={!isEditing}
                        className={`mt-2 ${!isEditing 
                          ? 'bg-white/5 border-white/10 text-gray-300' 
                          : 'bg-white/10 border-amber-400/50 text-white focus:border-amber-400'
                        }`}
                      />
                      {form.formState.errors.full_name && (
                        <p className="text-sm text-red-400 mt-1">
                          {form.formState.errors.full_name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="username" className="text-white">Username</Label>
                      <Input
                        id="username"
                        {...form.register('username')}
                        disabled={!isEditing}
                        className={`mt-2 ${!isEditing 
                          ? 'bg-white/5 border-white/10 text-gray-300' 
                          : 'bg-white/10 border-amber-400/50 text-white focus:border-amber-400'
                        }`}
                      />
                      {form.formState.errors.username && (
                        <p className="text-sm text-red-400 mt-1">
                          {form.formState.errors.username.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio" className="text-white">Bio</Label>
                    <Textarea
                      id="bio"
                      {...form.register('bio')}
                      disabled={!isEditing}
                      className={`mt-2 ${!isEditing 
                        ? 'bg-white/5 border-white/10 text-gray-300' 
                        : 'bg-white/10 border-amber-400/50 text-white focus:border-amber-400'
                      }`}
                      rows={3}
                    />
                    {form.formState.errors.bio && (
                      <p className="text-sm text-red-400 mt-1">
                        {form.formState.errors.bio.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="phone" className="text-white">Phone</Label>
                      <Input
                        id="phone"
                        {...form.register('contact_details.phone')}
                        disabled={!isEditing}
                        className={`mt-2 ${!isEditing 
                          ? 'bg-white/5 border-white/10 text-gray-300' 
                          : 'bg-white/10 border-amber-400/50 text-white focus:border-amber-400'
                        }`}
                      />
                    </div>

                    <div>
                      <Label htmlFor="website" className="text-white">Website</Label>
                      <Input
                        id="website"
                        {...form.register('contact_details.website')}
                        disabled={!isEditing}
                        className={`mt-2 ${!isEditing 
                          ? 'bg-white/5 border-white/10 text-gray-300' 
                          : 'bg-white/10 border-amber-400/50 text-white focus:border-amber-400'
                        }`}
                      />
                    </div>

                    <div>
                      <Label htmlFor="location" className="text-white">Location</Label>
                      <Input
                        id="location"
                        {...form.register('contact_details.location')}
                        disabled={!isEditing}
                        className={`mt-2 ${!isEditing 
                          ? 'bg-white/5 border-white/10 text-gray-300' 
                          : 'bg-white/10 border-amber-400/50 text-white focus:border-amber-400'
                        }`}
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end">
                      <Button type="submit" className="bg-amber-400 hover:bg-amber-500 text-black font-semibold">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">My Listings</h2>
                <Button
                  onClick={() => setShowListForm(true)}
                  className="bg-amber-400 hover:bg-amber-500 text-black font-semibold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Listing
                </Button>
              </div>

              {listings.length === 0 ? (
                <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                  <CardContent className="text-center py-12">
                    <Sparkles className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                    <p className="text-gray-300 mb-4 text-lg">You haven't created any listings yet</p>
                    <Button
                      onClick={() => setShowListForm(true)}
                      className="bg-amber-400 hover:bg-amber-500 text-black font-semibold"
                    >
                      Create Your First Listing
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing, index) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="bg-black/40 border-white/10 backdrop-blur-sm hover:border-amber-400/50 transition-all duration-300 group">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg line-clamp-2 text-white group-hover:text-amber-400 transition-colors">
                                {listing.title}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant={listing.status === 'active' ? 'default' : 'secondary'} 
                                       className={listing.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/50' : ''}>
                                  {listing.status}
                                </Badge>
                                <span className="text-sm text-gray-400">
                                  {listing.category}
                                </span>
                              </div>
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-black/90 border-white/20">
                                <DropdownMenuItem
                                  onClick={() => handleListingStatusChange(
                                    listing.id,
                                    listing.status === 'active' ? 'paused' : 'active'
                                  )}
                                  className="text-white hover:bg-white/10"
                                >
                                  {listing.status === 'active' ? (
                                    <>
                                      <Pause className="w-4 h-4 mr-2" />
                                      Pause Listing
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-4 h-4 mr-2" />
                                      Activate Listing
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setDeleteListingId(listing.id)}
                                  className="text-red-400 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Listing
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          <p className="text-gray-300 text-sm line-clamp-3 mb-4">
                            {listing.description}
                          </p>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-400">Max Budget:</span>
                              <span className="font-semibold text-amber-400">
                                ${listing.max_budget.toLocaleString()}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-400">Condition:</span>
                              <span className="text-sm text-white">{listing.preferred_condition}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-400">Location:</span>
                              <span className="text-sm text-white">{listing.location}</span>
                            </div>
                            
                            <div className="flex items-center justify-between pt-2 border-t border-white/10">
                              <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Eye className="w-4 h-4" />
                                  {listing.views_count}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart className="w-4 h-4" />
                                  {listing.favorites_count}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(listing.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">My Favorites</h2>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span>{favorites.length} favorite{favorites.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {favorites.length === 0 ? (
                <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                  <CardContent className="text-center py-12">
                    <Heart className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <p className="text-gray-300 mb-4 text-lg">You haven't favorited any listings yet</p>
                    <p className="text-sm text-gray-400">Browse listings and click the heart icon to save them here</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map((favorite, index) => {
                    const listing = favorite.listing as Listing;
                    if (!listing) return null;
                    
                    return (
                      <motion.div
                        key={favorite.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <Card className="bg-black/40 border-white/10 backdrop-blur-sm hover:border-amber-400/50 transition-all duration-300 group overflow-hidden">
                          <div className="aspect-video relative overflow-hidden">
                            <img
                              src={getImageUrl(listing)}
                              alt={listing.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 backdrop-blur-sm"
                              onClick={() => handleRemoveFavorite(listing.id)}
                            >
                              <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                            </Button>
                          </div>
                          
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-lg line-clamp-2 mb-2 text-white group-hover:text-amber-400 transition-colors">
                              {listing.title}
                            </h3>
                            
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="outline" className="border-amber-400/50 text-amber-400">
                                {listing.category}
                              </Badge>
                              <span className="text-sm text-gray-400">{listing.location}</span>
                            </div>
                            
                            <p className="text-gray-300 text-sm line-clamp-2 mb-4">
                              {listing.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-amber-400">
                                ${listing.max_budget.toLocaleString()}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedListing(listing)}
                                className="border-amber-400/50 text-amber-400 hover:bg-amber-400/10"
                              >
                                View Details
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">Messages</h2>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <MessageCircle className="w-4 h-4 text-blue-400" />
                  <span>{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {conversations.length === 0 ? (
                <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                  <CardContent className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    <p className="text-gray-300 mb-4 text-lg">No conversations yet</p>
                    <p className="text-sm text-gray-400">Start connecting with other collectors by contacting them about their listings</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {conversations.map((conversation, index) => (
                    <motion.div
                      key={conversation.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="bg-black/40 border-white/10 backdrop-blur-sm hover:border-amber-400/50 transition-all duration-300 cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12 border-2 border-amber-400/50">
                              <AvatarImage src={conversation.other_participant?.avatar_url} />
                              <AvatarFallback className="bg-amber-400/20 text-amber-400">
                                {conversation.other_participant?.full_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-white">
                                  {conversation.other_participant?.full_name || 'Unknown User'}
                                </h3>
                                <span className="text-sm text-gray-400">
                                  {new Date(conversation.updated_at).toLocaleDateString()}
                                </span>
                              </div>
                              
                              {conversation.listing && (
                                <p className="text-sm text-gray-300 mt-1">
                                  About: <span className="text-amber-400">{conversation.listing.title}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
              
              <Button
                onClick={() => setShowMessaging(true)}
                className="w-full bg-amber-400 hover:bg-amber-500 text-black font-semibold"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                View All Messages
              </Button>
            </div>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Eye className="w-5 h-5 text-amber-400" />
                  Privacy Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div>
                    <h4 className="font-medium text-white">Public Profile</h4>
                    <p className="text-sm text-gray-400">
                      Allow others to view your profile information
                    </p>
                  </div>
                  <Switch
                    checked={profile.visibility_preferences?.profile_public || false}
                    onCheckedChange={(checked) => handleVisibilityChange('profile_public', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div>
                    <h4 className="font-medium text-white">Show Email</h4>
                    <p className="text-sm text-gray-400">
                      Display your email address on your public profile
                    </p>
                  </div>
                  <Switch
                    checked={profile.visibility_preferences?.email_visible || false}
                    onCheckedChange={(checked) => handleVisibilityChange('email_visible', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div>
                    <h4 className="font-medium text-white">Show Contact Details</h4>
                    <p className="text-sm text-gray-400">
                      Allow others to see your contact information
                    </p>
                  </div>
                  <Switch
                    checked={profile.visibility_preferences?.contact_visible || false}
                    onCheckedChange={(checked) => handleVisibilityChange('contact_visible', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Bell className="w-5 h-5 text-amber-400" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div>
                    <h4 className="font-medium text-white">Email Notifications</h4>
                    <p className="text-sm text-gray-400">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={profile.notification_settings?.email_notifications || false}
                    onCheckedChange={(checked) => handleNotificationChange('email_notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div>
                    <h4 className="font-medium text-white">Listing Updates</h4>
                    <p className="text-sm text-gray-400">
                      Get notified when someone responds to your listings
                    </p>
                  </div>
                  <Switch
                    checked={profile.notification_settings?.listing_updates || false}
                    onCheckedChange={(checked) => handleNotificationChange('listing_updates', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div>
                    <h4 className="font-medium text-white">New Matches</h4>
                    <p className="text-sm text-gray-400">
                      Receive alerts when new items match your interests
                    </p>
                  </div>
                  <Switch
                    checked={profile.notification_settings?.new_matches || false}
                    onCheckedChange={(checked) => handleNotificationChange('new_matches', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div>
                    <h4 className="font-medium text-white">Marketing Communications</h4>
                    <p className="text-sm text-gray-400">
                      Receive updates about new features and promotions
                    </p>
                  </div>
                  <Switch
                    checked={profile.notification_settings?.marketing || false}
                    onCheckedChange={(checked) => handleNotificationChange('marketing', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteListingId} onOpenChange={() => setDeleteListingId(null)}>
        <AlertDialogContent className="bg-black/90 border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Listing</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete this listing? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteListingId && handleDeleteListing(deleteListingId)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New Listing Form */}
      <ListRequestForm
        isOpen={showListForm}
        onClose={() => setShowListForm(false)}
        onSubmit={handleNewListing}
      />

      {/* Product Detail Modal */}
      {selectedListing && (
        <ProductDetailModal
          listing={selectedListing}
          isOpen={!!selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}

      {/* Messaging Modal */}
      <MessagingModal
        isOpen={showMessaging}
        onClose={() => setShowMessaging(false)}
        conversations={conversations}
        onRefresh={loadConversations}
      />
    </div>
  );
}