import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../../core/services/weather.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  imports: [CommonModule],
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent implements OnInit {

  weatherInfo: any;

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    const latitude = 37.3886;
    const long = -5.9823;

    // Llamada al servicio con los parámetros de latitud y longitud
    this.weatherService.getWeather(latitude, long).subscribe(data => {
      this.weatherInfo = data;
    });
  }
}
