import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Listing = Database['public']['Tables']['listings']['Row'];
export type ListingInsert = Database['public']['Tables']['listings']['Insert'];
export type ListingUpdate = Database['public']['Tables']['listings']['Update'];

export type Favorite = {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
  listing?: Listing;
};

export type Review = {
  id: string;
  user_id: string;
  listing_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  profile?: Profile;
};

export type Conversation = {
  id: string;
  participant_1: string;
  participant_2: string;
  listing_id: string | null;
  created_at: string;
  updated_at: string;
  listing?: Listing;
  other_participant?: Profile;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
};

// Profile operations
export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  },

  async updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw new Error(error.message);
    }

    return data;
  },

  async checkUsernameAvailability(username: string, currentUserId?: string): Promise<boolean> {
    const query = supabase
      .from('profiles')
      .select('id')
      .eq('username', username);

    if (currentUserId) {
      query.neq('id', currentUserId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error checking username:', error);
      return false;
    }

    return data.length === 0;
  },

  async getPublicProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('visibility_preferences->>profile_public', 'true')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching public profiles:', error);
      return [];
    }

    return data || [];
  },

  async searchUsers(query: string, filters: any = {}): Promise<Profile[]> {
    let dbQuery = supabase
      .from('profiles')
      .select('*')
      .eq('visibility_preferences->>profile_public', 'true');

    // Text search in name, username, bio
    if (query) {
      dbQuery = dbQuery.or(`full_name.ilike.%${query}%,username.ilike.%${query}%,bio.ilike.%${query}%`);
    }

    // Keyword search
    if (filters.userKeywords) {
      dbQuery = dbQuery.or(`full_name.ilike.%${filters.userKeywords}%,username.ilike.%${filters.userKeywords}%,bio.ilike.%${filters.userKeywords}%`);
    }

    // Location filter
    if (filters.location) {
      dbQuery = dbQuery.ilike('contact_details->>location', `%${filters.location}%`);
    }

    dbQuery = dbQuery.order('created_at', { ascending: false });

    const { data, error } = await dbQuery;

    if (error) {
      console.error('Error searching users:', error);
      return [];
    }

    return data || [];
  }
};

// Listing operations
export const listingService = {
  async createListing(listing: Omit<ListingInsert, 'user_id'>): Promise<Listing | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('listings')
      .insert({
        ...listing,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating listing:', error);
      throw new Error(error.message);
    }

    return data;
  },

  async getUserListings(userId: string): Promise<Listing[]> {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user listings:', error);
      return [];
    }

    return data || [];
  },

  async getActiveListings(limit?: number): Promise<Listing[]> {
    let query = supabase
      .from('listings')
      .select(`
        *,
        profiles!listings_user_id_fkey (
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching active listings:', error);
      return [];
    }

    return data || [];
  },

  async getListing(listingId: string): Promise<Listing | null> {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        profiles!listings_user_id_fkey (
          id,
          full_name,
          username,
          avatar_url,
          bio
        )
      `)
      .eq('id', listingId)
      .single();

    if (error) {
      console.error('Error fetching listing:', error);
      return null;
    }

    return data;
  },

  async updateListing(listingId: string, updates: ListingUpdate): Promise<Listing | null> {
    const { data, error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', listingId)
      .select()
      .single();

    if (error) {
      console.error('Error updating listing:', error);
      throw new Error(error.message);
    }

    return data;
  },

  async deleteListing(listingId: string): Promise<boolean> {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', listingId);

    if (error) {
      console.error('Error deleting listing:', error);
      throw new Error(error.message);
    }

    return true;
  },

  async incrementViews(listingId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_listing_views', {
      listing_id: listingId
    });

    if (error) {
      console.error('Error incrementing views:', error);
    }
  },

  async searchListings(query: string, filters: any = {}): Promise<Listing[]> {
    let dbQuery = supabase
      .from('listings')
      .select(`
        *,
        profiles!listings_user_id_fkey (
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('status', 'active');

    // Text search
    if (query) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%,additional_notes.ilike.%${query}%`);
    }

    // Product keyword search
    if (filters.productKeywords) {
      dbQuery = dbQuery.or(`title.ilike.%${filters.productKeywords}%,description.ilike.%${filters.productKeywords}%,additional_notes.ilike.%${filters.productKeywords}%`);
    }

    // Category filter
    if (filters.category) {
      dbQuery = dbQuery.eq('category', filters.category);
    }

    // Price range filter
    if (filters.priceRange && filters.priceRange.length === 2) {
      const [minPrice, maxPrice] = filters.priceRange;
      dbQuery = dbQuery.gte('max_budget', minPrice).lte('max_budget', maxPrice);
    }

    // Location filter
    if (filters.location) {
      dbQuery = dbQuery.ilike('location', `%${filters.location}%`);
    }

    dbQuery = dbQuery.order('created_at', { ascending: false });

    const { data, error } = await dbQuery;

    if (error) {
      console.error('Error searching listings:', error);
      return [];
    }

    return data || [];
  }
};

