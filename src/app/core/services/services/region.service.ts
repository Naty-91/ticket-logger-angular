import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../auth.service';
import { environment } from '../../../../environments/environments';

/**
 * Servicio para gestionar las regiones, incluyendo la obtención de datos paginados y autenticación con token.
 */
@Injectable({
  providedIn: 'root', // Permite que el servicio esté disponible en toda la aplicación sin necesidad de declararlo en un módulo.
})
export class RegionService {
  /**
   * Constructor del servicio.
   * @param http Cliente HTTP de Angular para realizar solicitudes a la API.
   * @param authService Servicio de autenticación para obtener el token de acceso.
   */
  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Obtiene la lista de regiones desde la API con paginación y ordenación.
   * @param page Número de la página a solicitar (comienza en 0).
   * @param size Número de elementos por página.
   * @param sortColumn Nombre de la columna por la cual se ordenarán los resultados.
   * @param sortDirection Dirección de la ordenación (asc para ascendente, desc para descendente).
   * @returns Observable que emite la respuesta paginada de la API con las regiones solicitadas.
   */
  fetchRegions(page: number, size: number, sortColumn: string, sortDirection: string): Observable<any> {
    // Obtener el token de autenticación desde el servicio de autenticación
    const token = this.authService.getToken();

    // Si el usuario no está autenticado, lanzar un error
    if (!token) {
      return throwError(() => new Error('Unauthorized'));
    }

    // Construcción de los parámetros de la solicitud HTTP
    const params = new HttpParams()
      .set('page', page.toString()) // Página solicitada
      .set('size', size.toString()) // Cantidad de elementos por página
      .set('sort', `${sortColumn},${sortDirection}`); // Parámetro de ordenación en formato "columna,dirección"

    // Realizar la solicitud GET a la API con autenticación y parámetros de paginación y ordenación
    return this.http.get(`${environment.apiUrl}/regions`, { // ✅ Uso de backticks
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }), // Encabezado con el token de autenticación
      params: params // Parámetros de paginación y ordenación
    });
  }
}
