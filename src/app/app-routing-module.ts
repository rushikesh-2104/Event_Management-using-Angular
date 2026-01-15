import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './components/dashboard/dashboard';
import { TableComponent } from './components/table/table';
import { Cricket } from './cricket/cricket';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'table', component: TableComponent },
  {path:'cricket',component:Cricket}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
