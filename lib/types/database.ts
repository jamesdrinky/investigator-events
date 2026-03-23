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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
