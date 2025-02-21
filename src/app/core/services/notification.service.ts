import { Injectable, PLATFORM_ID, Inject, Injector } from '@angular/core';
import { Client, IMessage, StompHeaders } from '@stomp/stompjs';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private stompClient: Client | null = null;
  private notificationsSubject = new BehaviorSubject<any[]>([]);
  private apiUrl = `${environment.webSocketUrl}/notifications`;
  private authService!: AuthService;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private injector: Injector
  ) {}

  /**
   * Conecta al WebSocket de notificaciones
   */
  connect(): void {
    // Asegurar que AuthService está inicializado
    if (!this.authService) {
      this.authService = this.injector.get(AuthService);
    }

    const token = this.authService?.getToken();
    const username = this.authService?.getUsername();

    if (!token || !username) {
      console.error('No hay token o usuario autenticado, WebSocket no se conectará.');
      return;
    }

    if (this.stompClient && this.stompClient.connected) {
      console.warn('▲ WebSocket ya está conectado.');
      return;
    }

    // Configuración del cliente STOMP
    this.stompClient = new Client({
      brokerURL: `${environment.webSocketBroker}`, // URL del servidor WebSocket
      reconnectDelay: 5000, // Intento de reconexión cada 5 segundos
      debug: (msg) => console.log('• STOMP Debug:', msg),
      connectHeaders: {
        Authorization: `Bearer ${token}`, // Se envía el token en la cabecera
      },
    });

    this.stompClient.onConnect = () => {
      console.log('✓ WebSocket conectado');

      const token = this.authService?.getToken();
      const username = this.authService?.getUsername(); // Obtener usuario autenticado

      console.log(`• Usuario autenticado en WebSocket: ${username}`);
      console.log(`Token: ${token ? 'Existe' : 'No encontrado'}`);

      const headers: StompHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      // Suscribirse al canal de notificaciones global
      this.stompClient?.subscribe(
        '/topic/notifications',
        (message: IMessage) => {
          try {
            const notification = JSON.parse(message.body);
            console.log('📩 Notificación recibida:', notification);

            // Agregar la notificación a la lista existente
            const currentNotifications = this.notificationsSubject.value;
            this.notificationsSubject.next([...currentNotifications, notification]);
          } catch (error) {
            console.error('❌ Error al procesar notificación:', error);
          }
        },
        headers // Solo si el token está presente
      );
    };

    // Gestión de errores STOMP
    this.stompClient.onStompError = (frame) => {
      console.error('❌ STOMP Error:', frame.headers['message']);
    };

    this.stompClient.activate(); // Activar conexión WebSocket
  }

  /**
   * Obtiene el historial de notificaciones desde MongoDB (REST API).
   * Se realiza una petición HTTP a la API de notificaciones.
   * @returns Observable con la lista de notificaciones.
   */
  loadUserNotifications(): Observable<any[]> {
    if (!this.authService) {
      this.authService = this.injector.get(AuthService); // Inyección diferida
    }

    const token = this.authService.getToken();
    if (!token) {
      console.warn('⚠ No hay token disponible.');
      return of([]); // Devuelve un observable vacío si no hay token
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return this.http.get<any[]>(this.apiUrl, { headers }).pipe(
      tap((notifications) => console.log('📩 Notificaciones cargadas:', notifications))
    );
  }

  /**
   * Devuelve un Observable con las notificaciones en tiempo real.
   * @returns Observable con las notificaciones actualizadas.
   */
  getNotifications(): Observable<any[]> {
    return this.notificationsSubject.asObservable().pipe(
      tap((notifs) => console.log('📢 Notificaciones actualizadas en tiempo real:', notifs))
    );
  }

  /**
   * Desconecta el WebSocket.
   * Si el cliente STOMP está conectado, se desactiva la conexión.
   */
  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      console.log('❌ WebSocket desconectado.');
    }
  }
}
