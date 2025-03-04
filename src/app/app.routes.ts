import { Routes } from '@angular/router';
import { RegionsComponent } from './features/regions/regions.component';
import { LoginComponent } from './features/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { HomeComponent } from './features/home/home.component';
import { ForbiddenComponent } from './features/forbidden/forbidden.component';
import { Error404Component } from './features/error404/error404.component';
import { WeatherComponent } from './features/weather/weather.component';

export const routes: Routes = [
  {
    path: '', // Ruta inicial
    component: HomeComponent,
  },
  {
    path: 'login', // Página de inicio de sesión
    component: LoginComponent,
  },
  {
    path: 'regions', // Página protegida
    component: RegionsComponent,
    canActivate: [authGuard], // Protegida por el guard
  },
  {
    path: 'forbidden', // Página 403
    component: ForbiddenComponent,
  },
  {
    path: 'weather', // Página del clima
    component: WeatherComponent,
  },
  {
    path: '**', // Ruta comodín para 404
    component: Error404Component,
  }
];
