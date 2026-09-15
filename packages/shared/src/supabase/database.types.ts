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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_notes: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          encounter_id: string
          id: string
          note_type: string | null
          referral_id: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          encounter_id: string
          id?: string
          note_type?: string | null
          referral_id?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          encounter_id?: string
          id?: string
          note_type?: string | null
          referral_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinical_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnoses: {
        Row: {
          confirmed_by: string | null
          created_at: string
          description: string
          encounter_id: string
          icd10_code: string | null
          id: string
        }
        Insert: {
          confirmed_by?: string | null
          created_at?: string
          description: string
          encounter_id: string
          icd10_code?: string | null
          id?: string
        }
        Update: {
          confirmed_by?: string | null
          created_at?: string
          description?: string
          encounter_id?: string
          icd10_code?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnoses_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnoses_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          created_at: string
          facility_id: string | null
          id: string
          profile_id: string
          specialization: string | null
        }
        Insert: {
          created_at?: string
          facility_id?: string | null
          id?: string
          profile_id: string
          specialization?: string | null
        }
        Update: {
          created_at?: string
          facility_id?: string | null
          id?: string
          profile_id?: string
          specialization?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctors_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      encounters: {
        Row: {
          closed_at: string | null
          encounter_type: string | null
          facility_id: string | null
          health_worker_id: string | null
          id: string
          notes: string | null
          patient_id: string
          started_at: string
          status: Database["public"]["Enums"]["encounter_status"]
        }
        Insert: {
          closed_at?: string | null
          encounter_type?: string | null
          facility_id?: string | null
          health_worker_id?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          started_at?: string
          status?: Database["public"]["Enums"]["encounter_status"]
        }
        Update: {
          closed_at?: string | null
          encounter_type?: string | null
          facility_id?: string | null
          health_worker_id?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["encounter_status"]
        }
        Relationships: [
          {
            foreignKeyName: "encounters_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encounters_health_worker_id_fkey"
            columns: ["health_worker_id"]
            isOneToOne: false
            referencedRelation: "health_workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encounters_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      facilities: {
        Row: {
          created_at: string
          district: string | null
          id: string
          name: string
          state: string | null
          type: string | null
          village: string | null
        }
        Insert: {
          created_at?: string
          district?: string | null
          id?: string
          name: string
          state?: string | null
          type?: string | null
          village?: string | null
        }
        Update: {
          created_at?: string
          district?: string | null
          id?: string
          name?: string
          state?: string | null
          type?: string | null
          village?: string | null
        }
        Relationships: []
      }
      health_workers: {
        Row: {
          created_at: string
          facility_id: string | null
          id: string
          profile_id: string
          worker_type: string | null
        }
        Insert: {
          created_at?: string
          facility_id?: string | null
          id?: string
          profile_id: string
          worker_type?: string | null
        }
        Update: {
          created_at?: string
          facility_id?: string | null
          id?: string
          profile_id?: string
          worker_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_workers_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_workers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_vitals: {
        Row: {
          bmi: number | null
          bp_diastolic: number | null
          bp_systolic: number | null
          encounter_id: string
          heart_rate: number | null
          height_cm: number | null
          id: string
          recorded_at: string
          respiratory_rate: number | null
          spo2: number | null
          temperature_c: number | null
          weight_kg: number | null
        }
        Insert: {
          bmi?: number | null
          bp_diastolic?: number | null
          bp_systolic?: number | null
          encounter_id: string
          heart_rate?: number | null
          height_cm?: number | null
          id?: string
          recorded_at?: string
          respiratory_rate?: number | null
          spo2?: number | null
          temperature_c?: number | null
          weight_kg?: number | null
        }
        Update: {
          bmi?: number | null
          bp_diastolic?: number | null
          bp_systolic?: number | null
          encounter_id?: string
          heart_rate?: number | null
          height_cm?: number | null
          id?: string
          recorded_at?: string
          respiratory_rate?: number | null
          spo2?: number | null
          temperature_c?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_vitals_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          age: number | null
          created_at: string
          created_by: string | null
          district: string | null
          emergency_contact: string | null
          full_name: string
          gender: string | null
          id: string
          phone: string | null
          pincode: string | null
          state: string | null
          updated_at: string
          village: string | null
        }
        Insert: {
          address?: string | null
          age?: number | null
          created_at?: string
          created_by?: string | null
          district?: string | null
          emergency_contact?: string | null
          full_name: string
          gender?: string | null
          id?: string
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
          village?: string | null
        }
        Update: {
          address?: string | null
          age?: number | null
          created_at?: string
          created_by?: string | null
          district?: string | null
          emergency_contact?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
          village?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      referral_events: {
        Row: {
          actor_id: string | null
          comment: string | null
          created_at: string
          from_status: Database["public"]["Enums"]["referral_status"] | null
          id: string
          referral_id: string
          to_status: Database["public"]["Enums"]["referral_status"]
        }
        Insert: {
          actor_id?: string | null
          comment?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["referral_status"] | null
          id?: string
          referral_id: string
          to_status: Database["public"]["Enums"]["referral_status"]
        }
        Update: {
          actor_id?: string | null
          comment?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["referral_status"] | null
          id?: string
          referral_id?: string
          to_status?: Database["public"]["Enums"]["referral_status"]
        }
        Relationships: [
          {
            foreignKeyName: "referral_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_events_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          created_by: string | null
          destination_facility_id: string | null
          encounter_id: string
          id: string
          patient_id: string
          reason: string | null
          source_facility_id: string | null
          status: Database["public"]["Enums"]["referral_status"]
          updated_at: string
          urgency: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          destination_facility_id?: string | null
          encounter_id: string
          id?: string
          patient_id: string
          reason?: string | null
          source_facility_id?: string | null
          status?: Database["public"]["Enums"]["referral_status"]
          updated_at?: string
          urgency?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          destination_facility_id?: string | null
          encounter_id?: string
          id?: string
          patient_id?: string
          reason?: string | null
          source_facility_id?: string | null
          status?: Database["public"]["Enums"]["referral_status"]
          updated_at?: string
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_destination_facility_id_fkey"
            columns: ["destination_facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_source_facility_id_fkey"
            columns: ["source_facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_records: {
        Row: {
          created_at: string
          device_id: string | null
          entity_id: string
          entity_type: string
          error: string | null
          id: string
          local_id: string | null
          payload: Json | null
          status: Database["public"]["Enums"]["sync_status"]
          synced_at: string | null
        }
        Insert: {
          created_at?: string
          device_id?: string | null
          entity_id: string
          entity_type: string
          error?: string | null
          id?: string
          local_id?: string | null
          payload?: Json | null
          status?: Database["public"]["Enums"]["sync_status"]
          synced_at?: string | null
        }
        Update: {
          created_at?: string
          device_id?: string | null
          entity_id?: string
          entity_type?: string
          error?: string | null
          id?: string
          local_id?: string | null
          payload?: Json | null
          status?: Database["public"]["Enums"]["sync_status"]
          synced_at?: string | null
        }
        Relationships: []
      }
      triage_assessments: {
        Row: {
          assessed_at: string
          assessed_by: string | null
          care_pathway: string | null
          encounter_id: string
          id: string
          reasoning: string | null
          risk_level: Database["public"]["Enums"]["risk_level"]
        }
        Insert: {
          assessed_at?: string
          assessed_by?: string | null
          care_pathway?: string | null
          encounter_id: string
          id?: string
          reasoning?: string | null
          risk_level: Database["public"]["Enums"]["risk_level"]
        }
        Update: {
          assessed_at?: string
          assessed_by?: string | null
          care_pathway?: string | null
          encounter_id?: string
          id?: string
          reasoning?: string | null
          risk_level?: Database["public"]["Enums"]["risk_level"]
        }
        Relationships: [
          {
            foreignKeyName: "triage_assessments_assessed_by_fkey"
            columns: ["assessed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "triage_assessments_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
        ]
      }
      triage_responses: {
        Row: {
          assessment_id: string
          id: string
          present: boolean
          severity: string | null
          symptom_code: string
        }
        Insert: {
          assessment_id: string
          id?: string
          present?: boolean
          severity?: string | null
          symptom_code: string
        }
        Update: {
          assessment_id?: string
          id?: string
          present?: boolean
          severity?: string | null
          symptom_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "triage_responses_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "triage_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      encounter_status: "OPEN" | "CLOSED" | "CANCELLED"
      referral_status:
        | "CREATED"
        | "ACCEPTED"
        | "IN_REVIEW"
        | "CONSULTATION"
        | "COMPLETED"
        | "REJECTED"
        | "CANCELLED"
        | "PENDING"
        | "REDIRECTED"
      risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
      sync_status: "PENDING" | "SYNCING" | "SYNCED" | "FAILED"
      user_role: "ADMIN" | "HEALTH_WORKER" | "DOCTOR"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      encounter_status: ["OPEN", "CLOSED", "CANCELLED"],
      referral_status: [
        "CREATED",
        "ACCEPTED",
        "IN_REVIEW",
        "CONSULTATION",
        "COMPLETED",
        "REJECTED",
        "CANCELLED",
        "PENDING",
        "REDIRECTED",
      ],
      risk_level: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      sync_status: ["PENDING", "SYNCING", "SYNCED", "FAILED"],
      user_role: ["ADMIN", "HEALTH_WORKER", "DOCTOR"],
    },
  },
} as const
