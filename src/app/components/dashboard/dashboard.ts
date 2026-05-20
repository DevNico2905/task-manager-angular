import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { TaskFormComponent } from '../task-form/task-form';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskFormComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  tasks: Task[] = [];
  loading = true;
  userEmail = '';

  // Filtros y búsqueda
  searchQuery = '';
  filterStatus = 'todas';
  filterPriority = 'todas';

  // Modal
  showForm = false;
  editingTask: Task | null = null;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    const user = await this.authService.getUser();
    this.userEmail = user?.email ?? '';
    await this.loadTasks();
  }

  async loadTasks() {
    this.loading = true;
    try {
      this.tasks = await this.taskService.getTasks();
    } catch (err) {
      console.error('Error cargando tareas:', err);
    } finally {
      this.loading = false;
    }
  }

  get filteredTasks(): Task[] {
    return this.tasks.filter((task) => {
      const matchSearch =
        !this.searchQuery ||
        task.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchStatus =
        this.filterStatus === 'todas' || task.status === this.filterStatus;

      const matchPriority =
        this.filterPriority === 'todas' || task.priority === this.filterPriority;

      return matchSearch && matchStatus && matchPriority;
    });
  }

  get tasksByStatus() {
    const filtered = this.filteredTasks;
    return {
      pendiente: filtered.filter((t) => t.status === 'pendiente'),
      en_progreso: filtered.filter((t) => t.status === 'en_progreso'),
      completada: filtered.filter((t) => t.status === 'completada'),
    };
  }

  get stats() {
    return {
      total: this.tasks.length,
      pendiente: this.tasks.filter((t) => t.status === 'pendiente').length,
      en_progreso: this.tasks.filter((t) => t.status === 'en_progreso').length,
      completada: this.tasks.filter((t) => t.status === 'completada').length,
    };
  }

  openNewTask() {
    this.editingTask = null;
    this.showForm = true;
  }

  openEditTask(task: Task) {
    this.editingTask = { ...task };
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingTask = null;
  }

  async onSaveTask(taskData: Partial<Task>) {
    try {
      if (this.editingTask?.id) {
        await this.taskService.updateTask(this.editingTask.id, taskData);
      } else {
        await this.taskService.createTask(taskData);
      }
      this.closeForm();
      await this.loadTasks();
    } catch (err) {
      console.error('Error guardando tarea:', err);
    }
  }

  async toggleComplete(task: Task) {
    const newStatus =
      task.status === 'completada' ? 'pendiente' : 'completada';
    try {
      await this.taskService.updateTask(task.id!, { status: newStatus });
      await this.loadTasks();
    } catch (err) {
      console.error('Error actualizando tarea:', err);
    }
  }

  async deleteTask(task: Task) {
    if (!confirm(`¿Eliminar "${task.title}"?`)) return;
    try {
      await this.taskService.deleteTask(task.id!);
      await this.loadTasks();
    } catch (err) {
      console.error('Error eliminando tarea:', err);
    }
  }

  async logout() {
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }

  getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      alta: '🔴 Alta',
      media: '🟡 Media',
      baja: '🟢 Baja',
    };
    return labels[priority] ?? priority;
  }

  isOverdue(date: string): boolean {
    if (!date) return false;
    return new Date(date) < new Date(new Date().toDateString());
  }
}
