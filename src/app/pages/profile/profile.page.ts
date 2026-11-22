import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OrderHistory } from '../../components/order-history/order-history';
import { ProfileUpdateRequest } from '../../models/profile';
import { AccountService } from '../../services/account.service';
import { AuthService } from '../../services/auth.service';
import { PASSWORD_PATTERN, PASSWORD_RULES, matchFields, passwordStrength } from '../../validators/password';

type Tab = 'data' | 'orders';

@Component({
  selector: 'app-profile',
  imports: [OrderHistory, ReactiveFormsModule],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.css',
})
export class ProfilePage {
  private readonly account = inject(AccountService);
  protected readonly auth = inject(AuthService);
  protected readonly tab = signal<Tab>(
    inject(ActivatedRoute).snapshot.queryParamMap.get('tab') === 'orders' && !this.auth.isAdmin() ? 'orders' : 'data');

  protected readonly rules = PASSWORD_RULES;
  protected readonly passwordPattern = PASSWORD_PATTERN;

  protected readonly form = inject(NonNullableFormBuilder).group(
    {
      email: [this.auth.profile()?.email ?? '', [Validators.required, Validators.email, Validators.maxLength(100)]],
      password: ['', passwordStrength],
      confirmPassword: [''],
    },
    { validators: matchFields('password', 'confirmPassword') },
  );
  protected readonly password = toSignal(this.form.controls.password.valueChanges, { initialValue: '' });
  protected readonly showPassword = signal(false);
  protected readonly saving = signal(false);
  protected readonly message = signal<{ text: string; ok: boolean } | null>(null);

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

  protected passwordInvalid(): boolean {
    const control = this.form.controls.password;
    return control.touched && control.invalid;
  }

  protected mismatch(): boolean {
    return this.form.controls.confirmPassword.touched && this.form.hasError('mismatch');
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    const request: ProfileUpdateRequest = { email: email.trim().toLowerCase() };
    if (password) {
      request.password = password;
    }
    this.saving.set(true);
    this.message.set(null);
    this.account.updateProfile(request).subscribe({
      next: () => {
        this.saving.set(false);
        this.message.set({ text: 'Tus datos se actualizaron correctamente', ok: true });
        this.form.patchValue({ password: '', confirmPassword: '' });
        this.form.controls.password.markAsUntouched();
        this.form.controls.confirmPassword.markAsUntouched();
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.message.set({
          ok: false,
          text: err.status === 409
            ? 'El correo ya está registrado en otra cuenta'
            : err.status === 400
              ? 'Revisa los datos ingresados'
              : 'No se pudo conectar con el servidor. Intenta más tarde',
        });
      },
    });
  }
}
