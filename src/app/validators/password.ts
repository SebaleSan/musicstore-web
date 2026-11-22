import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface PasswordRule {
  key: string;
  label: string;
  test: (value: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { key: 'length', label: 'Entre 8 y 100 caracteres', test: value => value.length >= 8 && value.length <= 100 },
  { key: 'uppercase', label: 'Al menos una letra mayúscula', test: value => /[A-ZÑ]/.test(value) },
  { key: 'lowercase', label: 'Al menos una letra minúscula', test: value => /[a-zñ]/.test(value) },
  { key: 'number', label: 'Al menos un número', test: value => /\d/.test(value) },
  { key: 'symbol', label: 'Al menos un carácter especial (!@#$%...)', test: value => /[^A-Za-zÑñ0-9\s]/.test(value) },
  { key: 'spaces', label: 'Sin espacios', test: value => !/\s/.test(value) },
];

export const PASSWORD_PATTERN = '(?=.*[A-ZÑ])(?=.*[a-zñ])(?=.*\\d)(?=.*[^A-Za-zÑñ0-9\\s])\\S{8,100}';

export const passwordStrength: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value: string = control.value ?? '';
  if (!value) {
    return null;
  }
  const failed = PASSWORD_RULES.filter(rule => !rule.test(value)).map(rule => rule.key);
  return failed.length ? { passwordStrength: failed } : null;
};

export function matchFields(field: string, confirmation: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    return group.get(field)?.value === group.get(confirmation)?.value ? null : { mismatch: true };
  };
}
