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
      workspaces: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
        };
      };
      workspace_memberships: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          role: "owner" | "admin" | "member";
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          role?: "owner" | "admin" | "member";
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          role?: "owner" | "admin" | "member";
          created_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          slug: string;
          industry: string | null;
          status: "active" | "review" | "paused";
          retainer_quota: number;
          quota_posts?: number;
          quota_reels?: number;
          quota_carousels?: number;
          quota_stories?: number;
          quota_total?: number;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          slug: string;
          industry?: string | null;
          status?: "active" | "review" | "paused";
          retainer_quota?: number;
          quota_posts?: number;
          quota_reels?: number;
          quota_carousels?: number;
          quota_stories?: number;
          quota_total?: number;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          slug?: string;
          industry?: string | null;
          status?: "active" | "review" | "paused";
          retainer_quota?: number;
          quota_posts?: number;
          quota_reels?: number;
          quota_carousels?: number;
          quota_stories?: number;
          quota_total?: number;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      client_memberships: {
        Row: {
          id: string;
          client_id: string;
          user_id: string;
          role: "client_owner" | "reviewer" | "viewer";
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          user_id: string;
          role?: "client_owner" | "reviewer" | "viewer";
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          user_id?: string;
          role?: "client_owner" | "reviewer" | "viewer";
          created_at?: string;
        };
      };
      content_items: {
        Row: {
          id: string;
          client_id: string;
          title: string;
          format: "post" | "carousel" | "reel" | "story";
          status: "draft" | "pending" | "changes" | "approved" | "published" | "scheduled";
          caption: string | null;
          scheduled_at: string | null;
          approved_at: string | null;
          approved_by: string | null;
          published_at: string | null;
          revision_count: number;
          channels: string[];
          aspect_ratio: string;
          media_urls: string[];
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          title: string;
          format: "post" | "carousel" | "reel" | "story";
          status?: "draft" | "pending" | "changes" | "approved" | "published" | "scheduled";
          caption?: string | null;
          scheduled_at?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          published_at?: string | null;
          revision_count?: number;
          channels?: string[];
          aspect_ratio?: string;
          media_urls?: string[];
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          title?: string;
          format?: "post" | "carousel" | "reel" | "story";
          status?: "draft" | "pending" | "changes" | "approved" | "published" | "scheduled";
          caption?: string | null;
          scheduled_at?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          published_at?: string | null;
          revision_count?: number;
          channels?: string[];
          aspect_ratio?: string;
          media_urls?: string[];
          metadata?: Json;
          created_at?: string;
        };
      };
      content_revisions: {
        Row: {
          id: string;
          content_item_id: string;
          revision_number: number;
          status: "draft" | "pending" | "changes" | "approved" | "published";
          title: string;
          caption: string | null;
          feedback_note: string | null;
          target_area: "Caption & Copy" | "Slide Photo" | "Scheduling Time" | "Hashtags" | "General" | null;
          reviewer_id: string | null;
          reviewer_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          content_item_id: string;
          revision_number?: number;
          status: "draft" | "pending" | "changes" | "approved" | "published";
          title: string;
          caption?: string | null;
          feedback_note?: string | null;
          target_area?: "Caption & Copy" | "Slide Photo" | "Scheduling Time" | "Hashtags" | "General" | null;
          reviewer_id?: string | null;
          reviewer_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          content_item_id?: string;
          revision_number?: number;
          status?: "draft" | "pending" | "changes" | "approved" | "published";
          title?: string;
          caption?: string | null;
          feedback_note?: string | null;
          target_area?: "Caption & Copy" | "Slide Photo" | "Scheduling Time" | "Hashtags" | "General" | null;
          reviewer_id?: string | null;
          reviewer_name?: string | null;
          created_at?: string;
        };
      };
      deliverables: {
        Row: {
          id: string;
          client_id: string;
          title: string;
          format: "post" | "carousel" | "reel" | "story";
          status: "pending" | "changes" | "approved" | "scheduled";
          caption: string | null;
          scheduled_for: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          title: string;
          format: "post" | "carousel" | "reel" | "story";
          status?: "pending" | "changes" | "approved" | "scheduled";
          caption?: string | null;
          scheduled_for?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          title?: string;
          format?: "post" | "carousel" | "reel" | "story";
          status?: "pending" | "changes" | "approved" | "scheduled";
          caption?: string | null;
          scheduled_for?: string | null;
          created_at?: string;
        };
      };
      feedback_pins: {
        Row: {
          id: string;
          content_item_id: string;
          slide_index: number;
          pin_number: number;
          pin_x: number | null;
          pin_y: number | null;
          author_id: string | null;
          author_name: string;
          target_area: "caption" | "slide_photo" | "timing" | "hashtags" | "general" | null;
          note: string;
          status: "open" | "resolved";
          created_at: string;
        };
        Insert: {
          id?: string;
          content_item_id: string;
          slide_index?: number;
          pin_number?: number;
          pin_x?: number | null;
          pin_y?: number | null;
          author_id?: string | null;
          author_name: string;
          target_area?: "caption" | "slide_photo" | "timing" | "hashtags" | "general" | null;
          note: string;
          status?: "open" | "resolved";
          created_at?: string;
        };
        Update: {
          id?: string;
          content_item_id?: string;
          slide_index?: number;
          pin_number?: number;
          pin_x?: number | null;
          pin_y?: number | null;
          author_id?: string | null;
          author_name?: string;
          target_area?: "caption" | "slide_photo" | "timing" | "hashtags" | "general" | null;
          note?: string;
          status?: "open" | "resolved";
          created_at?: string;
        };
      };
    };
  };
}
