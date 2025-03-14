
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          priority: 'low' | 'medium' | 'high'
          due_date: string
          completed: boolean
          tags: string[] | null
          recurring: Json | null
          created_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          priority: 'low' | 'medium' | 'high'
          due_date: string
          completed?: boolean
          tags?: string[] | null
          recurring?: Json | null
          created_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          priority?: 'low' | 'medium' | 'high'
          due_date?: string
          completed?: boolean
          tags?: string[] | null
          recurring?: Json | null
          created_at?: string
          user_id?: string | null
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
  }
}
