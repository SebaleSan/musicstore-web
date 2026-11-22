import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { AccountService } from '../../services/account.service';
import { AuthService } from '../../services/auth.service';
import { EMAIL_PATTERN } from '../../validators/email';
import { PASSWORD_PATTERN, PASSWORD_RULES, matchFields, passwordStrength } from '../../validators/password';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.page.html',
  styleUrl: './register.page.css',
})
export class RegisterPage {
  private readonly account = inject(AccountService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly rules = PASSWORD_RULES;
  protected readonly passwordPattern = PASSWORD_PATTERN;
  protected readonly emailPattern = EMAIL_PATTERN;

  protected readonly form = inject(NonNullableFormBuilder).group(
    {
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(EMAIL_PATTERN), Validators.maxLength(100)]],
      password: ['', [Validators.required, passwordStrength]],
      confirmPassword: ['', Validators.required],
    },
    { validators: matchFields('password', 'confirmPassword') },
  );
  protected readonly password = toSignal(this.form.controls.password.valueChanges, { initialValue: '' });
  protected readonly showPassword = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected usernameError(): string | null {
    const control = this.form.controls.username;
    if (!control.touched || !control.errors) {
      return null;
    }
    if (control.hasError('required')) {
      return 'El usuario es obligatorio';
    }
    if (control.hasError('minlength') || control.hasError('maxlength')) {
      return 'El usuario debe tener entre 3 y 50 caracteres';
    }
    return 'Solo letras, números y guion bajo, sin espacios';
  }

  protected emailError(): string | null {
    const control = this.form.controls.email;
    if (!control.touched || !control.errors) {
      return null;
    }
    if (control.hasError('required')) {
      return 'El correo es obligatorio';
    }
    return control.hasError('maxlength') ? 'El correo no puede superar 100 caracteres' : 'Ingresa un correo válido';
  }

  protected passwordError(): string | null {
    const control = this.form.controls.password;
    if (!control.touched || !control.errors) {
      return null;
    }
    return control.hasError('required') ? 'La contraseña es obligatoria' : 'La contraseña no cumple los requisitos';
  }

  protected confirmError(): string | null {
    const control = this.form.controls.confirmPassword;
    if (!control.touched) {
      return null;
    }
    if (control.hasError('required')) {
      return 'Confirma tu contraseña';
    }
    return this.form.hasError('mismatch') ? 'Las contraseñas no coinciden' : null;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { username, email, password } = this.form.getRawValue();
    const normalized = username.trim().toLowerCase();
    this.saving.set(true);
    this.error.set(null);
    this.account
      .register({ username: normalized, email: email.trim().toLowerCase(), password })
      .pipe(switchMap(() => this.auth.login(normalized, password)))
      .subscribe({
        next: () => this.router.navigateByUrl('/'),
        error: (err: HttpErrorResponse) => {
          this.saving.set(false);
          this.error.set(err.status === 409
            ? 'El nombre de usuario o el correo ya están registrados'
            : err.status === 400
              ? 'Revisa los datos ingresados'
              : 'No se pudo conectar con el servidor. Intenta más tarde');
        },
      });
  }
}