// Favorites operations
export const favoritesService = {
  async getUserFavorites(userId: string): Promise<Favorite[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        listing:listings (
          *,
          profiles!listings_user_id_fkey (
            full_name,
            username,
            avatar_url
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }

    return data || [];
  },

  async addFavorite(listingId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        listing_id: listingId
      });

    if (error) {
      console.error('Error adding favorite:', error);
      return false;
    }

    return true;
  },

  async removeFavorite(listingId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('listing_id', listingId);

    if (error) {
      console.error('Error removing favorite:', error);
      return false;
    }

    return true;
  },

  async isFavorite(listingId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', listingId);

    if (error) {
      return false;
    }

    return data && data.length > 0;
  }
};

// Reviews operations
export const reviewsService = {
  async getListingReviews(listingId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profile:profiles (
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }

    return data || [];
  },

  async addReview(listingId: string, rating: number, comment?: string): Promise<Review | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        user_id: user.id,
        listing_id: listingId,
        rating,
        comment: comment || null
      })
      .select(`
        *,
        profile:profiles (
          full_name,
          username,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error adding review:', error);
      throw new Error(error.message);
    }

    return data;
  },

  async updateReview(reviewId: string, rating: number, comment?: string): Promise<Review | null> {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        rating,
        comment: comment || null
      })
      .eq('id', reviewId)
      .select(`
        *,
        profile:profiles (
          full_name,
          username,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error updating review:', error);
      throw new Error(error.message);
    }

    return data;
  },

  async getUserReview(listingId: string): Promise<Review | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', user.id)
      .eq('listing_id', listingId);

    if (error) {
      return null;
    }

    return data && data.length > 0 ? data[0] : null;
  }
};

// Messaging operations
export const messagingService = {
  async getUserConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        listing:listings (*),
        participant_1_profile:profiles!conversations_participant_1_fkey (
          id,
          full_name,
          username,
          avatar_url
        ),
        participant_2_profile:profiles!conversations_participant_2_fkey (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    // Add other_participant field
    return (data || []).map(conv => ({
      ...conv,
      other_participant: conv.participant_1 === userId 
        ? conv.participant_2_profile 
        : conv.participant_1_profile
    }));
  },

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles (
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data || [];
  },

  async createConversation(otherUserId: string, listingId?: string): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase.rpc('get_or_create_conversation', {
      user1_id: user.id,
      user2_id: otherUserId,
      listing_id_param: listingId || null
    });

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    return data;
  },

  async sendMessage(conversationId: string, content: string): Promise<Message | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content
      })
      .select(`
        *,
        sender:profiles (
          full_name,
          username,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error sending message:', error);
      throw new Error(error.message);
    }

    return data;
  },

  async markMessagesAsRead(conversationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return;
    }

    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id);

    if (error) {
      console.error('Error marking messages as read:', error);
    }
  }
};

// Storage operations for images
export const storageService = {
  async uploadImage(file: File, bucket: string = 'listing-images'): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async deleteImage(url: string, bucket: string = 'listing-images'): Promise<boolean> {
    const fileName = url.split('/').pop();
    if (!fileName) return false;

    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);

    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }

    return true;
  }
};