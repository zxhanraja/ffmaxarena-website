
export type Database = {
  public: {
    Tables: {
      contact_messages: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: number
          is_read: boolean | null
          message: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: number
          is_read?: boolean | null
          message: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: number
          is_read?: boolean | null
          message?: string
          subject?: string | null
        }
      }
      newsletter_subscriptions: {
        Row: {
          created_at: string
          email: string
          id: number
          is_active: boolean | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
          is_active?: boolean | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          is_active?: boolean | null
        }
      }
      organizer_verifications: {
        Row: {
          created_at: string
          discord_link: string | null
          email: string
          experience: string
          id: number
          organization_name: string
          organizer_name: string
          phone: string
          previous_tournaments: string | null
          proof_links: string | null
          social_media: string | null
          status: string | null
          whatsapp_link: string | null
          why_verified: string
        }
        Insert: {
          created_at?: string
          discord_link?: string | null
          email: string
          experience: string
          id?: number
          organization_name: string
          organizer_name: string
          phone: string
          previous_tournaments?: string | null
          proof_links?: string | null
          social_media?: string | null
          status?: string | null
          whatsapp_link?: string | null
          why_verified: string
        }
        Update: {
          created_at?: string
          discord_link?: string | null
          email?: string
          experience?: string
          id?: number
          organization_name?: string
          organizer_name?: string
          phone?: string
          previous_tournaments?: string | null
          proof_links?: string | null
          social_media?: string | null
          status?: string | null
          whatsapp_link?: string | null
          why_verified?: string
        }
      }
      organizers: {
        Row: {
          about: string | null
          badges: string[] | null
          contact_email: string
          created_at: string
          discord_id: string | null
          id: number
          instagram_profile: string | null
          is_verified: boolean | null
          logo_url: string | null
          name: string
          players_served: number | null
          rating: number | null
          total_tournaments: number | null
          whatsapp_number: string | null
          youtube_channel: string | null
        }
        Insert: {
          about?: string | null
          badges?: string[] | null
          contact_email: string
          created_at?: string
          discord_id?: string | null
          id?: number
          instagram_profile?: string | null
          is_verified?: boolean | null
          logo_url?: string | null
          name: string
          players_served?: number | null
          rating?: number | null
          total_tournaments?: number | null
          whatsapp_number?: string | null
          youtube_channel?: string | null
        }
        Update: {
          about?: string | null
          badges?: string[] | null
          contact_email?: string
          created_at?: string
          discord_id?: string | null
          id?: number
          instagram_profile?: string | null
          is_verified?: boolean | null
          logo_url?: string | null
          name?: string
          players_served?: number | null
          rating?: number | null
          total_tournaments?: number | null
          whatsapp_number?: string | null
          youtube_channel?: string | null
        }
      }
      tournament_submissions: {
        Row: {
          ampm: string
          banner_url: string | null
          created_at: string
          date: string
          description: string | null
          discord_link: string | null
          email: string
          entry_fee: string
          game_mode: string
          hour: string
          id: number
          map: string
          max_participants: string | null
          minute: string
          organizer_name: string
          poster_url: string
          prize_pool: string | null
          registration_link: string | null
          status: string | null
          tournament_title: string
          whatsapp_link: string | null
          youtube_link: string | null
        }
        Insert: {
          ampm: string
          banner_url?: string | null
          created_at?: string
          date: string
          description?: string | null
          discord_link?: string | null
          email: string
          entry_fee: string
          game_mode: string
          hour: string
          id?: number
          map: string
          max_participants?: string | null
          minute: string
          organizer_name: string
          poster_url: string
          prize_pool?: string | null
          registration_link?: string | null
          status?: string | null
          tournament_title: string
          whatsapp_link?: string | null
          youtube_link?: string | null
        }
        Update: {
          ampm?: string
          banner_url?: string | null
          created_at?: string
          date?: string
          description?: string | null
          discord_link?: string | null
          email?: string
          entry_fee?: string
          game_mode?: string
          hour?: string
          id?: number
          map?: string
          max_participants?: string | null
          minute?: string
          organizer_name?: string
          poster_url?: string
          prize_pool?: string | null
          registration_link?: string | null
          status?: string | null
          tournament_title?: string
          whatsapp_link?: string | null
          youtube_link?: string | null
        }
      }
      tournaments: {
        Row: {
          banner_url: string | null
          created_at: string
          date: string
          description: string | null
          discord_link: string | null
          entry_fee: string | null
          game_mode: string | null
          id: number
          is_verified: boolean | null
          map: string | null
          max_participants: string | null
          organizer_name: string
          poster_url: string | null
          prize_pool: string | null
          registration_link: string | null
          status: string | null
          time: string
          title: string
          whatsapp_link: string | null
          youtube_link: string | null
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          date: string
          description?: string | null
          discord_link?: string | null
          entry_fee?: string | null
          game_mode?: string | null
          id?: number
          is_verified?: boolean | null
          map?: string | null
          max_participants?: string | null
          organizer_name: string
          poster_url?: string | null
          prize_pool?: string | null
          registration_link?: string | null
          status?: string | null
          time: string
          title: string
          whatsapp_link?: string | null
          youtube_link?: string | null
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          date?: string
          description?: string | null
          discord_link?: string | null
          entry_fee?: string | null
          game_mode?: string | null
          id?: number
          is_verified?: boolean | null
          map?: string | null
          max_participants?: string | null
          organizer_name?: string
          poster_url?: string | null
          prize_pool?: string | null
          registration_link?: string | null
          status?: string | null
          time?: string
          title?: string
          whatsapp_link?: string | null
          youtube_link?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
