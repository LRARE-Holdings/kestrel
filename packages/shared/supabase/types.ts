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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          created_by: string | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          resource_id: string
          resource_type: string
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id: string
          resource_type: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string
          resource_type?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      base_rates: {
        Row: {
          created_at: string
          effective_date: string
          fetched_at: string
          id: string
          rate: number
          source_url: string
        }
        Insert: {
          created_at?: string
          effective_date: string
          fetched_at?: string
          id?: string
          rate: number
          source_url: string
        }
        Update: {
          created_at?: string
          effective_date?: string
          fetched_at?: string
          id?: string
          rate?: number
          source_url?: string
        }
        Relationships: []
      }
      dispute_mediator_requests: {
        Row: {
          created_at: string
          dispute_id: string
          id: string
          mediator_id: string | null
          request_message: string | null
          requested_by: string
          responded_at: string | null
          response_message: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dispute_id: string
          id?: string
          mediator_id?: string | null
          request_message?: string | null
          requested_by: string
          responded_at?: string | null
          response_message?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dispute_id?: string
          id?: string
          mediator_id?: string | null
          request_message?: string | null
          requested_by?: string
          responded_at?: string | null
          response_message?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispute_mediator_requests_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispute_mediator_requests_mediator_id_fkey"
            columns: ["mediator_id"]
            isOneToOne: false
            referencedRelation: "mediators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispute_mediator_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dispute_submissions: {
        Row: {
          content: string
          content_hash: string
          created_at: string | null
          dispute_id: string
          id: string
          metadata: Json | null
          submission_type: Database["public"]["Enums"]["submission_type"]
          submitted_by: string
        }
        Insert: {
          content: string
          content_hash: string
          created_at?: string | null
          dispute_id: string
          id?: string
          metadata?: Json | null
          submission_type: Database["public"]["Enums"]["submission_type"]
          submitted_by: string
        }
        Update: {
          content?: string
          content_hash?: string
          created_at?: string | null
          dispute_id?: string
          id?: string
          metadata?: Json | null
          submission_type?: Database["public"]["Enums"]["submission_type"]
          submitted_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispute_submissions_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispute_submissions_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          amount_disputed: number | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          deleted_at: string | null
          description: string | null
          dispute_type: Database["public"]["Enums"]["dispute_type"]
          escalated_at: string | null
          escalation_reason: string | null
          id: string
          includes_dispute_clause: boolean
          initiating_party_id: string
          reference_number: string
          resolution_summary: string | null
          resolved_at: string | null
          responding_party_email: string
          responding_party_id: string | null
          response_deadline: string | null
          status: Database["public"]["Enums"]["dispute_status"]
          subject: string
          updated_at: string | null
        }
        Insert: {
          amount_disputed?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          deleted_at?: string | null
          description?: string | null
          dispute_type: Database["public"]["Enums"]["dispute_type"]
          escalated_at?: string | null
          escalation_reason?: string | null
          id?: string
          includes_dispute_clause?: boolean
          initiating_party_id: string
          reference_number?: string
          resolution_summary?: string | null
          resolved_at?: string | null
          responding_party_email: string
          responding_party_id?: string | null
          response_deadline?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
          subject: string
          updated_at?: string | null
        }
        Update: {
          amount_disputed?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          deleted_at?: string | null
          description?: string | null
          dispute_type?: Database["public"]["Enums"]["dispute_type"]
          escalated_at?: string | null
          escalation_reason?: string | null
          id?: string
          includes_dispute_clause?: boolean
          initiating_party_id?: string
          reference_number?: string
          resolution_summary?: string | null
          resolved_at?: string | null
          responding_party_email?: string
          responding_party_id?: string | null
          response_deadline?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disputes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_initiating_party_id_fkey"
            columns: ["initiating_party_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_verifications: {
        Row: {
          created_at: string
          dispute_id: string | null
          email_type: string
          id: string
          recipient_email: string
          sent_at: string
          subject: string
          verification_code: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          dispute_id?: string | null
          email_type: string
          id?: string
          recipient_email: string
          sent_at?: string
          subject: string
          verification_code: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          dispute_id?: string | null
          email_type?: string
          id?: string
          recipient_email?: string
          sent_at?: string
          subject?: string
          verification_code?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_verifications_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_files: {
        Row: {
          created_at: string | null
          description: string | null
          dispute_id: string
          file_name: string
          file_size_bytes: number
          file_type: string
          id: string
          scan_status: string | null
          storage_path: string
          submission_id: string | null
          uploaded_by: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          dispute_id: string
          file_name: string
          file_size_bytes: number
          file_type: string
          id?: string
          scan_status?: string | null
          storage_path: string
          submission_id?: string | null
          uploaded_by: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          dispute_id?: string
          file_name?: string
          file_size_bytes?: number
          file_type?: string
          id?: string
          scan_status?: string | null
          storage_path?: string
          submission_id?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_files_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_files_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "dispute_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean
          flag_key: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          flag_key: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          flag_key?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      handshake_responses: {
        Row: {
          created_at: string
          handshake_id: string
          id: string
          message: string | null
          respondent_email: string
          respondent_name: string
          respondent_user_id: string | null
          response_type: string
          suggested_changes: Json | null
        }
        Insert: {
          created_at?: string
          handshake_id: string
          id?: string
          message?: string | null
          respondent_email: string
          respondent_name: string
          respondent_user_id?: string | null
          response_type: string
          suggested_changes?: Json | null
        }
        Update: {
          created_at?: string
          handshake_id?: string
          id?: string
          message?: string | null
          respondent_email?: string
          respondent_name?: string
          respondent_user_id?: string | null
          response_type?: string
          suggested_changes?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "handshake_responses_handshake_id_fkey"
            columns: ["handshake_id"]
            isOneToOne: false
            referencedRelation: "handshakes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handshake_responses_respondent_user_id_fkey"
            columns: ["respondent_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      handshake_terms: {
        Row: {
          amount: number | null
          created_at: string
          deadline: string | null
          description: string
          handshake_id: string
          id: string
          responsible_party: string
          sort_order: number
        }
        Insert: {
          amount?: number | null
          created_at?: string
          deadline?: string | null
          description: string
          handshake_id: string
          id?: string
          responsible_party: string
          sort_order?: number
        }
        Update: {
          amount?: number | null
          created_at?: string
          deadline?: string | null
          description?: string
          handshake_id?: string
          id?: string
          responsible_party?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "handshake_terms_handshake_id_fkey"
            columns: ["handshake_id"]
            isOneToOne: false
            referencedRelation: "handshakes"
            referencedColumns: ["id"]
          },
        ]
      }
      handshakes: {
        Row: {
          access_token: string
          confirmed_at: string | null
          created_at: string
          declined_at: string | null
          description: string | null
          expires_at: string | null
          id: string
          includes_dispute_clause: boolean
          party_a_business: string
          party_a_email: string
          party_a_name: string
          party_a_user_id: string | null
          party_b_business: string
          party_b_email: string
          party_b_name: string
          party_b_user_id: string | null
          status: Database["public"]["Enums"]["handshake_status"]
          title: string
          updated_at: string
        }
        Insert: {
          access_token?: string
          confirmed_at?: string | null
          created_at?: string
          declined_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          includes_dispute_clause?: boolean
          party_a_business: string
          party_a_email: string
          party_a_name: string
          party_a_user_id?: string | null
          party_b_business: string
          party_b_email: string
          party_b_name: string
          party_b_user_id?: string | null
          status?: Database["public"]["Enums"]["handshake_status"]
          title: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          confirmed_at?: string | null
          created_at?: string
          declined_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          includes_dispute_clause?: boolean
          party_a_business?: string
          party_a_email?: string
          party_a_name?: string
          party_a_user_id?: string | null
          party_b_business?: string
          party_b_email?: string
          party_b_name?: string
          party_b_user_id?: string | null
          status?: Database["public"]["Enums"]["handshake_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "handshakes_party_a_user_id_fkey"
            columns: ["party_a_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handshakes_party_b_user_id_fkey"
            columns: ["party_b_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_interactions: {
        Row: {
          content: string
          created_at: string
          created_by: string
          id: string
          lead_id: string
          type: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          id?: string
          lead_id: string
          type: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          lead_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_interactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          company: string | null
          created_at: string
          created_by: string
          email: string | null
          id: string
          name: string
          next_action_date: string | null
          notes: string | null
          phone: string | null
          source: string | null
          stage: string
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string
          created_by: string
          email?: string | null
          id?: string
          name: string
          next_action_date?: string | null
          notes?: string | null
          phone?: string | null
          source?: string | null
          stage?: string
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string
          created_by?: string
          email?: string | null
          id?: string
          name?: string
          next_action_date?: string | null
          notes?: string | null
          phone?: string | null
          source?: string | null
          stage?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      mediator_specialisations: {
        Row: {
          created_at: string
          id: string
          mediator_id: string
          specialisation: string
        }
        Insert: {
          created_at?: string
          id?: string
          mediator_id: string
          specialisation: string
        }
        Update: {
          created_at?: string
          id?: string
          mediator_id?: string
          specialisation?: string
        }
        Relationships: [
          {
            foreignKeyName: "mediator_specialisations_mediator_id_fkey"
            columns: ["mediator_id"]
            isOneToOne: false
            referencedRelation: "mediators"
            referencedColumns: ["id"]
          },
        ]
      }
      mediators: {
        Row: {
          accreditation: string | null
          approved_at: string | null
          bio: string | null
          created_at: string
          display_name: string
          email: string
          hourly_rate_pence: number | null
          id: string
          is_active: boolean
          jurisdiction: string
          updated_at: string
          user_id: string | null
          years_experience: number | null
        }
        Insert: {
          accreditation?: string | null
          approved_at?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          email: string
          hourly_rate_pence?: number | null
          id?: string
          is_active?: boolean
          jurisdiction?: string
          updated_at?: string
          user_id?: string | null
          years_experience?: number | null
        }
        Update: {
          accreditation?: string | null
          approved_at?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          email?: string
          hourly_rate_pence?: number | null
          id?: string
          is_active?: boolean
          jurisdiction?: string
          updated_at?: string
          user_id?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mediators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          completed_at: string | null
          created_at: string
          deliverables: Json | null
          description: string | null
          disputed_at: string | null
          due_date: string
          id: string
          payment_amount: number | null
          project_id: string
          responsible_party: string
          sort_order: number
          status: Database["public"]["Enums"]["milestone_status"]
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          deliverables?: Json | null
          description?: string | null
          disputed_at?: string | null
          due_date: string
          id?: string
          payment_amount?: number | null
          project_id: string
          responsible_party: string
          sort_order?: number
          status?: Database["public"]["Enums"]["milestone_status"]
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          deliverables?: Json | null
          description?: string | null
          disputed_at?: string | null
          due_date?: string
          id?: string
          payment_amount?: number | null
          project_id?: string
          responsible_party?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["milestone_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notices: {
        Row: {
          access_token: string
          acknowledged_at: string | null
          consequences: string | null
          content: string
          created_at: string
          id: string
          includes_dispute_clause: boolean
          notice_type: Database["public"]["Enums"]["notice_type"]
          recipient_address: string
          recipient_business: string
          recipient_email: string
          recipient_name: string
          reference: string | null
          relevant_clause: string | null
          required_action: string | null
          response_deadline: string | null
          sender_address: string
          sender_business: string
          sender_email: string
          sender_name: string
          sender_user_id: string | null
          status: Database["public"]["Enums"]["notice_status"]
          subject: string
          updated_at: string
        }
        Insert: {
          access_token?: string
          acknowledged_at?: string | null
          consequences?: string | null
          content: string
          created_at?: string
          id?: string
          includes_dispute_clause?: boolean
          notice_type: Database["public"]["Enums"]["notice_type"]
          recipient_address: string
          recipient_business: string
          recipient_email: string
          recipient_name: string
          reference?: string | null
          relevant_clause?: string | null
          required_action?: string | null
          response_deadline?: string | null
          sender_address: string
          sender_business: string
          sender_email: string
          sender_name: string
          sender_user_id?: string | null
          status?: Database["public"]["Enums"]["notice_status"]
          subject: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          acknowledged_at?: string | null
          consequences?: string | null
          content?: string
          created_at?: string
          id?: string
          includes_dispute_clause?: boolean
          notice_type?: Database["public"]["Enums"]["notice_type"]
          recipient_address?: string
          recipient_business?: string
          recipient_email?: string
          recipient_name?: string
          reference?: string | null
          relevant_clause?: string | null
          required_action?: string | null
          response_deadline?: string | null
          sender_address?: string
          sender_business?: string
          sender_email?: string
          sender_name?: string
          sender_user_id?: string | null
          status?: Database["public"]["Enums"]["notice_status"]
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notices_sender_user_id_fkey"
            columns: ["sender_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          dispute_id: string | null
          email_sent: boolean | null
          email_sent_at: string | null
          id: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          dispute_id?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          id?: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          dispute_id?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          id?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_responses: {
        Row: {
          created_at: string
          estimated_disputes_per_year: string | null
          id: string
          primary_use_case: string | null
          profile_id: string
          referral_code: string | null
          referral_source: string | null
        }
        Insert: {
          created_at?: string
          estimated_disputes_per_year?: string | null
          id?: string
          primary_use_case?: string | null
          profile_id: string
          referral_code?: string | null
          referral_source?: string | null
        }
        Update: {
          created_at?: string
          estimated_disputes_per_year?: string | null
          id?: string
          primary_use_case?: string | null
          profile_id?: string
          referral_code?: string | null
          referral_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_responses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          business_name: string | null
          business_type: string | null
          company_size: string | null
          created_at: string | null
          deleted_at: string | null
          display_name: string
          email: string
          id: string
          industry: string | null
          notification_preferences: Json | null
          onboarding_completed: boolean | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          business_name?: string | null
          business_type?: string | null
          company_size?: string | null
          created_at?: string | null
          deleted_at?: string | null
          display_name: string
          email: string
          id: string
          industry?: string | null
          notification_preferences?: Json | null
          onboarding_completed?: boolean | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          business_name?: string | null
          business_type?: string | null
          company_size?: string | null
          created_at?: string | null
          deleted_at?: string | null
          display_name?: string
          email?: string
          id?: string
          industry?: string | null
          notification_preferences?: Json | null
          onboarding_completed?: boolean | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          access_token: string
          created_at: string
          description: string | null
          expected_end_date: string | null
          id: string
          includes_dispute_clause: boolean
          name: string
          party_a_business: string
          party_a_email: string
          party_a_name: string
          party_a_user_id: string | null
          party_b_business: string
          party_b_email: string
          party_b_name: string
          party_b_user_id: string | null
          start_date: string
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string
        }
        Insert: {
          access_token?: string
          created_at?: string
          description?: string | null
          expected_end_date?: string | null
          id?: string
          includes_dispute_clause?: boolean
          name: string
          party_a_business: string
          party_a_email: string
          party_a_name: string
          party_a_user_id?: string | null
          party_b_business: string
          party_b_email: string
          party_b_name: string
          party_b_user_id?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
        }
        Update: {
          access_token?: string
          created_at?: string
          description?: string | null
          expected_end_date?: string | null
          id?: string
          includes_dispute_clause?: boolean
          name?: string
          party_a_business?: string
          party_a_email?: string
          party_a_name?: string
          party_a_user_id?: string | null
          party_b_business?: string
          party_b_email?: string
          party_b_name?: string
          party_b_user_id?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_party_a_user_id_fkey"
            columns: ["party_a_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_party_b_user_id_fkey"
            columns: ["party_b_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_documents: {
        Row: {
          clause_versions: Json
          configuration: Json
          created_at: string | null
          deleted_at: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          id: string
          includes_dispute_clause: boolean
          storage_path: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          clause_versions: Json
          configuration: Json
          created_at?: string | null
          deleted_at?: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          id?: string
          includes_dispute_clause?: boolean
          storage_path?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          clause_versions?: Json
          configuration?: Json
          created_at?: string | null
          deleted_at?: string | null
          document_type?: Database["public"]["Enums"]["document_type"]
          id?: string
          includes_dispute_clause?: boolean
          storage_path?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
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
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      generate_dispute_reference: { Args: never; Returns: string }
    }
    Enums: {
      dispute_status:
        | "draft"
        | "filed"
        | "awaiting_response"
        | "in_progress"
        | "resolved"
        | "escalated"
        | "withdrawn"
        | "expired"
      dispute_type:
        | "payment"
        | "deliverables"
        | "service_quality"
        | "contract_interpretation"
        | "other"
      document_type:
        | "contract"
        | "terms_and_conditions"
        | "handshake"
        | "notice"
        | "milestone_tracker"
        | "late_payment_letter"
      handshake_status:
        | "draft"
        | "pending"
        | "confirmed"
        | "modified"
        | "declined"
        | "expired"
      milestone_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "disputed"
        | "overdue"
      notice_status: "draft" | "sent" | "acknowledged" | "disputed"
      notice_type:
        | "breach"
        | "termination"
        | "change_request"
        | "payment_demand"
        | "general"
      project_status: "active" | "completed" | "on_hold" | "disputed"
      submission_type:
        | "initial_claim"
        | "response"
        | "reply"
        | "evidence_summary"
        | "proposal"
        | "acceptance"
        | "rejection"
        | "withdrawal"
        | "escalation"
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
      dispute_status: [
        "draft",
        "filed",
        "awaiting_response",
        "in_progress",
        "resolved",
        "escalated",
        "withdrawn",
        "expired",
      ],
      dispute_type: [
        "payment",
        "deliverables",
        "service_quality",
        "contract_interpretation",
        "other",
      ],
      document_type: [
        "contract",
        "terms_and_conditions",
        "handshake",
        "notice",
        "milestone_tracker",
        "late_payment_letter",
      ],
      handshake_status: [
        "draft",
        "pending",
        "confirmed",
        "modified",
        "declined",
        "expired",
      ],
      milestone_status: [
        "pending",
        "in_progress",
        "completed",
        "disputed",
        "overdue",
      ],
      notice_status: ["draft", "sent", "acknowledged", "disputed"],
      notice_type: [
        "breach",
        "termination",
        "change_request",
        "payment_demand",
        "general",
      ],
      project_status: ["active", "completed", "on_hold", "disputed"],
      submission_type: [
        "initial_claim",
        "response",
        "reply",
        "evidence_summary",
        "proposal",
        "acceptance",
        "rejection",
        "withdrawal",
        "escalation",
      ],
    },
  },
} as const
