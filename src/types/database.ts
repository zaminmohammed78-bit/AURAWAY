export type UserRole = 'student' | 'teacher';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  routine_visible_to_teacher: boolean;
  consistency_rate?: number;
  created_at?: string;
}

export interface RoutineItem {
  id: string;
  student_id: string;
  title: string;
  time_slot: string;
  category: string;
  status: 'PENDING' | 'COMPLETED' | 'MISSED';
  created_at?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  subject: string;
  due_date: string;
  instructions: string;
  assigned_to_student_id?: string | null;
  status: 'PENDING' | 'DONE' | 'REASON_SUBMITTED' | 'EXCUSED' | 'EXTENDED';
  extended_due_date?: string | null;
  created_at?: string;
  reason_submission?: ReasonSubmission | null;
}

export interface ReasonSubmission {
  id: string;
  task_id: string;
  student_id: string;
  submitted_by: 'STUDENT' | 'PARENT';
  reason_tag: string;
  note: string;
  created_at?: string;
}

export interface WellnessData {
  student_id: string;
  water_glasses: number;
  target_water_glasses: number;
  selected_mood: string;
  mood_notes: string;
}
