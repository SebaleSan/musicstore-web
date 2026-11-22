import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Order } from '../../models/order';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';

type Field = 'fullName' | 'phone' | 'address' | 'city' | 'region';

const MESSAGES: Record<Field, Record<string, string>> = {
  fullName: {
    required: 'El nombre es obligatorio',
    minlength: 'El nombre debe tener al menos 3 caracteres',
  },
  phone: {
    required: 'El teléfono es obligatorio',
    pattern: 'Debe tener 9 dígitos y comenzar con 9',
  },
  address: {
    required: 'La dirección es obligatoria',
    minlength: 'La dirección debe tener al menos 5 caracteres',
  },
  city: {
    required: 'La comuna es obligatoria',
    minlength: 'La comuna debe tener al menos 3 caracteres',
  },
  region: {
    required: 'Selecciona una región',
  },
};

@Component({
  selector: 'app-checkout',
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout.page.html',
  styleUrl: './checkout.page.css',
})
export class CheckoutPage {
  private readonly orderService = inject(OrderService);
  protected readonly cart = inject(CartService);

  protected readonly regions = [
    'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo', 'Valparaíso',
    'Metropolitana de Santiago', "Libertador General Bernardo O'Higgins", 'Maule', 'Ñuble', 'Biobío',
    'La Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén del General Carlos Ibáñez del Campo',
    'Magallanes y de la Antártica Chilena',
  ];

  protected readonly form = inject(NonNullableFormBuilder).group({
    fullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    phone: ['', [Validators.required, Validators.pattern(/^9\d{8}$/)]],
    address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(150)]],
    city: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
    region: ['', Validators.required],
  });
  protected readonly placed = signal<Order | null>(null);

  protected error(field: Field): string | null {
    const control = this.form.controls[field];
    if (!control.touched || !control.errors) {
      return null;
    }
    const key = Object.keys(control.errors)[0];
    return MESSAGES[field][key] ?? 'Valor inválido';
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const order = this.orderService.place(this.cart.items(), {
      fullName: value.fullName.trim(),
      phone: `+56${value.phone}`,
      address: value.address.trim(),
      city: value.city.trim(),
      region: value.region,
    });
    this.cart.clear();
    this.placed.set(order);
  }
}
