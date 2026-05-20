import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  isRegister = false;
  email = '';
  password = '';
  loading = false;
  error = '';
  success = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleMode() {
    this.isRegister = !this.isRegister;
    this.error = '';
    this.success = '';
  }

  async onSubmit() {
    if (!this.email || !this.password) {
      this.error = 'Completa todos los campos.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    try {
      if (this.isRegister) {
        await this.authService.signUp(this.email, this.password);
        this.success = 'Cuenta creada. Revisa tu correo para confirmar.';
        this.isRegister = false;
      } else {
        await this.authService.signIn(this.email, this.password);
        this.router.navigate(['/dashboard']);
      }
    } catch (err: any) {
      this.error = err.message || 'Ocurrió un error.';
    } finally {
      this.loading = false;
    }
  }
}
