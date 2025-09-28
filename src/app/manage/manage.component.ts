import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ApiCarService } from '../services/api-car.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CarListItemDto } from '../models/car.model';
@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss'],
  standalone: false
})
export class ManageComponent implements OnInit, OnDestroy {
  // ── table data (load more with client-side pagination) ──────────────────────
  allCars: CarListItemDto[] = []; // All cars loaded from server
  filteredCars: CarListItemDto[] = []; // Filtered cars (before pagination)
  rows: CarListItemDto[] = []; // Cars to display on current page
  total = 0;
  page = 1;
  pageSize = 10;
  searchTerm = '';
  loading = false;
  hasMoreData = true;

  private searchSubject = new Subject<string>();
  private searchSubscription: any;

  // ── add/edit modal state ───────────────────────────────────────────────────
  showModal = false;
  submitted = false;
  isEdit = false;

  // for edit we keep id; for add it's null
  editingId: number | null = null;
  formModel = {
    company: '',
    model: '',
    price: 0,
    description: '' as string | null
  };

  // ── file upload / preview ──────────────────────────────────────────────────
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  readonly MAX_IMAGE_BYTES = 2_000_000;
  readonly placeholder = 'https://via.placeholder.com/600x400?text=Car';

  // pagination helpers
  get totalPages(): number {
    // Calculate total pages based on total available cars from server
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  constructor(
    private api: ApiCarService,
    private router: Router,
    private route: ActivatedRoute
  ) {
        this.searchSubscription = this.searchSubject.pipe(
          debounceTime(1000), // Reduced from 1000ms to 300ms for better responsiveness
          distinctUntilChanged()
        ).subscribe(searchTerm => {
          this.searchTerm = searchTerm;
          this.performSearch();
        });
  }

  ngOnInit(): void {
    // Load initial data
    this.loadPage(true);
    // keep optional q in sync with URL (you can remove this if you don't want query-driven search here)
    this.route.queryParamMap.subscribe(q => {
      const qTerm = q.get('q') || '';
      this.setSearchTerm(qTerm);
    });
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  // ── API calls ──────────────────────────────────────────────────────────────
  private loadPage(resetPage = false): void {
    if (resetPage) {
      this.page = 1;
    }

    this.loading = true;

    // Load cars from server for the current page only
    this.api.getCars(this.searchTerm, this.page, this.pageSize)
      .subscribe({
        next: res => {
          this.allCars = res.items; // Replace with new page data
          this.total = res.totalCount;
          this.hasMoreData = this.page < this.totalPages;
          this.rows = res.items; // Directly set rows for display
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
    this.loadPage(true);
  }


  // ── search / pagination ────────────────────────────────────────────────────
  setSearch(term: string, reset = false): void {
    this.searchSubject.next(term);
  }

  private setSearchTerm(term: string): void {
    this.searchTerm = term;
    this.performSearch(); // Direct call, bypasses debounce for immediate initial load
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchSubject.next('');
  }

  changePage(delta: number): void {
    const next = this.page + delta;
    if (next < 1 || next > this.totalPages) return;

    this.page = next;
    console.log(`changePage: Setting page to ${this.page}`);
    this.loadPage(); // Fetch new page from server
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.page = 1; // Reset to first page when changing page size
    this.loadPage(true); // Fetch new page from server
  }


  // reset search if user navigates away and back (hook from navbar if needed)
  resetOnTabEnter(): void {
    this.clearSearch();
  }



  // ── modal handlers ────────────────────────────────────────────────────────
  openAdd(): void {
    this.isEdit = false;
    this.editingId = null;
    this.showModal = true;
    this.submitted = false;
    this.formModel = { company: '', model: '', price: 0, description: '' };
    this.selectedFile = null;
    this.previewUrl = null;
  }

  openEdit(row: CarListItemDto): void {
    // fetch full car if you need description (we included it in list DTO already)
    this.isEdit = true;
    this.editingId = row.id;
    this.showModal = true;
    this.submitted = false;
    this.formModel = {
      company: row.company,
      model: row.model,
      price: Number(row.price),
      description: row.description ?? ''
    };
    // optional: set preview to current image (blob fetch). For simplicity, clear it:
    this.selectedFile = null;
    this.previewUrl = null;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onFileSelected(evt: Event): void {
    const input = evt.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) { alert('Please select an image.'); return; }
    if (file.size > this.MAX_IMAGE_BYTES) { alert('Image too large.'); return; }

    this.selectedFile = file;

    // optional preview
    const reader = new FileReader();
    reader.onload = () => { this.previewUrl = reader.result as string; };
    reader.readAsDataURL(file);
  }

  clearUploadedImage(): void {
    this.selectedFile = null;
    this.previewUrl = null;
  }

  // ── create / update / delete ──────────────────────────────────────────────
  submit(form: NgForm): void {
    this.submitted = true;
    if (form.invalid || Number(this.formModel.price) <= 0) return;

    if (this.isEdit && this.editingId !== null) {
      this.api.updateCar(this.editingId, {
        company: this.formModel.company.trim(),
        model: this.formModel.model.trim(),
        price: Number(this.formModel.price),
        description: (this.formModel.description || '').trim(),
        file: this.selectedFile
      }).subscribe({
        next: () => {
          this.closeModal();
          this.loadPage(true); // reload all cars to include the updated one
        },
        error: err => alert('Failed to update: ' + (err?.error || err?.message || ''))
      });
    } else {
      this.api.addCar({
        company: this.formModel.company.trim(),
        model: this.formModel.model.trim(),
        price: Number(this.formModel.price),
        description: (this.formModel.description || '').trim(),
        file: this.selectedFile
      }).subscribe({
        next: () => {
          this.closeModal();
          this.loadPage(true); // reload all cars to include the new one
        },
        error: err => alert('Failed to add: ' + (err?.error || err?.message || ''))
      });
    }
  }

  confirmDelete(row: CarListItemDto): void {
    if (!confirm(`Delete "${row.company} ${row.model}"?`)) return;
    this.api.deleteCar(row.id).subscribe({
      next: () => this.loadPage(true), // reload all cars after deletion
      error: err => alert('Failed to delete: ' + (err?.error || err?.message || ''))
    });
  }
}
