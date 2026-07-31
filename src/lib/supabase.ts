import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase: SupabaseClient = hasSupabaseConfig
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : (null as unknown as SupabaseClient)

export type Role = 'admin' | 'member'

export type Profile = {
  id: string
  email: string
  full_name: string | null
  photo_url: string | null
  location: string | null
  role: Role
  onboarded: boolean
  created_at: string
}

export type ContentType = 'gd' | 'video' | 'post'

export type Content = {
  id: string
  user_id: string
  type: ContentType
  topic: string
  description: string | null
  file_url: string | null
  ai_generated: boolean
  linked_task_id: string | null
  created_at: string
}

export type TaskStatus = 'pending' | 'submitted' | 'ai_generated' | 'overdue'

export type Task = {
  id: string
  assigned_to: string
  assigned_by: string
  topic: string
  content_type: ContentType
  deadline: string
  status: TaskStatus
  linked_content_id: string | null
  created_at: string
}

export type Message = {
  id: string
  sender_id: string
  receiver_id: string
  text: string
  sent_at: string
  read: boolean
}

export type ScheduleEntry = {
  id: string
  member_id: string
  topic: string
  content_type: ContentType
  due_date: string
  month: string
  created_at: string
}

export type NotificationType = 'task_assigned' | 'task_reminder' | 'message' | 'ai_fallback'

export type Notification = {
  id: string
  user_id: string
  type: NotificationType
  message: string
  read: boolean
  created_at: string
}
