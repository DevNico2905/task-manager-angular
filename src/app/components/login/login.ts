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
    if (this.loading) return;

    const email = this.email.trim();
    const password = this.password;

    if (!email || !password) {
      this.error = 'Completa todos los campos.';
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.error = 'Correo no válido.';
      return;
    }

    if (password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    try {
      if (this.isRegister) {
        const data = await this.authService.signUp(email, password);
        if (data.session) {
          this.router.navigate(['/dashboard']);
        } else if (data.user && data.user.identities?.length === 0) {
          this.error = 'Ya existe una cuenta con ese correo.';
        } else {
          this.success = 'Cuenta creada. Revisa tu correo para confirmar.';
          this.isRegister = false;
        }
      } else {
        await this.authService.signIn(email, password);
        this.router.navigate(['/dashboard']);
      }
    } catch (err: any) {
      this.error = this.mapAuthError(err);
    } finally {
      this.loading = false;
    }
  }

  private mapAuthError(err: any): string {
    const code: string = err?.code ?? err?.error_code ?? '';
    const msg: string = err?.message ?? '';

    if (code === 'invalid_credentials' || /invalid login credentials/i.test(msg)) {
      return 'Correo o contraseña incorrectos. Si aún no tienes cuenta, regístrate.';
    }
    if (code === 'email_not_confirmed') {
      return 'Confirma tu correo antes de iniciar sesión.';
    }
    if (code === 'user_already_exists' || /already registered/i.test(msg)) {
      return 'Ya existe una cuenta con ese correo.';
    }
    if (code === 'weak_password' || /password.*weak|password should be/i.test(msg)) {
      return 'La contraseña es demasiado débil. Usa una más segura.';
    }
    if (
      code === 'over_email_send_rate_limit' ||
      code === 'over_request_rate_limit' ||
      /rate limit/i.test(msg)
    ) {
      return 'Demasiados intentos. Espera unos minutos antes de volver a intentarlo.';
    }
    if (/failed to fetch|network/i.test(msg)) {
      return 'No se pudo conectar con el servidor. Revisa tu conexión.';
    }
    return msg || 'Ocurrió un error.';
  }
}
