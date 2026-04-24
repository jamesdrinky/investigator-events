export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      advertiser_leads: {
        Row: {
          business_type: string
          company_name: string
          contact_name: string
          created_at: string | null
          email: string
          id: string
          inquiry_type: string
          message: string
          region_or_audience: string | null
          status: string
          website: string | null
        }
        Insert: {
          business_type: string
          company_name: string
          contact_name: string
          created_at?: string | null
          email: string
          id?: string
          inquiry_type?: string
          message: string
          region_or_audience?: string | null
          status?: string
          website?: string | null
        }
        Update: {
          business_type?: string
          company_name?: string
          contact_name?: string
          created_at?: string | null
          email?: string
          id?: string
          inquiry_type?: string
          message?: string
          region_or_audience?: string | null
          status?: string
          website?: string | null
        }
        Relationships: []
      }
      association_admins: {
        Row: {
          association_page_id: string
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          association_page_id: string
          created_at?: string | null
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          association_page_id?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "association_admins_association_page_id_fkey"
            columns: ["association_page_id"]
            isOneToOne: false
            referencedRelation: "association_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      association_pages: {
        Row: {
          contact_email: string | null
          country: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          founded_year: number | null
          id: string
          is_verified: boolean | null
          logo_url: string | null
          member_count: number | null
          name: string
          slug: string
          social_links: Json | null
          website: string | null
        }
        Insert: {
          contact_email?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          founded_year?: number | null
          id?: string
          is_verified?: boolean | null
          logo_url?: string | null
          member_count?: number | null
          name: string
          slug: string
          social_links?: Json | null
          website?: string | null
        }
        Update: {
          contact_email?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          founded_year?: number | null
          id?: string
          is_verified?: boolean | null
          logo_url?: string | null
          member_count?: number | null
          name?: string
          slug?: string
          social_links?: Json | null
          website?: string | null
        }
        Relationships: []
      }
      association_posts: {
        Row: {
          association_page_id: string
          author_id: string | null
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          is_pinned: boolean | null
          likes_count: number | null
          link_url: string | null
          title: string | null
        }
        Insert: {
          association_page_id: string
          author_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_pinned?: boolean | null
          likes_count?: number | null
          link_url?: string | null
          title?: string | null
        }
        Update: {
          association_page_id?: string
          author_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_pinned?: boolean | null
          likes_count?: number | null
          link_url?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "association_posts_association_page_id_fkey"
            columns: ["association_page_id"]
            isOneToOne: false
            referencedRelation: "association_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      association_suggestions: {
        Row: {
          country: string | null
          created_at: string
          id: string
          name: string
          status: string
          website: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          id?: string
          name: string
          status?: string
          website?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          id?: string
          name?: string
          status?: string
          website?: string | null
        }
        Relationships: []
      }
      association_verification_codes: {
        Row: {
          association_page_id: string
          code: string
          created_at: string | null
          created_by: string | null
          expires_at: string
          id: string
          is_active: boolean
          usage_count: number
        }
        Insert: {
          association_page_id: string
          code: string
          created_at?: string | null
          created_by?: string | null
          expires_at: string
          id?: string
          is_active?: boolean
          usage_count?: number
        }
        Update: {
          association_page_id?: string
          code?: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean
          usage_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "association_verification_codes_association_page_id_fkey"
            columns: ["association_page_id"]
            isOneToOne: false
            referencedRelation: "association_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      clash_checks: {
        Row: {
          clashing_events: Json | null
          created_at: string | null
          id: string
          proposed_end: string
          proposed_start: string
          region: string | null
          user_id: string | null
        }
        Insert: {
          clashing_events?: Json | null
          created_at?: string | null
          id?: string
          proposed_end: string
          proposed_start: string
          region?: string | null
          user_id?: string | null
        }
        Update: {
          clashing_events?: Json | null
          created_at?: string | null
          id?: string
          proposed_end?: string
          proposed_start?: string
          region?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      connections: {
        Row: {
          addressee_id: string | null
          created_at: string | null
          id: string
          requester_id: string | null
          status: string | null
        }
        Insert: {
          addressee_id?: string | null
          created_at?: string | null
          id?: string
          requester_id?: string | null
          status?: string | null
        }
        Update: {
          addressee_id?: string | null
          created_at?: string | null
          id?: string
          requester_id?: string | null
          status?: string | null
        }
        Relationships: []
      }
      event_attendees: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          is_going: boolean | null
          user_id: string | null
          visibility: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          is_going?: boolean | null
          user_id?: string | null
          visibility?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          is_going?: boolean | null
          user_id?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_messages: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          message: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          message: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          message?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_messages_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_messages_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_photos: {
        Row: {
          caption: string | null
          created_at: string | null
          event_id: string
          id: string
          image_url: string
          likes_count: number | null
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          event_id: string
          id?: string
          image_url: string
          likes_count?: number | null
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          event_id?: string
          id?: string
          image_url?: string
          likes_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_photos_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_reviews: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          rating: number | null
          review_text: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          rating?: number | null
          review_text?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          rating?: number | null
          review_text?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_reviews_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_reviews_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_speakers: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          event_id: string | null
          id: string
          name: string
          topic: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          name: string
          topic?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          name?: string
          topic?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_speakers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_submissions: {
        Row: {
          category: string
          city: string
          contact_email: string
          country: string
          created_at: string
          end_date: string | null
          event_name: string
          event_scope: string
          id: string
          notes: string | null
          organiser: string
          region: string
          start_date: string
          status: string
          website: string
        }
        Insert: {
          category: string
          city: string
          contact_email: string
          country: string
          created_at?: string
          end_date?: string | null
          event_name: string
          event_scope?: string
          id?: string
          notes?: string | null
          organiser: string
          region?: string
          start_date: string
          status?: string
          website: string
        }
        Update: {
          category?: string
          city?: string
          contact_email?: string
          country?: string
          created_at?: string
          end_date?: string | null
          event_name?: string
          event_scope?: string
          id?: string
          notes?: string | null
          organiser?: string
          region?: string
          start_date?: string
          status?: string
          website?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          approved: boolean
          association: string | null
          category: string
          city: string
          country: string
          created_at: string | null
          date: string
          description: string
          end_date: string | null
          event_scope: string
          featured: boolean | null
          id: string
          image_path: string | null
          organiser: string
          pricing: string | null
          region: string
          slug: string | null
          start_date: string | null
          timezone: string | null
          title: string
          website: string
        }
        Insert: {
          approved?: boolean
          association?: string | null
          category: string
          city: string
          country: string
          created_at?: string | null
          date: string
          description: string
          end_date?: string | null
          event_scope?: string
          featured?: boolean | null
          id?: string
          image_path?: string | null
          organiser: string
          pricing?: string | null
          region: string
          slug?: string | null
          start_date?: string | null
          timezone?: string | null
          title: string
          website: string
        }
        Update: {
          approved?: boolean
          association?: string | null
          category?: string
          city?: string
          country?: string
          created_at?: string | null
          date?: string
          description?: string
          end_date?: string | null
          event_scope?: string
          featured?: boolean | null
          id?: string
          image_path?: string | null
          organiser?: string
          pricing?: string | null
          region?: string
          slug?: string | null
          start_date?: string | null
          timezone?: string | null
          title?: string
          website?: string
        }
        Relationships: []
      }
      followers: {
        Row: {
          created_at: string | null
          follower_id: string | null
          following_id: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "followers_follower_id_profiles_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_following_id_profiles_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_posts: {
        Row: {
          association_page_id: string | null
          contact_email: string | null
          country: string | null
          created_at: string | null
          description: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          location: string | null
          specialisation: string | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          association_page_id?: string | null
          contact_email?: string | null
          country?: string | null
          created_at?: string | null
          description: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          specialisation?: string | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          association_page_id?: string | null
          contact_email?: string | null
          country?: string | null
          created_at?: string | null
          description?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          specialisation?: string | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_posts_association_page_id_fkey"
            columns: ["association_page_id"]
            isOneToOne: false
            referencedRelation: "association_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      lfg_posts: {
        Row: {
          budget_range: string | null
          country: string | null
          created_at: string | null
          description: string
          id: string
          location: string | null
          responses_count: number | null
          specialism: string | null
          status: string | null
          title: string
          urgency: string | null
          user_id: string
        }
        Insert: {
          budget_range?: string | null
          country?: string | null
          created_at?: string | null
          description: string
          id?: string
          location?: string | null
          responses_count?: number | null
          specialism?: string | null
          status?: string | null
          title: string
          urgency?: string | null
          user_id: string
        }
        Update: {
          budget_range?: string | null
          country?: string | null
          created_at?: string | null
          description?: string
          id?: string
          location?: string | null
          responses_count?: number | null
          specialism?: string | null
          status?: string | null
          title?: string
          urgency?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lfg_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lfg_responses: {
        Row: {
          created_at: string | null
          id: string
          lfg_id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lfg_id: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lfg_id?: string
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lfg_responses_lfg_id_fkey"
            columns: ["lfg_id"]
            isOneToOne: false
            referencedRelation: "lfg_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lfg_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      member_verifications: {
        Row: {
          association_name: string
          association_page_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          status: string | null
          user_id: string | null
          verification_code_id: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          association_name: string
          association_page_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
          verification_code_id?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          association_name?: string
          association_page_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
          verification_code_id?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_verifications_association_page_id_fkey"
            columns: ["association_page_id"]
            isOneToOne: false
            referencedRelation: "association_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_verifications_verification_code_id_fkey"
            columns: ["verification_code_id"]
            isOneToOne: false
            referencedRelation: "association_verification_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          event_id: string | null
          id: string
          image_url: string | null
          is_read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          event_id?: string | null
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          event_id?: string | null
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_sends: {
        Row: {
          click_count: number
          failed_count: number
          featured_count: number
          id: string
          new_count: number
          open_count: number
          recipient_count: number
          sent_at: string
          upcoming_count: number
        }
        Insert: {
          click_count?: number
          failed_count?: number
          featured_count?: number
          id?: string
          new_count?: number
          open_count?: number
          recipient_count?: number
          sent_at?: string
          upcoming_count?: number
        }
        Update: {
          click_count?: number
          failed_count?: number
          featured_count?: number
          id?: string
          new_count?: number
          open_count?: number
          recipient_count?: number
          sent_at?: string
          upcoming_count?: number
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          confirmed_at: string | null
          created_at: string | null
          email: string
          id: string
          interests: string | null
          region: string | null
          status: string
          unsubscribe_token: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string | null
          email: string
          id?: string
          interests?: string | null
          region?: string | null
          status?: string
          unsubscribe_token?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string | null
          email?: string
          id?: string
          interests?: string | null
          region?: string | null
          status?: string
          unsubscribe_token?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string | null
          body: string | null
          created_at: string
          emailed: boolean
          id: string
          is_read: boolean
          link: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          body?: string | null
          created_at?: string
          emailed?: boolean
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          body?: string | null
          created_at?: string
          emailed?: boolean
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      organisations: {
        Row: {
          country: string | null
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
          type: string
          website: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          type?: string
          website?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          type?: string
          website?: string | null
        }
        Relationships: []
      }
      outreach_sends: {
        Row: {
          association: string
          clicked_at: string | null
          event_name: string | null
          html: string | null
          id: string
          opened_at: string | null
          recipient_email: string
          recipient_name: string | null
          region: string | null
          resend_id: string | null
          send_after: string | null
          sender: string
          sent_at: string
          status: string
          subject: string | null
        }
        Insert: {
          association: string
          clicked_at?: string | null
          event_name?: string | null
          html?: string | null
          id?: string
          opened_at?: string | null
          recipient_email: string
          recipient_name?: string | null
          region?: string | null
          resend_id?: string | null
          send_after?: string | null
          sender?: string
          sent_at?: string
          status?: string
          subject?: string | null
        }
        Update: {
          association?: string
          clicked_at?: string | null
          event_name?: string | null
          html?: string | null
          id?: string
          opened_at?: string | null
          recipient_email?: string
          recipient_name?: string | null
          region?: string | null
          resend_id?: string | null
          send_after?: string | null
          sender?: string
          sent_at?: string
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments_count: number
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          is_pinned: boolean | null
          likes_count: number
          link_url: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          comments_count?: number
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_pinned?: boolean | null
          likes_count?: number
          link_url?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          comments_count?: number
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_pinned?: boolean | null
          likes_count?: number
          link_url?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_sections: {
        Row: {
          content: string
          created_at: string | null
          id: string
          sort_order: number
          title: string
          type: string
          user_id: string
          visible: boolean
        }
        Insert: {
          content?: string
          created_at?: string | null
          id?: string
          sort_order?: number
          title: string
          type: string
          user_id: string
          visible?: boolean
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          sort_order?: number
          title?: string
          type?: string
          user_id?: string
          visible?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          auth_provider: string | null
          available_for_referrals: boolean | null
          avatar_url: string | null
          badges: string[] | null
          banner_url: string | null
          bio: string | null
          country: string | null
          created_at: string | null
          full_name: string | null
          headline: string | null
          id: string
          is_public: boolean | null
          is_verified: boolean | null
          jurisdictions: string[] | null
          last_seen: string | null
          linkedin_name: string | null
          linkedin_picture: string | null
          linkedin_url: string | null
          location: string | null
          profile_color: string | null
          skills: string[] | null
          specialisation: string | null
          tos_accepted_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          auth_provider?: string | null
          available_for_referrals?: boolean | null
          avatar_url?: string | null
          badges?: string[] | null
          banner_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          full_name?: string | null
          headline?: string | null
          id: string
          is_public?: boolean | null
          is_verified?: boolean | null
          jurisdictions?: string[] | null
          last_seen?: string | null
          linkedin_name?: string | null
          linkedin_picture?: string | null
          linkedin_url?: string | null
          location?: string | null
          profile_color?: string | null
          skills?: string[] | null
          specialisation?: string | null
          tos_accepted_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          auth_provider?: string | null
          available_for_referrals?: boolean | null
          avatar_url?: string | null
          badges?: string[] | null
          banner_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          full_name?: string | null
          headline?: string | null
          id?: string
          is_public?: boolean | null
          is_verified?: boolean | null
          jurisdictions?: string[] | null
          last_seen?: string | null
          linkedin_name?: string | null
          linkedin_picture?: string | null
          linkedin_url?: string | null
          location?: string | null
          profile_color?: string | null
          skills?: string[] | null
          specialisation?: string | null
          tos_accepted_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          description: string | null
          id: string
          reason: string
          reported_content_id: string | null
          reported_content_type: string | null
          reported_user_id: string | null
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          reason: string
          reported_content_id?: string | null
          reported_content_type?: string | null
          reported_user_id?: string | null
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          reason?: string
          reported_content_id?: string | null
          reported_content_type?: string | null
          reported_user_id?: string | null
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          approved: boolean | null
          association_slug: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          title: string
          url: string
          user_id: string | null
        }
        Insert: {
          approved?: boolean | null
          association_slug?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          title: string
          url: string
          user_id?: string | null
        }
        Update: {
          approved?: boolean | null
          association_slug?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          title?: string
          url?: string
          user_id?: string | null
        }
        Relationships: []
      }
      saved_events: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_associations: {
        Row: {
          association_name: string
          association_slug: string | null
          created_at: string | null
          id: string
          member_since: number | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          association_name: string
          association_slug?: string | null
          created_at?: string | null
          id?: string
          member_since?: number | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          association_name?: string
          association_slug?: string | null
          created_at?: string | null
          id?: string
          member_since?: number | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      work_experience: {
        Row: {
          company_logo_url: string | null
          company_name: string
          created_at: string | null
          description: string | null
          end_year: number | null
          id: string
          is_current: boolean | null
          job_title: string
          organisation_id: string | null
          sort_order: number | null
          start_year: number
          user_id: string
        }
        Insert: {
          company_logo_url?: string | null
          company_name: string
          created_at?: string | null
          description?: string | null
          end_year?: number | null
          id?: string
          is_current?: boolean | null
          job_title: string
          organisation_id?: string | null
          sort_order?: number | null
          start_year: number
          user_id: string
        }
        Update: {
          company_logo_url?: string | null
          company_name?: string
          created_at?: string | null
          description?: string | null
          end_year?: number | null
          id?: string
          is_current?: boolean | null
          job_title?: string
          organisation_id?: string | null
          sort_order?: number | null
          start_year?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_experience_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_experience_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_email: { Args: { uid: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
