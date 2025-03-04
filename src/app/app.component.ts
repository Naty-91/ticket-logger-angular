import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { WeatherComponent } from './features/weather/weather.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet , HeaderComponent, FooterComponent, WeatherComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'dwese-ticket-logger-angular';
}
