import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-order-history',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './order-history.html',
  styleUrl: './order-history.css',
})
export class OrderHistory {
  protected readonly orders = inject(OrderService).orders;
}
