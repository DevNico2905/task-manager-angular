import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Task } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private table = 'tasks';

  constructor(private supabaseService: SupabaseService) {}

  async getTasks(): Promise<Task[]> {
    const { data, error } = await this.supabaseService.client
      .from(this.table)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  async createTask(task: Partial<Task>): Promise<Task> {
    const user = await this.supabaseService.client.auth.getUser();
    const { data, error } = await this.supabaseService.client
      .from(this.table)
      .insert({ ...task, user_id: user.data.user?.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await this.supabaseService.client
      .from(this.table)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTask(id: string): Promise<void> {
    const { error } = await this.supabaseService.client
      .from(this.table)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
