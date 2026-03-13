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
      leads: {
        Row: {
          assigned_salesperson_id: string | null
          city: string | null
          company_name: string | null
          created_at: string
          email: string
          id: string
          ip_address: string | null
          name: string
          notes: string | null
          phone: string
          province: string | null
          region: string | null
          source: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_salesperson_id?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
          name: string
          notes?: string | null
          phone: string
          province?: string | null
          region?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_salesperson_id?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          name?: string
          notes?: string | null
          phone?: string
          province?: string | null
          region?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_salesperson_id_fkey"
            columns: ["assigned_salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
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
      quotes: {
        Row: {
          accepted_date: string | null
          additional_costs: Json | null
          assigned_to: string | null
          converted_sale_id: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          delivery_time: string | null
          id: string
          items: Json | null
          notes: string | null
          payment_terms_text: string | null
          payment_type: string | null
          project_name: string | null
          quote_number: string | null
          sent_date: string | null
          site_address: string | null
          site_city: string | null
          site_country: string | null
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
          converted_sale_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          delivery_time?: string | null
          id?: string
          items?: Json | null
          notes?: string | null
          payment_terms_text?: string | null
          payment_type?: string | null
          project_name?: string | null
          quote_number?: string | null
          sent_date?: string | null
          site_address?: string | null
          site_city?: string | null
          site_country?: string | null
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
          converted_sale_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          delivery_time?: string | null
          id?: string
          items?: Json | null
          notes?: string | null
          payment_terms_text?: string | null
          payment_type?: string | null
          project_name?: string | null
          quote_number?: string | null
          sent_date?: string | null
          site_address?: string | null
          site_city?: string | null
          site_country?: string | null
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
      app_role: "admin" | "moderator" | "user" | "commerciale"
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
      app_role: ["admin", "moderator", "user", "commerciale"],
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
