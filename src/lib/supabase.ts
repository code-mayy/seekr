import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          username: string | null;
          bio: string;
          avatar_url: string | null;
          contact_details: any;
          visibility_preferences: any;
          notification_settings: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          username?: string | null;
          bio?: string;
          avatar_url?: string | null;
          contact_details?: any;
          visibility_preferences?: any;
          notification_settings?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          username?: string | null;
          bio?: string;
          avatar_url?: string | null;
          contact_details?: any;
          visibility_preferences?: any;
          notification_settings?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      listings: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          category: string;
          description: string;
          max_budget: number;
          preferred_condition: string;
          location: string;
          additional_notes: string;
          images: any;
          status: string;
          views_count: number;
          favorites_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          category: string;
          description: string;
          max_budget?: number;
          preferred_condition: string;
          location: string;
          additional_notes?: string;
          images?: any;
          status?: string;
          views_count?: number;
          favorites_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          category?: string;
          description?: string;
          max_budget?: number;
          preferred_condition?: string;
          location?: string;
          additional_notes?: string;
          images?: any;
          status?: string;
          views_count?: number;
          favorites_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};