import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: false
})
export class NavbarComponent {
  constructor(private router: Router) {}


  goListing(): void {
    this.router.navigate(['/listing'], { queryParams: { q: null, add: null } });
  }

  goManage(): void {
    this.router.navigate(['/manage'], { queryParams: { q: null, add: null } });
  }
}
