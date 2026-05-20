import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-form.html',
  styleUrl: './task-form.css',
})
export class TaskFormComponent implements OnChanges {
  @Input() task: Task | null = null;
  @Input() visible = false;
  @Output() save = new EventEmitter<Partial<Task>>();
  @Output() close = new EventEmitter<void>();

  title = '';
  description = '';
  due_date = '';
  priority: Task['priority'] = 'media';
  status: Task['status'] = 'pendiente';

  ngOnChanges() {
    if (this.task) {
      this.title = this.task.title;
      this.description = this.task.description;
      this.due_date = this.task.due_date;
      this.priority = this.task.priority;
      this.status = this.task.status;
    } else {
      this.resetForm();
    }
  }

  onSave() {
    if (!this.title.trim()) return;

    this.save.emit({
      title: this.title.trim(),
      description: this.description.trim(),
      due_date: this.due_date,
      priority: this.priority,
      status: this.status,
    });

    this.resetForm();
  }

  onClose() {
    this.resetForm();
    this.close.emit();
  }

  private resetForm() {
    this.title = '';
    this.description = '';
    this.due_date = '';
    this.priority = 'media';
    this.status = 'pendiente';
  }
}
