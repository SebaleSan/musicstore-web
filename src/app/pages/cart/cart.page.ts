import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './cart.page.html',
  styleUrl: './cart.page.css',
})
export class CartPage {
  protected readonly cart = inject(CartService);

  protected clear(): void {
    if (confirm('¿Quieres vaciar el carrito?')) {
      this.cart.clear();
    }
  }
}
