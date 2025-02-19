import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegionService } from '../../core/services/services/region.service';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

/**
 * Componente que muestra una tabla con la lista de regiones.
 * La tabla permite paginación y ordenación de datos.
 */
@Component({
  selector: 'app-regions',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule],
  templateUrl: './regions.component.html',
  styleUrls: ['./regions.component.scss']
})
export class RegionsComponent implements OnInit, AfterViewInit {

  /** Columnas que se mostrarán en la tabla. */
  displayedColumns: string[] = ['id', 'name'];

  /** Fuente de datos para la tabla. */
  dataSource = new MatTableDataSource<any>([]);

  /** Variables de paginación y ordenación. */
  totalElements: number = 0;
  totalPages: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  sortColumn: string = 'name';
  sortDirection: string = 'asc';

  /** Variable para almacenar errores en la carga de datos. */
  error: string | null = null;

  /** Referencias a los componentes de Material para paginación y ordenación. */
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  /**
   * Constructor del componente.
   * @param regionService Servicio para obtener datos de las regiones.
   * @param router Servicio de enrutamiento.
   */
  constructor(private regionService: RegionService, private router: Router) {}

  /**
   * Método de inicialización del componente.
   */
  ngOnInit() {
    this.fetchRegions(this.currentPage, this.pageSize, this.sortColumn, this.sortDirection);
  }

  /**
   * Método que se ejecuta después de que la vista ha sido inicializada.
   */
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Suscripción al evento de cambio de ordenación
    this.sort.sortChange.subscribe((sort: Sort) => this.handleSortEvent(sort));
  }

  /**
   * Obtiene la lista de regiones paginadas y ordenadas desde la API.
   * @param page Número de la página a solicitar.
   * @param size Número de elementos por página.
   * @param sortColumn Nombre de la columna por la que se ordenarán los datos.
   * @param sortDirection Dirección de orden ('asc' o 'desc').
   */
  fetchRegions(page: number, size: number, sortColumn: string, sortDirection: string) {
    console.log(`Llamando al servicio con página: ${page}, tamaño: ${size}, orden: ${sortColumn} ${sortDirection}`);

    this.regionService.fetchRegions(page, size, sortColumn, sortDirection).subscribe({
      next: (res: any) => {
        console.log(`Datos recibidos: ${res.content.length} elementos, total páginas: ${res.totalPages}`);

        // Se actualiza la fuente de datos con los nuevos registros
        this.dataSource.data = res.content;

        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
        this.currentPage = res.number;
        this.pageSize = res.size;

        // Se actualiza el paginador y la vista
        setTimeout(() => {
          this.paginator.length = this.totalElements;
          this.paginator.pageIndex = this.currentPage;
          this.paginator.pageSize = this.pageSize;
        });
      },
      error: (err) => {
        console.error('Error al obtener datos:', err);

        // Manejo de errores
        if (err.status === 403) {
          this.router.navigate(['/forbidden']);
        } else {
          this.error = 'Error al cargar las regiones';
        }
      }
    });
  }

  /**
   * Maneja el evento de cambio de página.
   * @param event Evento de paginación.
   */
  handlePageEvent(event: PageEvent) {
    console.log(`Cambio de página detectado: Página ${event.pageIndex}, Tamaño: ${event.pageSize}`);
    this.fetchRegions(event.pageIndex, event.pageSize, this.sortColumn, this.sortDirection);
  }

  /**
   * Maneja el evento de cambio de ordenación en la tabla.
   * @param sort Evento de ordenación.
   */
  handleSortEvent(sort: Sort) {
    console.log(`Cambio de orden detectado: Ordenando por ${sort.active} (${sort.direction})`);

    this.sortColumn = sort.active;
    this.sortDirection = sort.direction || 'asc';

    this.fetchRegions(this.currentPage, this.pageSize, this.sortColumn, this.sortDirection);
  }
}
