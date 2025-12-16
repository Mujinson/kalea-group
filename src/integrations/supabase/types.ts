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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          address: string | null
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string
          customer_type: Database["public"]["Enums"]["customer_type"]
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          notes: string | null
          pec: string | null
          phone: string | null
          postal_code: string | null
          province: string | null
          sdi_code: string | null
          updated_at: string
          vat_number: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          customer_type: Database["public"]["Enums"]["customer_type"]
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          pec?: string | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          sdi_code?: string | null
          updated_at?: string
          vat_number?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          customer_type?: Database["public"]["Enums"]["customer_type"]
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          pec?: string | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          sdi_code?: string | null
          updated_at?: string
          vat_number?: string | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          color: string | null
          created_at: string
          id: string
          low_stock_threshold: number | null
          movement_date: string
          movement_type: string
          notes: string | null
          product_type: string
          purchase_cost: number
          quantity_sqm: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          low_stock_threshold?: number | null
          movement_date?: string
          movement_type?: string
          notes?: string | null
          product_type: string
          purchase_cost: number
          quantity_sqm: number
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          low_stock_threshold?: number | null
          movement_date?: string
          movement_type?: string
          notes?: string | null
          product_type?: string
          purchase_cost?: number
          quantity_sqm?: number
        }
        Relationships: []
      }
      payment_agreements: {
        Row: {
          created_at: string
          end_date: string
          id: string
          notes: string | null
          start_date: string
          supplier_name: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          notes?: string | null
          start_date: string
          supplier_name: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          notes?: string | null
          start_date?: string
          supplier_name?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      payment_schedules: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          is_paid: boolean
          notes: string | null
          paid_date: string | null
          payment_type: string | null
          sale_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          is_paid?: boolean
          notes?: string | null
          paid_date?: string | null
          payment_type?: string | null
          sale_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          is_paid?: boolean
          notes?: string | null
          paid_date?: string | null
          payment_type?: string | null
          sale_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_schedules_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_additional_costs: {
        Row: {
          cost_type: string
          created_at: string
          id: string
          quantity: number | null
          sale_id: string
          total_price: number
          unit: string | null
          unit_price: number
        }
        Insert: {
          cost_type: string
          created_at?: string
          id?: string
          quantity?: number | null
          sale_id: string
          total_price?: number
          unit?: string | null
          unit_price?: number
        }
        Update: {
          cost_type?: string
          created_at?: string
          id?: string
          quantity?: number | null
          sale_id?: string
          total_price?: number
          unit?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_additional_costs_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_items: {
        Row: {
          created_at: string
          id: string
          product_type: string
          product_variant: string | null
          quantity_sqm: number
          sale_id: string
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          product_type: string
          product_variant?: string | null
          quantity_sqm: number
          sale_id: string
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          product_type?: string
          product_variant?: string | null
          quantity_sqm?: number
          sale_id?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          balance_amount: number | null
          balance_due_date: string | null
          channel: string
          color: string | null
          created_at: string
          customer_id: string | null
          customer_name: string | null
          deposit_amount: number | null
          deposit_date: string | null
          id: string
          notes: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_notes: string | null
          payment_terms: string | null
          product_type: string
          quantity_sqm: number
          sale_date: string
          sale_price: number
          vat_amount: number | null
          vat_included: boolean
        }
        Insert: {
          balance_amount?: number | null
          balance_due_date?: string | null
          channel?: string
          color?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          deposit_amount?: number | null
          deposit_date?: string | null
          id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_notes?: string | null
          payment_terms?: string | null
          product_type: string
          quantity_sqm: number
          sale_date?: string
          sale_price: number
          vat_amount?: number | null
          vat_included?: boolean
        }
        Update: {
          balance_amount?: number | null
          balance_due_date?: string | null
          channel?: string
          color?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          deposit_amount?: number | null
          deposit_date?: string | null
          id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_notes?: string | null
          payment_terms?: string | null
          product_type?: string
          quantity_sqm?: number
          sale_date?: string
          sale_price?: number
          vat_amount?: number | null
          vat_included?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      static_costs: {
        Row: {
          created_at: string
          duty_percentage: number
          fob_cost: number
          id: string
          import_logistics_cost: number
          internal_transport_cost: number | null
          product_type: string
          updated_at: string
          vat_percentage: number
        }
        Insert: {
          created_at?: string
          duty_percentage?: number
          fob_cost: number
          id?: string
          import_logistics_cost?: number
          internal_transport_cost?: number | null
          product_type: string
          updated_at?: string
          vat_percentage?: number
        }
        Update: {
          created_at?: string
          duty_percentage?: number
          fob_cost?: number
          id?: string
          import_logistics_cost?: number
          internal_transport_cost?: number | null
          product_type?: string
          updated_at?: string
          vat_percentage?: number
        }
        Relationships: []
      }
      supplier_payments: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          payment_amount: number
          payment_date: string
          supplier_name: string
          total_debt: number
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          payment_amount: number
          payment_date?: string
          supplier_name?: string
          total_debt: number
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          payment_amount?: number
          payment_date?: string
          supplier_name?: string
          total_debt?: number
        }
        Relationships: []
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
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      customer_type:
        | "cliente_privato"
        | "rivenditore"
        | "costruttore"
        | "posatore"
        | "architetto"
        | "interior_designer"
        | "showroom"
        | "studio_design"
        | "azienda_pubblica"
      payment_method: "carta_credito" | "bonifico" | "contanti" | "assegno"
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
      app_role: ["admin", "moderator", "user"],
      customer_type: [
        "cliente_privato",
        "rivenditore",
        "costruttore",
        "posatore",
        "architetto",
        "interior_designer",
        "showroom",
        "studio_design",
        "azienda_pubblica",
      ],
      payment_method: ["carta_credito", "bonifico", "contanti", "assegno"],
    },
  },
} as const
