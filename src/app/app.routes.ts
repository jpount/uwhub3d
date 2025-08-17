import { Routes } from '@angular/router';
import { Room3dComponent } from './components/room-3d/room-3d.component';

export const routes: Routes = [
  { path: '', component: Room3dComponent },
  { path: '**', redirectTo: '' }
];