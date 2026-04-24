export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          family_id: string | null;
          theme: 'dark' | 'light';
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          family_id?: string | null;
          theme?: 'dark' | 'light';
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          family_id?: string | null;
          theme?: 'dark' | 'light';
          created_at?: string;
        };
        Relationships: [];
      };
      families: {
        Row: {
          id: string;
          name: string;
          head_id: string;
          invite_code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          head_id: string;
          invite_code: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          head_id?: string;
          invite_code?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      supply_items: {
        Row: {
          id: string;
          family_id: string;
          name: string;
          category: string;
          frequency: 'weekly' | 'monthly';
          is_bought: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          name: string;
          category: string;
          frequency: 'weekly' | 'monthly';
          is_bought?: boolean;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          family_id?: string;
          name?: string;
          category?: string;
          frequency?: 'weekly' | 'monthly';
          is_bought?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      purchase_records: {
        Row: {
          id: string;
          item_id: string;
          family_id: string;
          price: number;
          bought_by: string;
          bought_at: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          item_id: string;
          family_id: string;
          price: number;
          bought_by: string;
          bought_at?: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          item_id?: string;
          family_id?: string;
          price?: number;
          bought_by?: string;
          bought_at?: string;
          notes?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Family = Database['public']['Tables']['families']['Row'];
export type SupplyItem = Database['public']['Tables']['supply_items']['Row'];
export type PurchaseRecord = Database['public']['Tables']['purchase_records']['Row'];
