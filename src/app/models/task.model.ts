export interface Task {
  id?: string;
  user_id?: string;
  title: string;
  description: string;
  due_date: string;
  priority: 'alta' | 'media' | 'baja';
  status: 'pendiente' | 'en_progreso' | 'completada';
  created_at?: string;
  updated_at?: string;
}
