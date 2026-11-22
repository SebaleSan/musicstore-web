import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderHistory } from '../../components/order-history/order-history';
import { AuthService } from '../../services/auth.service';

type Tab = 'data' | 'orders';

@Component({
  selector: 'app-profile',
  imports: [OrderHistory],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.css',
})
export class ProfilePage {
  protected readonly auth = inject(AuthService);
  protected readonly tab = signal<Tab>(
    inject(ActivatedRoute).snapshot.queryParamMap.get('tab') === 'orders' && !this.auth.isAdmin() ? 'orders' : 'data');
}
