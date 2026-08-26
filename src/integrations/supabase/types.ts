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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      blog_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          body: string
          category_id: string | null
          cover_path: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          category_id?: string | null
          cover_path?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          category_id?: string | null
          cover_path?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      image_tags: {
        Row: {
          image_id: string
          tag_id: string
        }
        Insert: {
          image_id: string
          tag_id: string
        }
        Update: {
          image_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "image_tags_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "project_images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "image_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          archived_at: string | null
          created_at: string
          email: string
          id: string
          interest: string | null
          message: string | null
          name: string
          notified_at: string | null
          notify_error: string | null
          phone: string | null
          project_type: string | null
          read_at: string | null
          source: string | null
          timeline: string | null
          user_agent: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          email: string
          id?: string
          interest?: string | null
          message?: string | null
          name: string
          notified_at?: string | null
          notify_error?: string | null
          phone?: string | null
          project_type?: string | null
          read_at?: string | null
          source?: string | null
          timeline?: string | null
          user_agent?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          email?: string
          id?: string
          interest?: string | null
          message?: string | null
          name?: string
          notified_at?: string | null
          notify_error?: string | null
          phone?: string | null
          project_type?: string | null
          read_at?: string | null
          source?: string | null
          timeline?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      project_images: {
        Row: {
          alt_text: string | null
          category: string
          created_at: string
          id: string
          is_cover: boolean
          project_id: string
          sort_order: number
          storage_path: string
        }
        Insert: {
          alt_text?: string | null
          category: string
          created_at?: string
          id?: string
          is_cover?: boolean
          project_id: string
          sort_order?: number
          storage_path: string
        }
        Update: {
          alt_text?: string | null
          category?: string
          created_at?: string
          id?: string
          is_cover?: boolean
          project_id?: string
          sort_order?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tags: {
        Row: {
          project_id: string
          tag_id: string
        }
        Insert: {
          project_id: string
          tag_id: string
        }
        Update: {
          project_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tags_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client_brief: string | null
          created_at: string
          description: string | null
          featured: boolean
          features: Json
          headline: string | null
          id: string
          location_city: string | null
          location_state: string | null
          project_type: string
          published: boolean
          slug: string
          sort_order: number
          specs: Json
          story: string | null
          tagline: string | null
          title: string
          updated_at: string
          year_completed: number | null
        }
        Insert: {
          client_brief?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          features?: Json
          headline?: string | null
          id?: string
          location_city?: string | null
          location_state?: string | null
          project_type?: string
          published?: boolean
          slug: string
          sort_order?: number
          specs?: Json
          story?: string | null
          tagline?: string | null
          title: string
          updated_at?: string
          year_completed?: number | null
        }
        Update: {
          client_brief?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          features?: Json
          headline?: string | null
          id?: string
          location_city?: string | null
          location_state?: string | null
          project_type?: string
          published?: boolean
          slug?: string
          sort_order?: number
          specs?: Json
          story?: string | null
          tagline?: string | null
          title?: string
          updated_at?: string
          year_completed?: number | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          favicon_path: string | null
          hero_headline: string | null
          hero_image_bucket: string | null
          hero_image_path: string | null
          hero_subline: string | null
          id: string
          inquiry_notify_emails: string | null
          intro_body: string | null
          intro_heading: string | null
          logo_dark_path: string | null
          logo_path: string | null
          singleton: boolean
          site_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          favicon_path?: string | null
          hero_headline?: string | null
          hero_image_bucket?: string | null
          hero_image_path?: string | null
          hero_subline?: string | null
          id?: string
          inquiry_notify_emails?: string | null
          intro_body?: string | null
          intro_heading?: string | null
          logo_dark_path?: string | null
          logo_path?: string | null
          singleton?: boolean
          site_name?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          favicon_path?: string | null
          hero_headline?: string | null
          hero_image_bucket?: string | null
          hero_image_path?: string | null
          hero_subline?: string | null
          id?: string
          inquiry_notify_emails?: string | null
          intro_body?: string | null
          intro_heading?: string | null
          logo_dark_path?: string | null
          logo_path?: string | null
          singleton?: boolean
          site_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      team_members: {
        Row: {
          bio: string | null
          created_at: string
          credentials: string | null
          id: string
          name: string
          photo_path: string | null
          published: boolean
          role: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          credentials?: string | null
          id?: string
          name: string
          photo_path?: string | null
          published?: boolean
          role?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          credentials?: string | null
          id?: string
          name?: string
          photo_path?: string | null
          published?: boolean
          role?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author_detail: string | null
          author_name: string
          created_at: string
          id: string
          project_id: string | null
          published: boolean
          quote: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          author_detail?: string | null
          author_name: string
          created_at?: string
          id?: string
          project_id?: string | null
          published?: boolean
          quote: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          author_detail?: string | null
          author_name?: string
          created_at?: string
          id?: string
          project_id?: string | null
          published?: boolean
          quote?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id?: string }; Returns: boolean }
      is_owner: { Args: { _user_id?: string }; Returns: boolean }
      is_platform_owner: { Args: { _user_id?: string }; Returns: boolean }
      is_staff: { Args: { _user_id?: string }; Returns: boolean }
      list_project_bucket_paths: {
        Args: { _slug: string }
        Returns: {
          name: string
        }[]
      }
      set_project_cover: {
        Args: { _image_id: string; _project_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "platform_owner" | "owner" | "editor"
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
    Enums: {
      app_role: ["admin", "platform_owner", "owner", "editor"],
    },
  },
} as const
