// src/app/listing/listing.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { ApiCarService } from '../services/api-car.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CarListItemDto } from '../models/car.model';

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss'],
  standalone: false
})
export class ListingComponent implements OnInit, OnDestroy {
  // ── Listing / paging state (client-side filtering with load more) ─────────────
  allCars: CarListItemDto[] = []; // All cars from server
  displayedCars: CarListItemDto[] = []; // Cars currently displayed
  page = 1;
  batchSize = 9;
  total = 0;
  searchTerm = '';
  loading = false;
  hasMoreData = true;

  // ── Debounce search ───────────────────────────────────────────────────────────
  private searchSubject = new Subject<string>();
  private searchSubscription: any;

  // ── Add modal state ──────────────────────────────────────────────────────────
  showModal = false;
  submitted = false;
  newCar = { company: '', model: '', price: 0, description: '' as string | null };

  // ── File upload preview (optional) ───────────────────────────────────────────
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  readonly MAX_IMAGE_BYTES = 2_000_000; // 2 MB
  readonly placeholder = 'https://via.placeholder.com/600x400?text=Car';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiCarService
  ) {
    // Set up debounced search
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.performSearch();
    });
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    // Load initial data
    this.fetch(true);

    // react to URL changes (?q=, ?add=1)
    this.route.queryParamMap.subscribe(q => {
      const add = q.get('add');
      const qTerm = q.get('q') || '';
      if (add === '1') this.openModal();
      this.setSearchTerm(qTerm);
    });
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  // ── Data fetch ───────────────────────────────────────────────────────────────
  private fetch(reset = false): void {
    if (reset) {
      this.page = 1;
      this.allCars = [];
      this.displayedCars = [];
    }

    this.loading = true;

    // Load cars from server with search term
    this.api.getCars(this.searchTerm, this.page, this.batchSize)
      .subscribe({
        next: res => {
          if (reset || this.searchTerm.trim()) {
            // For search or reset, replace the cars
            this.allCars = res.items;
            this.displayedCars = res.items;
          } else {
            // For load more without search, accumulate cars
            this.allCars = [...this.allCars, ...res.items];
            this.displayedCars = [...this.displayedCars, ...res.items];
          }
          this.total = res.totalCount;
          this.hasMoreData = this.allCars.length < this.total;
          this.loading = false;
        },
        error: err => {
          this.loading = false;
          alert('Failed to load cars: ' + (err?.error || err?.message || ''));
        }
      });
  }

  // ── Server-side search ──────────────────────────────────────────────────────
  private performSearch(): void {
    this.page = 1; // Reset to first page when searching
    this.fetch(true);
  }
  setSearch(term: string, reset = false): void {
    this.searchSubject.next(term);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchSubject.next('');
  }

  private setSearchTerm(term: string): void {
    this.searchTerm = term;
    this.performSearch();
  }

  // ── Load More functionality ────────────────────────────────────────────────────
  loadMore(): void {
    if (this.hasMoreData && !this.loading) {
      this.page++;
      this.fetch();
    }
  }

  hasMore(): boolean {
    return this.hasMoreData && !this.loading;
  }

  // ── Navigation ───────────────────────────────────────────────────────────────
  goToDetail(id: number): void {
    console.log(id);

    this.router.navigate(['Cars', 'CarInfo', id]);
  }


  // ── Modal handlers ──────────────────────────────────────────────────────────
  openModal(): void {
    this.showModal = true;
    this.submitted = false;
    this.newCar = { company: '', model: '', price: 0, description: '' };
    this.selectedFile = null;
    this.previewUrl = null;
  }

  closeModal(): void {
    this.showModal = false;
    // remove ?add=1 from url but keep other params
    this.router.navigate([], { queryParams: { add: null }, queryParamsHandling: 'merge' });
  }

  // ── File upload / preview ───────────────────────────────────────────────────
  onFileSelected(evt: Event): void {
    const input = evt.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please select an image.');
      return;
    }
    if (file.size > this.MAX_IMAGE_BYTES) {
      alert('Image too large.');
      return;
    }

    this.selectedFile = file;
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  clearUploadedImage(): void {
    this.selectedFile = null;
    this.previewUrl = null;
  }

  // ── Create (POST) via API ───────────────────────────────────────────────────
  addCar(form: NgForm): void {
    this.submitted = true;
    if (form.invalid || Number(this.newCar.price) <= 0) return;

    this.api.addCar({
      company: this.newCar.company.trim(),
      model: this.newCar.model.trim(),
      price: Number(this.newCar.price),
      description: (this.newCar.description || '').trim(),
      file: this.selectedFile
    }).subscribe({
      next: () => {
        this.closeModal();
        this.fetch(true); // reload all cars to include the new one
      },
      error: err => alert('Failed to add car: ' + (err?.error || err?.message || ''))
    });
  }
}
