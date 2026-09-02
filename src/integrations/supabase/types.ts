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
      intents: {
        Row: {
          claimed: boolean
          claimed_at: string | null
          created_at: string
          id: string
          intent_created_at: string
          intent_id: string
          intent_token: string
          mobile_hash: string | null
          session_id: string
          source_id: string
          updated_at: string
        }
        Insert: {
          claimed?: boolean
          claimed_at?: string | null
          created_at?: string
          id?: string
          intent_created_at?: string
          intent_id: string
          intent_token: string
          mobile_hash?: string | null
          session_id: string
          source_id: string
          updated_at?: string
        }
        Update: {
          claimed?: boolean
          claimed_at?: string | null
          created_at?: string
          id?: string
          intent_created_at?: string
          intent_id?: string
          intent_token?: string
          mobile_hash?: string | null
          session_id?: string
          source_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      mobile_otp_rate_limits: {
        Row: {
          created_at: string
          daily_attempts: number
          daily_window_start: string
          hourly_attempts: number
          hourly_window_start: string
          id: string
          mobile_hash: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          daily_attempts?: number
          daily_window_start?: string
          hourly_attempts?: number
          hourly_window_start?: string
          id?: string
          mobile_hash: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          daily_attempts?: number
          daily_window_start?: string
          hourly_attempts?: number
          hourly_window_start?: string
          id?: string
          mobile_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      otp_verifications: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          last_verify_at: string | null
          mobile_hash: string
          otp_hash: string
          send_attempts: number
          session_id: string
          verify_attempts: number
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          last_verify_at?: string | null
          mobile_hash: string
          otp_hash: string
          send_attempts?: number
          session_id: string
          verify_attempts?: number
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          last_verify_at?: string | null
          mobile_hash?: string
          otp_hash?: string
          send_attempts?: number
          session_id?: string
          verify_attempts?: number
        }
        Relationships: []
      }
      redirect_logs: {
        Row: {
          created_at: string
          destination: string
          id: string
          session_id: string
          source_id: string
        }
        Insert: {
          created_at?: string
          destination: string
          id?: string
          session_id: string
          source_id: string
        }
        Update: {
          created_at?: string
          destination?: string
          id?: string
          session_id?: string
          source_id?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          created_at: string
          entry_timestamp: string
          id: string
          precommit_timestamp: string | null
          session_id: string
          source_id: string
          state: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          entry_timestamp?: string
          id?: string
          precommit_timestamp?: string | null
          session_id: string
          source_id: string
          state?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          entry_timestamp?: string
          id?: string
          precommit_timestamp?: string | null
          session_id?: string
          source_id?: string
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
      unique_individuals: {
        Row: {
          created_at: string
          id: string
          mobile_hash: string
          session_id: string
          verification_timestamp: string
        }
        Insert: {
          created_at?: string
          id?: string
          mobile_hash: string
          session_id: string
          verification_timestamp?: string
        }
        Update: {
          created_at?: string
          id?: string
          mobile_hash?: string
          session_id?: string
          verification_timestamp?: string
        }
        Relationships: []
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
