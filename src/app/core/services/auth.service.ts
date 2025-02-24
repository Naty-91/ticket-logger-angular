import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environments';
import { NotificationService } from './notification.service';
import {jwtDecode} from 'jwt-decode';  // Asegúrate de tener esta importación para el uso de jwtDecode.

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token = new BehaviorSubject<string | null>(null);
  // BehaviorSubject almacena el token y permite a otros componentes reaccionar cuando cambia.

  constructor(
    private http: HttpClient,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  /**
   * Autentica al usuario con username y password.
   * @param username - Nombre de usuario ingresado.
   * @param password - Contraseña ingresada.
   * @returns Observable con el token si la autenticación es exitosa.
   */
  login(username: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(
      `${environment.apiUrl}/v1/authenticate`,
      { username, password },
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(
      tap(response => {
        this.setToken(response.token);
        console.log('✓ Login exitoso, conectando a WebSockets...');
        
        // Iniciar WebSocket usando el método connect
        this.notificationService.connect();
      })
    );
  }

  /**
   * Almacena el token de autenticación en el BehaviorSubject.
   * @param token - Token recibido tras una autenticación exitosa.
   */
  setToken(token: string): void {
    this.token.next(token); // Actualiza el valor del token.
  }

  /**
   * Obtiene el token actual almacenado en el BehaviorSubject.
   * @returns El token actual o null si no está definido.
   */
  getToken(): string | null {
    return this.token.value;
  }

  /**
   * Devuelve un observable que emite el estado de autenticación basado en la existencia del token.
   * @returns Observable<boolean>
   */
  isLoggedIn(): Observable<boolean> {
    // Verifica si el token existe y emite un valor booleano.
    return this.token.asObservable().pipe(map((token: string | null) => !!token));
  }

  /**
   * Cierra sesión: borra el token, desconecta WebSockets y redirige al usuario.
   */
  logout(): void {
    console.log('Cerrando sesión y desconectando de WebSockets...');
    
    this.token.next(null); // Elimina el token almacenado
    this.notificationService.disconnect(); // Desconecta WebSockets
    
    this.router.navigate(['/']); // Redirige al usuario a la página de inicio
  }

  /**
   * Extrae el nombre de usuario desde el token JWT.
   * @returns Nombre de usuario o 'null' si el token es inválido.
   */
  getUsername(): string | null {
    // Obtener el token de alguna parte (supongo que hay una función getToken)
    const token = this.getToken();
    
    // Si no existe el token, retornar null
    if (!token) return null;
    
    try {
      // Decodificar el token JWT
      const decodedToken: any = jwtDecode(token);
      
      // Retornar el 'sub' que es el campo estándar para el nombre de usuario****
      return decodedToken.sub || null;
      
    } catch (error) {
      // Si ocurre algún error al decodificar el token, loguear el error y retornar null
      console.error('Error al decodificar el token:', error);
      return null;
    }
  }
}
