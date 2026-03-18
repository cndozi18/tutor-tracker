export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      tutees: {
        Row: {
          id: string;
          tutor_id: string;
          full_name: string;
          year_group: string | null;
          age: number | null;
          subjects: string[] | null;
          learning_style: string | null;
          parent_name: string | null;
          parent_email: string | null;
          parent_phone: string | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tutor_id: string;
          full_name: string;
          year_group?: string | null;
          age?: number | null;
          subjects?: string[] | null;
          learning_style?: string | null;
          parent_name?: string | null;
          parent_email?: string | null;
          parent_phone?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tutor_id?: string;
          full_name?: string;
          year_group?: string | null;
          age?: number | null;
          subjects?: string[] | null;
          learning_style?: string | null;
          parent_name?: string | null;
          parent_email?: string | null;
          parent_phone?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      topic_progress: {
        Row: {
          id: string;
          tutor_id: string;
          tutee_id: string;
          subject: string;
          topic: string;
          rag_status: 'red' | 'amber' | 'green';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tutor_id: string;
          tutee_id: string;
          subject: string;
          topic: string;
          rag_status?: 'red' | 'amber' | 'green';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tutor_id?: string;
          tutee_id?: string;
          subject?: string;
          topic?: string;
          rag_status?: 'red' | 'amber' | 'green';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          tutor_id: string;
          tutee_id: string;
          starts_at: string;
          duration_mins: number;
          subject: string | null;
          plan: string | null;
          notes: string | null;
          homework_set: string | null;
          status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tutor_id: string;
          tutee_id: string;
          starts_at: string;
          duration_mins?: number;
          subject?: string | null;
          plan?: string | null;
          notes?: string | null;
          homework_set?: string | null;
          status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tutor_id?: string;
          tutee_id?: string;
          starts_at?: string;
          duration_mins?: number;
          subject?: string | null;
          plan?: string | null;
          notes?: string | null;
          homework_set?: string | null;
          status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Tutee = Database['public']['Tables']['tutees']['Row'];
export type TopicProgress = Database['public']['Tables']['topic_progress']['Row'];
export type Lesson = Database['public']['Tables']['lessons']['Row'];
