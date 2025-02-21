import { Component, OnDestroy, OnInit } from '@angular/core';
import { NotificationService } from '../../core/services/notification.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

/**
 * Componente de notificaciones.
 * Este componente muestra las notificaciones en un menú desplegable e interactúa con el 'NotificationService' 
 * para recibir actualizaciones en tiempo real a través de WebSockets.
 */
@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatListModule
  ],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: any[] = []; // Almacena la lista de notificaciones recibidas
  unreadCount: number = 0; // Contador de notificaciones no leídas
  private subscription: Subscription | undefined; // Suscripción a las notificaciones en tiempo real

  /**
   * Constructor del componente de notificaciones.
   * @param notificationService Servicio para la gestión de notificaciones en tiempo real.
   */
  constructor(
    private notificationService: NotificationService
  ) {}

 /**
 * Método de inicialización del componente.
 * Se suscribe a las notificaciones en tiempo real y carga el historial de notificaciones del usuario.
 */
ngOnInit(): void {
  // Conecta el servicio de WebSocket para recibir notificaciones
  this.notificationService.connect();
  
  // Cargar historial de notificaciones desde la API REST si hay usuario autenticado
  this.notificationService.loadUserNotifications().subscribe((history) => {
    if (history && history.length > 0) {
      this.notifications = history; // Asigna el historial de notificaciones
      this.unreadCount = history.length; // Establece el contador de notificaciones no leídas
    }
  });

  // Suscribirse a nuevas notificaciones en tiempo real
  this.subscription = this.notificationService.getNotifications().subscribe((notifs) => {
    if (notifs && Array.isArray(notifs)) {
      notifs.forEach((notification) => {
        if (notification && notification.subject && notification.message) {
          // Solo agrega notificaciones válidas con 'subject' y 'message'
          this.notifications.unshift(notification); // Agrega la notificación al inicio de la lista
          this.unreadCount++; // Incrementa el contador de no leídas
        }
      });
    }
  });
}


  /**
 * Marca todas las notificaciones como leídas.
 * Establece el contador de notificaciones no leídas a cero.
 */
markAllAsRead(): void {
  this.unreadCount = 0; // Resetea el contador de notificaciones no leídas
}

/**
 * Método de limpieza cuando el componente se destruye.
 * Se desuscribe de las notificaciones en tiempo real y desconecta el servicio WebSocket.
 */
ngOnDestroy(): void {
  if (this.subscription) {
    this.subscription.unsubscribe(); // Cancela la suscripción a las notificaciones en tiempo real
  }

  this.notificationService.disconnect(); // Desconecta el WebSocket al salir del componente
}

}
