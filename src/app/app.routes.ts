import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin-guard';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    title: 'Inicio | Music Store',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage),
  },
  {
    path: 'catalog',
    title: 'Catálogo | Music Store',
    loadComponent: () => import('./pages/catalog/catalog.page').then(m => m.CatalogPage),
  },
  {
    path: 'albums/:id',
    title: 'Álbum | Music Store',
    loadComponent: () => import('./pages/album-detail/album-detail.page').then(m => m.AlbumDetailPage),
  },
  {
    path: 'login',
    title: 'Iniciar sesión | Music Store',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'register',
    title: 'Crear cuenta | Music Store',
    loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage),
  },
  {
    path: 'recover-password',
    title: 'Recuperar contraseña | Music Store',
    loadComponent: () => import('./pages/recover-password/recover-password.page').then(m => m.RecoverPasswordPage),
  },
  {
    path: 'profile',
    title: 'Mi perfil | Music Store',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage),
  },
  {
    path: 'cart',
    title: 'Carrito | Music Store',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/cart/cart.page').then(m => m.CartPage),
  },
  {
    path: 'checkout',
    title: 'Finalizar compra | Music Store',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/checkout/checkout.page').then(m => m.CheckoutPage),
  },
  {
    path: 'orders',
    title: 'Mis compras | Music Store',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/orders/orders.page').then(m => m.OrdersPage),
  },
  {
    path: 'admin/albums',
    title: 'Administrar álbumes | Music Store',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./pages/admin-albums/admin-albums.page').then(m => m.AdminAlbumsPage),
  },
  { path: '**', redirectTo: '' },
];
