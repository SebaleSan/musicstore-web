import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EMAIL_PATTERN } from '../../validators/email';

@Component({
  selector: 'app-recover-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './recover-password.page.html',
  styleUrl: './recover-password.page.css',
})
export class RecoverPasswordPage {
  protected readonly emailPattern = EMAIL_PATTERN;

  protected readonly form = inject(NonNullableFormBuilder).group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
    email: ['', [Validators.required, Validators.email, Validators.pattern(EMAIL_PATTERN), Validators.maxLength(100)]],
  });
  protected readonly sentTo = signal<string | null>(null);

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

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.sentTo.set(this.form.getRawValue().email.trim().toLowerCase());
  }
}
