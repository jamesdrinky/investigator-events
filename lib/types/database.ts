export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string;
          city: string;
          country: string;
          region: string;
          start_date: string;
          end_date: string | null;
          organiser: string;
          association: string | null;
          website: string;
          category: string;
          event_scope: 'main' | 'secondary';
          featured: boolean;
          approved: boolean;
          image_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description: string;
          city: string;
          country: string;
          region: string;
          start_date: string;
          end_date?: string | null;
          organiser: string;
          association?: string | null;
          website: string;
          category: string;
          event_scope?: 'main' | 'secondary';
          featured?: boolean;
          approved?: boolean;
          image_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string;
          city?: string;
          country?: string;
          region?: string;
          start_date?: string;
          end_date?: string | null;
          organiser?: string;
          association?: string | null;
          website?: string;
          category?: string;
          event_scope?: 'main' | 'secondary';
          featured?: boolean;
          approved?: boolean;
          image_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      event_submissions: {
        Row: {
          id: string;
          event_name: string;
          organiser: string;
          city: string;
          region: string;
          country: string;
          start_date: string;
          end_date: string | null;
          category: string;
          website: string;
          contact_email: string;
          notes: string | null;
          event_scope: 'main' | 'secondary';
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
        };
        Insert: {
          id?: string;
          event_name: string;
          organiser: string;
          city: string;
          region: string;
          country: string;
          start_date: string;
          end_date?: string | null;
          category: string;
          website: string;
          contact_email: string;
          notes?: string | null;
          event_scope?: 'main' | 'secondary';
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
        };
        Update: {
          id?: string;
          event_name?: string;
          organiser?: string;
          city?: string;
          region?: string;
          country?: string;
          start_date?: string;
          end_date?: string | null;
          category?: string;
          website?: string;
          contact_email?: string;
          notes?: string | null;
          event_scope?: 'main' | 'secondary';
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
        };
        Relationships: [];
      };
      advertiser_leads: {
        Row: {
          id: string;
          company_name: string;
          contact_name: string;
          email: string;
          website: string | null;
          inquiry_type: string;
          region_or_audience: string | null;
          message: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_name: string;
          contact_name: string;
          email: string;
          website?: string | null;
          inquiry_type: string;
          region_or_audience?: string | null;
          message: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_name?: string;
          contact_name?: string;
          email?: string;
          website?: string | null;
          inquiry_type?: string;
          region_or_audience?: string | null;
          message?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      profile_sections: {
        Row: { id: string; user_id: string; type: string; title: string; content: string | null; sort_order: number; visible: boolean };
        Insert: { id?: string; user_id: string; type: string; title: string; content?: string | null; sort_order?: number; visible?: boolean };
        Update: { id?: string; user_id?: string; type?: string; title?: string; content?: string | null; sort_order?: number; visible?: boolean };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          country: string | null;
          username: string | null;
          website: string | null;
          specialisation: string | null;
          headline: string | null;
          profile_color: string | null;
          is_public: boolean;
          bio: string | null;
          badges: string[] | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          country?: string | null;
          username?: string | null;
          website?: string | null;
          specialisation?: string | null;
          headline?: string | null;
          profile_color?: string | null;
          is_public?: boolean;
          bio?: string | null;
          badges?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          country?: string | null;
          username?: string | null;
          website?: string | null;
          specialisation?: string | null;
          headline?: string | null;
          profile_color?: string | null;
          is_public?: boolean;
          bio?: string | null;
          badges?: string[] | null;
          created_at?: string;
        };
        Relationships: [];
      };
      user_associations: {
        Row: { id: string; user_id: string; association_name: string; association_slug: string; member_since: string | null; role: string | null };
        Insert: { id?: string; user_id: string; association_name: string; association_slug: string; member_since?: string | null; role?: string | null };
        Update: { id?: string; user_id?: string; association_name?: string; association_slug?: string; member_since?: string | null; role?: string | null };
        Relationships: [];
      };
      member_verifications: {
        Row: { id: string; user_id: string; association_name: string; status: 'pending' | 'verified' | 'rejected'; created_at: string };
        Insert: { id?: string; user_id: string; association_name: string; status?: 'pending' | 'verified' | 'rejected'; created_at?: string };
        Update: { id?: string; user_id?: string; association_name?: string; status?: 'pending' | 'verified' | 'rejected'; created_at?: string };
        Relationships: [];
      };
      event_reviews: {
        Row: { id: string; user_id: string; event_id: string; rating: number; review_text: string | null; created_at: string };
        Insert: { id?: string; user_id: string; event_id: string; rating: number; review_text?: string | null; created_at?: string };
        Update: { id?: string; user_id?: string; event_id?: string; rating?: number; review_text?: string | null; created_at?: string };
        Relationships: [];
      };
      event_attendees: {
        Row: { id: string; user_id: string; event_id: string; visibility: string | null; is_going: boolean; created_at: string };
        Insert: { id?: string; user_id: string; event_id: string; visibility?: string | null; is_going?: boolean; created_at?: string };
        Update: { id?: string; user_id?: string; event_id?: string; visibility?: string | null; is_going?: boolean; created_at?: string };
        Relationships: [];
      };
      event_messages: {
        Row: { id: string; event_id: string; user_id: string; message: string; created_at: string };
        Insert: { id?: string; event_id: string; user_id: string; message: string; created_at?: string };
        Update: { id?: string; event_id?: string; user_id?: string; message?: string; created_at?: string };
        Relationships: [];
      };
      event_speakers: {
        Row: { id: string; event_id: string; user_id: string | null; name: string; bio: string | null; topic: string | null; avatar_url: string | null };
        Insert: { id?: string; event_id: string; user_id?: string | null; name: string; bio?: string | null; topic?: string | null; avatar_url?: string | null };
        Update: { id?: string; event_id?: string; user_id?: string | null; name?: string; bio?: string | null; topic?: string | null; avatar_url?: string | null };
        Relationships: [];
      };
      posts: {
        Row: { id: string; user_id: string; content: string; image_url: string | null; link_url: string | null; likes_count: number; comments_count: number; created_at: string };
        Insert: { id?: string; user_id: string; content: string; image_url?: string | null; link_url?: string | null; likes_count?: number; comments_count?: number; created_at?: string };
        Update: { id?: string; user_id?: string; content?: string; image_url?: string | null; link_url?: string | null; likes_count?: number; comments_count?: number; created_at?: string };
        Relationships: [];
      };
      post_likes: {
        Row: { id: string; user_id: string; post_id: string; created_at: string };
        Insert: { id?: string; user_id: string; post_id: string; created_at?: string };
        Update: { id?: string; user_id?: string; post_id?: string; created_at?: string };
        Relationships: [];
      };
      post_comments: {
        Row: { id: string; user_id: string; post_id: string; content: string; created_at: string };
        Insert: { id?: string; user_id: string; post_id: string; content: string; created_at?: string };
        Update: { id?: string; user_id?: string; post_id?: string; content?: string; created_at?: string };
        Relationships: [];
      };
      followers: {
        Row: { id: string; follower_id: string; following_id: string; created_at: string };
        Insert: { id?: string; follower_id: string; following_id: string; created_at?: string };
        Update: { id?: string; follower_id?: string; following_id?: string; created_at?: string };
        Relationships: [];
      };
      connections: {
        Row: { id: string; requester_id: string; addressee_id: string; status: string; created_at: string };
        Insert: { id?: string; requester_id: string; addressee_id: string; status?: string; created_at?: string };
        Update: { id?: string; requester_id?: string; addressee_id?: string; status?: string; created_at?: string };
        Relationships: [];
      };
      job_posts: {
        Row: { id: string; user_id: string; title: string; description: string; location: string | null; country: string | null; type: string | null; specialisation: string | null; contact_email: string; is_active: boolean; created_at: string };
        Insert: { id?: string; user_id: string; title: string; description: string; location?: string | null; country?: string | null; type?: string | null; specialisation?: string | null; contact_email: string; is_active?: boolean; created_at?: string };
        Update: { id?: string; user_id?: string; title?: string; description?: string; location?: string | null; country?: string | null; type?: string | null; specialisation?: string | null; contact_email?: string; is_active?: boolean; created_at?: string };
        Relationships: [];
      };
      resources: {
        Row: { id: string; user_id: string; title: string; description: string | null; url: string; category: string | null; association_slug: string | null; approved: boolean; created_at: string };
        Insert: { id?: string; user_id: string; title: string; description?: string | null; url: string; category?: string | null; association_slug?: string | null; approved?: boolean; created_at?: string };
        Update: { id?: string; user_id?: string; title?: string; description?: string | null; url?: string; category?: string | null; association_slug?: string | null; approved?: boolean; created_at?: string };
        Relationships: [];
      };
      clash_checks: {
        Row: { id: string; user_id: string | null; proposed_start: string; proposed_end: string; region: string | null; clashing_events: string[] | null; created_at: string };
        Insert: { id?: string; user_id?: string | null; proposed_start: string; proposed_end: string; region?: string | null; clashing_events?: string[] | null; created_at?: string };
        Update: { id?: string; user_id?: string | null; proposed_start?: string; proposed_end?: string; region?: string | null; clashing_events?: string[] | null; created_at?: string };
        Relationships: [];
      };
      saved_events: {
        Row: {
          id: string;
          user_id: string;
          event_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      newsletter_subscriptions: {
        Row: {
          id: string;
          email: string;
          region: string | null;
          interests: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          region?: string | null;
          interests?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          region?: string | null;
          interests?: string | null;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      organisations: {
        Row: { id: string; name: string; slug: string; type: string; logo_url: string | null; website: string | null; country: string | null; description: string | null; created_at: string };
        Insert: { id?: string; name: string; slug: string; type?: string; logo_url?: string | null; website?: string | null; country?: string | null; description?: string | null };
        Update: { id?: string; name?: string; slug?: string; type?: string; logo_url?: string | null; website?: string | null; country?: string | null; description?: string | null };
        Relationships: [];
      };
      work_experience: {
        Row: { id: string; user_id: string; organisation_id: string | null; company_name: string; company_logo_url: string | null; job_title: string; description: string | null; start_year: number; end_year: number | null; is_current: boolean; sort_order: number; created_at: string };
        Insert: { id?: string; user_id: string; organisation_id?: string | null; company_name: string; company_logo_url?: string | null; job_title: string; description?: string | null; start_year: number; end_year?: number | null; is_current?: boolean; sort_order?: number };
        Update: { id?: string; user_id?: string; organisation_id?: string | null; company_name?: string; company_logo_url?: string | null; job_title?: string; description?: string | null; start_year?: number; end_year?: number | null; is_current?: boolean; sort_order?: number };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
