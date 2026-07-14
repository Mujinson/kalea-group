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
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_type: string
          assigned_to: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          duration_minutes: number
          id: string
          lead_id: string | null
          location: string | null
          notes: string | null
          reminder_sent: boolean | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_type?: string
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          duration_minutes?: number
          id?: string
          lead_id?: string | null
          location?: string | null
          notes?: string | null
          reminder_sent?: boolean | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_type?: string
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          duration_minutes?: number
          id?: string
          lead_id?: string | null
          location?: string | null
          notes?: string | null
          reminder_sent?: boolean | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_customer_receivables"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "appointments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_blocks: {
        Row: {
          block_date: string
          created_at: string
          id: string
          reason: string | null
          slot: string
          user_id: string
        }
        Insert: {
          block_date: string
          created_at?: string
          id?: string
          reason?: string | null
          slot?: string
          user_id: string
        }
        Update: {
          block_date?: string
          created_at?: string
          id?: string
          reason?: string | null
          slot?: string
          user_id?: string
        }
        Relationships: []
      }
      catalog_audit_log: {
        Row: {
          action: string
          created_at: string
          entity_code: string | null
          entity_id: string | null
          entity_type: string
          field: string | null
          id: string
          new_value: Json | null
          old_value: Json | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_code?: string | null
          entity_id?: string | null
          entity_type: string
          field?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_code?: string | null
          entity_id?: string | null
          entity_type?: string
          field?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      catalog_brands: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          slug: string | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          slug?: string | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          slug?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      catalog_collections: {
        Row: {
          brand_id: string | null
          created_at: string
          description: string | null
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          brand_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          brand_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_collections_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "catalog_brands"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_import_flags: {
        Row: {
          created_at: string
          csv_row: Json | null
          id: string
          issue_note: string | null
          product_match_hint: string | null
          resolved: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          csv_row?: Json | null
          id?: string
          issue_note?: string | null
          product_match_hint?: string | null
          resolved?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          csv_row?: Json | null
          id?: string
          issue_note?: string | null
          product_match_hint?: string | null
          resolved?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      catalog_price_history: {
        Row: {
          change_reason: string | null
          changed_at: string
          changed_by: string | null
          changed_field: string
          id: string
          new_value: number | null
          old_value: number | null
          product_id: string
        }
        Insert: {
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          changed_field: string
          id?: string
          new_value?: number | null
          old_value?: number | null
          product_id: string
        }
        Update: {
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          changed_field?: string
          id?: string
          new_value?: number | null
          old_value?: number | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_price_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog_products"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_price_list_items: {
        Row: {
          brand: string | null
          collection: string | null
          created_at: string
          diff_type: Database["public"]["Enums"]["catalog_diff_type"]
          id: string
          list_price: number | null
          name: string | null
          old_snapshot: Json | null
          price_list_id: string
          product_code: string
          product_id: string | null
          snapshot: Json
          supplier_discount_percentage: number | null
          unit_of_measure: string | null
          vat_percentage: number | null
        }
        Insert: {
          brand?: string | null
          collection?: string | null
          created_at?: string
          diff_type?: Database["public"]["Enums"]["catalog_diff_type"]
          id?: string
          list_price?: number | null
          name?: string | null
          old_snapshot?: Json | null
          price_list_id: string
          product_code: string
          product_id?: string | null
          snapshot?: Json
          supplier_discount_percentage?: number | null
          unit_of_measure?: string | null
          vat_percentage?: number | null
        }
        Update: {
          brand?: string | null
          collection?: string | null
          created_at?: string
          diff_type?: Database["public"]["Enums"]["catalog_diff_type"]
          id?: string
          list_price?: number | null
          name?: string | null
          old_snapshot?: Json | null
          price_list_id?: string
          product_code?: string
          product_id?: string | null
          snapshot?: Json
          supplier_discount_percentage?: number | null
          unit_of_measure?: string | null
          vat_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_price_list_items_price_list_id_fkey"
            columns: ["price_list_id"]
            isOneToOne: false
            referencedRelation: "catalog_price_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_price_list_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog_products"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_price_lists: {
        Row: {
          applied_at: string | null
          brand_id: string | null
          created_at: string
          created_by: string | null
          effective_date: string
          id: string
          name: string
          notes: string | null
          source_file: string | null
          status: Database["public"]["Enums"]["catalog_price_list_status"]
          totals: Json
          updated_at: string
          version: number
        }
        Insert: {
          applied_at?: string | null
          brand_id?: string | null
          created_at?: string
          created_by?: string | null
          effective_date?: string
          id?: string
          name: string
          notes?: string | null
          source_file?: string | null
          status?: Database["public"]["Enums"]["catalog_price_list_status"]
          totals?: Json
          updated_at?: string
          version: number
        }
        Update: {
          applied_at?: string | null
          brand_id?: string | null
          created_at?: string
          created_by?: string | null
          effective_date?: string
          id?: string
          name?: string
          notes?: string | null
          source_file?: string | null
          status?: Database["public"]["Enums"]["catalog_price_list_status"]
          totals?: Json
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "catalog_price_lists_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "catalog_brands"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_products: {
        Row: {
          attributes: Json
          available_stock: number | null
          barcode: string | null
          brand: string | null
          brand_id: string | null
          category_id: string | null
          certifications: string[] | null
          collection: string | null
          collection_id: string | null
          color: string | null
          created_at: string
          description: string | null
          finish: string | null
          format: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          list_price: number
          low_stock_threshold: number | null
          markup_percentage: number
          max_customer_discount_percentage: number
          min_margin_percentage: number
          min_order_quantity: number | null
          name: string
          net_cost: number | null
          notes: string | null
          pack_per_pallet: number | null
          pallet_weight_kg: number | null
          pieces_per_pack: number | null
          price_base_sqm: number | null
          price_over_3_pallets_sqm: number | null
          price_over_pallet_sqm: number | null
          product_code: string
          product_type: string
          purchase_price: number | null
          sale_price: number | null
          subcategory: string | null
          supplier_code: string | null
          supplier_discount_percentage: number
          supplier_id: string | null
          technical_sheet_pdf_url: string | null
          technical_sheet_url: string | null
          thickness_mm: number | null
          unit_of_measure: string
          updated_at: string
          vat_percentage: number
          warehouse_location: string | null
          weight_per_unit: number | null
        }
        Insert: {
          attributes?: Json
          available_stock?: number | null
          barcode?: string | null
          brand?: string | null
          brand_id?: string | null
          category_id?: string | null
          certifications?: string[] | null
          collection?: string | null
          collection_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          finish?: string | null
          format?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          list_price?: number
          low_stock_threshold?: number | null
          markup_percentage?: number
          max_customer_discount_percentage?: number
          min_margin_percentage?: number
          min_order_quantity?: number | null
          name: string
          net_cost?: number | null
          notes?: string | null
          pack_per_pallet?: number | null
          pallet_weight_kg?: number | null
          pieces_per_pack?: number | null
          price_base_sqm?: number | null
          price_over_3_pallets_sqm?: number | null
          price_over_pallet_sqm?: number | null
          product_code: string
          product_type?: string
          purchase_price?: number | null
          sale_price?: number | null
          subcategory?: string | null
          supplier_code?: string | null
          supplier_discount_percentage?: number
          supplier_id?: string | null
          technical_sheet_pdf_url?: string | null
          technical_sheet_url?: string | null
          thickness_mm?: number | null
          unit_of_measure?: string
          updated_at?: string
          vat_percentage?: number
          warehouse_location?: string | null
          weight_per_unit?: number | null
        }
        Update: {
          attributes?: Json
          available_stock?: number | null
          barcode?: string | null
          brand?: string | null
          brand_id?: string | null
          category_id?: string | null
          certifications?: string[] | null
          collection?: string | null
          collection_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          finish?: string | null
          format?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          list_price?: number
          low_stock_threshold?: number | null
          markup_percentage?: number
          max_customer_discount_percentage?: number
          min_margin_percentage?: number
          min_order_quantity?: number | null
          name?: string
          net_cost?: number | null
          notes?: string | null
          pack_per_pallet?: number | null
          pallet_weight_kg?: number | null
          pieces_per_pack?: number | null
          price_base_sqm?: number | null
          price_over_3_pallets_sqm?: number | null
          price_over_pallet_sqm?: number | null
          product_code?: string
          product_type?: string
          purchase_price?: number | null
          sale_price?: number | null
          subcategory?: string | null
          supplier_code?: string | null
          supplier_discount_percentage?: number
          supplier_id?: string | null
          technical_sheet_pdf_url?: string | null
          technical_sheet_url?: string | null
          thickness_mm?: number | null
          unit_of_measure?: string
          updated_at?: string
          vat_percentage?: number
          warehouse_location?: string | null
          weight_per_unit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "catalog_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "catalog_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "product_suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_conversations: {
        Row: {
          channel: string
          created_at: string
          id: string
          lead_id: string | null
          qualification_data: Json | null
          session_id: string
          status: string
          updated_at: string
        }
        Insert: {
          channel?: string
          created_at?: string
          id?: string
          lead_id?: string | null
          qualification_data?: Json | null
          session_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          lead_id?: string | null
          qualification_data?: Json | null
          session_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_conversations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chatbot_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_invoices: {
        Row: {
          attachment_url: string | null
          commission_percentage: number
          created_at: string
          due_date: string | null
          id: string
          invoice_number: string | null
          notes: string | null
          paid_date: string | null
          salesperson_id: string
          status: Database["public"]["Enums"]["invoice_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          attachment_url?: string | null
          commission_percentage?: number
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          paid_date?: string | null
          salesperson_id: string
          status?: Database["public"]["Enums"]["invoice_status"]
          total_amount?: number
          updated_at?: string
        }
        Update: {
          attachment_url?: string | null
          commission_percentage?: number
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          paid_date?: string | null
          salesperson_id?: string
          status?: Database["public"]["Enums"]["invoice_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commercial_invoices_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          amount: number
          base_amount: number
          created_at: string
          customer_id: string | null
          customer_name: string | null
          id: string
          note: string | null
          paid_at: string | null
          percentage: number
          preventivo_id: string | null
          quote_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          base_amount?: number
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          id?: string
          note?: string | null
          paid_at?: string | null
          percentage?: number
          preventivo_id?: string | null
          quote_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          base_amount?: number
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          id?: string
          note?: string | null
          paid_at?: string | null
          percentage?: number
          preventivo_id?: string | null
          quote_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_preventivo_id_fkey"
            columns: ["preventivo_id"]
            isOneToOne: false
            referencedRelation: "preventivi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      construction_sites: {
        Row: {
          access_difficulty: string | null
          address: string | null
          available_days: number | null
          building_floor: string | null
          city: string | null
          construction_type: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contact_surname: string | null
          country: string | null
          created_at: string
          customer_id: string | null
          electricity_available: boolean | null
          end_date: string | null
          estimated_hours: number | null
          floor_brand: string | null
          floor_color: string | null
          floor_lot: string | null
          floor_model: string | null
          floor_product_id: string | null
          floor_sqm: number | null
          floor_tech_notes: string | null
          floor_thickness: string | null
          floor_type: string | null
          has_elevator: boolean | null
          id: string
          inhabited: boolean | null
          latitude: number | null
          lead_id: string | null
          logistics_notes: string | null
          longitude: number | null
          notes: string | null
          parking_available: boolean | null
          parking_distance_m: number | null
          permits_required: boolean | null
          planned_end_date: string | null
          planned_start_date: string | null
          postal_code: string | null
          priority: string | null
          product_model: string | null
          project_name: string | null
          province: string | null
          quote_id: string | null
          region: string | null
          salesperson_id: string | null
          start_date: string | null
          status: string
          tipologia: string | null
          title: string
          updated_at: string
          water_available: boolean | null
          worker_notes: string | null
          ztl_zone: boolean | null
        }
        Insert: {
          access_difficulty?: string | null
          address?: string | null
          available_days?: number | null
          building_floor?: string | null
          city?: string | null
          construction_type?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_surname?: string | null
          country?: string | null
          created_at?: string
          customer_id?: string | null
          electricity_available?: boolean | null
          end_date?: string | null
          estimated_hours?: number | null
          floor_brand?: string | null
          floor_color?: string | null
          floor_lot?: string | null
          floor_model?: string | null
          floor_product_id?: string | null
          floor_sqm?: number | null
          floor_tech_notes?: string | null
          floor_thickness?: string | null
          floor_type?: string | null
          has_elevator?: boolean | null
          id?: string
          inhabited?: boolean | null
          latitude?: number | null
          lead_id?: string | null
          logistics_notes?: string | null
          longitude?: number | null
          notes?: string | null
          parking_available?: boolean | null
          parking_distance_m?: number | null
          permits_required?: boolean | null
          planned_end_date?: string | null
          planned_start_date?: string | null
          postal_code?: string | null
          priority?: string | null
          product_model?: string | null
          project_name?: string | null
          province?: string | null
          quote_id?: string | null
          region?: string | null
          salesperson_id?: string | null
          start_date?: string | null
          status?: string
          tipologia?: string | null
          title: string
          updated_at?: string
          water_available?: boolean | null
          worker_notes?: string | null
          ztl_zone?: boolean | null
        }
        Update: {
          access_difficulty?: string | null
          address?: string | null
          available_days?: number | null
          building_floor?: string | null
          city?: string | null
          construction_type?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_surname?: string | null
          country?: string | null
          created_at?: string
          customer_id?: string | null
          electricity_available?: boolean | null
          end_date?: string | null
          estimated_hours?: number | null
          floor_brand?: string | null
          floor_color?: string | null
          floor_lot?: string | null
          floor_model?: string | null
          floor_product_id?: string | null
          floor_sqm?: number | null
          floor_tech_notes?: string | null
          floor_thickness?: string | null
          floor_type?: string | null
          has_elevator?: boolean | null
          id?: string
          inhabited?: boolean | null
          latitude?: number | null
          lead_id?: string | null
          logistics_notes?: string | null
          longitude?: number | null
          notes?: string | null
          parking_available?: boolean | null
          parking_distance_m?: number | null
          permits_required?: boolean | null
          planned_end_date?: string | null
          planned_start_date?: string | null
          postal_code?: string | null
          priority?: string | null
          product_model?: string | null
          project_name?: string | null
          province?: string | null
          quote_id?: string | null
          region?: string | null
          salesperson_id?: string | null
          start_date?: string | null
          status?: string
          tipologia?: string | null
          title?: string
          updated_at?: string
          water_available?: boolean | null
          worker_notes?: string | null
          ztl_zone?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "construction_sites_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "construction_sites_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_customer_receivables"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "construction_sites_floor_product_id_fkey"
            columns: ["floor_product_id"]
            isOneToOne: false
            referencedRelation: "catalog_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "construction_sites_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "construction_sites_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "construction_sites_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_assignments: {
        Row: {
          created_at: string
          created_by: string | null
          crew_id: string
          end_date: string
          hours_per_day: number
          id: string
          notes: string | null
          site_id: string
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          crew_id: string
          end_date: string
          hours_per_day?: number
          id?: string
          notes?: string | null
          site_id: string
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          crew_id?: string
          end_date?: string
          hours_per_day?: number
          id?: string
          notes?: string | null
          site_id?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crew_assignments_crew_id_fkey"
            columns: ["crew_id"]
            isOneToOne: false
            referencedRelation: "crews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_assignments_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "construction_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_members: {
        Row: {
          created_at: string
          crew_id: string
          id: string
          role: string
          worker_id: string
        }
        Insert: {
          created_at?: string
          crew_id: string
          id?: string
          role?: string
          worker_id: string
        }
        Update: {
          created_at?: string
          crew_id?: string
          id?: string
          role?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crew_members_crew_id_fkey"
            columns: ["crew_id"]
            isOneToOne: false
            referencedRelation: "crews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_members_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: true
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      crews: {
        Row: {
          active: boolean
          color: string
          created_at: string
          id: string
          lead_worker_id: string | null
          max_workers: number
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          color?: string
          created_at?: string
          id?: string
          lead_worker_id?: string | null
          max_workers?: number
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          color?: string
          created_at?: string
          id?: string
          lead_worker_id?: string | null
          max_workers?: number
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crews_lead_worker_id_fkey"
            columns: ["lead_worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_assistant_conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      crm_assistant_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          tool_calls: Json | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          tool_calls?: Json | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          tool_calls?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_assistant_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "crm_assistant_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_action_logs: {
        Row: {
          action_description: string
          action_type: string
          contact_person_contact: string | null
          contact_person_name: string | null
          contact_person_role: string | null
          created_at: string
          customer_id: string
          id: string
          next_steps: string | null
          user_email: string | null
        }
        Insert: {
          action_description: string
          action_type: string
          contact_person_contact?: string | null
          contact_person_name?: string | null
          contact_person_role?: string | null
          created_at?: string
          customer_id: string
          id?: string
          next_steps?: string | null
          user_email?: string | null
        }
        Update: {
          action_description?: string
          action_type?: string
          contact_person_contact?: string | null
          contact_person_name?: string | null
          contact_person_role?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          next_steps?: string | null
          user_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_action_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_action_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_customer_receivables"
            referencedColumns: ["customer_id"]
          },
        ]
      }
      customer_contracts: {
        Row: {
          contract_type: string | null
          created_at: string
          customer_id: string
          document_url: string | null
          end_date: string | null
          id: string
          notes: string | null
          sale_id: string | null
          signed_date: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["contract_status"] | null
          title: string
          updated_at: string
          value: number | null
        }
        Insert: {
          contract_type?: string | null
          created_at?: string
          customer_id: string
          document_url?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          sale_id?: string | null
          signed_date?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["contract_status"] | null
          title: string
          updated_at?: string
          value?: number | null
        }
        Update: {
          contract_type?: string | null
          created_at?: string
          customer_id?: string
          document_url?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          sale_id?: string | null
          signed_date?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["contract_status"] | null
          title?: string
          updated_at?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_contracts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_contracts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_customer_receivables"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "customer_contracts_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_documents: {
        Row: {
          created_at: string
          customer_id: string
          document_type: string
          file_url: string | null
          id: string
          notes: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          document_type?: string
          file_url?: string | null
          id?: string
          notes?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          document_type?: string
          file_url?: string | null
          id?: string
          notes?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_documents_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_documents_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_customer_receivables"
            referencedColumns: ["customer_id"]
          },
        ]
      }
      customer_invoices: {
        Row: {
          created_at: string
          created_by: string | null
          customer_id: string | null
          description: string | null
          due_date: string | null
          id: string
          invoice_date: string
          invoice_number: string
          invoice_seq: number
          invoice_year: number
          notes: string | null
          paid_amount: number
          quote_id: string | null
          site_id: string | null
          status: string
          subtotal: number
          total: number
          tranche_percentage: number | null
          tranche_scheme: string
          tranche_type: string | null
          updated_at: string
          vat_amount: number
          vat_rate: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number: string
          invoice_seq: number
          invoice_year?: number
          notes?: string | null
          paid_amount?: number
          quote_id?: string | null
          site_id?: string | null
          status?: string
          subtotal?: number
          total?: number
          tranche_percentage?: number | null
          tranche_scheme?: string
          tranche_type?: string | null
          updated_at?: string
          vat_amount?: number
          vat_rate?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          invoice_seq?: number
          invoice_year?: number
          notes?: string | null
          paid_amount?: number
          quote_id?: string | null
          site_id?: string | null
          status?: string
          subtotal?: number
          total?: number
          tranche_percentage?: number | null
          tranche_scheme?: string
          tranche_type?: string | null
          updated_at?: string
          vat_amount?: number
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "customer_invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_customer_receivables"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "customer_invoices_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_invoices_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "construction_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string
          method: string
          notes: string | null
          payment_date: string
          recorded_by: string | null
          reference: string | null
          tranche_type: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_id: string
          method?: string
          notes?: string | null
          payment_date?: string
          recorded_by?: string | null
          reference?: string | null
          tranche_type?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string
          method?: string
          notes?: string | null
          payment_date?: string
          recorded_by?: string | null
          reference?: string | null
          tranche_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "customer_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_reminders: {
        Row: {
          completed_date: string | null
          created_at: string
          customer_id: string
          description: string | null
          id: string
          is_completed: boolean | null
          reminder_date: string
          salesperson_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          completed_date?: string | null
          created_at?: string
          customer_id: string
          description?: string | null
          id?: string
          is_completed?: boolean | null
          reminder_date: string
          salesperson_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          completed_date?: string | null
          created_at?: string
          customer_id?: string
          description?: string | null
          id?: string
          is_completed?: boolean | null
          reminder_date?: string
          salesperson_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_reminders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_reminders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_customer_receivables"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "customer_reminders_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_visits: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          notes: string | null
          outcome: string | null
          salesperson_id: string | null
          updated_at: string
          visit_date: string
          visit_type: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          notes?: string | null
          outcome?: string | null
          salesperson_id?: string | null
          updated_at?: string
          visit_date?: string
          visit_type?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          notes?: string | null
          outcome?: string | null
          salesperson_id?: string | null
          updated_at?: string
          visit_date?: string
          visit_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_visits_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_visits_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_customer_receivables"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "customer_visits_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          assigned_salesperson_id: string | null
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
          region: string | null
          sdi_code: string | null
          status: Database["public"]["Enums"]["customer_status"] | null
          total_margin: number | null
          total_value: number | null
          updated_at: string
          vat_number: string | null
        }
        Insert: {
          address?: string | null
          assigned_salesperson_id?: string | null
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
          region?: string | null
          sdi_code?: string | null
          status?: Database["public"]["Enums"]["customer_status"] | null
          total_margin?: number | null
          total_value?: number | null
          updated_at?: string
          vat_number?: string | null
        }
        Update: {
          address?: string | null
          assigned_salesperson_id?: string | null
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
          region?: string | null
          sdi_code?: string | null
          status?: Database["public"]["Enums"]["customer_status"] | null
          total_margin?: number | null
          total_value?: number | null
          updated_at?: string
          vat_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_assigned_salesperson_id_fkey"
            columns: ["assigned_salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
      }
      fixed_costs: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["fixed_cost_category"]
          cost_date: string
          created_at: string
          description: string
          frequency: Database["public"]["Enums"]["cost_frequency"]
          id: string
          is_paid: boolean | null
          notes: string | null
          paid_date: string | null
          person_name: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          category: Database["public"]["Enums"]["fixed_cost_category"]
          cost_date?: string
          created_at?: string
          description: string
          frequency?: Database["public"]["Enums"]["cost_frequency"]
          id?: string
          is_paid?: boolean | null
          notes?: string | null
          paid_date?: string | null
          person_name?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["fixed_cost_category"]
          cost_date?: string
          created_at?: string
          description?: string
          frequency?: Database["public"]["Enums"]["cost_frequency"]
          id?: string
          is_paid?: boolean | null
          notes?: string | null
          paid_date?: string | null
          person_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          color: string | null
          created_at: string
          exit_price: number | null
          id: string
          is_paid: boolean | null
          low_stock_threshold: number | null
          movement_date: string
          movement_type: string
          notes: string | null
          product_type: string
          purchase_cost: number
          quantity_sqm: number
          sale_id_link: string | null
          supplier_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          exit_price?: number | null
          id?: string
          is_paid?: boolean | null
          low_stock_threshold?: number | null
          movement_date?: string
          movement_type?: string
          notes?: string | null
          product_type: string
          purchase_cost: number
          quantity_sqm: number
          sale_id_link?: string | null
          supplier_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          exit_price?: number | null
          id?: string
          is_paid?: boolean | null
          low_stock_threshold?: number | null
          movement_date?: string
          movement_type?: string
          notes?: string | null
          product_type?: string
          purchase_cost?: number
          quantity_sqm?: number
          sale_id_link?: string | null
          supplier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_sale_id_link_fkey"
            columns: ["sale_id_link"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_sales: {
        Row: {
          created_at: string
          id: string
          invoice_id: string
          sale_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_id: string
          sale_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invoice_id?: string
          sale_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_sales_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "commercial_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_sales_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_activities: {
        Row: {
          created_at: string
          description: string | null
          id: string
          lead_id: string
          metadata: Json | null
          occurred_at: string
          title: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          lead_id: string
          metadata?: Json | null
          occurred_at?: string
          title?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          lead_id?: string
          metadata?: Json | null
          occurred_at?: string
          title?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          lead_id: string
          mime_type: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          lead_id: string
          mime_type?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          lead_id?: string
          mime_type?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_attachments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_automations: {
        Row: {
          automation_type: string
          created_at: string
          executed_at: string | null
          id: string
          lead_id: string
          payload: Json | null
          scheduled_at: string
          status: string
        }
        Insert: {
          automation_type: string
          created_at?: string
          executed_at?: string | null
          id?: string
          lead_id: string
          payload?: Json | null
          scheduled_at: string
          status?: string
        }
        Update: {
          automation_type?: string
          created_at?: string
          executed_at?: string | null
          id?: string
          lead_id?: string
          payload?: Json | null
          scheduled_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_automations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address: string | null
          archived_at: string | null
          assigned_salesperson_id: string | null
          assigned_user_id: string | null
          budget_range: string | null
          city: string | null
          code: string | null
          company_name: string | null
          contact_person_email: string | null
          contact_person_name: string | null
          contact_person_phone: string | null
          contact_person_role: string | null
          contact_type: string | null
          country: string | null
          created_at: string
          created_by_user_id: string | null
          deleted_at: string | null
          email: string | null
          first_name: string | null
          has_thermal_insulation: boolean | null
          id: string
          ip_address: string | null
          language: string | null
          last_interaction_at: string | null
          last_name: string | null
          latitude: number | null
          lead_type: string | null
          linkedin_url: string | null
          longitude: number | null
          message: string | null
          name: string
          notes: string | null
          phone: string | null
          pipeline_stage: string
          postal_code: string | null
          preferred_contact_method: string | null
          profession: string | null
          project_name: string | null
          project_sqm: string | null
          project_type: string | null
          province: string | null
          qualification_score: number | null
          referrer_id: string | null
          region: string | null
          site_address: string | null
          site_city: string | null
          site_country: string | null
          site_postal_code: string | null
          site_province: string | null
          source: string | null
          status: string
          updated_at: string
          vat_number: string | null
          visited_showroom: boolean | null
          website: string | null
        }
        Insert: {
          address?: string | null
          archived_at?: string | null
          assigned_salesperson_id?: string | null
          assigned_user_id?: string | null
          budget_range?: string | null
          city?: string | null
          code?: string | null
          company_name?: string | null
          contact_person_email?: string | null
          contact_person_name?: string | null
          contact_person_phone?: string | null
          contact_person_role?: string | null
          contact_type?: string | null
          country?: string | null
          created_at?: string
          created_by_user_id?: string | null
          deleted_at?: string | null
          email?: string | null
          first_name?: string | null
          has_thermal_insulation?: boolean | null
          id?: string
          ip_address?: string | null
          language?: string | null
          last_interaction_at?: string | null
          last_name?: string | null
          latitude?: number | null
          lead_type?: string | null
          linkedin_url?: string | null
          longitude?: number | null
          message?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          pipeline_stage?: string
          postal_code?: string | null
          preferred_contact_method?: string | null
          profession?: string | null
          project_name?: string | null
          project_sqm?: string | null
          project_type?: string | null
          province?: string | null
          qualification_score?: number | null
          referrer_id?: string | null
          region?: string | null
          site_address?: string | null
          site_city?: string | null
          site_country?: string | null
          site_postal_code?: string | null
          site_province?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          vat_number?: string | null
          visited_showroom?: boolean | null
          website?: string | null
        }
        Update: {
          address?: string | null
          archived_at?: string | null
          assigned_salesperson_id?: string | null
          assigned_user_id?: string | null
          budget_range?: string | null
          city?: string | null
          code?: string | null
          company_name?: string | null
          contact_person_email?: string | null
          contact_person_name?: string | null
          contact_person_phone?: string | null
          contact_person_role?: string | null
          contact_type?: string | null
          country?: string | null
          created_at?: string
          created_by_user_id?: string | null
          deleted_at?: string | null
          email?: string | null
          first_name?: string | null
          has_thermal_insulation?: boolean | null
          id?: string
          ip_address?: string | null
          language?: string | null
          last_interaction_at?: string | null
          last_name?: string | null
          latitude?: number | null
          lead_type?: string | null
          linkedin_url?: string | null
          longitude?: number | null
          message?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          pipeline_stage?: string
          postal_code?: string | null
          preferred_contact_method?: string | null
          profession?: string | null
          project_name?: string | null
          project_sqm?: string | null
          project_type?: string | null
          province?: string | null
          qualification_score?: number | null
          referrer_id?: string | null
          region?: string | null
          site_address?: string | null
          site_city?: string | null
          site_country?: string | null
          site_postal_code?: string | null
          site_province?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          vat_number?: string | null
          visited_showroom?: boolean | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_salesperson_id_fkey"
            columns: ["assigned_salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_targets: {
        Row: {
          created_at: string
          id: string
          month: number
          target_eur: number
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          month: number
          target_eur?: number
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          month?: number
          target_eur?: number
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          entity_id: string | null
          id: string
          link: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          entity_id?: string | null
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          entity_id?: string | null
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
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
      preventivi: {
        Row: {
          cantiere: string | null
          cliente_nome: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          data: string
          id: string
          importo_totale: number
          json_dati: Json
          lead_id: string | null
          lingua: string
          numero_preventivo: string
          stato: string
          updated_at: string
        }
        Insert: {
          cantiere?: string | null
          cliente_nome?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          data?: string
          id?: string
          importo_totale?: number
          json_dati?: Json
          lead_id?: string | null
          lingua?: string
          numero_preventivo: string
          stato?: string
          updated_at?: string
        }
        Update: {
          cantiere?: string | null
          cliente_nome?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          data?: string
          id?: string
          importo_totale?: number
          json_dati?: Json
          lead_id?: string | null
          lingua?: string
          numero_preventivo?: string
          stato?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "preventivi_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preventivi_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_customer_receivables"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "preventivi_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_rules: {
        Row: {
          created_at: string
          id: string
          max_discount_pct: number
          min_margin_pct: number
          requires_approval_above_discount: number | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_discount_pct: number
          min_margin_pct: number
          requires_approval_above_discount?: number | null
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          max_discount_pct?: number
          min_margin_pct?: number
          requires_approval_above_discount?: number | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          macro_category:
            | Database["public"]["Enums"]["catalog_macro_category"]
            | null
          name: string
          parent_id: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          macro_category?:
            | Database["public"]["Enums"]["catalog_macro_category"]
            | null
          name: string
          parent_id?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          macro_category?:
            | Database["public"]["Enums"]["catalog_macro_category"]
            | null
          name?: string
          parent_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string
          product_slug: string
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          product_slug: string
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          product_slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_suppliers: {
        Row: {
          contact_person: string | null
          country: string | null
          created_at: string
          default_discount_percentage: number | null
          email: string | null
          id: string
          is_active: boolean | null
          lead_time_days: number | null
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          contact_person?: string | null
          country?: string | null
          created_at?: string
          default_discount_percentage?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          lead_time_days?: number | null
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          contact_person?: string | null
          country?: string | null
          created_at?: string
          default_discount_percentage?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          lead_time_days?: number | null
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          accepted_date: string | null
          additional_costs: Json | null
          assigned_to: string | null
          client_name: string | null
          converted_sale_id: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          delivery_time: string | null
          id: string
          items: Json | null
          lead_id: string | null
          notes: string | null
          payment_terms_text: string | null
          payment_type: string | null
          project_name: string | null
          quote_data: Json | null
          quote_number: string | null
          sent_date: string | null
          site_address: string | null
          site_city: string | null
          site_country: string | null
          site_id: string | null
          site_postal_code: string | null
          site_province: string | null
          status: string
          subject: string | null
          tipologia: string | null
          total_amount: number
          transport_method: string | null
          updated_at: string
          valid_until: string | null
          vat_amount: number | null
          vat_included: boolean | null
          vat_rate: number | null
        }
        Insert: {
          accepted_date?: string | null
          additional_costs?: Json | null
          assigned_to?: string | null
          client_name?: string | null
          converted_sale_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          delivery_time?: string | null
          id?: string
          items?: Json | null
          lead_id?: string | null
          notes?: string | null
          payment_terms_text?: string | null
          payment_type?: string | null
          project_name?: string | null
          quote_data?: Json | null
          quote_number?: string | null
          sent_date?: string | null
          site_address?: string | null
          site_city?: string | null
          site_country?: string | null
          site_id?: string | null
          site_postal_code?: string | null
          site_province?: string | null
          status?: string
          subject?: string | null
          tipologia?: string | null
          total_amount?: number
          transport_method?: string | null
          updated_at?: string
          valid_until?: string | null
          vat_amount?: number | null
          vat_included?: boolean | null
          vat_rate?: number | null
        }
        Update: {
          accepted_date?: string | null
          additional_costs?: Json | null
          assigned_to?: string | null
          client_name?: string | null
          converted_sale_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          delivery_time?: string | null
          id?: string
          items?: Json | null
          lead_id?: string | null
          notes?: string | null
          payment_terms_text?: string | null
          payment_type?: string | null
          project_name?: string | null
          quote_data?: Json | null
          quote_number?: string | null
          sent_date?: string | null
          site_address?: string | null
          site_city?: string | null
          site_country?: string | null
          site_id?: string | null
          site_postal_code?: string | null
          site_province?: string | null
          status?: string
          subject?: string | null
          tipologia?: string | null
          total_amount?: number
          transport_method?: string | null
          updated_at?: string
          valid_until?: string | null
          vat_amount?: number | null
          vat_included?: boolean | null
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_converted_sale_id_fkey"
            columns: ["converted_sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_customer_receivables"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "quotes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "construction_sites"
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
      sale_salespeople: {
        Row: {
          commission_amount: number | null
          commission_percentage: number
          created_at: string
          id: string
          sale_id: string
          salesperson_id: string
        }
        Insert: {
          commission_amount?: number | null
          commission_percentage?: number
          created_at?: string
          id?: string
          sale_id: string
          salesperson_id: string
        }
        Update: {
          commission_amount?: number | null
          commission_percentage?: number
          created_at?: string
          id?: string
          sale_id?: string
          salesperson_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_salespeople_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_salespeople_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
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
          is_paid: boolean | null
          margin_amount: number | null
          margin_percentage: number | null
          notes: string | null
          paid_date: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_notes: string | null
          payment_terms: string | null
          product_type: string
          quantity_sqm: number
          sale_date: string
          sale_price: number
          subtotal_amount: number
          total_amount: number
          vat_amount: number | null
          vat_included: boolean
          vat_rate: number
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
          is_paid?: boolean | null
          margin_amount?: number | null
          margin_percentage?: number | null
          notes?: string | null
          paid_date?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_notes?: string | null
          payment_terms?: string | null
          product_type: string
          quantity_sqm: number
          sale_date?: string
          sale_price: number
          subtotal_amount?: number
          total_amount?: number
          vat_amount?: number | null
          vat_included?: boolean
          vat_rate?: number
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
          is_paid?: boolean | null
          margin_amount?: number | null
          margin_percentage?: number | null
          notes?: string | null
          paid_date?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_notes?: string | null
          payment_terms?: string | null
          product_type?: string
          quantity_sqm?: number
          sale_date?: string
          sale_price?: number
          subtotal_amount?: number
          total_amount?: number
          vat_amount?: number | null
          vat_included?: boolean
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_customer_receivables"
            referencedColumns: ["customer_id"]
          },
        ]
      }
      salespeople: {
        Row: {
          commission_rate: number | null
          created_at: string
          email: string | null
          first_name: string
          id: string
          is_active: boolean | null
          is_commission_earner: boolean
          last_name: string
          notes: string | null
          phone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          is_active?: boolean | null
          is_commission_earner?: boolean
          last_name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          commission_rate?: number | null
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          is_active?: boolean | null
          is_commission_earner?: boolean
          last_name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      salesperson_territories: {
        Row: {
          created_at: string
          id: string
          salesperson_id: string
          territory_type: string
          territory_value: string
        }
        Insert: {
          created_at?: string
          id?: string
          salesperson_id: string
          territory_type: string
          territory_value: string
        }
        Update: {
          created_at?: string
          id?: string
          salesperson_id?: string
          territory_type?: string
          territory_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "salesperson_territories_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
      }
      site_accessories: {
        Row: {
          catalog_product_id: string | null
          created_at: string
          id: string
          notes: string | null
          product_name: string | null
          quantity: number | null
          site_id: string
          type: string
          unit: string | null
        }
        Insert: {
          catalog_product_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          product_name?: string | null
          quantity?: number | null
          site_id: string
          type: string
          unit?: string | null
        }
        Update: {
          catalog_product_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          product_name?: string | null
          quantity?: number | null
          site_id?: string
          type?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_accessories_catalog_product_id_fkey"
            columns: ["catalog_product_id"]
            isOneToOne: false
            referencedRelation: "catalog_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_accessories_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "construction_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      site_attachments: {
        Row: {
          category: string | null
          created_at: string
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          site_id: string
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          site_id: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          site_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_attachments_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "construction_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      site_chat_messages: {
        Row: {
          attachment_url: string | null
          created_at: string
          id: string
          message: string
          site_id: string
          user_id: string
          user_name: string | null
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          id?: string
          message: string
          site_id: string
          user_id: string
          user_name?: string | null
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          id?: string
          message?: string
          site_id?: string
          user_id?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_chat_messages_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "construction_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      site_checklist_items: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string
          id: string
          label: string
          site_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          label: string
          site_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          label?: string
          site_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_checklist_items_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "construction_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      site_equipment: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          site_id: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          site_id: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          site_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_equipment_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "construction_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      site_expenses: {
        Row: {
          added_by: string | null
          amount: number
          created_at: string
          description: string
          expense_date: string | null
          expense_type: string
          id: string
          is_paid: boolean | null
          notes: string | null
          paid_date: string | null
          receipt_url: string | null
          site_id: string
          updated_at: string
        }
        Insert: {
          added_by?: string | null
          amount?: number
          created_at?: string
          description: string
          expense_date?: string | null
          expense_type?: string
          id?: string
          is_paid?: boolean | null
          notes?: string | null
          paid_date?: string | null
          receipt_url?: string | null
          site_id: string
          updated_at?: string
        }
        Update: {
          added_by?: string | null
          amount?: number
          created_at?: string
          description?: string
          expense_date?: string | null
          expense_type?: string
          id?: string
          is_paid?: boolean | null
          notes?: string | null
          paid_date?: string | null
          receipt_url?: string | null
          site_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_expenses_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "construction_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      site_issues: {
        Row: {
          created_at: string
          description: string | null
          id: string
          issue_type: string
          photo_url: string
          reported_by: string
          reporter_name: string | null
          resolved_at: string | null
          resolved_by: string | null
          site_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          issue_type: string
          photo_url: string
          reported_by: string
          reporter_name?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          site_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          issue_type?: string
          photo_url?: string
          reported_by?: string
          reporter_name?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          site_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_issues_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "construction_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      site_materials: {
        Row: {
          added_by: string | null
          created_at: string
          id: string
          material_name: string
          notes: string | null
          quantity: number
          site_id: string
          total_cost: number | null
          unit: string | null
          unit_cost: number | null
          usage_date: string | null
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          id?: string
          material_name: string
          notes?: string | null
          quantity?: number
          site_id: string
          total_cost?: number | null
          unit?: string | null
          unit_cost?: number | null
          usage_date?: string | null
        }
        Update: {
          added_by?: string | null
          created_at?: string
          id?: string
          material_name?: string
          notes?: string | null
          quantity?: number
          site_id?: string
          total_cost?: number | null
          unit?: string | null
          unit_cost?: number | null
          usage_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_materials_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "construction_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      site_media: {
        Row: {
          created_at: string
          description: string | null
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          site_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string
          file_url: string
          id?: string
          site_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_media_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "construction_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      site_work_logs: {
        Row: {
          break_minutes: number
          created_at: string
          end_distance_m: number | null
          end_latitude: number | null
          end_longitude: number | null
          end_time: string | null
          hourly_cost: number | null
          hours_worked: number
          id: string
          materials_used: string[] | null
          notes: string | null
          site_id: string
          start_distance_m: number | null
          start_latitude: number | null
          start_longitude: number | null
          start_time: string | null
          updated_at: string
          work_date: string
          worker_id: string | null
          worker_user_id: string | null
        }
        Insert: {
          break_minutes?: number
          created_at?: string
          end_distance_m?: number | null
          end_latitude?: number | null
          end_longitude?: number | null
          end_time?: string | null
          hourly_cost?: number | null
          hours_worked?: number
          id?: string
          materials_used?: string[] | null
          notes?: string | null
          site_id: string
          start_distance_m?: number | null
          start_latitude?: number | null
          start_longitude?: number | null
          start_time?: string | null
          updated_at?: string
          work_date?: string
          worker_id?: string | null
          worker_user_id?: string | null
        }
        Update: {
          break_minutes?: number
          created_at?: string
          end_distance_m?: number | null
          end_latitude?: number | null
          end_longitude?: number | null
          end_time?: string | null
          hourly_cost?: number | null
          hours_worked?: number
          id?: string
          materials_used?: string[] | null
          notes?: string | null
          site_id?: string
          start_distance_m?: number | null
          start_latitude?: number | null
          start_longitude?: number | null
          start_time?: string | null
          updated_at?: string
          work_date?: string
          worker_id?: string | null
          worker_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_work_logs_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "construction_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_work_logs_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      site_work_photos: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          work_log_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          work_log_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          work_log_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_work_photos_work_log_id_fkey"
            columns: ["work_log_id"]
            isOneToOne: false
            referencedRelation: "site_work_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      site_workers: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          site_id: string
          start_date: string | null
          updated_at: string
          worker_id: string | null
          worker_role: string | null
          worker_user_id: string | null
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          site_id: string
          start_date?: string | null
          updated_at?: string
          worker_id?: string | null
          worker_role?: string | null
          worker_user_id?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          site_id?: string
          start_date?: string | null
          updated_at?: string
          worker_id?: string | null
          worker_role?: string | null
          worker_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_workers_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "construction_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_workers_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
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
      stock_valuation: {
        Row: {
          created_at: string
          description: string
          id: string
          last_updated: string | null
          notes: string | null
          total_value: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          last_updated?: string | null
          notes?: string | null
          total_value?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          last_updated?: string | null
          notes?: string | null
          total_value?: number
          updated_at?: string
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
      suppliers: {
        Row: {
          address: string | null
          contact_person: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          vat_number: string | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          vat_number?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          vat_number?: string | null
        }
        Relationships: []
      }
      time_off_requests: {
        Row: {
          approved_by: string | null
          created_at: string
          decided_at: string | null
          decision_note: string | null
          end_date: string
          id: string
          kind: string
          note: string | null
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          decided_at?: string | null
          decision_note?: string | null
          end_date: string
          id?: string
          kind?: string
          note?: string | null
          start_date: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          decided_at?: string | null
          decision_note?: string | null
          end_date?: string
          id?: string
          kind?: string
          note?: string | null
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tool_settings: {
        Row: {
          created_at: string
          id: string
          settings: Json
          tool_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          settings?: Json
          tool_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          settings?: Json
          tool_key?: string
          updated_at?: string
          user_id?: string
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
      variable_costs: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["variable_cost_category"]
          cost_date: string
          created_at: string
          customer_id: string | null
          description: string
          frequency: Database["public"]["Enums"]["cost_frequency"]
          id: string
          is_paid: boolean | null
          notes: string | null
          paid_date: string | null
          sale_id: string | null
          salesperson_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          category: Database["public"]["Enums"]["variable_cost_category"]
          cost_date?: string
          created_at?: string
          customer_id?: string | null
          description: string
          frequency?: Database["public"]["Enums"]["cost_frequency"]
          id?: string
          is_paid?: boolean | null
          notes?: string | null
          paid_date?: string | null
          sale_id?: string | null
          salesperson_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["variable_cost_category"]
          cost_date?: string
          created_at?: string
          customer_id?: string | null
          description?: string
          frequency?: Database["public"]["Enums"]["cost_frequency"]
          id?: string
          is_paid?: boolean | null
          notes?: string | null
          paid_date?: string | null
          sale_id?: string | null
          salesperson_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "variable_costs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "variable_costs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_customer_receivables"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "variable_costs_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "variable_costs_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
      }
      wc_accessories: {
        Row: {
          active: boolean
          category: string
          code: string | null
          compatible_collections: string[] | null
          created_at: string
          description: string | null
          id: string
          list_price: number
          name: string
          sort_order: number
          supplier_discount_pct: number
          unit: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category: string
          code?: string | null
          compatible_collections?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          list_price?: number
          name: string
          sort_order?: number
          supplier_discount_pct?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          code?: string | null
          compatible_collections?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          list_price?: number
          name?: string
          sort_order?: number
          supplier_discount_pct?: number
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      wc_collections: {
        Row: {
          active: boolean
          code: string
          created_at: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      wc_essences: {
        Row: {
          active: boolean
          code: string
          created_at: string
          id: string
          name: string
          sort_order: number
          surface_treatment: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          surface_treatment?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          surface_treatment?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      wc_finishes: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      wc_formats: {
        Row: {
          active: boolean
          code: string
          created_at: string
          dimensions: string | null
          id: string
          name: string
          sort_order: number
          thickness_mm: number | null
          top_layer_mm: number | null
          unit: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          dimensions?: string | null
          id?: string
          name: string
          sort_order?: number
          thickness_mm?: number | null
          top_layer_mm?: number | null
          unit?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          dimensions?: string | null
          id?: string
          name?: string
          sort_order?: number
          thickness_mm?: number | null
          top_layer_mm?: number | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      wc_prices: {
        Row: {
          collection_id: string
          created_at: string
          essence_id: string
          finish_id: string
          format_id: string
          id: string
          list_price: number
          notes: string | null
          supplier_discount_pct: number
          updated_at: string
        }
        Insert: {
          collection_id: string
          created_at?: string
          essence_id: string
          finish_id: string
          format_id: string
          id?: string
          list_price: number
          notes?: string | null
          supplier_discount_pct?: number
          updated_at?: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          essence_id?: string
          finish_id?: string
          format_id?: string
          id?: string
          list_price?: number
          notes?: string | null
          supplier_discount_pct?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wc_prices_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "wc_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wc_prices_essence_id_fkey"
            columns: ["essence_id"]
            isOneToOne: false
            referencedRelation: "wc_essences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wc_prices_finish_id_fkey"
            columns: ["finish_id"]
            isOneToOne: false
            referencedRelation: "wc_finishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wc_prices_format_id_fkey"
            columns: ["format_id"]
            isOneToOne: false
            referencedRelation: "wc_formats"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_documents: {
        Row: {
          created_at: string
          document_type: string
          file_url: string | null
          id: string
          notes: string | null
          title: string
          updated_at: string
          worker_id: string
        }
        Insert: {
          created_at?: string
          document_type?: string
          file_url?: string | null
          id?: string
          notes?: string | null
          title: string
          updated_at?: string
          worker_id: string
        }
        Update: {
          created_at?: string
          document_type?: string
          file_url?: string | null
          id?: string
          notes?: string | null
          title?: string
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_documents_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_time_entries: {
        Row: {
          accuracy_m: number | null
          created_at: string
          distance_from_site_m: number | null
          event_at: string
          event_date: string
          event_type: string
          id: string
          is_at_site: boolean | null
          latitude: number | null
          longitude: number | null
          notes: string | null
          site_id: string | null
          updated_at: string
          user_id: string
          worker_id: string | null
        }
        Insert: {
          accuracy_m?: number | null
          created_at?: string
          distance_from_site_m?: number | null
          event_at?: string
          event_date?: string
          event_type: string
          id?: string
          is_at_site?: boolean | null
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          site_id?: string | null
          updated_at?: string
          user_id: string
          worker_id?: string | null
        }
        Update: {
          accuracy_m?: number | null
          created_at?: string
          distance_from_site_m?: number | null
          event_at?: string
          event_date?: string
          event_type?: string
          id?: string
          is_at_site?: boolean | null
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          site_id?: string | null
          updated_at?: string
          user_id?: string
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "worker_time_entries_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "construction_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_time_entries_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      workers: {
        Row: {
          created_at: string
          deleted_at: string | null
          email: string | null
          first_name: string
          fiscal_code: string | null
          hire_date: string | null
          hourly_cost: number
          id: string
          last_name: string
          notes: string | null
          phone: string | null
          photo_url: string | null
          role: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          first_name: string
          fiscal_code?: string | null
          hire_date?: string | null
          hourly_cost?: number
          id?: string
          last_name: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          role?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          first_name?: string
          fiscal_code?: string | null
          hire_date?: string | null
          hourly_cost?: number
          id?: string
          last_name?: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          role?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      v_customer_receivables: {
        Row: {
          customer_id: string | null
          customer_name: string | null
          da_incassare: number | null
          fatturato: number | null
          incassato: number | null
          scaduto: number | null
          venduto: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      submit_public_lead: {
        Args: {
          _city?: string
          _company_name?: string
          _country?: string
          _email: string
          _interest?: string
          _message?: string
          _name: string
          _phone?: string
          _province?: string
          _region?: string
          _source?: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "commerciale"
        | "operaio"
        | "ibrido"
      catalog_diff_type:
        | "new"
        | "updated"
        | "deleted"
        | "price_changed"
        | "unchanged"
      catalog_macro_category: "articoli" | "accessori" | "servizi"
      catalog_price_list_status: "draft" | "applied" | "archived"
      contract_status: "in_corso" | "completato" | "annullato"
      cost_frequency: "mensile" | "trimestrale" | "annuale" | "una_tantum"
      customer_status: "opportunity" | "signed" | "working"
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
      fixed_cost_category:
        | "stipendi"
        | "affitto_magazzino"
        | "utenze"
        | "software_saas"
        | "assicurazioni"
        | "spese_bancarie"
        | "altri_costi_fissi"
      invoice_status: "da_pagare" | "pagata" | "scaduta"
      payment_method: "carta_credito" | "bonifico" | "contanti" | "assegno"
      variable_cost_category:
        | "trasporti"
        | "logistica"
        | "campionature"
        | "marketing"
        | "spese_commerciali"
        | "altri"
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
      app_role: [
        "admin",
        "moderator",
        "user",
        "commerciale",
        "operaio",
        "ibrido",
      ],
      catalog_diff_type: [
        "new",
        "updated",
        "deleted",
        "price_changed",
        "unchanged",
      ],
      catalog_macro_category: ["articoli", "accessori", "servizi"],
      catalog_price_list_status: ["draft", "applied", "archived"],
      contract_status: ["in_corso", "completato", "annullato"],
      cost_frequency: ["mensile", "trimestrale", "annuale", "una_tantum"],
      customer_status: ["opportunity", "signed", "working"],
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
      fixed_cost_category: [
        "stipendi",
        "affitto_magazzino",
        "utenze",
        "software_saas",
        "assicurazioni",
        "spese_bancarie",
        "altri_costi_fissi",
      ],
      invoice_status: ["da_pagare", "pagata", "scaduta"],
      payment_method: ["carta_credito", "bonifico", "contanti", "assegno"],
      variable_cost_category: [
        "trasporti",
        "logistica",
        "campionature",
        "marketing",
        "spese_commerciali",
        "altri",
      ],
    },
  },
} as const
