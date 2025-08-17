import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet></router-outlet>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class AppComponent {
  title = 'uwhub-3d';
  
  constructor() {
    // Dispatch app ready event after initialization
    setTimeout(() => {
      window.dispatchEvent(new Event('app-ready'));
    }, 100);
  }
}