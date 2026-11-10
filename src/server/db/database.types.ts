/**
 * Types de la base de données — GÉNÉRÉS depuis le projet Supabase (ne pas modifier à la main).
 *
 * Régénérer après chaque migration :
 *   npx supabase gen types typescript --project-id <project-ref> > src/server/db/database.types.ts
 * (ou via le connecteur Supabase), puis réajouter les alias en fin de fichier.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      agent_runs: {
        Row: {
          agent_id: string;
          conversation_id: string | null;
          cost_usd: number | null;
          created_at: string;
          error: string | null;
          finished_at: string | null;
          id: string;
          input: string | null;
          input_tokens: number | null;
          output: string | null;
          output_tokens: number | null;
          parent_run_id: string | null;
          started_at: string | null;
          status: Database["public"]["Enums"]["agent_run_status"];
          user_id: string;
        };
        Insert: {
          agent_id: string;
          conversation_id?: string | null;
          cost_usd?: number | null;
          created_at?: string;
          error?: string | null;
          finished_at?: string | null;
          id?: string;
          input?: string | null;
          input_tokens?: number | null;
          output?: string | null;
          output_tokens?: number | null;
          parent_run_id?: string | null;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["agent_run_status"];
          user_id?: string;
        };
        Update: {
          agent_id?: string;
          conversation_id?: string | null;
          cost_usd?: number | null;
          created_at?: string;
          error?: string | null;
          finished_at?: string | null;
          id?: string;
          input?: string | null;
          input_tokens?: number | null;
          output?: string | null;
          output_tokens?: number | null;
          parent_run_id?: string | null;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["agent_run_status"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "agent_runs_agent_id_user_id_fkey";
            columns: ["agent_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "agent_runs_conversation_id_user_id_fkey";
            columns: ["conversation_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "agent_runs_parent_run_id_user_id_fkey";
            columns: ["parent_run_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "agent_runs";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      agent_tools: {
        Row: {
          agent_id: string;
          config: Json;
          created_at: string;
          id: string;
          requires_approval: boolean;
          tool_key: string;
          user_id: string;
        };
        Insert: {
          agent_id: string;
          config?: Json;
          created_at?: string;
          id?: string;
          requires_approval?: boolean;
          tool_key: string;
          user_id?: string;
        };
        Update: {
          agent_id?: string;
          config?: Json;
          created_at?: string;
          id?: string;
          requires_approval?: boolean;
          tool_key?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "agent_tools_agent_id_user_id_fkey";
            columns: ["agent_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      agents: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          instructions: string | null;
          is_active: boolean;
          is_master: boolean;
          limits: Json;
          memory_can_propose: boolean;
          memory_read_categories: Database["public"]["Enums"]["memory_category"][];
          mission: string | null;
          name: string;
          slug: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          instructions?: string | null;
          is_active?: boolean;
          is_master?: boolean;
          limits?: Json;
          memory_can_propose?: boolean;
          memory_read_categories?: Database["public"]["Enums"]["memory_category"][];
          mission?: string | null;
          name: string;
          slug: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          instructions?: string | null;
          is_active?: boolean;
          is_master?: boolean;
          limits?: Json;
          memory_can_propose?: boolean;
          memory_read_categories?: Database["public"]["Enums"]["memory_category"][];
          mission?: string | null;
          name?: string;
          slug?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          action: string;
          created_at: string;
          entity_id: string | null;
          entity_type: string | null;
          id: number;
          metadata: Json;
          user_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: never;
          metadata?: Json;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: never;
          metadata?: Json;
          user_id?: string | null;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          archived_at: string | null;
          created_at: string;
          id: string;
          last_message_at: string | null;
          pinned: boolean;
          project_id: string | null;
          title: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          archived_at?: string | null;
          created_at?: string;
          id?: string;
          last_message_at?: string | null;
          pinned?: boolean;
          project_id?: string | null;
          title?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          archived_at?: string | null;
          created_at?: string;
          id?: string;
          last_message_at?: string | null;
          pinned?: boolean;
          project_id?: string | null;
          title?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_project_id_user_id_fkey";
            columns: ["project_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      decisions: {
        Row: {
          context: string | null;
          created_at: string;
          decided_on: string;
          id: string;
          lessons: string | null;
          options: Json;
          outcome: string | null;
          project_id: string | null;
          reasons: string | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          context?: string | null;
          created_at?: string;
          decided_on?: string;
          id?: string;
          lessons?: string | null;
          options?: Json;
          outcome?: string | null;
          project_id?: string | null;
          reasons?: string | null;
          title: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          context?: string | null;
          created_at?: string;
          decided_on?: string;
          id?: string;
          lessons?: string | null;
          options?: Json;
          outcome?: string | null;
          project_id?: string | null;
          reasons?: string | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "decisions_project_id_user_id_fkey";
            columns: ["project_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      document_chunks: {
        Row: {
          chunk_index: number;
          content: string;
          created_at: string;
          document_id: string;
          embedding: string | null;
          embedding_model: string | null;
          fts: unknown;
          id: string;
          token_count: number | null;
          user_id: string;
        };
        Insert: {
          chunk_index: number;
          content: string;
          created_at?: string;
          document_id: string;
          embedding?: string | null;
          embedding_model?: string | null;
          fts?: unknown;
          id?: string;
          token_count?: number | null;
          user_id?: string;
        };
        Update: {
          chunk_index?: number;
          content?: string;
          created_at?: string;
          document_id?: string;
          embedding?: string | null;
          embedding_model?: string | null;
          fts?: unknown;
          id?: string;
          token_count?: number | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_user_id_fkey";
            columns: ["document_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      documents: {
        Row: {
          checksum_sha256: string | null;
          created_at: string;
          error: string | null;
          filename: string;
          id: string;
          mime_type: string;
          page_count: number | null;
          processed_at: string | null;
          project_id: string | null;
          size_bytes: number;
          status: Database["public"]["Enums"]["document_status"];
          storage_path: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          checksum_sha256?: string | null;
          created_at?: string;
          error?: string | null;
          filename: string;
          id?: string;
          mime_type: string;
          page_count?: number | null;
          processed_at?: string | null;
          project_id?: string | null;
          size_bytes: number;
          status?: Database["public"]["Enums"]["document_status"];
          storage_path: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          checksum_sha256?: string | null;
          created_at?: string;
          error?: string | null;
          filename?: string;
          id?: string;
          mime_type?: string;
          page_count?: number | null;
          processed_at?: string | null;
          project_id?: string | null;
          size_bytes?: number;
          status?: Database["public"]["Enums"]["document_status"];
          storage_path?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "documents_project_id_user_id_fkey";
            columns: ["project_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      goals: {
        Row: {
          created_at: string;
          description: string | null;
          horizon: Database["public"]["Enums"]["goal_horizon"];
          id: string;
          project_id: string | null;
          status: Database["public"]["Enums"]["goal_status"];
          target_date: string | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          horizon?: Database["public"]["Enums"]["goal_horizon"];
          id?: string;
          project_id?: string | null;
          status?: Database["public"]["Enums"]["goal_status"];
          target_date?: string | null;
          title: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          horizon?: Database["public"]["Enums"]["goal_horizon"];
          id?: string;
          project_id?: string | null;
          status?: Database["public"]["Enums"]["goal_status"];
          target_date?: string | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "goals_project_id_user_id_fkey";
            columns: ["project_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      memories: {
        Row: {
          category: Database["public"]["Enums"]["memory_category"];
          confidence: number | null;
          content: string;
          created_at: string;
          embedding: string | null;
          embedding_model: string | null;
          epistemic_status: Database["public"]["Enums"]["epistemic_status"];
          fts: unknown;
          id: string;
          merged_into: string | null;
          origin: Database["public"]["Enums"]["record_origin"];
          project_id: string | null;
          tags: string[];
          title: string | null;
          updated_at: string;
          user_id: string;
          valid_from: string | null;
          valid_until: string | null;
          validated_at: string | null;
          validation_status: Database["public"]["Enums"]["validation_status"];
        };
        Insert: {
          category: Database["public"]["Enums"]["memory_category"];
          confidence?: number | null;
          content: string;
          created_at?: string;
          embedding?: string | null;
          embedding_model?: string | null;
          epistemic_status: Database["public"]["Enums"]["epistemic_status"];
          fts?: unknown;
          id?: string;
          merged_into?: string | null;
          origin: Database["public"]["Enums"]["record_origin"];
          project_id?: string | null;
          tags?: string[];
          title?: string | null;
          updated_at?: string;
          user_id?: string;
          valid_from?: string | null;
          valid_until?: string | null;
          validated_at?: string | null;
          validation_status?: Database["public"]["Enums"]["validation_status"];
        };
        Update: {
          category?: Database["public"]["Enums"]["memory_category"];
          confidence?: number | null;
          content?: string;
          created_at?: string;
          embedding?: string | null;
          embedding_model?: string | null;
          epistemic_status?: Database["public"]["Enums"]["epistemic_status"];
          fts?: unknown;
          id?: string;
          merged_into?: string | null;
          origin?: Database["public"]["Enums"]["record_origin"];
          project_id?: string | null;
          tags?: string[];
          title?: string | null;
          updated_at?: string;
          user_id?: string;
          valid_from?: string | null;
          valid_until?: string | null;
          validated_at?: string | null;
          validation_status?: Database["public"]["Enums"]["validation_status"];
        };
        Relationships: [
          {
            foreignKeyName: "memories_merged_into_user_id_fkey";
            columns: ["merged_into", "user_id"];
            isOneToOne: false;
            referencedRelation: "memories";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "memories_project_id_user_id_fkey";
            columns: ["project_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      memory_revisions: {
        Row: {
          changed_at: string;
          changed_by: string | null;
          id: number;
          memory_id: string;
          previous_category: Database["public"]["Enums"]["memory_category"];
          previous_content: string;
          previous_epistemic_status: Database["public"]["Enums"]["epistemic_status"];
          previous_title: string | null;
          previous_validation_status: Database["public"]["Enums"]["validation_status"];
          user_id: string;
        };
        Insert: {
          changed_at?: string;
          changed_by?: string | null;
          id?: never;
          memory_id: string;
          previous_category: Database["public"]["Enums"]["memory_category"];
          previous_content: string;
          previous_epistemic_status: Database["public"]["Enums"]["epistemic_status"];
          previous_title?: string | null;
          previous_validation_status: Database["public"]["Enums"]["validation_status"];
          user_id: string;
        };
        Update: {
          changed_at?: string;
          changed_by?: string | null;
          id?: never;
          memory_id?: string;
          previous_category?: Database["public"]["Enums"]["memory_category"];
          previous_content?: string;
          previous_epistemic_status?: Database["public"]["Enums"]["epistemic_status"];
          previous_title?: string | null;
          previous_validation_status?: Database["public"]["Enums"]["validation_status"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "memory_revisions_memory_id_user_id_fkey";
            columns: ["memory_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "memories";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      memory_sources: {
        Row: {
          conversation_id: string | null;
          created_at: string;
          document_id: string | null;
          excerpt: string | null;
          id: string;
          memory_id: string;
          message_id: string | null;
          source_type: Database["public"]["Enums"]["memory_source_type"];
          url: string | null;
          user_id: string;
        };
        Insert: {
          conversation_id?: string | null;
          created_at?: string;
          document_id?: string | null;
          excerpt?: string | null;
          id?: string;
          memory_id: string;
          message_id?: string | null;
          source_type: Database["public"]["Enums"]["memory_source_type"];
          url?: string | null;
          user_id?: string;
        };
        Update: {
          conversation_id?: string | null;
          created_at?: string;
          document_id?: string | null;
          excerpt?: string | null;
          id?: string;
          memory_id?: string;
          message_id?: string | null;
          source_type?: Database["public"]["Enums"]["memory_source_type"];
          url?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "memory_sources_conversation_id_user_id_fkey";
            columns: ["conversation_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "memory_sources_document_id_user_id_fkey";
            columns: ["document_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "memory_sources_memory_id_user_id_fkey";
            columns: ["memory_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "memories";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "memory_sources_message_id_user_id_fkey";
            columns: ["message_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "messages";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      messages: {
        Row: {
          content: string;
          context: Json;
          conversation_id: string;
          created_at: string;
          fts: unknown;
          id: string;
          input_tokens: number | null;
          model: string | null;
          output_tokens: number | null;
          provider: string | null;
          role: Database["public"]["Enums"]["message_role"];
          user_id: string;
        };
        Insert: {
          content: string;
          context?: Json;
          conversation_id: string;
          created_at?: string;
          fts?: unknown;
          id?: string;
          input_tokens?: number | null;
          model?: string | null;
          output_tokens?: number | null;
          provider?: string | null;
          role: Database["public"]["Enums"]["message_role"];
          user_id?: string;
        };
        Update: {
          content?: string;
          context?: Json;
          conversation_id?: string;
          created_at?: string;
          fts?: unknown;
          id?: string;
          input_tokens?: number | null;
          model?: string | null;
          output_tokens?: number | null;
          provider?: string | null;
          role?: Database["public"]["Enums"]["message_role"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_user_id_fkey";
            columns: ["conversation_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_path: string | null;
          bio: string | null;
          created_at: string;
          display_name: string | null;
          full_name: string | null;
          headline: string | null;
          id: string;
          locale: string;
          onboarding_completed_at: string | null;
          role: Database["public"]["Enums"]["user_role"];
          timezone: string;
          updated_at: string;
        };
        Insert: {
          avatar_path?: string | null;
          bio?: string | null;
          created_at?: string;
          display_name?: string | null;
          full_name?: string | null;
          headline?: string | null;
          id: string;
          locale?: string;
          onboarding_completed_at?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          avatar_path?: string | null;
          bio?: string | null;
          created_at?: string;
          display_name?: string | null;
          full_name?: string | null;
          headline?: string | null;
          id?: string;
          locale?: string;
          onboarding_completed_at?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      project_tasks: {
        Row: {
          completed_at: string | null;
          created_at: string;
          due_on: string | null;
          id: string;
          notes: string | null;
          position: number;
          project_id: string;
          status: Database["public"]["Enums"]["task_status"];
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          due_on?: string | null;
          id?: string;
          notes?: string | null;
          position?: number;
          project_id: string;
          status?: Database["public"]["Enums"]["task_status"];
          title: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          due_on?: string | null;
          id?: string;
          notes?: string | null;
          position?: number;
          project_id?: string;
          status?: Database["public"]["Enums"]["task_status"];
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_tasks_project_id_user_id_fkey";
            columns: ["project_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      projects: {
        Row: {
          created_at: string;
          description: string | null;
          due_on: string | null;
          id: string;
          name: string;
          objectives: string | null;
          progress: number;
          started_on: string | null;
          status: Database["public"]["Enums"]["project_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          due_on?: string | null;
          id?: string;
          name: string;
          objectives?: string | null;
          progress?: number;
          started_on?: string | null;
          status?: Database["public"]["Enums"]["project_status"];
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          due_on?: string | null;
          id?: string;
          name?: string;
          objectives?: string | null;
          progress?: number;
          started_on?: string | null;
          status?: Database["public"]["Enums"]["project_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          agent_run_id: string | null;
          created_at: string;
          details: string | null;
          due_at: string | null;
          id: string;
          kind: Database["public"]["Enums"]["work_item_kind"];
          payload: Json;
          resolved_at: string | null;
          status: Database["public"]["Enums"]["work_item_status"];
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          agent_run_id?: string | null;
          created_at?: string;
          details?: string | null;
          due_at?: string | null;
          id?: string;
          kind?: Database["public"]["Enums"]["work_item_kind"];
          payload?: Json;
          resolved_at?: string | null;
          status?: Database["public"]["Enums"]["work_item_status"];
          title: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          agent_run_id?: string | null;
          created_at?: string;
          details?: string | null;
          due_at?: string | null;
          id?: string;
          kind?: Database["public"]["Enums"]["work_item_kind"];
          payload?: Json;
          resolved_at?: string | null;
          status?: Database["public"]["Enums"]["work_item_status"];
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_agent_run_id_user_id_fkey";
            columns: ["agent_run_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "agent_runs";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      usage_events: {
        Row: {
          cost_usd: number;
          created_at: string;
          id: number;
          input_tokens: number;
          latency_ms: number | null;
          model: string;
          operation: string;
          output_tokens: number;
          provider: string;
          user_id: string;
        };
        Insert: {
          cost_usd?: number;
          created_at?: string;
          id?: never;
          input_tokens?: number;
          latency_ms?: number | null;
          model: string;
          operation: string;
          output_tokens?: number;
          provider: string;
          user_id: string;
        };
        Update: {
          cost_usd?: number;
          created_at?: string;
          id?: never;
          input_tokens?: number;
          latency_ms?: number | null;
          model?: string;
          operation?: string;
          output_tokens?: number;
          provider?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          ai_model: string | null;
          ai_provider: string | null;
          created_at: string;
          memory_capture: Database["public"]["Enums"]["memory_capture_mode"];
          monthly_token_limit: number | null;
          plan: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          ai_model?: string | null;
          ai_provider?: string | null;
          created_at?: string;
          memory_capture?: Database["public"]["Enums"]["memory_capture_mode"];
          monthly_token_limit?: number | null;
          plan?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          ai_model?: string | null;
          ai_provider?: string | null;
          created_at?: string;
          memory_capture?: Database["public"]["Enums"]["memory_capture_mode"];
          monthly_token_limit?: number | null;
          plan?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      record_audit_event: {
        Args: {
          p_action: string;
          p_entity_id?: string;
          p_entity_type?: string;
          p_metadata?: Json;
        };
        Returns: undefined;
      };
      record_usage_event: {
        Args: {
          p_cost_usd?: number;
          p_input_tokens: number;
          p_latency_ms?: number;
          p_model: string;
          p_operation: string;
          p_output_tokens: number;
          p_provider: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      agent_run_status: "queued" | "running" | "awaiting_approval" | "succeeded" | "failed" | "cancelled";
      document_status: "uploaded" | "processing" | "ready" | "failed";
      epistemic_status: "confirmed_fact" | "user_statement" | "opinion" | "hypothesis" | "ai_inference" | "uncertain";
      goal_horizon: "short" | "medium" | "long";
      goal_status: "active" | "achieved" | "abandoned";
      memory_capture_mode: "off" | "suggest";
      memory_category: "episodic" | "semantic" | "procedural" | "prospective";
      memory_source_type: "message" | "conversation" | "document" | "web" | "manual";
      message_role: "user" | "assistant" | "system" | "tool";
      project_status: "idea" | "active" | "paused" | "completed" | "archived";
      record_origin: "user" | "system";
      task_status: "todo" | "in_progress" | "done" | "cancelled";
      user_role: "user" | "admin";
      validation_status: "pending" | "validated" | "corrected" | "rejected";
      work_item_kind: "todo" | "approval";
      work_item_status: "open" | "approved" | "rejected" | "done" | "cancelled";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// ── Alias pratiques (non générés) ─────────────────────────────────────────────
type PublicTables = Database["public"]["Tables"];
export type TableRow<T extends keyof PublicTables> = PublicTables[T]["Row"];

export type ProfileRow = TableRow<"profiles">;
export type ConversationRow = TableRow<"conversations">;
export type MessageRow = TableRow<"messages">;
